import { Upload, FileSpreadsheet, Download, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { parseTeachersFromExcel, createSampleExcelFile } from '../lib/excel';
import type { Teacher } from '../types';

interface FileUploadProps {
  onTeachersLoaded: (teachers: Omit<Teacher, 'id' | 'project_id'>[]) => void;
}

export default function FileUpload({ onTeachersLoaded }: FileUploadProps) {
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [teacherCount, setTeacherCount] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');
    setLoading(true);

    try {
      const teachers = await parseTeachersFromExcel(file);

      if (teachers.length < 20) {
        setError(`Cần ít nhất 20 giám thị. File hiện tại chỉ có ${teachers.length} giám thị.`);
        return;
      }

      const schools = new Set(teachers.map(t => t.school));
      if (schools.size < 2) {
        setError('Cần ít nhất 2 trường khác nhau trong danh sách.');
        return;
      }

      setTeacherCount(teachers.length);
      onTeachersLoaded(teachers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi đọc file Excel');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSample = () => {
    createSampleExcelFile();
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="section-icon bg-gradient-to-br from-emerald-500 to-green-500">
          <FileSpreadsheet className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">Tải lên danh sách giám thị</h2>
          <p className="text-xs text-gray-500">File Excel (.xlsx, .xls)</p>
        </div>
      </div>

      <div className="mb-4">
        <details className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <summary className="cursor-pointer font-semibold text-gray-700 text-sm">
            📖 Hướng dẫn chuẩn bị file Excel
          </summary>
          <div className="mt-3 text-sm text-gray-600 space-y-2">
            <p className="font-medium">Cấu trúc file Excel:</p>
            <table className="w-full border border-gray-200 text-left text-sm rounded-lg overflow-hidden">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                <tr>
                  <th className="border border-gray-200 px-3 py-2 font-semibold">Họ và tên</th>
                  <th className="border border-gray-200 px-3 py-2 font-semibold">Trường</th>
                  <th className="border border-gray-200 px-3 py-2 font-semibold">Vai trò ưu tiên</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 px-3 py-2">Nguyễn Văn A</td>
                  <td className="border border-gray-200 px-3 py-2">Trường A</td>
                  <td className="border border-gray-200 px-3 py-2">GT1</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 px-3 py-2">Trần Thị B</td>
                  <td className="border border-gray-200 px-3 py-2">Trường B</td>
                  <td className="border border-gray-200 px-3 py-2">GT2</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="font-semibold text-blue-800 text-xs mb-1">💡 Lưu ý:</p>
              <ul className="list-disc list-inside space-y-1 text-xs text-blue-700">
                <li>Cột "Vai trò ưu tiên" là tùy chọn (GT1, GT2, GT3, Linh hoạt)</li>
                <li>File phải có ít nhất 20 giám thị</li>
                <li>Cần ít nhất 2 trường khác nhau</li>
              </ul>
            </div>
          </div>
        </details>
      </div>

      <div className="mb-4">
        <button
          onClick={handleDownloadSample}
          className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition font-medium"
        >
          <Download className="w-4 h-4" />
          Tải xuống file mẫu
        </button>
      </div>

      <div className="upload-zone">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
            <Upload className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-gray-600 mb-1">
            {fileName ? (
              <span className="font-semibold text-green-600">✅ {fileName}</span>
            ) : (
              <>
                <span className="text-blue-600 hover:text-blue-700 font-semibold">
                  Chọn file Excel
                </span>{' '}
                hoặc kéo thả vào đây
              </>
            )}
          </p>
          {teacherCount > 0 && (
            <p className="text-xs text-green-600 font-medium">Đã tải {teacherCount} giám thị</p>
          )}
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
    </div>
  );
}
