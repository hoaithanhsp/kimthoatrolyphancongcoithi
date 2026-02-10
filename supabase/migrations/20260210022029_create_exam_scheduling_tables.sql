/*
  # Tạo schema cho hệ thống phân công giám thị coi thi

  1. Bảng mới
    - `projects`: Lưu thông tin các đợt thi
      - `id` (uuid, primary key)
      - `name` (text): Tên đợt thi
      - `num_schools` (integer): Số trường tham gia
      - `num_rooms` (integer): Số phòng thi
      - `num_sessions` (integer): Số buổi thi
      - `created_at` (timestamptz): Thời gian tạo
      - `user_id` (uuid): ID người tạo
    
    - `teachers`: Lưu danh sách giám thị
      - `id` (uuid, primary key)
      - `project_id` (uuid): FK đến projects
      - `name` (text): Họ tên giám thị
      - `school` (text): Tên trường
      - `preferred_role` (text): Vai trò ưu tiên (GT1/GT2/GT3)
      - `created_at` (timestamptz)
    
    - `schedules`: Lưu lịch phân công
      - `id` (uuid, primary key)
      - `project_id` (uuid): FK đến projects
      - `session_number` (integer): Số thứ tự buổi thi
      - `session_name` (text): Tên buổi thi
      - `room_number` (integer): Số phòng
      - `gt1_id` (uuid): FK đến teachers
      - `gt2_id` (uuid): FK đến teachers
      - `gt3_id` (uuid): FK đến teachers
      - `created_at` (timestamptz)

  2. Bảo mật
    - Bật RLS cho tất cả các bảng
    - Người dùng đã xác thực có thể tạo và xem dữ liệu của họ
*/

-- Bảng projects
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  num_schools integer NOT NULL CHECK (num_schools >= 2 AND num_schools <= 4),
  num_rooms integer NOT NULL CHECK (num_rooms >= 5 AND num_rooms <= 50),
  num_sessions integer NOT NULL CHECK (num_sessions >= 1 AND num_sessions <= 10),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Bảng teachers
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  school text NOT NULL,
  preferred_role text CHECK (preferred_role IN ('GT1', 'GT2', 'GT3', 'Linh hoạt', NULL)),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view teachers in own projects"
  ON teachers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = teachers.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create teachers in own projects"
  ON teachers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = teachers.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update teachers in own projects"
  ON teachers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = teachers.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = teachers.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete teachers in own projects"
  ON teachers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = teachers.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Bảng schedules
CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  session_number integer NOT NULL,
  session_name text NOT NULL,
  room_number integer NOT NULL,
  gt1_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  gt2_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  gt3_id uuid REFERENCES teachers(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view schedules in own projects"
  ON schedules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = schedules.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create schedules in own projects"
  ON schedules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = schedules.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete schedules in own projects"
  ON schedules FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = schedules.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Indexes để tăng hiệu suất truy vấn
CREATE INDEX IF NOT EXISTS idx_teachers_project_id ON teachers(project_id);
CREATE INDEX IF NOT EXISTS idx_teachers_school ON teachers(school);
CREATE INDEX IF NOT EXISTS idx_schedules_project_id ON schedules(project_id);
CREATE INDEX IF NOT EXISTS idx_schedules_session ON schedules(session_number, room_number);