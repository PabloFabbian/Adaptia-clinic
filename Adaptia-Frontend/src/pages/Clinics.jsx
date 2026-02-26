import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useClinics } from '../hooks/useClinics';
import { Tabs } from '../components/ui/Tabs';
import { InviteMemberModal } from '../features/clinics/InviteMemberModal';
import {
    Home, Users, Calendar, Settings, UserPlus, Layout,
    ShieldCheck, Activity, Mail, Lock,
    ChevronRight, Loader2, Cpu, Check, Shield
} from 'lucide-react';

const tabExplanations = {
    inicio: {
        title: "Ecosistema",
        description: "Vista holística de tu clínica. Actividad en tiempo real y salud operativa.",
        icon: <Activity size={20} strokeWidth={2} />,
        color: "text-[#50e3c2]", bg: "bg-slate-50 dark:bg-slate-800"
    },
    miembros: {
        title: "Colaboradores",
        description: "Gestión de red profesional. Cada especialista es soberano de su acceso.",
        icon: <Users size={20} strokeWidth={2} />,
        color: "text-blue-500", bg: "bg-slate-50 dark:bg-slate-800"
    },
    roles: {
        title: "Gobernanza",
        description: "Defina las capacidades globales de cada rol. Base para todos los miembros.",
        icon: <ShieldCheck size={20} strokeWidth={2} />,
        color: "text-purple-500", bg: "bg-slate-50 dark:bg-slate-800"
    },
    salas: {
        title: "Espacios",
        description: "Optimice el uso de sus instalaciones físicas y consultorios.",
        icon: <Layout size={20} strokeWidth={2} />,
        color: "text-orange-500", bg: "bg-slate-50 dark:bg-slate-800"
    }
};

const ResourcePill = ({ active, label, onClick, disabled = false }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`
            flex items-center gap-2 px-4 py-1.5 rounded-full transition-all duration-300 border backdrop-blur-sm
            ${active
                ? 'bg-slate-900/90 dark:bg-[#50e3c2]/90 border-slate-900 dark:border-[#50e3c2] text-white dark:text-slate-900 shadow-sm'
                : 'bg-white/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-700/50 text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200'}
            ${disabled ? 'cursor-not-allowed opacity-30 grayscale' : 'cursor-pointer active:scale-90'}
        `}
    >
        <span className="text-[9px] font-black uppercase tracking-[0.1em] py-0.5">
            {label}
        </span>
        {active ? (
            <Check size={10} strokeWidth={4} className="animate-in zoom-in duration-300" />
        ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
        )}
    </button>
);

