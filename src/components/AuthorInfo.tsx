import { User, MapPin, School, LogOut } from 'lucide-react';

interface AuthorInfoProps {
    onLogout: () => void;
}

export default function AuthorInfo({ onLogout }: AuthorInfoProps) {
    return (
        <div className="glass-card p-5 mb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <img
                        src="/avatar.jpg"
                        alt="Trần Thị Kim Thoa"
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-lg"
                    />
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-indigo-500" />
                            <h3 className="font-bold text-gray-800">Trần Thị Kim Thoa</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <School className="w-3.5 h-3.5" />
                            <span>Trường THPT Hoàng Diệu</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            <span>Số 1 Mạc Đĩnh Chi, phường Phú Lợi, TP. Cần Thơ</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <img
                        src="/logo.jpg"
                        alt="Logo"
                        className="w-12 h-12 rounded-xl object-cover border border-gray-200 shadow hidden md:block"
                    />
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition font-medium"
                        title="Đăng xuất"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Đăng xuất</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
