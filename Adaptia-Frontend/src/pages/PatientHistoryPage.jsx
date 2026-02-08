import { useParams, useNavigate } from 'react-router-dom';
import {
    Calendar, Search, FileText, Sparkles,
    ChevronDown, ChevronUp, Pill, Brain, Save, Loader2, ArrowLeft, ShieldAlert, Lock, EyeOff
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

// Hooks y API
import { useAuth } from '../context/AuthContext';
import { getPatientNotes, getPatientById, updatePatient, exportHistoryToPDF } from '../api/notes';

// --- CONSTANTES DE ROLES (Jerarquía 0-4) ---
const ROLE = {
    TECH_OWNER: 0,
    OWNER: 1,
    PSICOLOGO: 3,
    SECRETARIA: 4
};

const ExpandableContent = ({ text, isRestricted }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (isRestricted) return (
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
            <EyeOff size={14} className="text-gray-400" />
            <p className="text-gray-400 italic text-xs">Contenido detallado restringido para su rol.</p>
        </div>
    );

    if (!text) return <p className="text-gray-400 dark:text-gray-500 italic text-sm">Sin contenido detallado</p>;
    const isLongText = text.length > 250;

    return (
        <div className="space-y-2">
            <div className={`relative transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px]' : 'max-h-24 overflow-hidden'}`}>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">{text}</p>
                {!isExpanded && isLongText && (
                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white dark:from-[#1a1f2e] via-white/80 dark:via-[#1a1f2e]/80 to-transparent" />
                )}
            </div>
            {isLongText && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-600 mt-2"
                >
                    {isExpanded ? <>Ver menos <ChevronUp size={12} /></> : <>Leer detalle completo <ChevronDown size={12} /></>}
                </button>
            )}
        </div>
    );
};

export const PatientHistoryPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, activeClinic, loading: authLoading } = useAuth();

    const [searchTerm, setSearchTerm] = useState('');
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);
    const [canEdit, setCanEdit] = useState(false);

    const motivoRef = useRef(null);
    const antecedentesRef = useRef(null);
    const medicacionRef = useRef(null);

    const [patientData, setPatientData] = useState(null);
    const [profile, setProfile] = useState({ motivo_consulta: '', antecedentes: '', medicacion: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const adjustHeight = (ref) => {
        if (ref.current) {
            ref.current.style.height = 'auto';
            ref.current.style.height = `${ref.current.scrollHeight}px`;
        }
    };

    useEffect(() => {
        adjustHeight(motivoRef);
        adjustHeight(antecedentesRef);
        adjustHeight(medicacionRef);
    }, [profile, loading]);

    useEffect(() => {
        const loadAllData = async () => {
            const clinicId = activeClinic?.id;
            const userRoleId = activeClinic?.role_id; // Ya es 0, 1, 3 o 4

            if (authLoading || !id || clinicId === undefined || clinicId === null) return;

            setLoading(true);
            try {
                const [notesResponse, patientResponse] = await Promise.all([
                    getPatientNotes(id, user.id, clinicId),
                    getPatientById(id)
                ]);

                if (patientResponse?.data) {
                    const p = patientResponse.data;
                    setPatientData(p);
                    setProfile({
                        motivo_consulta: p.history?.motivo_consulta || '',
                        antecedentes: p.history?.antecedentes || '',
                        medicacion: p.history?.medicacion || ''
                    });

                    // --- LÓGICA DE REACCIÓN POR ROL ---
                    const isHighLevel = userRoleId <= ROLE.OWNER; // 0 o 1
                    const isPatientOwner = p.owner_member_id === user.id;
                    setCanEdit(isHighLevel || isPatientOwner);
                }

                const finalNotes = notesResponse?.data || [];
                setNotes(Array.isArray(finalNotes) ? finalNotes : []);

            } catch (error) {
                console.error("❌ Error:", error);
                if (error.response?.status === 403) setAccessDenied(true);
                toast.error("Error al cargar historial");
            } finally {
                setLoading(false);
            }
        };

        loadAllData();
    }, [id, user?.id, activeClinic?.id, authLoading]);

    // ... handleSaveProfile y handleExportPDF se mantienen igual ...
    const handleSaveProfile = async () => {
        if (!canEdit) return;
        setIsSaving(true);
        try {
            const updatedPatient = {
                ...patientData,
                history: { ...patientData.history, ...profile }
            };
            await updatePatient(id, updatedPatient);
            toast.success("Perfil actualizado");
        } catch (error) { toast.error("Error al guardar"); }
        finally { setIsSaving(false); }
    };

    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            await exportHistoryToPDF(id, patientData?.name || 'Paciente');
            toast.success("PDF generado");
        } catch (err) { toast.error("Error al exportar"); }
        finally { setIsExporting(false); }
    };

    const filteredNotes = notes.filter(n => {
        const content = (n.content || n.details || "").toLowerCase();
        const title = (n.title || "").toLowerCase();
        return content.includes(searchTerm.toLowerCase()) || title.includes(searchTerm.toLowerCase());
    });

    const getCategoryStyles = (category) => {
        switch (category) {
            case 'Urgencia': return 'bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400';
            case 'Diagnóstico': return 'bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400';
            default: return 'bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400';
        }
    };

    if (authLoading || loading) return (
        <div className="h-screen flex items-center justify-center bg-transparent">
            <Loader2 className="animate-spin text-orange-500" />
        </div>
    );

    if (accessDenied) return (
        <div className="h-[60vh] flex flex-col items-center justify-center text-center p-6">
            <ShieldAlert size={64} className="text-red-500 mb-4 opacity-20" />
            <h2 className="text-2xl font-bold dark:text-white">Acceso Restringido</h2>
            <button onClick={() => navigate('/pacientes')} className="mt-6 text-orange-500 font-bold flex items-center gap-2">
                <ArrowLeft size={16} /> Volver
            </button>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8 p-4 bg-transparent transition-colors duration-300">
            {/* CABECERA */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => navigate('/pacientes')} className="group flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors">
                    <ArrowLeft size={18} />
                    <span className="text-xs font-bold uppercase tracking-widest">Volver</span>
                </button>
                <div className="text-right">
                    <h1 className="text-2xl font-bold dark:text-white">{patientData?.name}</h1>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">DNI: {patientData?.dni || 'N/A'}</p>
                </div>
            </div>

            {/* PERFIL PSICOLÓGICO */}
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-teal-500/10 text-teal-600 rounded-xl flex items-center justify-center border border-teal-500/20">
                            <Brain size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold leading-none dark:text-white">Perfil Psicológico</h2>
                            {!canEdit && (
                                <div className="flex items-center gap-1 mt-1 text-[9px] text-amber-600 font-bold uppercase tracking-tighter">
                                    <Lock size={10} /> Solo Lectura
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={handleExportPDF} disabled={isExporting} className="flex items-center gap-2 px-6 py-2.5 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 rounded-full text-xs font-bold hover:bg-gray-100 transition-all">
                            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} className="text-orange-500" />}
                            Exportar PDF
                        </button>
                        {canEdit && (
                            <button onClick={handleSaveProfile} disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-full text-xs font-bold transition-all shadow-lg shadow-teal-600/20">
                                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                Guardar Perfil
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-gray-50 dark:bg-slate-800/40 p-5 rounded-[1.5rem] border border-gray-100 dark:border-slate-700/50">
                            <label className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-2 block">Motivo de Consulta</label>
                            <textarea
                                ref={motivoRef}
                                readOnly={!canEdit}
                                value={profile.motivo_consulta}
                                onChange={(e) => setProfile({ ...profile, motivo_consulta: e.target.value })}
                                className="w-full bg-transparent text-sm text-gray-700 dark:text-slate-200 focus:outline-none resize-none leading-relaxed"
                                rows="1"
                                placeholder={canEdit ? "Describa el motivo..." : "Sin información registrada"}
                            />
                        </div>
                        <div className="px-5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Antecedentes</label>
                            <textarea
                                ref={antecedentesRef}
                                readOnly={!canEdit}
                                value={profile.antecedentes}
                                onChange={(e) => setProfile({ ...profile, antecedentes: e.target.value })}
                                className="w-full bg-transparent text-sm italic text-gray-500 dark:text-gray-400 focus:outline-none resize-none leading-relaxed"
                                rows="1"
                                placeholder="Sin antecedentes registrados"
                            />
                        </div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-500/10 p-6 rounded-[2rem] border border-red-100 dark:border-red-500/20">
                        <div className="flex items-center gap-2 mb-3 text-red-500">
                            <Pill size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Medicación</span>
                        </div>
                        <textarea
                            ref={medicacionRef}
                            readOnly={!canEdit}
                            value={profile.medicacion}
                            onChange={(e) => setProfile({ ...profile, medicacion: e.target.value })}
                            className="w-full bg-transparent text-sm font-bold text-gray-800 dark:text-slate-100 focus:outline-none resize-none"
                            rows="1"
                            placeholder="No referida"
                        />
                    </div>
                </div>
            </div>

            {/* BUSCADOR */}
            <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Buscar en el historial de sesiones..."
                    className="w-full pl-14 pr-6 py-4 bg-white dark:bg-[#1a1f2e] border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100 rounded-[1.5rem] outline-none text-sm focus:border-orange-500/50 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* TIMELINE */}
            <div className="relative border-l-2 border-gray-200 dark:border-gray-800 ml-4 pl-10 space-y-10">
                {filteredNotes.map((note) => (
                    <div key={note.id} className="relative group">
                        <div className="absolute -left-[51px] top-2 w-5 h-5 bg-white dark:bg-[#0f172a] border-4 border-gray-200 dark:border-gray-800 group-hover:border-orange-500 rounded-full transition-colors" />
                        <div className="bg-white dark:bg-[#1a1f2e] rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300">
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getCategoryStyles(note.category)}`}>
                                            {note.category || 'Evolución'}
                                        </span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <Calendar size={12} /> {note.created_at ? new Date(note.created_at).toLocaleDateString() : 'Sin fecha'}
                                        </span>
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">{note.title || 'Nota de Sesión'}</h4>
                                </div>
                            </div>

                            {/* El Resumen IA solo se ve si no es Secretaría (ID 4) */}
                            {activeClinic.role_id < ROLE.SECRETARIA && (
                                <div className="mb-6 p-5 bg-orange-50 dark:bg-orange-950/10 rounded-3xl border border-orange-100 dark:border-orange-900/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles size={14} className="text-orange-600" />
                                        <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Resumen IA</span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
                                        {note.summary ? `"${note.summary}"` : "Resumen no disponible."}
                                    </p>
                                </div>
                            )}

                            {/* Pasamos isRestricted al sub-componente */}
                            <ExpandableContent
                                text={note.content || note.details}
                                isRestricted={activeClinic.role_id === ROLE.SECRETARIA}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};