import { useState, useMemo } from 'react';
import {
    Users, UserPlus, Search, Filter, Mail, Phone,
    ShieldCheck, ChevronRight, Loader2, ShieldAlert, Lock, Eye
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

// Hooks y Contexto
import { usePatients } from '../hooks/usePatients';
import { useAuth } from '../context/AuthContext';
import { ROLE, ACTION_PERMISSIONS } from '../constants/roles';

// Componentes
import { PatientDetailsPanel } from '../features/patients/PatientDetailsPanel';
import { ClinicalNoteModal } from '../features/patients/ClinicalNoteModal';

export const PatientsPage = () => {
    const navigate = useNavigate();
    const { user, activeClinic, loading: authLoading } = useAuth();
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [, setSearchParams] = useSearchParams();

    const { patients, loading, refresh } = usePatients(
        activeClinic?.id,
        user?.id,
        setSelectedPatient
    );

    // --- LÓGICA DE GOBERNANZA ---

    const canWriteNotes = (patient) => {
        if (!patient || !user) return false;
        if (user.role_id === ROLE.TECH_OWNER) return true;
        const hasRolePermission = ACTION_PERMISSIONS.WRITE_CLINICAL_NOTES.includes(user.role_id);
        return hasRolePermission && patient.owner_member_id === user.id;
    };

    const getAccessLevel = (patient) => {
        if (!patient || !user) return 'Read';
        if (
            user.role_id === ROLE.TECH_OWNER ||
            patient.owner_member_id === user.id
        ) return 'Full';
        return 'Read';
    };

    const closePanel = () => {
        setSelectedPatient(null);
        setSearchParams({});
    };

    const handleSaveNote = async (formData) => {
        if (!canWriteNotes(selectedPatient)) {
            toast.error("Acceso denegado", {
                description: "No tienes permisos para redactar notas en este expediente."
            });
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/clinical-notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    patient_id: selectedPatient.id,
                    member_id: user.id,
                    content: formData.details,
                    title: formData.title,
                    summary: formData.summary,
                    category: formData.category
                })
            });

            if (!response.ok) throw new Error("Error al guardar la nota");

            toast.success("Nota clínica guardada exitosamente");
            setIsNoteModalOpen(false);
            refresh();

        } catch (err) {
            toast.error("Error al guardar", { description: err.message });
        }
    };

    const filteredPatients = useMemo(() => {
        return (patients || []).filter(p =>
            (p.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.dni?.includes(searchTerm)) ||
            (p.email?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [patients, searchTerm]);

    if (authLoading) return (
        <div className="h-screen flex items-center justify-center bg-[#0f1219]">
            <Loader2 className="animate-spin text-adaptia-mint" />
        </div>
    );

    return (
        <div className="relative min-h-screen">
            {/* Main Content */}
            <div className={`max-w-7xl mx-auto px-6 py-10 transition-all duration-700 ease-in-out ${selectedPatient ? 'pr-[420px] scale-[0.97] blur-sm opacity-50 pointer-events-none' : 'scale-100 opacity-100'
                }`}>
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-orange-500 rounded-[1.5rem] text-white shadow-2xl shadow-orange-500/20">
                            <Users className="w-7 h-7" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-light dark:text-white tracking-tight">
                                Base de <span className="font-bold">Pacientes</span>
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-light">
                                <span className="dark:text-adaptia-mint font-bold">{filteredPatients.length}</span> expedientes en <span className="text-gray-800 dark:text-gray-200 font-medium">{activeClinic?.name || 'Cargando clínica...'}</span>
                            </p>
                        </div>
                    </div>

                    {ACTION_PERMISSIONS.CREATE_PATIENT.includes(user?.role_id) && (
                        <button
                            onClick={() => navigate('/nuevo-paciente')}
                            className="flex items-center justify-center gap-2 bg-gray-900 dark:bg-adaptia-blue text-white px-7 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-adaptia-blue/20"
                        >
                            <UserPlus size={18} strokeWidth={2.5} /> Nuevo Registro
                        </button>
                    )}
                </header>

                {/* Buscador */}
                <div className="flex gap-4 mb-10 group">
                    <div className="relative flex-1">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-adaptia-blue transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, DNI o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4.5 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-[2rem] text-sm outline-none focus:ring-8 focus:ring-adaptia-blue/5 transition-all dark:text-white shadow-sm"
                        />
                    </div>
                    <button className="p-4 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-2xl text-gray-400 hover:text-adaptia-mint transition-all shadow-sm">
                        <Filter size={20} />
                    </button>
                </div>

                {/* Tabla */}
                <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-[2.5rem] shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-gray-50/50 dark:bg-white/5 text-gray-400 dark:text-gray-500">
                                <tr className="text-[10px] font-black uppercase tracking-[0.2em]">
                                    <th className="px-10 py-6">Identidad</th>
                                    <th className="px-10 py-6">Contacto</th>
                                    <th className="px-10 py-6">Profesional a Cargo</th>
                                    <th className="px-10 py-6 text-right">Acceso</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-10 py-32 text-center text-gray-400 uppercase text-[10px] font-bold tracking-widest">
                                            <Loader2 className="animate-spin mx-auto mb-4 text-adaptia-mint" />
                                            Sincronizando expedientes...
                                        </td>
                                    </tr>
                                ) : filteredPatients.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-10 py-32 text-center">
                                            <ShieldAlert size={40} className="mx-auto text-gray-200 mb-4" />
                                            <p className="text-gray-400 text-sm">No se encontraron pacientes disponibles.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPatients.map((patient) => {
                                        const access = getAccessLevel(patient);
                                        const isFullAccess = access === 'Full';

                                        return (
                                            <tr
                                                key={patient.id}
                                                onClick={() => setSelectedPatient(patient)}
                                                className={`group hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-all cursor-pointer ${selectedPatient?.id === patient.id ? 'bg-orange-50/50 dark:bg-adaptia-blue/5' : ''
                                                    }`}
                                            >
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-5">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm border transition-all ${isFullAccess
                                                            ? 'bg-orange-500/10 text-orange-600 border-orange-500/20 shadow-sm'
                                                            : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20'
                                                            }`}>
                                                            {patient.name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 dark:text-gray-100 leading-tight group-hover:text-adaptia-blue transition-colors">
                                                                {patient.name}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 font-mono mt-1">
                                                                DNI: {patient.dni || 'S/D'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 text-gray-500 dark:text-gray-400">
                                                    <div className="text-[11px] space-y-1 font-medium">
                                                        <p className="flex items-center gap-2"><Mail size={13} /> {patient.email || '—'}</p>
                                                        <p className="flex items-center gap-2"><Phone size={13} /> {patient.phone || '—'}</p>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-[10px] font-bold text-gray-400 border border-gray-100 dark:border-white/10">
                                                            {patient.owner_name?.charAt(0) || '?'}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                                {patient.owner_member_id === user?.id ? (
                                                                    <span className="text-adaptia-mint font-black">Mío (Tú)</span>
                                                                ) : (
                                                                    patient.owner_name || 'Sin asignar'
                                                                )}
                                                            </p>
                                                            <p className="text-[9px] uppercase tracking-tighter text-gray-400 font-medium">Responsable</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-4">
                                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border transition-all ${isFullAccess
                                                            ? 'bg-adaptia-mint/10 text-adaptia-mint border-adaptia-mint/20 shadow-sm shadow-adaptia-mint/5'
                                                            : 'bg-indigo-50 dark:bg-indigo-400/5 text-indigo-500 dark:text-indigo-300 border-indigo-100 dark:border-indigo-400/10'
                                                            }`}>
                                                            {isFullAccess ? <ShieldCheck size={12} /> : <Eye size={12} />}
                                                            {isFullAccess ? 'Acceso Total' : 'Solo Lectura'}
                                                        </div>
                                                        <ChevronRight className="text-gray-300 group-hover:text-adaptia-mint transition-all" size={18} />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Paneles laterales y Modales */}
            <PatientDetailsPanel
                patient={selectedPatient}
                user={user}
                activeClinic={activeClinic}
                onClose={closePanel}
                onOpenNote={canWriteNotes(selectedPatient) ? () => setIsNoteModalOpen(true) : null}
                canEdit={canWriteNotes(selectedPatient)}
            />

            {isNoteModalOpen && selectedPatient && (
                <ClinicalNoteModal
                    isOpen={isNoteModalOpen}
                    patientName={selectedPatient?.name}
                    onSave={handleSaveNote}
                    onClose={() => setIsNoteModalOpen(false)}
                />
            )}
        </div>
    );
};