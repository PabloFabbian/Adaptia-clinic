import { useMemo, useState } from 'react';
import { ExternalLink, Loader2, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const BookingPage = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    const calendarUrl = useMemo(() => {
        const doctorSlug = user?.name?.toLowerCase().trim().replace(/\s+/g, '-') || 'pablo-fabbian';
        return `https://cal.com/${doctorSlug}?embed=true`;
    }, [user]);

    return (
        <div className="h-screen max-w-7xl mx-auto px-6 pt-6 pb-6 flex flex-col overflow-hidden animate-in fade-in duration-700">

            {/* Header Compacto */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 shrink-0">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-[#50e3c2]" />
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                            Gestión de Calendario
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Agendar <span className="text-[#50e3c2]">Nueva Cita</span>
                    </h1>
                </div>
            </header>

            {/* Contenedor Principal — flex-1 para ocupar el alto restante, min-h-0 para que flex respete el límite */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">

                {/* Calendario — h-full para llenar el contenedor del grid */}
                <div className="lg:col-span-3 bg-white dark:bg-[#0F0F0F] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden relative h-[90%]">
                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-[#0F0F0F] z-10 text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
                            <Loader2 className="w-8 h-8 text-[#50e3c2] animate-spin mb-4" />
                            Cargando Agenda...
                        </div>
                    )}
                    <iframe
                        src={calendarUrl}
                        width="100%"
                        height="80%"
                        frameBorder="0"
                        onLoad={() => setIsLoading(false)}
                        className={`transition-opacity duration-500 bg-[#0F0F0F] pt-12 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    />
                </div>

                {/* Sidebar */}
                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                        <h2 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="text-[#50e3c2]">01</span> Acceso Externo
                        </h2>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            ¿Problemas con el visor? Usa el link directo.
                        </p>
                        <a
                            href={calendarUrl.replace('?embed=true', '')}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full flex items-center justify-between px-4 py-3 bg-slate-900 dark:bg-[#50e3c2] text-white dark:text-slate-900 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-md active:scale-95"
                        >
                            Link Directo
                            <ExternalLink size={14} />
                        </a>
                    </div>

                    <div className="p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm shrink-0">
                                <Globe size={14} className="text-[#50e3c2]" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-900 dark:text-white uppercase">Zona Horaria</h4>
                                <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">Detección automática activa.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};