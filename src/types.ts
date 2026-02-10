export interface Teacher {
  id: string;
  project_id: string;
  name: string;
  school: string;
  preferred_role?: 'GT1' | 'GT2' | 'GT3' | 'Linh hoạt' | null;
  created_at?: string;
}

export interface Project {
  id: string;
  name: string;
  num_schools: number;
  num_rooms: number;
  num_sessions: number;
  user_id?: string;
  created_at?: string;
}

export interface Schedule {
  id: string;
  project_id: string;
  session_number: number;
  session_name: string;
  room_number: number;
  gt1_id: string;
  gt2_id: string;
  gt3_id: string;
  created_at?: string;
}

export interface ScheduleWithDetails extends Schedule {
  gt1_name: string;
  gt1_school: string;
  gt2_name: string;
  gt2_school: string;
  gt3_name: string;
  gt3_school: string;
}

export interface TeacherWorkload {
  teacher_id: string;
  teacher_name: string;
  school: string;
  workload: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ScheduleGenerationResult {
  schedules: ScheduleWithDetails[];
  validation: ValidationResult;
  workload: TeacherWorkload[];
}

export interface RoomLayout {
  id: string;
  project_id: string;
  room_number: number;
  floor: string;
  building: string;
  cluster_id?: number;
  created_at?: string;
}

export interface RoomCluster {
  cluster_id: number;
  floor: string;
  building: string;
  rooms: number[];
  room_count: number;
}
