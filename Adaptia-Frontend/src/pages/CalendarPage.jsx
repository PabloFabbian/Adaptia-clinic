import { useMemo, useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Info, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CalendarPage = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const isSecretaria = user?.role === 'Secretaría' || user?.role === 'admin';

    const calendarUrl = useMemo(() => {
        const bgColor = isDarkMode ? '1a1f2b' : 'ffffff';
        const base = `https://calendar.google.com/calendar/embed?src=pablo.fabbian@gmail.com&ctz=America%2FArgentina%2FBuenos_Aires&showPrint=0&showTabs=1&showCalendars=0&bgcolor=%23${bgColor}`;
        return isSecretaria ? `${base}&mode=AGENDA&showNav=1` : `${base}&mode=WEEK&showNav=0`;
    }, [isSecretaria, isDarkMode]);

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-900 dark:bg-[#50e3c2] rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200 dark:shadow-[#50e3c2]/10 transition-colors duration-500">
                        <CalendarIcon className="w-7 h-7 text-white dark:text-slate-900" strokeWidth={1.5} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 text-[#50e3c2] font-black text-[10px] uppercase tracking-[0.2em] mb-1">
                            <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
                            Sincronización en Tiempo Real
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Control de <span className="text-[#50e3c2]">Citas</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Modo de Vista</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            {isSecretaria ? 'Agenda Global' : 'Semana Laboral'}
                        </p>
                    </div>
                </div>
            </header>

            {/* Contenedor del Calendario */}
            <div className={`relative rounded-[2.25rem] border transition-all duration-500 overflow-hidden shadow-2xl
                ${isDarkMode
                    ? 'bg-[#1a1f2b] border-slate-800 shadow-black/20'
                    : 'bg-white border-slate-100 shadow-slate-200/50'}`}>

                {/* Loading State — estilo consistente con BookingPage */}
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-[#0F0F0F] z-10 text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
                        <Loader2 className="w-8 h-8 text-[#50e3c2] animate-spin mb-4" />
                        Cargando Agenda...
                    </div>
                )}

                <div className="p-3">
                    <iframe
                        src={calendarUrl}
                        width="100%"
                        height="600px"
                        frameBorder="0"
                        onLoad={() => setTimeout(() => setIsLoading(false), 700)}
                        className={`transition-opacity duration-700 rounded-[1.5rem]
                            ${isLoading ? 'opacity-0' : 'opacity-100'} 
                            ${isDarkMode ? 'invert-[0.9] hue-rotate-180 contrast-[1.1] saturate-[0.8]' : 'saturate-[0.9]'}`}
                        style={{ backgroundColor: isDarkMode ? '#191C1C' : '#ffffff' }}
                    />
                </div>
            </div>

            {/* Footer */}
            <footer className="flex items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                <Info size={16} className="text-[#50e3c2]" />
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Las citas se actualizan automáticamente. Para modificaciones avanzadas, utilice la interfaz nativa de Google Calendar.
                </p>
            </footer>
        </div>
    );
};