import { BarChart3 } from 'lucide-react';
import type { TeacherWorkload } from '../types';

interface WorkloadChartProps {
  workload: TeacherWorkload[];
}

const GRADIENT_COLORS = [
  { from: '#3b82f6', to: '#6366f1' },
  { from: '#10b981', to: '#06b6d4' },
  { from: '#f59e0b', to: '#ef4444' },
  { from: '#8b5cf6', to: '#d946ef' },
  { from: '#06b6d4', to: '#3b82f6' },
];

export default function WorkloadChart({ workload }: WorkloadChartProps) {
  const maxWorkload = Math.max(...workload.map(w => w.workload), 1);

  const getGradient = (index: number) => {
    const color = GRADIENT_COLORS[index % GRADIENT_COLORS.length];
    return `linear-gradient(90deg, ${color.from}, ${color.to})`;
  };

  const getWorkloadColor = (work: number): string => {
    const ratio = work / maxWorkload;
    if (ratio > 0.8) return 'text-red-600';
    if (ratio > 0.5) return 'text-amber-600';
    return 'text-blue-600';
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="section-icon bg-gradient-to-br from-cyan-500 to-blue-500">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">Khối lượng</h2>
          <p className="text-xs text-gray-500">Phân bố ca gác</p>
        </div>
      </div>

      <div className="space-y-3">
        {workload.map((item, index) => {
          const percentage = (item.workload / maxWorkload) * 100;

          return (
            <div key={item.teacher_id} className="group">
              <div className="flex items-center justify-between text-sm mb-1">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate text-xs">{item.teacher_name}</p>
                  <p className="text-xs text-gray-400">{item.school}</p>
                </div>
                <span className={`ml-3 font-bold flex-shrink-0 ${getWorkloadColor(item.workload)}`}>
                  {item.workload} ca
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    background: getGradient(index)
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {workload.length === 0 && (
        <p className="text-center text-gray-400 py-8 text-sm">Chưa có dữ liệu</p>
      )}

      {workload.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs">
          <div className="bg-blue-50 rounded-lg p-2.5 text-center">
            <p className="text-gray-500">Min</p>
            <p className="font-bold text-blue-700">
              {Math.min(...workload.map(w => w.workload))} ca
            </p>
          </div>
          <div className="bg-amber-50 rounded-lg p-2.5 text-center">
            <p className="text-gray-500">Max</p>
            <p className="font-bold text-amber-700">
              {Math.max(...workload.map(w => w.workload))} ca
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
