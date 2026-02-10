import type { Teacher, ScheduleWithDetails, ValidationResult, TeacherWorkload, RoomCluster } from '../types';

interface TeachersBySchool {
  [school: string]: Teacher[];
}

interface TeacherWorkloadMap {
  [teacherId: string]: number;
}

interface PairHistory {
  [key: string]: boolean;
}

export function generateSchedule(
  teachers: Teacher[],
  numRooms: number,
  numSessions: number
): ScheduleWithDetails[] {
  const teachersBySchool = groupTeachersBySchool(teachers);
  const schools = Object.keys(teachersBySchool);

  if (schools.length < 2) {
    throw new Error('Cần ít nhất 2 trường để phân công');
  }

  if (teachers.length < numRooms * 2) {
    throw new Error(`Cần ít nhất ${numRooms * 2} giám thị. Hiện tại chỉ có ${teachers.length}`);
  }

  const schedules: ScheduleWithDetails[] = [];
  const workload: TeacherWorkloadMap = {};
  const pairHistory: PairHistory = {};

  teachers.forEach(t => {
    workload[t.id] = 0;
  });

  for (let sessionNum = 1; sessionNum <= numSessions; sessionNum++) {
    const sessionName = `Buổi ${sessionNum}`;

    for (let roomNum = 1; roomNum <= numRooms; roomNum++) {
      const { gt1, gt2 } = findValidPair(
        teachersBySchool,
        schools,
        workload,
        pairHistory,
        teachers
      );

      const pairKey = [gt1.id, gt2.id].sort().join('-');
      pairHistory[pairKey] = true;

      workload[gt1.id]++;
      workload[gt2.id]++;

      let gt3: Teacher | null = null;
      if (roomNum % 5 === 1 || roomNum === 1) {
        const clusterRooms = schedules.slice(-Math.min(5, schedules.length));
        gt3 = findValidSupervisor(
          teachers,
          teachersBySchool,
          workload,
          clusterRooms,
          gt1,
          gt2
        );

        if (gt3) {
          workload[gt3.id]++;
        }
      } else {
        const lastSupervisor = schedules[schedules.length - 1];
        if (lastSupervisor && lastSupervisor.gt3_id) {
          const supervisorTeacher = teachers.find(t => t.id === lastSupervisor.gt3_id);
          if (supervisorTeacher) {
            gt3 = supervisorTeacher;
          }
        }
      }

      if (!gt3) {
        gt3 = teachers[0];
      }

      schedules.push({
        id: `${sessionNum}-${roomNum}`,
        project_id: '',
        session_number: sessionNum,
        session_name: sessionName,
        room_number: roomNum,
        gt1_id: gt1.id,
        gt1_name: gt1.name,
        gt1_school: gt1.school,
        gt2_id: gt2.id,
        gt2_name: gt2.name,
        gt2_school: gt2.school,
        gt3_id: gt3.id,
        gt3_name: gt3.name,
        gt3_school: gt3.school
      });
    }
  }

  return schedules;
}

function groupTeachersBySchool(teachers: Teacher[]): TeachersBySchool {
  const grouped: TeachersBySchool = {};

  teachers.forEach(teacher => {
    if (!grouped[teacher.school]) {
      grouped[teacher.school] = [];
    }
    grouped[teacher.school].push(teacher);
  });

  return grouped;
}

function findValidPair(
  teachersBySchool: TeachersBySchool,
  schools: string[],
  workload: TeacherWorkloadMap,
  pairHistory: PairHistory,
  allTeachers: Teacher[]
): { gt1: Teacher; gt2: Teacher } {
  const maxAttempts = 1000;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const shuffledSchools = [...schools].sort(() => Math.random() - 0.5);
    const school1 = shuffledSchools[0];
    const school2 = shuffledSchools[1];

    const teachers1 = teachersBySchool[school1];
    const teachers2 = teachersBySchool[school2];

    const gt1 = teachers1.reduce((min, t) =>
      workload[t.id] < workload[min.id] ? t : min
    );

    const gt2 = teachers2.reduce((min, t) =>
      workload[t.id] < workload[min.id] ? t : min
    );

    const pairKey = [gt1.id, gt2.id].sort().join('-');

    if (!pairHistory[pairKey]) {
      return { gt1, gt2 };
    }

    attempts++;
  }

  const allTeachersSorted = [...allTeachers].sort((a, b) =>
    workload[a.id] - workload[b.id]
  );

  for (let i = 0; i < allTeachersSorted.length; i++) {
    for (let j = i + 1; j < allTeachersSorted.length; j++) {
      const t1 = allTeachersSorted[i];
      const t2 = allTeachersSorted[j];

      if (t1.school !== t2.school) {
        const pairKey = [t1.id, t2.id].sort().join('-');
        if (!pairHistory[pairKey]) {
          return { gt1: t1, gt2: t2 };
        }
      }
    }
  }

  const gt1 = allTeachersSorted[0];
  const gt2 = allTeachersSorted.find(t => t.school !== gt1.school) || allTeachersSorted[1];

  return { gt1, gt2 };
}

