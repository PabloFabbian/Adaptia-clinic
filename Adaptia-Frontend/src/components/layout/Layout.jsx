import { Sidebar } from './Sidebar';
import { ArrowLeft, LogOut, Settings, User, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useMemo } from 'react';

export const Layout = () => {
    const { logout, user, activeClinic } = useAuth(); // Extraemos activeClinic
    const navigate = useNavigate();
    const location = useLocation();

    // Estado para Dark Mode
    const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

    // --- LÓGICA DINÁMICA DE ROL ---
    // Buscamos el rol del usuario en la clínica activa o el rol global
    const userRoleDisplay = useMemo(() => {
        if (!user || activeClinic === null) return 'Sin Clínica'; // Cambio clave

        const rid = Number(activeClinic.role_id);

        if (rid === 0) return 'Tech Owner';
        if (rid <= 2) return 'Owner';
        if (rid <= 4) return 'Psicólogo';
        if (rid <= 6) return 'Secretaría';
        return 'Invitado';
    }, [user, activeClinic]);

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

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/') return 'Dashboard';
        if (path.includes('pacientes')) return 'Gestión de Pacientes';
        if (path.includes('citas')) return 'Agenda Médica';
        if (path.includes('clinicas')) return 'Administración de Sedes';
        return 'Panel de Control';
    };

    return (
        <div className="flex h-screen bg-white dark:bg-dark-bg transition-colors duration-500">
            <Sidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="
                    h-16 flex items-center justify-between px-10 transition-colors z-20
                    bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md
                    border-b border-[#50e3c2] dark:border-[#50e3c2]/30
                    shadow-[0_1px_10px_rgba(80,227,194,0.1)] dark:shadow-[0_4px_20px_rgba(80,227,194,0.05)]
                ">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-gray-400 hover:text-gray-700 hover:cursor-pointer dark:hover:text-gray-200 transition-colors mr-4"
                        >
                            <ArrowLeft size={18} strokeWidth={1.5} />
                        </button>
                        <h1 className="text-sm font-medium text-gray-600 dark:text-dark-text uppercase tracking-widest cursor-default">
                            {getPageTitle()}
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Perfil de usuario DINÁMICO */}
                        <div className="flex items-center gap-3 pr-6 border-r border-gray-100 dark:border-dark-border">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-none">
                                    {user?.name || 'Cargando...'}
                                </p>
                                <p className={`text-[10px] mt-1 uppercase tracking-widest font-bold ${userRoleDisplay === 'Tech Owner' ? 'text-adaptia-mint' : 'text-gray-400 dark:text-gray-500'
                                    }`}>
                                    {userRoleDisplay}
                                </p>
                            </div>
                            <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-white shadow-lg transition-colors ${userRoleDisplay === 'Tech Owner' ? 'bg-adaptia-mint' : 'bg-gray-900 dark:bg-adaptia-blue'
                                }`}>
                                <User size={18} />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={toggleTheme}
                                className="p-2 text-gray-400 hover:text-orange-500 dark:hover:text-adaptia-mint hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-all"
                                title="Cambiar Tema"
                            >
                                {isDark ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
                            </button>

                            <button
                                onClick={() => navigate('/settings')}
                                className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-all"
                            >
                                <Settings size={20} strokeWidth={1.5} />
                            </button>

                            <button
                                onClick={logout}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                                title="Cerrar Sesión"
                            >
                                <LogOut size={20} strokeWidth={1.5} />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto px-10 py-8 bg-gray-50/30 dark:bg-dark-bg transition-colors">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};