/*
  # Thêm bảng quản lý sơ đồ phòng thi

  1. Bảng mới
    - `room_layouts`: Lưu thông tin sơ đồ phòng thi
      - `id` (uuid, primary key)
      - `project_id` (uuid): FK đến projects
      - `room_number` (integer): Số phòng
      - `floor` (text): Tầng (VD: "Tầng 1", "Tầng 2")
      - `building` (text): Tòa nhà/Dãy (VD: "Dãy A", "Dãy B")
      - `cluster_id` (integer): ID cụm phòng cho GT3
      - `created_at` (timestamptz)

  2. Bảo mật
    - Bật RLS cho bảng room_layouts
    - Người dùng có thể quản lý room layouts của projects của họ

  3. Indexes
    - Index cho project_id để tăng tốc truy vấn
    - Index cho cluster_id để nhóm phòng
*/

-- Bảng room_layouts
CREATE TABLE IF NOT EXISTS room_layouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  room_number integer NOT NULL,
  floor text NOT NULL,
  building text DEFAULT '',
  cluster_id integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, room_number)
);

ALTER TABLE room_layouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view room layouts in own projects"
  ON room_layouts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = room_layouts.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create room layouts in own projects"
  ON room_layouts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = room_layouts.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update room layouts in own projects"
  ON room_layouts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = room_layouts.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = room_layouts.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete room layouts in own projects"
  ON room_layouts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = room_layouts.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_room_layouts_project_id ON room_layouts(project_id);
CREATE INDEX IF NOT EXISTS idx_room_layouts_cluster_id ON room_layouts(project_id, cluster_id);
CREATE INDEX IF NOT EXISTS idx_room_layouts_floor ON room_layouts(project_id, floor, building);