import { useState, useMemo } from 'react';
import { Calendar, Users, Clock, Video, Edit2, CreditCard, Timer, Hash, Plus, ChevronRight, Zap, ShieldCheck } from 'lucide-react';
import { AppointmentTable } from '../features/appointments/AppointmentTable';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = ({ user, appointments = [] }) => {
    const navigate = useNavigate();
    const { can } = useAuth();
    const [isFocusMode, setIsFocusMode] = useState(false);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 13) return "Buenos días";
        if (hour >= 13 && hour < 20) return "Buenas tardes";
        return "Buenas noches";
    }, []);

    const [consultationInfo, setConsultationInfo] = useState({
        label: 'Tiempo Promedio',
        value: '25 min',
        icon: Timer,
        color: 'bg-[#50e3c2] text-gray-900 border-[#40c7aa]'
    });

    const rotateInfo = () => {
        const infos = [
            { label: 'Tiempo Promedio', value: '25 min', icon: Timer, color: 'bg-[#50e3c2] text-gray-900 border-[#40c7aa]' },
            { label: 'Tarifa Base', value: '$45.00', icon: CreditCard, color: 'bg-emerald-500 text-white border-emerald-600' },
            { label: 'ID Profesional', value: 'MP-4492', icon: Hash, color: 'bg-slate-800 text-white border-slate-900' }
        ];
        const currentIndex = infos.findIndex(i => i.label === consultationInfo.label);
        const nextIndex = (currentIndex + 1) % infos.length;
        setConsultationInfo(infos[nextIndex]);
    };

    return (
        <div className="max-w-7xl mx-auto px-6 pt-8 pb-12 space-y-10 animate-in fade-in duration-700">

            {/* Header Flat */}
            {!isFocusMode && (
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-4 bg-[#50e3c2]" />
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                                Dashboard Operativo
                            </span>
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                            {greeting}, {user?.name.split(' ')[0] || 'Profesional'} 👋🏼
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            Hay <span className="text-slate-900 dark:text-[#50e3c2] font-bold">{appointments.length} citas</span> para tu jornada de hoy.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/calendario')}
                            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-5 py-3 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors active:scale-95"
                        >
                            <Calendar size={18} className="text-[#50e3c2]" />
                            Agenda
                        </button>

                        {can('patients.write') && (
                            <button
                                onClick={() => navigate('/nuevo-paciente')}
                                className="flex items-center gap-2 bg-slate-900 dark:bg-[#50e3c2] text-white dark:text-slate-900 px-5 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-all active:scale-95"
                            >
                                <Plus size={18} />
                                Nuevo Paciente
                            </button>
                        )}
                    </div>
                </header>
            )}

            {/* Grid de KPIs Flat */}
            {!isFocusMode && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Card 1 */}
                    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <div className="p-3 rounded-lg bg-slate-900 dark:bg-slate-700 text-white">
                                <Clock size={20} />
                            </div>
                            <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded border border-emerald-100 dark:border-emerald-500/20 uppercase">En Línea</span>
                        </div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Citas Hoy</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{appointments.length}</h3>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <div className="p-3 rounded-lg bg-[#50e3c2] text-slate-900">
                                <Users size={20} />
                            </div>
                            {can('patients.read') && <span className="text-[9px] font-bold text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded uppercase">Total</span>}
                        </div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Pacientes</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                            {can('patients.read') ? '124' : '---'}
                        </h3>
                    </div>

                    {/* Card 3 Rotativa */}
                    <div onClick={rotateInfo} className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 hover:border-[#50e3c2] transition-all cursor-pointer group">
                        <div className="flex justify-between items-center mb-4">
                            <div className={`p-3 rounded-lg transition-colors duration-300 ${consultationInfo.color}`}>
                                <consultationInfo.icon size={20} />
                            </div>
                            <Edit2 size={14} className="text-slate-300 group-hover:text-[#50e3c2]" />
                        </div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{consultationInfo.label}</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{consultationInfo.value}</h3>
                    </div>
                </div>
            )}

            {/* Sección de Tabla Flat */}
            <section className={`space-y-4 ${isFocusMode ? 'pt-6' : ''}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                            {isFocusMode ? 'Modo Enfoque' : 'Próximas Citas'}
                        </h2>
                    </div>
                    <button
                        onClick={() => setIsFocusMode(!isFocusMode)}
                        className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${isFocusMode
                            ? 'bg-[#50e3c2] border-[#50e3c2] text-slate-900'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                            }`}
                    >
                        <Zap size={12} className={isFocusMode ? 'fill-slate-900' : ''} />
                        {isFocusMode ? 'Salir' : 'Enfoque'}
                    </button>
                </div>

                <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 ${isFocusMode ? 'border-[#50e3c2] border-2' : ''}`}>
                    {appointments.length > 0 ? (
                        <div className="p-2">
                            <AppointmentTable
                                appointments={appointments}
                                actions={(app) => (
                                    <div className="flex items-center gap-2">
                                        {app.type === 'virtual' && (
                                            <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase hover:bg-[#50e3c2] hover:text-slate-900 transition-colors">
                                                <Video size={14} /> Link
                                            </button>
                                        )}
                                        <button
                                            onClick={() => navigate(`/pacientes/${app.patient_id}/historial`)}
                                            className="p-2 text-slate-400 hover:text-[#50e3c2]"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                )}
                            />
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <Zap size={32} className="mx-auto mb-4 text-slate-200 dark:text-slate-700" />
                            <h4 className="text-slate-900 dark:text-white font-bold">Sin actividad pendiente</h4>
                            <p className="text-slate-400 text-sm">Has completado todas tus tareas de hoy.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Dashboard;