import { useState, useEffect } from 'react';
import {
    X, Mail, Phone, MapPin, FileText, ExternalLink,
    Clock, Calendar, Shield, Edit3, Lock, Loader2, User
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getPatientNotes } from '../../api/notes';

export const PatientDetailsPanel = ({
    patient,
    onClose,
    onOpenNote,
    canEdit,
    user,
    activeClinic
}) => {
    const navigate = useNavigate();
    const [recentNotes, setRecentNotes] = useState([]);
    const [loadingNotes, setLoadingNotes] = useState(false);

    useEffect(() => {
        if (patient?.id && user?.id && activeClinic?.id) {
            fetchRecentNotes();
        } else {
            setRecentNotes([]);
        }
    }, [patient?.id, user?.id, activeClinic?.id]);

    const fetchRecentNotes = async () => {
        setLoadingNotes(true);
        try {
            const response = await getPatientNotes(patient.id, user.id, activeClinic.id);
            const notes = response.data || [];
            setRecentNotes(notes.slice(0, 2));
        } catch (error) {
            console.error("❌ Error cargando notas en el Panel:", error);
        } finally {
            setLoadingNotes(false);
        }
    };

    if (!patient) return null;

    return (
        <div className="fixed right-0 top-0 h-screen w-[420px] bg-white dark:bg-slate-900 shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-40 animate-in slide-in-from-right duration-500 border-l border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">

                {/* Cabecera de Acciones Rápidas */}
                <div className="flex justify-between items-center mb-10">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-all active:scale-90"
                    >
                        <X size={20} />
                    </button>

                    {canEdit ? (
                        <button
                            onClick={() => navigate(`/pacientes/editar/${patient.id}`)}
                            className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl uppercase tracking-[0.15em] transition-all group border border-slate-200 dark:border-slate-700"
                        >
                            <Edit3 size={14} className="text-[#50e3c2] group-hover:rotate-12 transition-transform" />
                            Editar Perfil
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 px-4 py-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100 dark:border-slate-800 rounded-xl">
                            <Lock size={12} /> Solo Lectura
                        </div>
                    )}
                </div>

                {/* Avatar y Encabezado Principal */}
                <header className="flex flex-col items-center text-center mb-12">
                    <div className="relative mb-4">
                        <div className="w-24 h-24 rounded-3xl bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-[#50e3c2] text-3xl font-bold shadow-xl border border-slate-200 dark:border-slate-700">
                            {patient.name.charAt(0)}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#50e3c2] rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center">
                            <User size={14} className="text-slate-900" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {patient.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="w-2 h-2 rounded-full bg-[#50e3c2]" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                            Expediente: {patient.dni || 'S/D'}
                        </p>
                    </div>
                </header>

                <div className="space-y-8">
                    {/* Sección 1: Notas Recientes */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actividad Reciente</h3>
                            <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800 ml-4" />
                        </div>
                        <div className="space-y-3">
                            {loadingNotes ? (
                                <div className="flex flex-col items-center justify-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                    <Loader2 className="w-5 h-5 text-[#50e3c2] animate-spin mb-2" />
                                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Sincronizando...</span>
                                </div>
                            ) : recentNotes.length > 0 ? (
                                recentNotes.map(note => (
                                    <div key={note.id} className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-[#50e3c2]/50 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-[9px] font-black text-[#50e3c2] uppercase tracking-tighter">{note.category || 'Evolución'}</p>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase">
                                                {new Date(note.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 italic leading-relaxed">
                                            "{note.summary || note.content}"
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Sin actividad reciente</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Sección 2: Contacto */}
                    <section className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Información de Contacto</h3>
                        <div className="grid gap-2">
                            <ContactItem icon={<Mail size={14} />} text={patient.email} />
                            <ContactItem icon={<Phone size={14} />} text={patient.phone} />
                            <ContactItem icon={<MapPin size={14} />} text={patient.address} />
                        </div>
                    </section>

                    {/* Sección 3: Datos Clínicos */}
                    <section className="space-y-4 pb-10">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detalles del Archivo</h3>
                        <div className="grid gap-2">
                            <ContactItem
                                icon={<Calendar size={14} />}
                                text={patient.birth_date ? new Date(patient.birth_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'No registrada'}
                            />
                            <ContactItem
                                icon={<Shield size={14} />}
                                text={patient.insurance_name || 'Sin Cobertura / Particular'}
                            />
                        </div>
                    </section>
                </div>
            </div>

            {/* Acciones Inferiores - Flat Dark Style */}
            <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                {canEdit ? (
                    <button
                        onClick={onOpenNote}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 dark:bg-[#50e3c2] text-white dark:text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-slate-200 dark:shadow-none"
                    >
                        <FileText size={18} /> Crear Nota Clínica
                    </button>
                ) : (
                    <div className="w-full flex items-center justify-center gap-3 py-4 bg-slate-100 dark:bg-slate-800/50 text-slate-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest cursor-not-allowed">
                        <Lock size={14} /> Escritura Restringida
                    </div>
                )}

                <Link
                    to={`/pacientes/${patient.id}/historial`}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                    <ExternalLink size={16} /> Ver Historial Completo
                </Link>
            </div>
        </div>
    );
};

const ContactItem = ({ icon, text }) => (
    <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700 group">
        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-[#50e3c2] transition-colors">
            {icon}
        </div>
        <span className="text-xs font-bold truncate">{text || 'No registrado'}</span>
    </div>
);