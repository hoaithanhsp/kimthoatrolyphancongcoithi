import { Calendar } from 'lucide-react';
import type { ScheduleWithDetails } from '../types';

interface ScheduleTableProps {
  schedules: ScheduleWithDetails[];
}

export default function ScheduleTable({ schedules }: ScheduleTableProps) {
  const sessions = [...new Set(schedules.map(s => s.session_name))];

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="section-icon bg-gradient-to-br from-indigo-500 to-blue-500">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">Lịch phân công</h2>
          <p className="text-xs text-gray-500">{schedules.length} phòng-buổi</p>
        </div>
      </div>

      <div className="space-y-6">
        {sessions.map(session => {
          const sessionSchedules = schedules.filter(s => s.session_name === session);

          return (
            <div key={session} className="rounded-xl overflow-hidden border border-gray-200">
              <div className="bg-gradient-to-r from-indigo-500 to-blue-500 px-5 py-3">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {session}
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full ml-2">
                    {sessionSchedules.length} phòng
                  </span>
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="schedule-table w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left">Phòng</th>
                      <th className="text-left">GT1</th>
                      <th className="text-left">Trường GT1</th>
                      <th className="text-left">GT2</th>
                      <th className="text-left">Trường GT2</th>
                      <th className="text-left">GT3</th>
                      <th className="text-left">Trường GT3</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionSchedules.map(schedule => (
                      <tr key={schedule.id}>
                        <td className="font-bold text-gray-900">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-bold">
                            {schedule.room_number}
                          </span>
                        </td>
                        <td className="font-medium text-gray-800">{schedule.gt1_name}</td>
                        <td>
                          <span className="badge badge-primary">{schedule.gt1_school}</span>
                        </td>
                        <td className="font-medium text-gray-800">{schedule.gt2_name}</td>
                        <td>
                          <span className="badge badge-success">{schedule.gt2_school}</span>
                        </td>
                        <td className="font-medium text-gray-800">{schedule.gt3_name}</td>
                        <td>
                          <span className="badge badge-warning">{schedule.gt3_school}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
