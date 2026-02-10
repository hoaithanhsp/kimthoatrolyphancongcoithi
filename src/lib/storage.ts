// localStorage service - thay thế Supabase

const STORAGE_KEYS = {
    CONFIG: 'pcct_config',
    API_KEY: 'pcct_gemini_api_key',
    AI_MODEL: 'pcct_ai_model',
    LAST_SCHEDULE: 'pcct_last_schedule',
} as const;

export interface AppConfig {
    numSchools: number;
    numRooms: number;
    numSessions: number;
}

const DEFAULT_CONFIG: AppConfig = {
    numSchools: 4,
    numRooms: 10,
    numSessions: 2,
};

export function saveConfig(config: AppConfig): void {
    try {
        localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    } catch (e) {
        console.error('Lỗi lưu cấu hình:', e);
    }
}

export function loadConfig(): AppConfig {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
        if (data) {
            return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
        }
    } catch (e) {
        console.error('Lỗi đọc cấu hình:', e);
    }
    return DEFAULT_CONFIG;
}

export function saveApiKey(key: string): void {
    try {
        localStorage.setItem(STORAGE_KEYS.API_KEY, key);
    } catch (e) {
        console.error('Lỗi lưu API key:', e);
    }
}

export function loadApiKey(): string {
    try {
        return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
    } catch (e) {
        console.error('Lỗi đọc API key:', e);
        return '';
    }
}

export function saveAiModel(model: string): void {
    try {
        localStorage.setItem(STORAGE_KEYS.AI_MODEL, model);
    } catch (e) {
        console.error('Lỗi lưu AI model:', e);
    }
}

export function loadAiModel(): string {
    try {
        return localStorage.getItem(STORAGE_KEYS.AI_MODEL) || 'gemini-3-flash-preview';
    } catch (e) {
        console.error('Lỗi đọc AI model:', e);
        return 'gemini-3-flash-preview';
    }
}

export function saveLastSchedule(data: unknown): void {
    try {
        localStorage.setItem(STORAGE_KEYS.LAST_SCHEDULE, JSON.stringify(data));
    } catch (e) {
        console.error('Lỗi lưu lịch phân công:', e);
    }
}

export function loadLastSchedule<T>(): T | null {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.LAST_SCHEDULE);
        if (data) {
            return JSON.parse(data) as T;
        }
    } catch (e) {
        console.error('Lỗi đọc lịch phân công:', e);
    }
    return null;
}

export function clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
}
