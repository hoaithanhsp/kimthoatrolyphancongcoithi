import { useState, useEffect } from 'react';
import { GraduationCap, Download, Loader2, Settings, Sparkles, Brain, Star, AlertCircle } from 'lucide-react';
import ConfigForm from './components/ConfigForm';
import FileUpload from './components/FileUpload';
import RoomLayoutUpload from './components/RoomLayoutUpload';
import TeacherStats from './components/TeacherStats';
import ScheduleTable from './components/ScheduleTable';
import ValidationResults from './components/ValidationResults';
import WorkloadChart from './components/WorkloadChart';
import ApiKeyModal from './components/ApiKeyModal';
import { generateSchedule, generateScheduleWithClusters, validateSchedule, calculateWorkload } from './lib/scheduler';
import { exportScheduleToExcel } from './lib/excel';
import { analyzeSchedule, type AiAnalysisResult } from './lib/geminiService';
import { loadConfig, saveConfig, loadApiKey } from './lib/storage';
import type { Teacher, ScheduleWithDetails, ValidationResult, TeacherWorkload, RoomCluster } from './types';

export default function App() {
  const savedConfig = loadConfig();
  const [numSchools, setNumSchools] = useState(savedConfig.numSchools);
  const [numRooms, setNumRooms] = useState(savedConfig.numRooms);
  const [numSessions, setNumSessions] = useState(savedConfig.numSessions);
  const [teachers, setTeachers] = useState<Omit<Teacher, 'id' | 'project_id'>[]>([]);
  const [roomClusters, setRoomClusters] = useState<RoomCluster[]>([]);
  const [schedules, setSchedules] = useState<ScheduleWithDetails[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [workload, setWorkload] = useState<TeacherWorkload[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysisResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [hasApiKey, setHasApiKey] = useState(!!loadApiKey());

  // Auto-save config when changed
  useEffect(() => {
    saveConfig({ numSchools, numRooms, numSessions });
  }, [numSchools, numRooms, numSessions]);

  // AI INSTRUCTIONS.md Mục 2: Khi chưa có key, hiển thị Modal bắt buộc nhập
  useEffect(() => {
    if (!loadApiKey()) {
      setShowApiKeyModal(true);
    }
  }, []);

  const handleTeachersLoaded = (loadedTeachers: Omit<Teacher, 'id' | 'project_id'>[]) => {
    setTeachers(loadedTeachers);
    setSchedules([]);
    setValidation(null);
    setWorkload([]);
    setError('');
    setAiAnalysis(null);
    setAiError('');
  };

  const handleRoomLayoutsLoaded = (clusters: RoomCluster[]) => {
    setRoomClusters(clusters);
    setSchedules([]);
    setValidation(null);
    setWorkload([]);
    setError('');
    setAiAnalysis(null);
  };

  const handleGenerateSchedule = () => {
    if (teachers.length === 0) {
      setError('Vui lòng tải lên danh sách giám thị trước');
      return;
    }

    setLoading(true);
    setError('');
    setAiAnalysis(null);
    setAiError('');

    try {
      const teachersWithIds: Teacher[] = teachers.map((t, index) => ({
        ...t,
        id: `teacher-${index}`,
        project_id: 'temp'
      }));

      let generatedSchedules: ScheduleWithDetails[];

      if (roomClusters.length > 0) {
        generatedSchedules = generateScheduleWithClusters(teachersWithIds, roomClusters, numSessions);
      } else {
        generatedSchedules = generateSchedule(teachersWithIds, numRooms, numSessions);
      }

      const validationResult = validateSchedule(generatedSchedules);
      const workloadResult = calculateWorkload(generatedSchedules, teachersWithIds);

      setSchedules(generatedSchedules);
      setValidation(validationResult);
      setWorkload(workloadResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tạo lịch phân công');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (schedules.length === 0) return;
    exportScheduleToExcel(schedules, workload);
  };

  const handleAiAnalysis = async () => {
    if (!loadApiKey()) {
      setShowApiKeyModal(true);
      return;
    }

    setAiLoading(true);
    setAiError('');
    setAiAnalysis(null);

    try {
      const result = await analyzeSchedule(schedules, workload);
      setAiAnalysis(result);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Lỗi phân tích AI');
    } finally {
      setAiLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-blue-600';
    if (score >= 4) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #ecfeff 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <header className="header-gradient px-8 py-6 mb-8">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Phân Công Coi Thi THPT
                </h1>
                <p className="text-white/80 text-sm mt-1">
                  Tuân thủ quy chế thi · Phân bổ công bằng · Tối ưu hóa
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* AI INSTRUCTIONS.md Mục 2: Nút Settings (API Key) kèm dòng chữ màu đỏ luôn hiển thị */}
              <button
                onClick={() => setShowApiKeyModal(true)}
                className="settings-btn"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings (API Key)</span>
              </button>
              <span className="text-red-300 text-xs font-semibold hidden md:inline">
                Lấy API key để sử dụng app
              </span>
            </div>
          </div>
          {!hasApiKey && (
            <div className="relative z-10 mt-4 flex items-center gap-2 text-sm bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-300" />
              <span className="text-red-200 font-medium">
                ⚠️ Chưa có API key · <button onClick={() => setShowApiKeyModal(true)} className="underline font-bold text-white hover:text-yellow-200 transition">Nhập ngay để sử dụng app</button>
              </span>
            </div>
          )}
        </header>

        {/* Main Content */}
        <div className="space-y-6">
          <ConfigForm
            numSchools={numSchools}
            numRooms={numRooms}
            numSessions={numSessions}
            onNumSchoolsChange={setNumSchools}
            onNumRoomsChange={setNumRooms}
            onNumSessionsChange={setNumSessions}
          />

          <FileUpload onTeachersLoaded={handleTeachersLoaded} />

          {teachers.length > 0 && (
            <RoomLayoutUpload
              onRoomLayoutsLoaded={handleRoomLayoutsLoaded}
              numRooms={numRooms}
            />
          )}

          {teachers.length > 0 && <TeacherStats teachers={teachers} />}

          {teachers.length > 0 && (
            <div className="flex justify-center">
              <button
                onClick={handleGenerateSchedule}
                disabled={loading}
                className="btn-primary flex items-center gap-3 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-5 h-5" />
                    Tạo lịch phân công
                  </>
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="alert-error flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {validation && <ValidationResults validation={validation} />}

          {schedules.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleExportExcel}
                className="btn-success flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Tải xuống Excel
              </button>
              <button
                onClick={handleAiAnalysis}
                disabled={aiLoading}
                className="btn-ai flex items-center gap-2"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AI đang phân tích...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    Phân tích bằng AI
                  </>
                )}
              </button>
            </div>
          )}

          {/* AI Error */}
          {aiError && (
            <div className="alert-warning flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800">Lỗi phân tích AI</p>
                <p className="text-amber-700 text-sm mt-1">{aiError}</p>
              </div>
            </div>
          )}

          {/* AI Analysis Results */}
          {aiAnalysis && (
            <div className="ai-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold ai-card-header text-lg">Phân tích AI</h3>
                  <p className="text-xs text-gray-500">Đánh giá tự động bằng Gemini AI</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Star className={`w-5 h-5 ${getScoreColor(aiAnalysis.overallScore)}`} />
                  <span className={`text-2xl font-bold ${getScoreColor(aiAnalysis.overallScore)}`}>
                    {aiAnalysis.overallScore}/10
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed">{aiAnalysis.summary}</p>

              {aiAnalysis.issues.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-red-700 mb-2 text-sm">⚠️ Vấn đề phát hiện</h4>
                  <ul className="space-y-1">
                    {aiAnalysis.issues.map((issue, i) => (
                      <li key={i} className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiAnalysis.suggestions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-green-700 mb-2 text-sm">💡 Gợi ý cải thiện</h4>
                  <ul className="space-y-1">
                    {aiAnalysis.suggestions.map((suggestion, i) => (
                      <li key={i} className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {schedules.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ScheduleTable schedules={schedules} />
              </div>
              <div>
                <WorkloadChart workload={workload} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="footer-gradient mt-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <GraduationCap className="w-5 h-5 text-blue-400" />
            <span className="font-semibold text-gray-300">Phân Công Coi Thi THPT</span>
          </div>
          <p className="text-sm text-gray-500">
            Tuân thủ quy chế thi tốt nghiệp THPT · Phiên bản 2.0
          </p>
        </footer>
      </div>

      {/* API Key Modal - AI INSTRUCTIONS.md: mandatory khi chưa có key */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => {
          setShowApiKeyModal(false);
          setHasApiKey(!!loadApiKey());
        }}
        mandatory={!hasApiKey}
      />
    </div>
  );
}
