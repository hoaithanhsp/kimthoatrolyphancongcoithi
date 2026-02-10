import { useState, useEffect } from 'react';
import { Key, X, ExternalLink, Sparkles, Check } from 'lucide-react';
import { saveApiKey, loadApiKey, saveAiModel, loadAiModel } from '../lib/storage';
import { getAvailableModels } from '../lib/geminiService';

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    mandatory?: boolean; // Khi chưa có key, modal bắt buộc nhập (không cho đóng)
}

export default function ApiKeyModal({ isOpen, onClose, mandatory = false }: ApiKeyModalProps) {
    const [apiKey, setApiKey] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [saved, setSaved] = useState(false);

    const models = getAvailableModels();

    useEffect(() => {
        if (isOpen) {
            setApiKey(loadApiKey());
            setSelectedModel(loadAiModel());
            setSaved(false);
        }
    }, [isOpen]);

    const handleSave = () => {
        if (!apiKey.trim()) return;
        saveApiKey(apiKey.trim());
        saveAiModel(selectedModel);
        setSaved(true);
        setTimeout(() => {
            onClose();
        }, 800);
    };

    if (!isOpen) return null;

    return (
        <div
            className="modal-overlay"
            onClick={mandatory ? undefined : onClose}
        >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Thiết lập Model & API Key</h2>
                            <p className="text-xs text-gray-500">Cài đặt Gemini AI</p>
                        </div>
                    </div>
                    {!mandatory && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    )}
                </div>

                {/* Mandatory notice */}
                {mandatory && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-sm text-red-700 font-semibold">
                            ⚠️ Vui lòng nhập API key để sử dụng ứng dụng
                        </p>
                    </div>
                )}

                {/* API Key Input */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Key className="w-4 h-4 inline mr-1" />
                        API Key
                    </label>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Nhập API key Gemini..."
                        className="input-modern"
                    />
                    {/* Link theo AI INSTRUCTIONS.md: https://aistudio.google.com/api-keys */}
                    <a
                        href="https://aistudio.google.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-700 transition"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Lấy API key miễn phí tại Google AI Studio
                    </a>
                </div>

                {/* Model Selection - Theo AI INSTRUCTIONS.md Mục 2:
            Hiển thị danh sách chọn Model AI (dạng thẻ/Cards)
            Thứ tự: gemini-3-flash-preview (Default), gemini-3-pro-preview, gemini-2.5-flash */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        <Sparkles className="w-4 h-4 inline mr-1" />
                        Chọn Model AI
                    </label>
                    <div className="space-y-2">
                        {models.map((model) => (
                            <button
                                key={model.id}
                                onClick={() => setSelectedModel(model.id)}
                                className={`w-full text-left p-3 rounded-xl border-2 transition-all ${selectedModel === model.id
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-800 text-sm">{model.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{model.description}</p>
                                    </div>
                                    {selectedModel === model.id && (
                                        <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                                            <Check className="w-3.5 h-3.5 text-white" />
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={!apiKey.trim()}
                    className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${saved
                            ? 'bg-green-500'
                            : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {saved ? (
                        <span className="flex items-center justify-center gap-2">
                            <Check className="w-5 h-5" />
                            Đã lưu!
                        </span>
                    ) : (
                        'Lưu cài đặt'
                    )}
                </button>

                {/* Note */}
                <p className="mt-3 text-xs text-gray-400 text-center">
                    API key được lưu trong trình duyệt của bạn, không gửi lên server.
                </p>
            </div>
        </div>
    );
}
