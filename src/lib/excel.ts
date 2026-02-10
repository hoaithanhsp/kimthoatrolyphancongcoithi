import * as XLSX from 'xlsx';
import type { Teacher, ScheduleWithDetails, TeacherWorkload, RoomLayout, RoomCluster } from '../types';

export interface ExcelTeacher {
  'Họ và tên': string;
  'Trường': string;
  'Vai trò ưu tiên'?: string;
}

export function parseTeachersFromExcel(file: File): Promise<Omit<Teacher, 'id' | 'project_id'>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: ExcelTeacher[] = XLSX.utils.sheet_to_json(worksheet);

        const teachers = jsonData.map(row => {
          const name = row['Họ và tên']?.toString().trim();
          const school = row['Trường']?.toString().trim();
          const preferredRole = row['Vai trò ưu tiên']?.toString().trim();

          if (!name || !school) {
            throw new Error('File Excel thiếu cột "Họ và tên" hoặc "Trường"');
          }

          let role: Teacher['preferred_role'] = null;
          if (preferredRole) {
            if (['GT1', 'GT2', 'GT3', 'Linh hoạt'].includes(preferredRole)) {
              role = preferredRole as Teacher['preferred_role'];
            }
          }

          return {
            name,
            school,
            preferred_role: role
          };
        });

        if (teachers.length === 0) {
          throw new Error('File Excel không có dữ liệu');
        }

        resolve(teachers);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Không thể đọc file'));
    };

    reader.readAsBinaryString(file);
  });
}

export function exportScheduleToExcel(
  schedules: ScheduleWithDetails[],
  workload: TeacherWorkload[]
): void {
  const scheduleData = schedules.map(s => ({
    'Buổi': s.session_name,
    'Phòng': s.room_number,
    'GT1': s.gt1_name,
    'Trường GT1': s.gt1_school,
    'GT2': s.gt2_name,
    'Trường GT2': s.gt2_school,
    'GT3': s.gt3_name,
    'Trường GT3': s.gt3_school
  }));

  const workloadData = workload.map(w => ({
    'Giám thị': w.teacher_name,
    'Trường': w.school,
    'Số ca gác': w.workload
  }));

  const wb = XLSX.utils.book_new();

  const wsSchedule = XLSX.utils.json_to_sheet(scheduleData);
  XLSX.utils.book_append_sheet(wb, wsSchedule, 'Lịch phân công');

  const wsWorkload = XLSX.utils.json_to_sheet(workloadData);
  XLSX.utils.book_append_sheet(wb, wsWorkload, 'Khối lượng công việc');

  const sessionStats = schedules.reduce((acc, s) => {
    acc[s.session_name] = (acc[s.session_name] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const statsData = Object.entries(sessionStats).map(([session, count]) => ({
    'Buổi thi': session,
    'Số phòng': count
  }));

  const wsStats = XLSX.utils.json_to_sheet(statsData);
  XLSX.utils.book_append_sheet(wb, wsStats, 'Thống kê');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  XLSX.writeFile(wb, `lich_phan_cong_${timestamp}.xlsx`);
}

export function createSampleExcelFile(): void {
  const sampleData = [
    { 'Họ và tên': 'Nguyễn Văn A', 'Trường': 'Trường A', 'Vai trò ưu tiên': 'GT1' },
    { 'Họ và tên': 'Trần Thị B', 'Trường': 'Trường B', 'Vai trò ưu tiên': 'GT2' },
    { 'Họ và tên': 'Lê Văn C', 'Trường': 'Trường C', 'Vai trò ưu tiên': 'GT3' },
    { 'Họ và tên': 'Phạm Thị D', 'Trường': 'Trường D', 'Vai trò ưu tiên': 'Linh hoạt' },
    { 'Họ và tên': 'Hoàng Văn E', 'Trường': 'Trường A', 'Vai trò ưu tiên': '' },
    { 'Họ và tên': 'Đỗ Thị F', 'Trường': 'Trường B', 'Vai trò ưu tiên': '' },
    { 'Họ và tên': 'Vũ Văn G', 'Trường': 'Trường C', 'Vai trò ưu tiên': '' },
    { 'Họ và tên': 'Bùi Thị H', 'Trường': 'Trường D', 'Vai trò ưu tiên': '' },
    { 'Họ và tên': 'Đặng Văn I', 'Trường': 'Trường A', 'Vai trò ưu tiên': '' },
    { 'Họ và tên': 'Mai Thị K', 'Trường': 'Trường B', 'Vai trò ưu tiên': '' },
    { 'Họ và tên': 'Dương Văn L', 'Trường': 'Trường C', 'Vai trò ưu tiên': '' },
    { 'Họ và tên': 'Võ Thị M', 'Trường': 'Trường D', 'Vai trò ưu tiên': '' },
    { 'Họ và tên': 'Trương Văn N', 'Trường': 'Trường A', 'Vai trò ưu tiên': '' },
    { 'Họ và tên': 'Lý Thị O', 'Trường': 'Trường B', 'Vai trò ưu tiên': '' },
    { 'Họ và tên': 'Phan Văn P', 'Trường': 'Trường C', 'Vai trò ưu tiên': '' },
    { 'Họ và tên': 'Chu Thị Q', 'Trường': 'Trường D', 'Vai trò ưu tiên': '' },
    { 'Họ và tên': 'Đinh Văn R', 'Trường': 'Trường A', 'Vai trò ưu tiên': '' },
    { 'Họ và tên': 'Hà Thị S', 'Trường': 'Trường B', 'Vai trò ưu tiên': '' },
    { 'Họ và tên': 'Cao Văn T', 'Trường': 'Trường C', 'Vai trò ưu tiên': '' },
    { 'Họ và tên': 'La Thị U', 'Trường': 'Trường D', 'Vai trò ưu tiên': '' }
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(sampleData);
  XLSX.utils.book_append_sheet(wb, ws, 'Danh sách giám thị');
  XLSX.writeFile(wb, 'mau_danh_sach_giam_thi.xlsx');
}

export interface ExcelRoomLayout {
  'Số phòng': number;
  'Tầng': string;
  'Dãy/Tòa nhà'?: string;
}

export function parseRoomLayoutFromExcel(file: File): Promise<Omit<RoomLayout, 'id' | 'project_id' | 'cluster_id'>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: ExcelRoomLayout[] = XLSX.utils.sheet_to_json(worksheet);

        const roomLayouts = jsonData.map(row => {
          const roomNumber = row['Số phòng'];
          const floor = row['Tầng']?.toString().trim();
          const building = row['Dãy/Tòa nhà']?.toString().trim() || '';

          if (!roomNumber || !floor) {
            throw new Error('File Excel thiếu cột "Số phòng" hoặc "Tầng"');
          }

          return {
            room_number: Number(roomNumber),
            floor,
            building
          };
        });

        if (roomLayouts.length === 0) {
          throw new Error('File Excel không có dữ liệu');
        }

        resolve(roomLayouts);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Không thể đọc file'));
    };

    reader.readAsBinaryString(file);
  });
}

