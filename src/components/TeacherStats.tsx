import { Users, School, BarChart3 } from 'lucide-react';
import type { Teacher } from '../types';

interface TeacherStatsProps {
  teachers: Omit<Teacher, 'id' | 'project_id'>[];
}

export default function TeacherStats({ teachers }: TeacherStatsProps) {
  const schools = new Set(teachers.map(t => t.school));
  const avgPerSchool = teachers.length / schools.size;

  const schoolCounts = teachers.reduce((acc, teacher) => {
    acc[teacher.school] = (acc[teacher.school] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="section-icon bg-gradient-to-br from-purple-500 to-violet-500">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">Thống kê giám thị</h2>
          <p className="text-xs text-gray-500">Tổng quan danh sách đã tải lên</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat-card stat-card-blue">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-white/80" />
            <span className="text-sm text-white/80">Tổng giám thị</span>
          </div>
          <p className="text-3xl font-bold">{teachers.length}</p>
        </div>

        <div className="stat-card stat-card-green">
          <div className="flex items-center gap-2 mb-2">
            <School className="w-5 h-5 text-white/80" />
            <span className="text-sm text-white/80">Số trường</span>
          </div>
          <p className="text-3xl font-bold">{schools.size}</p>
        </div>

        <div className="stat-card stat-card-amber">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-white/80" />
            <span className="text-sm text-white/80">TB giám thị/trường</span>
          </div>
          <p className="text-3xl font-bold">{avgPerSchool.toFixed(1)}</p>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-800 mb-3 text-sm">📊 Phân bố theo trường</h3>
        <div className="space-y-2">
          {Object.entries(schoolCounts).map(([school, count]) => {
            const percentage = (count / teachers.length) * 100;
            return (
              <div key={school} className="p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-gray-700">{school}</span>
                  <span className="text-sm font-bold text-blue-600">{count} GT</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
