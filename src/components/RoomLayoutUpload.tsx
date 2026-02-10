import { Building2, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { parseRoomLayoutFromExcel, createClustersFromRoomLayouts, createSampleRoomLayoutFile } from '../lib/excel';
import type { RoomCluster } from '../types';

interface RoomLayoutUploadProps {
  onRoomLayoutsLoaded: (clusters: RoomCluster[]) => void;
  numRooms: number;
}

export default function RoomLayoutUpload({ onRoomLayoutsLoaded, numRooms }: RoomLayoutUploadProps) {
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [clusters, setClusters] = useState<RoomCluster[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');
    setLoading(true);

    try {
      const roomLayouts = await parseRoomLayoutFromExcel(file);

      if (roomLayouts.length !== numRooms) {
        setError(`Số phòng trong file (${roomLayouts.length}) không khớp với cấu hình (${numRooms})`);
        setLoading(false);
        return;
      }

      const roomNumbers = new Set(roomLayouts.map(r => r.room_number));
      if (roomNumbers.size !== roomLayouts.length) {
        setError('Có số phòng bị trùng lặp trong file');
        setLoading(false);
        return;
      }

      const generatedClusters = createClustersFromRoomLayouts(roomLayouts);

      if (generatedClusters.length === 0) {
        setError('Không thể tạo cụm phòng từ sơ đồ này');
        setLoading(false);
        return;
      }

      setClusters(generatedClusters);
      onRoomLayoutsLoaded(generatedClusters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi đọc file Excel');
      setClusters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSample = () => {
    createSampleRoomLayoutFile();
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="section-icon bg-gradient-to-br from-amber-500 to-orange-500">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">Sơ đồ phòng thi</h2>
          <p className="text-xs text-gray-500">Tùy chọn · Phân cụm GT3 theo tầng/dãy</p>
        </div>
        <span className="badge badge-warning ml-auto">Tùy chọn</span>
      </div>

      <div className="alert-info mb-4">
        <p className="text-sm text-blue-700">
          💡 Tải lên sơ đồ phòng thi để phân công GT3 hợp lý theo tầng và dãy phòng.
          Nếu không tải lên, hệ thống sẽ tự động phân chia theo cụm 5 phòng liên tiếp.
        </p>
      </div>

      <div className="mb-4">
        <details className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <summary className="cursor-pointer font-semibold text-gray-700 text-sm">
            📖 Hướng dẫn chuẩn bị file sơ đồ phòng thi
          </summary>
          <div className="mt-3 text-sm text-gray-600 space-y-2">
            <p className="font-medium">Cấu trúc file Excel:</p>
            <table className="w-full border border-gray-200 text-left text-sm rounded-lg overflow-hidden">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                <tr>
                  <th className="border border-gray-200 px-3 py-2 font-semibold">Số phòng</th>
                  <th className="border border-gray-200 px-3 py-2 font-semibold">Tầng</th>
                  <th className="border border-gray-200 px-3 py-2 font-semibold">Dãy/Tòa nhà</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 px-3 py-2">1</td>
                  <td className="border border-gray-200 px-3 py-2">Tầng 1</td>
                  <td className="border border-gray-200 px-3 py-2">Dãy A</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 px-3 py-2">2</td>
                  <td className="border border-gray-200 px-3 py-2">Tầng 1</td>
                  <td className="border border-gray-200 px-3 py-2">Dãy A</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-3 p-3 bg-amber-50 rounded-lg">
              <p className="font-semibold text-amber-800 text-xs mb-1">⚠️ Lưu ý:</p>
              <ul className="list-disc list-inside space-y-1 text-xs text-amber-700">
                <li>Số lượng phòng phải khớp với cấu hình ({numRooms} phòng)</li>
                <li>GT3 sẽ chỉ giám sát các phòng cùng tầng và cùng dãy</li>
                <li>Mỗi cụm phòng sẽ có từ 3-7 phòng</li>
              </ul>
            </div>
          </div>
        </details>
      </div>

      <div className="mb-4">
        <button
          onClick={handleDownloadSample}
          className="flex items-center gap-2 px-4 py-2 text-sm text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition font-medium"
        >
          <Download className="w-4 h-4" />
          Tải xuống file mẫu sơ đồ phòng thi
        </button>
      </div>

      <div className="upload-zone">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
          id="room-layout-upload"
        />
        <label htmlFor="room-layout-upload" className="cursor-pointer">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-amber-500" />
          </div>
          <p className="text-gray-600 mb-1">
            {fileName ? (
              <span className="font-semibold text-green-600">✅ {fileName}</span>
            ) : (
              <>
                <span className="text-amber-600 hover:text-amber-700 font-semibold">
                  Chọn file sơ đồ phòng thi
                </span>{' '}
                hoặc kéo thả vào đây
              </>
            )}
          </p>
          <p className="text-xs text-gray-400 mt-1">Chỉ hỗ trợ file .xlsx, .xls</p>
        </label>
      </div>

      {loading && (
        <div className="alert-info mt-4 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-blue-700 text-sm">Đang xử lý file...</span>
        </div>
      )}

      {error && (
        <div className="alert-error mt-4 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {clusters.length > 0 && (
        <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-green-800">
              Đã tạo {clusters.length} cụm phòng
            </h3>
          </div>
          <div className="space-y-2">
            {clusters.map(cluster => (
              <div key={cluster.cluster_id} className="bg-white/80 p-3 rounded-xl border border-green-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-800 text-sm">
                    🏢 Cụm {cluster.cluster_id}: {cluster.floor} {cluster.building && `- ${cluster.building}`}
                  </span>
                  <span className="badge badge-success">
                    {cluster.room_count} phòng
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  Phòng: {cluster.rooms.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
