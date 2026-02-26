import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Loader2, CheckCircle2, Eye, EyeOff, Sun, Moon } from 'lucide-react';

export const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const { user, login, logout } = useAuth();
    const navigate = useNavigate();

    const toggleTheme = () => {
        const switchTheme = () => {
            const newIsDark = !isDark;
            setIsDark(newIsDark);
            if (newIsDark) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
        };

        if (!document.startViewTransition) {
            switchTheme();
            return;
        }
        document.startViewTransition(switchTheme);
    };

    useEffect(() => {
        if (token) {
            if (user) logout();
            setIsLogin(false);
            const validateInvitation = async () => {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/clinics/invitations/validate/${token}`);
                    const data = await response.json();
                    if (response.ok) {
                        setEmail(data.email);
                        setSuccessMsg(`Invitación válida para ${data.clinic_name}`);
                    } else {
                        setError(data.error || "Invitación no válida");
                    }
                } catch (err) {
                    setError("Error de conexión");
                }
            };
            validateInvitation();
        }
    }, [token, user, logout]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        const payload = isLogin ? { email, password } : { name, email, password };

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const resData = await response.json();
            if (!response.ok) throw new Error(resData.message || 'Error en la operación');

            if (!isLogin && token) {
                await fetch(`${import.meta.env.VITE_API_URL}/api/clinics/accept-invitation`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token, userId: resData.user.id })
                });
            }
            login(resData.user);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] dark:bg-[#0f172a] relative overflow-hidden font-sans transition-colors duration-500">

            {/* PATRÓN FLAT DE PUNTOS (OPCIONAL) */}
            <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.1] [background-image:radial-gradient(#50e3c2_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />

            <div className="w-full max-w-[460px] z-10 px-6">
                <div className="bg-white dark:bg-[#1e293b] rounded-[2rem] shadow-sm border border-gray-200 dark:border-slate-800 p-12 text-center relative">

                    {/* INTERRUPTOR DE TEMA FLAT */}
                    <button
                        onClick={toggleTheme}
                        className="absolute top-6 right-6 p-2 text-slate-400 hover:text-[#50e3c2] hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-all active:scale-95"
                        title="Cambiar Tema"
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {/* ÁREA DEL LOGO */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="flex items-center gap-1 mb-4">
                            <img
                                src="/Logo1.png"
                                alt="Adaptia"
                                className="h-12 mt-2 -ml-1 w-auto object-contain dark:brightness-110"
                            />
                            <h1 className="text-3xl font-bold text-[#50e3c2] tracking-tighter">
                                CRM
                            </h1>
                        </div>
                        <p className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-[0.25em] ml-1">
                            {isLogin ? 'Terminal de Acceso Seguro' : 'Registro de Profesional'}
                        </p>
                    </div>

                    {/* ALERTAS FLAT */}
                    {(successMsg || error) && (
                        <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-wider ${error
                            ? 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-500/5 dark:border-red-500/20'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-500/5 dark:border-emerald-500/20'
                            }`}>
                            {error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                            <span className="flex-1 text-left">{error || successMsg}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5 text-left">
                        {!isLogin && (
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Nombre</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:border-[#50e3c2] transition-colors placeholder:text-slate-400"
                                    placeholder="Nombre completo"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    disabled={!!token}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:border-[#50e3c2] transition-colors disabled:opacity-50"
                                    placeholder="correo@ejemplo.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:border-[#50e3c2] transition-colors"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#50e3c2]"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full py-4 mt-2 bg-slate-900 dark:bg-[#50e3c2] text-white dark:text-slate-900 rounded-xl font-bold text-xs uppercase tracking-widest transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <span>{isLogin ? 'Entrar' : 'Registrar'}</span>}
                        </button>
                    </form>

                    {!token && (
                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-[10px] font-bold text-slate-400 hover:text-[#50e3c2] uppercase tracking-widest transition-colors"
                            >
                                {isLogin ? 'Crear una cuenta' : 'Ya tengo cuenta'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="text-center mt-8">
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">
                        &copy; 2026 Adaptia Health &bull; CRM
                    </p>
                </div>
            </div>
        </div>
    );
};