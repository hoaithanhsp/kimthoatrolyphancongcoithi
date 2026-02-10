import { Settings, Hash, Clock, School } from 'lucide-react';

interface ConfigFormProps {
  numSchools: number;
  numRooms: number;
  numSessions: number;
  onNumSchoolsChange: (value: number) => void;
  onNumRoomsChange: (value: number) => void;
  onNumSessionsChange: (value: number) => void;
}

export default function ConfigForm({
  numSchools,
  numRooms,
  numSessions,
  onNumSchoolsChange,
  onNumRoomsChange,
  onNumSessionsChange
}: ConfigFormProps) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="section-icon bg-gradient-to-br from-blue-500 to-indigo-500">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">Cấu hình kỳ thi</h2>
          <p className="text-xs text-gray-500">Thiết lập thông số cơ bản</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <School className="w-4 h-4 text-blue-600" />
            <label className="text-sm font-semibold text-gray-700">
              Số lượng trường
            </label>
          </div>
          <select
            value={numSchools}
            onChange={(e) => onNumSchoolsChange(Number(e.target.value))}
            className="input-modern"
          >
            <option value={2}>2 trường</option>
            <option value={3}>3 trường</option>
            <option value={4}>4 trường</option>
            <option value={5}>5 trường</option>
            <option value={6}>6 trường</option>
          </select>
          <p className="mt-2 text-xs text-gray-500">
            Số trường cung cấp giám thị
          </p>
        </div>

        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
          <div className="flex items-center gap-2 mb-3">
            <Hash className="w-4 h-4 text-green-600" />
            <label className="text-sm font-semibold text-gray-700">
              Số phòng thi
            </label>
          </div>
          <input
            type="number"
            min={5}
            max={50}
            value={numRooms}
            onChange={(e) => onNumRoomsChange(Number(e.target.value))}
            className="input-modern"
          />
          <p className="mt-2 text-xs text-gray-500">
            Từ 5 đến 50 phòng
          </p>
        </div>

        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-amber-600" />
            <label className="text-sm font-semibold text-gray-700">
              Số buổi thi
            </label>
          </div>
          <input
            type="number"
            min={1}
            max={10}
            value={numSessions}
            onChange={(e) => onNumSessionsChange(Number(e.target.value))}
            className="input-modern"
          />
          <p className="mt-2 text-xs text-gray-500">
            Từ 1 đến 10 buổi
          </p>
        </div>
      </div>

      <div className="mt-5 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
        <h3 className="text-sm font-bold text-indigo-800 mb-2">📊 Ước tính nhanh</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <span className="text-gray-600">Tổng số ca gác:</span>
            <span className="font-bold text-indigo-700">{numRooms * numSessions * 2}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-gray-600">GT tối thiểu:</span>
            <span className="font-bold text-blue-700">{Math.max(20, numRooms * 2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