export function createClustersFromRoomLayouts(roomLayouts: Omit<RoomLayout, 'id' | 'project_id' | 'cluster_id'>[]): RoomCluster[] {
  const sortedRooms = [...roomLayouts].sort((a, b) => a.room_number - b.room_number);

  const clusters: RoomCluster[] = [];
  let currentCluster: RoomCluster | null = null;
  let clusterId = 1;

  sortedRooms.forEach((room) => {
    const floorKey = `${room.floor}-${room.building}`;

    if (!currentCluster ||
        currentCluster.floor !== room.floor ||
        currentCluster.building !== room.building ||
        currentCluster.room_count >= 7) {

      if (currentCluster && currentCluster.room_count >= 3) {
        clusters.push(currentCluster);
      } else if (currentCluster && currentCluster.room_count < 3) {
        if (clusters.length > 0) {
          const lastCluster = clusters[clusters.length - 1];
          if (lastCluster.floor === currentCluster.floor &&
              lastCluster.building === currentCluster.building &&
              lastCluster.room_count + currentCluster.room_count <= 7) {
            lastCluster.rooms.push(...currentCluster.rooms);
            lastCluster.room_count += currentCluster.room_count;
          } else {
            clusters.push(currentCluster);
          }
        } else {
          clusters.push(currentCluster);
        }
      }

      currentCluster = {
        cluster_id: clusterId++,
        floor: room.floor,
        building: room.building,
        rooms: [room.room_number],
        room_count: 1
      };
    } else {
      currentCluster.rooms.push(room.room_number);
      currentCluster.room_count++;
    }
  });

  if (currentCluster) {
    if (currentCluster.room_count < 3 && clusters.length > 0) {
      const lastCluster = clusters[clusters.length - 1];
      if (lastCluster.floor === currentCluster.floor &&
          lastCluster.building === currentCluster.building &&
          lastCluster.room_count + currentCluster.room_count <= 7) {
        lastCluster.rooms.push(...currentCluster.rooms);
        lastCluster.room_count += currentCluster.room_count;
      } else {
        clusters.push(currentCluster);
      }
    } else {
      clusters.push(currentCluster);
    }
  }

  return clusters;
}

export function createSampleRoomLayoutFile(): void {
  const sampleData = [
    { 'Số phòng': 1, 'Tầng': 'Tầng 1', 'Dãy/Tòa nhà': 'Dãy A' },
    { 'Số phòng': 2, 'Tầng': 'Tầng 1', 'Dãy/Tòa nhà': 'Dãy A' },
    { 'Số phòng': 3, 'Tầng': 'Tầng 1', 'Dãy/Tòa nhà': 'Dãy A' },
    { 'Số phòng': 4, 'Tầng': 'Tầng 1', 'Dãy/Tòa nhà': 'Dãy A' },
    { 'Số phòng': 5, 'Tầng': 'Tầng 1', 'Dãy/Tòa nhà': 'Dãy A' },
    { 'Số phòng': 6, 'Tầng': 'Tầng 2', 'Dãy/Tòa nhà': 'Dãy A' },
    { 'Số phòng': 7, 'Tầng': 'Tầng 2', 'Dãy/Tòa nhà': 'Dãy A' },
    { 'Số phòng': 8, 'Tầng': 'Tầng 2', 'Dãy/Tòa nhà': 'Dãy A' },
    { 'Số phòng': 9, 'Tầng': 'Tầng 2', 'Dãy/Tòa nhà': 'Dãy A' },
    { 'Số phòng': 10, 'Tầng': 'Tầng 2', 'Dãy/Tòa nhà': 'Dãy A' }
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(sampleData);
  XLSX.utils.book_append_sheet(wb, ws, 'Sơ đồ phòng thi');
  XLSX.writeFile(wb, 'mau_so_do_phong_thi.xlsx');
}
