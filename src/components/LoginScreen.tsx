import { useState } from 'react';
import { LogIn, Eye, EyeOff } from 'lucide-react';

interface LoginScreenProps {
    onLogin: () => void;
}

// Thông tin đăng nhập theo GV/THÔNG TIN GV.txt
const VALID_USER = 'Trần Thị Kim Thoa';
const VALID_PASS = '12345';

export default function LoginScreen({ onLogin }: LoginScreenProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [shake, setShake] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (username.trim() === VALID_USER && password === VALID_PASS) {
            // Lưu trạng thái đăng nhập
            localStorage.setItem('pcct_logged_in', 'true');
            onLogin();
        } else {
            setError('Tên đăng nhập hoặc mật khẩu không đúng');
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4338ca 60%, #6366f1 100%)' }}>
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/5 rounded-full blur-3xl"></div>
            </div>

            <div className={`relative w-full max-w-md mx-4 ${shake ? 'animate-shake' : ''}`}>
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-4 shadow-2xl">
                        <img src="/logo.jpg" alt="Logo" className="w-14 h-14 rounded-xl object-cover" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Phân Công Coi Thi THPT
                    </h1>
                    <p className="text-indigo-200 text-sm">
                        Đăng nhập để sử dụng hệ thống
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-semibold text-indigo-100 mb-2">
                                Tên đăng nhập
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                                placeholder="Nhập tên đăng nhập..."
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-indigo-300/60 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 transition"
                                autoFocus
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-indigo-100 mb-2">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                    placeholder="Nhập mật khẩu..."
                                    className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-indigo-300/60 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-300 hover:text-white transition"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="p-3 bg-red-500/20 border border-red-400/30 rounded-xl">
                                <p className="text-red-200 text-sm text-center font-medium">{error}</p>
                            </div>
                        )}

                        {/* Submit button */}
                        <button
                            type="submit"
                            className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                            <LogIn className="w-5 h-5" />
                            Đăng nhập
                        </button>
                    </form>

                    {/* Author info */}
                    <div className="mt-6 pt-5 border-t border-white/10">
                        <div className="flex items-center gap-3">
                            <img
                                src="/avatar.jpg"
                                alt="Avatar"
                                className="w-12 h-12 rounded-full object-cover border-2 border-white/30 shadow-lg"
                            />
                            <div>
                                <p className="text-sm font-semibold text-white">Trần Thị Kim Thoa</p>
                                <p className="text-xs text-indigo-300">Trường THPT Hoàng Diệu</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-indigo-300/60 text-xs mt-6">
                    © 2026 Phân Công Coi Thi THPT · Phiên bản 2.0
                </p>
            </div>

            <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
        </div>
    );
}
