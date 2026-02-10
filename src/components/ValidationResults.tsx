import { CheckCircle, AlertCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { ValidationResult } from '../types';

interface ValidationResultsProps {
  validation: ValidationResult;
}

export default function ValidationResults({ validation }: ValidationResultsProps) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`section-icon ${validation.valid ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gradient-to-br from-red-500 to-rose-500'}`}>
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">Kiểm tra tính hợp lệ</h2>
          <p className="text-xs text-gray-500">Xác minh theo quy chế thi</p>
        </div>
      </div>

      {validation.valid ? (
        <div className="alert-success flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-green-800">✅ Lịch phân công hợp lệ</p>
            <p className="text-sm text-green-700 mt-1">
              Tất cả các ràng buộc đều được tuân thủ
            </p>
          </div>
        </div>
      ) : (
        <div className="alert-error flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-800">❌ Lịch có lỗi</p>
            <p className="text-sm text-red-700 mt-1">
              Một số ràng buộc chưa được tuân thủ
            </p>
          </div>
        </div>
      )}

      {validation.errors.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold text-red-800 mb-2 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Lỗi ({validation.errors.length})
          </h3>
          <div className="space-y-2">
            {validation.errors.map((error, index) => (
              <div
                key={index}
                className="alert-error text-sm"
              >
                {error}
              </div>
            ))}
          </div>
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold text-amber-800 mb-2 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Cảnh báo ({validation.warnings.length})
          </h3>
          <div className="space-y-2">
            {validation.warnings.map((warning, index) => (
              <div
                key={index}
                className="alert-warning text-sm"
              >
                {warning}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
