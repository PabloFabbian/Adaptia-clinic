import { useState, useEffect } from 'react';
import {
    X, Mail, Phone, MapPin, FileText, ExternalLink,
    Clock, Calendar, Shield, Edit3, Lock, Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getPatientNotes } from '../../api/notes'; // Asegúrate que la ruta sea correcta

export const PatientDetailsPanel = ({
    patient,
    onClose,
    onOpenNote,
    canEdit,
    user,          // Recibido desde PatientsPage
    activeClinic   // Recibido desde PatientsPage
}) => {
    const navigate = useNavigate();
    const [recentNotes, setRecentNotes] = useState([]);
    const [loadingNotes, setLoadingNotes] = useState(false);

    useEffect(() => {
        // Solo intentamos cargar si tenemos al paciente Y las credenciales del usuario
        if (patient?.id && user?.id && activeClinic?.id) {
            fetchRecentNotes();
        } else {
            // Si el panel se cierra o cambian credenciales, limpiamos
            setRecentNotes([]);
        }
    }, [patient?.id, user?.id, activeClinic?.id]);

    const fetchRecentNotes = async () => {
        setLoadingNotes(true);
        try {
            // Inyectamos los 3 parámetros necesarios para evitar el error 400
            const response = await getPatientNotes(patient.id, user.id, activeClinic.id);

            // Tomamos solo las 2 más recientes para el panel lateral
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
        <div className="fixed right-0 top-0 h-screen w-[400px] bg-white dark:bg-dark-surface shadow-[-20px_0_50px_rgba(0,0,0,0.05)] dark:shadow-[-20px_0_50px_rgba(0,0,0,0.3)] z-40 animate-in slide-in-from-right duration-500 border-l border-gray-100 dark:border-dark-border flex flex-col">
            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">

                {/* Cabecera de Acciones Rápidas */}
                <div className="flex justify-between items-center mb-10">
                    <button
                        onClick={onClose}
                        className="p-2.5 hover:bg-gray-100 dark:hover:bg-dark-border rounded-2xl text-gray-400 transition-all"
                    >
                        <X size={24} />
                    </button>

                    {/* BOTÓN EDITAR PERFIL: Solo visible si tiene permisos */}
                    {canEdit ? (
                        <button
                            onClick={() => navigate(`/pacientes/editar/${patient.id}`)}
                            className="flex items-center gap-2 px-4 py-2 text-[10px] font-black text-adaptia-blue hover:bg-adaptia-blue/5 rounded-xl uppercase tracking-widest transition-all group"
                        >
                            <Edit3 size={14} className="group-hover:rotate-12 transition-transform" />
                            Editar Perfil
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 px-4 py-2 text-[9px] font-black text-gray-400 uppercase tracking-widest border border-gray-100 dark:border-white/5 rounded-xl">
                            <Lock size={12} /> Vista de Supervisor
                        </div>
                    )}
                </div>

                {/* Avatar y Encabezado Principal */}
                <header className="flex flex-col items-center text-center mb-10">
                    <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-white text-3xl font-bold shadow-2xl mb-4 transition-colors ${canEdit
                        ? 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-500/20'
                        : 'bg-gradient-to-br from-slate-400 to-slate-600 shadow-slate-500/20'
                        }`}>
                        {patient.name.charAt(0)}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {patient.name}
                    </h2>
                    <p className="text-[10px] text-adaptia-blue font-black uppercase tracking-widest mt-1">
                        DNI: {patient.dni || 'Sin Documento'}
                    </p>
                </header>

                <div className="space-y-8">
                    {/* Sección 1: Notas Recientes */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actividad Reciente</h3>
                            <Clock size={14} className="text-gray-300" />
                        </div>
                        <div className="space-y-3">
                            {loadingNotes ? (
                                <div className="flex flex-col items-center justify-center py-8 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-dark-border">
                                    <Loader2 className="w-5 h-5 text-adaptia-blue animate-spin mb-2" />
                                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Sincronizando...</span>
                                </div>
                            ) : recentNotes.length > 0 ? (
                                recentNotes.map(note => (
                                    <div key={note.id} className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-dark-border group hover:border-adaptia-blue/30 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-[10px] font-bold text-adaptia-blue uppercase">{note.category || 'Evolución'}</p>
                                            <span className="text-[9px] text-gray-400 font-mono">
                                                {new Date(note.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 italic">
                                            "{note.summary || note.content}"
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center bg-gray-50/50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-gray-100 dark:border-dark-border">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Sin actividad reciente</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Sección 2: Contacto */}
                    <section className="space-y-4">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-dark-border pb-3">Contacto</h3>
                        <div className="grid gap-3">
                            <ContactItem icon={<Mail size={16} />} text={patient.email} />
                            <ContactItem icon={<Phone size={16} />} text={patient.phone} />
                            <ContactItem icon={<MapPin size={16} />} text={patient.address} />
                        </div>
                    </section>

                    {/* Sección 3: Datos Clínicos */}
                    <section className="space-y-4">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-dark-border pb-3">Ficha Médica</h3>
                        <div className="grid gap-3">
                            <ContactItem
                                icon={<Calendar size={16} />}
                                text={patient.birth_date ? new Date(patient.birth_date).toLocaleDateString() : 'Fecha no registrada'}
                            />
                            <ContactItem
                                icon={<Shield size={16} />}
                                text={patient.insurance_name || 'Particular / Sin Obra Social'}
                            />
                        </div>
                    </section>
                </div>
            </div>

            {/* Acciones Inferiores */}
            <div className="p-8 border-t border-gray-100 dark:border-dark-border bg-gray-50/30 dark:bg-white/[0.02] space-y-3">
                {canEdit ? (
                    <button
                        onClick={onOpenNote}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-gray-900 dark:bg-adaptia-blue text-white rounded-2xl text-sm font-bold hover:shadow-lg hover:shadow-adaptia-blue/20 transition-all active:scale-95"
                    >
                        <FileText size={18} /> Crear Nota Clínica
                    </button>
                ) : (
                    <div className="w-full flex items-center justify-center gap-3 py-4 bg-gray-100 dark:bg-white/5 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed border border-gray-200 dark:border-white/5">
                        <Lock size={14} /> Escritura Restringida
                    </div>
                )}

                <Link
                    to={`/pacientes/${patient.id}/historial`}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 rounded-2xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                >
                    <ExternalLink size={18} /> Ver Historial Completo
                </Link>
            </div>
        </div>
    );
};

const ContactItem = ({ icon, text }) => (
    <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300 p-1 group">
        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-adaptia-blue transition-colors">
            {icon}
        </div>
        <span className="text-xs font-medium truncate">{text || 'No registrado'}</span>
    </div>
);