function findValidSupervisor(
  allTeachers: Teacher[],
  teachersBySchool: TeachersBySchool,
  workload: TeacherWorkloadMap,
  clusterRooms: ScheduleWithDetails[],
  gt1: Teacher,
  gt2: Teacher
): Teacher {
  const schoolsInCluster = new Set<string>();

  clusterRooms.forEach(room => {
    schoolsInCluster.add(room.gt1_school);
    schoolsInCluster.add(room.gt2_school);
  });

  schoolsInCluster.add(gt1.school);
  schoolsInCluster.add(gt2.school);

  const validTeachers = allTeachers.filter(t =>
    !schoolsInCluster.has(t.school)
  );

  if (validTeachers.length > 0) {
    return validTeachers.reduce((min, t) =>
      workload[t.id] < workload[min.id] ? t : min
    );
  }

  return allTeachers.reduce((min, t) =>
    workload[t.id] < workload[min.id] ? t : min
  );
}

export function validateSchedule(
  schedules: ScheduleWithDetails[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  schedules.forEach(schedule => {
    if (schedule.gt1_school === schedule.gt2_school) {
      errors.push(
        `❌ ${schedule.session_name}, Phòng ${schedule.room_number}: GT1 và GT2 cùng trường (${schedule.gt1_school})`
      );
    }

    if (schedule.gt1_id === schedule.gt2_id) {
      errors.push(
        `❌ ${schedule.session_name}, Phòng ${schedule.room_number}: GT1 và GT2 trùng nhau`
      );
    }
  });

  const pairCount: { [key: string]: number } = {};
  schedules.forEach(schedule => {
    const pairKey = [schedule.gt1_id, schedule.gt2_id].sort().join('-');
    pairCount[pairKey] = (pairCount[pairKey] || 0) + 1;
  });

  Object.entries(pairCount).forEach(([pair, count]) => {
    if (count > 1) {
      const [id1, id2] = pair.split('-');
      const teacher1 = schedules.find(s => s.gt1_id === id1 || s.gt2_id === id1);
      const teacher2 = schedules.find(s => s.gt1_id === id2 || s.gt2_id === id2);

      if (teacher1 && teacher2) {
        const name1 = teacher1.gt1_id === id1 ? teacher1.gt1_name : teacher1.gt2_name;
        const name2 = teacher2.gt1_id === id2 ? teacher2.gt1_name : teacher2.gt2_name;

        warnings.push(
          `⚠️ Cặp ${name1} - ${name2} gác chung ${count} lần`
        );
      }
    }
  });

  const workloadMap: { [teacherId: string]: number } = {};

  schedules.forEach(schedule => {
    workloadMap[schedule.gt1_id] = (workloadMap[schedule.gt1_id] || 0) + 1;
    workloadMap[schedule.gt2_id] = (workloadMap[schedule.gt2_id] || 0) + 1;
    if (schedule.gt3_id) {
      workloadMap[schedule.gt3_id] = (workloadMap[schedule.gt3_id] || 0) + 1;
    }
  });

  const workloads = Object.values(workloadMap);
  if (workloads.length > 0) {
    const maxLoad = Math.max(...workloads);
    const minLoad = Math.min(...workloads);

    if (maxLoad - minLoad > 2) {
      warnings.push(
        `⚠️ Chênh lệch khối lượng công việc: ${maxLoad - minLoad} ca (max: ${maxLoad}, min: ${minLoad})`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export function calculateWorkload(
  schedules: ScheduleWithDetails[],
  teachers: Teacher[]
): TeacherWorkload[] {
  const workloadMap: { [teacherId: string]: number } = {};

  teachers.forEach(teacher => {
    workloadMap[teacher.id] = 0;
  });

  schedules.forEach(schedule => {
    workloadMap[schedule.gt1_id] = (workloadMap[schedule.gt1_id] || 0) + 1;
    workloadMap[schedule.gt2_id] = (workloadMap[schedule.gt2_id] || 0) + 1;
    if (schedule.gt3_id) {
      workloadMap[schedule.gt3_id] = (workloadMap[schedule.gt3_id] || 0) + 1;
    }
  });

  return teachers.map(teacher => ({
    teacher_id: teacher.id,
    teacher_name: teacher.name,
    school: teacher.school,
    workload: workloadMap[teacher.id] || 0
  })).sort((a, b) => b.workload - a.workload);
}

export function generateScheduleWithClusters(
  teachers: Teacher[],
  clusters: RoomCluster[],
  numSessions: number
): ScheduleWithDetails[] {
  const teachersBySchool = groupTeachersBySchool(teachers);
  const schools = Object.keys(teachersBySchool);

  if (schools.length < 2) {
    throw new Error('Cần ít nhất 2 trường để phân công');
  }

  const totalRooms = clusters.reduce((sum, cluster) => sum + cluster.room_count, 0);

  if (teachers.length < totalRooms * 2) {
    throw new Error(`Cần ít nhất ${totalRooms * 2} giám thị. Hiện tại chỉ có ${teachers.length}`);
  }

  const schedules: ScheduleWithDetails[] = [];
  const workload: TeacherWorkloadMap = {};
  const pairHistory: PairHistory = {};

  teachers.forEach(t => {
    workload[t.id] = 0;
  });

  for (let sessionNum = 1; sessionNum <= numSessions; sessionNum++) {
    const sessionName = `Buổi ${sessionNum}`;

    clusters.forEach(cluster => {
      const clusterSchedules: ScheduleWithDetails[] = [];

      const gt3 = findValidSupervisorForCluster(
        teachers,
        teachersBySchool,
        workload,
        [],
        cluster
      );

      if (gt3) {
        workload[gt3.id]++;
      }

      cluster.rooms.forEach(roomNum => {
        const { gt1, gt2 } = findValidPair(
          teachersBySchool,
          schools,
          workload,
          pairHistory,
          teachers
        );

        const pairKey = [gt1.id, gt2.id].sort().join('-');
        pairHistory[pairKey] = true;

        workload[gt1.id]++;
        workload[gt2.id]++;

        const schedule: ScheduleWithDetails = {
          id: `${sessionNum}-${roomNum}`,
          project_id: '',
          session_number: sessionNum,
          session_name: sessionName,
          room_number: roomNum,
          gt1_id: gt1.id,
          gt1_name: gt1.name,
          gt1_school: gt1.school,
          gt2_id: gt2.id,
          gt2_name: gt2.name,
          gt2_school: gt2.school,
          gt3_id: gt3?.id || teachers[0].id,
          gt3_name: gt3?.name || teachers[0].name,
          gt3_school: gt3?.school || teachers[0].school
        };

        clusterSchedules.push(schedule);
      });

      const gt3UsedSchools = new Set<string>();
      clusterSchedules.forEach(schedule => {
        gt3UsedSchools.add(schedule.gt1_school);
        gt3UsedSchools.add(schedule.gt2_school);
      });

      if (gt3 && gt3UsedSchools.has(gt3.school)) {
        const betterGt3 = findValidSupervisorForCluster(
          teachers,
          teachersBySchool,
          workload,
          clusterSchedules,
          cluster
        );

        if (betterGt3 && !gt3UsedSchools.has(betterGt3.school)) {
          workload[gt3.id]--;
          workload[betterGt3.id]++;

          clusterSchedules.forEach(schedule => {
            schedule.gt3_id = betterGt3.id;
            schedule.gt3_name = betterGt3.name;
            schedule.gt3_school = betterGt3.school;
          });
        }
      }

      schedules.push(...clusterSchedules);
    });
  }

  return schedules.sort((a, b) => {
    if (a.session_number !== b.session_number) {
      return a.session_number - b.session_number;
    }
    return a.room_number - b.room_number;
  });
}

function findValidSupervisorForCluster(
  allTeachers: Teacher[],
  teachersBySchool: TeachersBySchool,
  workload: TeacherWorkloadMap,
  clusterRooms: ScheduleWithDetails[],
  cluster: RoomCluster
): Teacher {
  const schoolsInCluster = new Set<string>();

  clusterRooms.forEach(room => {
    schoolsInCluster.add(room.gt1_school);
    schoolsInCluster.add(room.gt2_school);
  });

  const validTeachers = allTeachers.filter(t =>
    !schoolsInCluster.has(t.school)
  );

  if (validTeachers.length > 0) {
    return validTeachers.reduce((min, t) =>
      workload[t.id] < workload[min.id] ? t : min
    );
  }

  return allTeachers.reduce((min, t) =>
    workload[t.id] < workload[min.id] ? t : min
  );
}
