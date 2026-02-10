// Gemini AI Service - Phân tích và gợi ý tối ưu phân công coi thi
// Tuân thủ AI INSTRUCTIONS.md

import { loadApiKey, loadAiModel } from './storage';
import type { ScheduleWithDetails, TeacherWorkload } from '../types';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Theo AI INSTRUCTIONS.md - Mục 1:
// Model mặc định: gemini-3-pro-preview
// Fallback: gemini-3-flash-preview → gemini-3-pro-preview → gemini-2.5-flash
const FALLBACK_MODELS = [
    'gemini-3-flash-preview',
    'gemini-3-pro-preview',
    'gemini-2.5-flash',
];

export interface AiAnalysisResult {
    summary: string;
    issues: string[];
    suggestions: string[];
    overallScore: number; // 1-10
}

async function callGeminiApi(
    prompt: string,
    model: string,
    apiKey: string
): Promise<string> {
    const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 2048,
            }
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData?.error?.message || `HTTP ${response.status}`;
        throw new Error(`Lỗi API Gemini (${model}): ${errorMsg}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        throw new Error('Không nhận được phản hồi từ Gemini');
    }

    return text;
}

// Cơ chế Retry theo AI INSTRUCTIONS.md:
// Nếu gặp lỗi API, tự động thử lại với model tiếp theo trong danh sách
// Giữ nguyên kết quả các bước trước đó, chỉ retry bước đang lỗi
async function callWithFallback(prompt: string, apiKey: string): Promise<string> {
    const preferredModel = loadAiModel();
    const models = [preferredModel, ...FALLBACK_MODELS.filter(m => m !== preferredModel)];

    let lastError: Error | null = null;

    for (const model of models) {
        try {
            console.log(`🤖 Đang thử model: ${model}...`);
            return await callGeminiApi(prompt, model, apiKey);
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            console.warn(`⚠️ Model ${model} thất bại: ${lastError.message}. Tự động chuyển sang model tiếp theo...`);
        }
    }

    throw lastError || new Error('Tất cả model AI đều thất bại. Vui lòng kiểm tra API key hoặc thử lại sau.');
}

function buildAnalysisPrompt(
    schedules: ScheduleWithDetails[],
    workload: TeacherWorkload[]
): string {
    const schedulesSummary = schedules.slice(0, 30).map(s =>
        `Buổi ${s.session_number}, Phòng ${s.room_number}: GT1=${s.gt1_name}(${s.gt1_school}), GT2=${s.gt2_name}(${s.gt2_school}), GT3=${s.gt3_name}(${s.gt3_school})`
    ).join('\n');

    const workloadSummary = workload.map(w =>
        `${w.teacher_name} (${w.school}): ${w.workload} ca`
    ).join('\n');

    const totalSchedules = schedules.length;
    const workloads = workload.map(w => w.workload);
    const maxLoad = Math.max(...workloads);
    const minLoad = Math.min(...workloads);
    const avgLoad = (workloads.reduce((a, b) => a + b, 0) / workloads.length).toFixed(1);

    const violations = schedules.filter(s => s.gt1_school === s.gt2_school);

    return `Bạn là chuyên gia phân tích phân công coi thi THPT Việt Nam. Hãy phân tích lịch phân công sau và trả về JSON thuần (không markdown, không \`\`\`):

THỐNG KÊ:
- Tổng số phòng-buổi: ${totalSchedules}
- Tổng giám thị: ${workload.length}
- Khối lượng: min=${minLoad}, max=${maxLoad}, TB=${avgLoad}
- Vi phạm cùng trường GT1-GT2: ${violations.length}

LỊCH PHÂN CÔNG (${Math.min(30, totalSchedules)} dòng đầu):
${schedulesSummary}

KHỐI LƯỢNG:
${workloadSummary}

QUY CHẾ:
1. GT1 và GT2 trong cùng phòng KHÔNG được cùng trường
2. GT3 giám sát cụm phòng, không cùng trường với GT1/GT2
3. Khối lượng công việc phải cân bằng (chênh lệch ≤ 2 ca)
4. Cùng một cặp GT không nên gác chung quá 1 lần

Trả về JSON format:
{
  "summary": "Tóm tắt ngắn gọn đánh giá chung (2-3 câu)",
  "issues": ["Vấn đề 1", "Vấn đề 2"],
  "suggestions": ["Gợi ý cải thiện 1", "Gợi ý 2"],
  "overallScore": 8
}

Lưu ý: overallScore từ 1-10. Chỉ trả về JSON thuần, không markdown.`;
}

export async function analyzeSchedule(
    schedules: ScheduleWithDetails[],
    workload: TeacherWorkload[]
): Promise<AiAnalysisResult> {
    const apiKey = loadApiKey();

    if (!apiKey) {
        throw new Error('Vui lòng nhập API key Gemini trong phần Cài đặt');
    }

    if (schedules.length === 0) {
        throw new Error('Chưa có lịch phân công để phân tích');
    }

    const prompt = buildAnalysisPrompt(schedules, workload);
    const responseText = await callWithFallback(prompt, apiKey);

    try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Không tìm thấy JSON trong phản hồi');
        }

        const result = JSON.parse(jsonMatch[0]) as AiAnalysisResult;

        if (!result.summary || !Array.isArray(result.issues) || !Array.isArray(result.suggestions)) {
            throw new Error('Phản hồi thiếu trường bắt buộc');
        }

        result.overallScore = Math.max(1, Math.min(10, result.overallScore || 5));

        return result;
    } catch (parseError) {
        console.error('Parse error:', parseError, 'Raw response:', responseText);
        return {
            summary: responseText.slice(0, 300),
            issues: ['Không thể phân tích cấu trúc phản hồi từ AI'],
            suggestions: ['Thử phân tích lại'],
            overallScore: 5,
        };
    }
}

// Theo AI INSTRUCTIONS.md - Mục 2:
// Thứ tự hiển thị: gemini-3-flash-preview (Default), gemini-3-pro-preview, gemini-2.5-flash
export function getAvailableModels(): { id: string; name: string; description: string }[] {
    return [
        { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', description: 'Nhanh, hiệu quả (Mặc định)' },
        { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', description: 'Mạnh mẽ, chi tiết nhất' },
        { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Ổn định, phản hồi nhanh' },
    ];
}