export const Clinics = () => {
    const { activeClinic, hasRole, loading: authLoading } = useAuth();
    const {
        members,
        roles: availableRoles,
        capabilities,
        governanceMatrix,
        loading: dataLoading,
        fetchDirectory,
        fetchGovernance,
        toggleRolePermission,
        toggleConsent
    } = useClinics();

    const [activeTab, setActiveTab] = useState('miembros');
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    useEffect(() => {
        if (activeClinic?.id) {
            fetchDirectory(activeClinic.id);
            fetchGovernance(activeClinic.id);
        }
    }, [activeClinic?.id, fetchDirectory, fetchGovernance]);

    const canManageGovernance = useMemo(() => hasRole(['Tech Owner', 'Owner']), [hasRole]);

    const handleMemberConsentToggle = async (memberId, capSlug, currentStatus) => {
        if (!activeClinic?.id) return;
        await toggleConsent(activeClinic.id, memberId, capSlug, !currentStatus);
    };

    const clinicTabs = [
        { id: 'inicio', label: 'Ecosistema', icon: <Home size={16} /> },
        { id: 'miembros', label: 'Colaboradores', icon: <UserPlus size={16} /> },
        { id: 'roles', label: 'Gobernanza', icon: <ShieldCheck size={16} /> },
        { id: 'salas', label: 'Espacios', icon: <Layout size={16} /> },
    ];

    if (authLoading) return (
        <div className="h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#0f172a]">
            <Loader2 className="animate-spin text-[#50e3c2]" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {activeClinic?.name?.replace('Clinic', '')} <span className="text-[#50e3c2]">Clinic</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                        Unidad de gestión operativa
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl shadow-sm">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                        {hasRole(['Tech Owner']) ? <Cpu size={16} className="text-emerald-500" /> : <Shield size={16} className="text-emerald-500" />}
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nivel de Acceso</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{activeClinic?.role_name || 'Especialista'}</p>
                    </div>
                </div>
            </header>

            <Tabs tabs={clinicTabs} activeTab={activeTab} onChange={setActiveTab} />

            <div className="grid grid-cols-12 gap-10 mt-12">
                {/* Sidebar Explicativo */}
                <aside className="col-span-12 lg:col-span-4 xl:col-span-3">
                    <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 sticky top-19">
                        <div className={`w-12 h-12 rounded-xl ${tabExplanations[activeTab].bg} border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-6`}>
                            <div className={tabExplanations[activeTab].color}>
                                {tabExplanations[activeTab].icon}
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                            {tabExplanations[activeTab].title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8 font-medium">
                            {tabExplanations[activeTab].description}
                        </p>

                        {canManageGovernance && activeTab === 'miembros' && (
                            <button
                                onClick={() => setIsInviteModalOpen(true)}
                                className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-[#50e3c2] text-white dark:text-slate-900 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95"
                            >
                                <Mail size={16} strokeWidth={3} /> Invitar Miembro
                            </button>
                        )}
                    </div>
                </aside>

                {/* Contenido Principal */}
                <main className="col-span-12 lg:col-span-8 xl:col-span-9">
                    {dataLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-3xl border-dashed">
                            <Loader2 className="animate-spin text-[#50e3c2] mb-4" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sincronizando registros...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {activeTab === 'miembros' && (
                                <div className="space-y-4">
                                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 ml-2">Directorio Profesional</h2>
                                    {members.map((member) => (
                                        <div key={member.id} className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl flex flex-col md:flex-row items-center gap-6 shadow-sm hover:border-[#50e3c2]/30 transition-all">
                                            {/* AVATAR FLAT (Estilo unificado) */}
                                            <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-900 dark:text-[#50e3c2] border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                                                {member.name?.charAt(0).toUpperCase()}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">{member.name}</h4>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{member.role_name}</p>
                                            </div>

                                            <div className="flex flex-wrap gap-2 justify-center">
                                                {capabilities.filter(c => ['patients.read', 'appointments.read', 'notes.read'].some(slug => c.slug.includes(slug))).map(cap => {
                                                    const isGranted = member.consents?.some(c => c.resource_type === cap.slug.split('.').pop() && c.is_granted);
                                                    return (
                                                        <ResourcePill
                                                            key={cap.id}
                                                            label={cap.slug.split('.').pop()}
                                                            active={isGranted}
                                                            onClick={() => handleMemberConsentToggle(member.id, cap.slug, isGranted)}
                                                        />
                                                    );
                                                })}
                                            </div>

                                            <div className="flex items-center gap-2 pl-4 border-l border-slate-100 dark:border-slate-700">
                                                <button className="p-2 text-slate-300 hover:text-[#50e3c2] transition-colors">
                                                    <Settings size={18} />
                                                </button>
                                                <ChevronRight className="text-slate-200" size={20} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'roles' && (
                                <div className="space-y-8">
                                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Matriz de Gobernanza Global</h2>
                                    {availableRoles.map((role) => (
                                        <div key={role.id} className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
                                            <div className="flex items-center gap-4 mb-8">
                                                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center border border-purple-100 dark:border-purple-500/20">
                                                    <Shield size={18} className="text-purple-500" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{role.name}</h3>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Permisos Base del Sistema</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                                {capabilities.map((cap) => {
                                                    const isAssigned = governanceMatrix[role.name]?.some(g => g.resource === cap.slug);
                                                    return (
                                                        <ResourcePill
                                                            key={`${role.id}-${cap.id}`}
                                                            label={cap.slug.replace('clinic.', '')}
                                                            active={isAssigned}
                                                            disabled={!canManageGovernance}
                                                            onClick={() => {/* Lógica de toggleRolePermission */ }}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {(activeTab === 'inicio' || activeTab === 'salas') && (
                                <div className="h-80 flex flex-col items-center justify-center bg-white dark:bg-slate-800/20 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-[2.5rem]">
                                    <Layout className="text-slate-200 dark:text-slate-700 mb-4" size={48} strokeWidth={1} />
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">Módulo en optimización</p>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Modal de Invitación */}
            {activeClinic?.id && (
                <InviteMemberModal
                    isOpen={isInviteModalOpen}
                    onClose={() => setIsInviteModalOpen(false)}
                    onSuccess={() => fetchDirectory(activeClinic.id)}
                    clinicId={activeClinic.id}
                />
            )}
        </div>
    );
};

export default Clinics;