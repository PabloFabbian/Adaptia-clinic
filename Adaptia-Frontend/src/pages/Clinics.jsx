import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useClinics } from '../hooks/useClinics';
import { Tabs } from '../components/ui/Tabs';
import { InviteMemberModal } from '../features/clinics/components/InviteMemberModal';
import {
    Home, Users, Calendar, Settings, UserPlus, Layout,
    ShieldCheck, Activity, Mail, Lock,
    ChevronRight, Loader2, Cpu, Check, Shield
} from 'lucide-react';

const tabExplanations = {
    inicio: {
        title: "Ecosistema",
        description: "Vista holística de tu clínica. Actividad en tiempo real y salud operativa.",
        icon: <Activity size={20} strokeWidth={1.5} />,
        color: "text-adaptia-mint", bg: "bg-adaptia-mint/10"
    },
    miembros: {
        title: "Colaboradores",
        description: "Gestión de red profesional. Cada especialista es soberano de su acceso.",
        icon: <Users size={20} strokeWidth={1.5} />,
        color: "text-blue-500", bg: "bg-blue-500/10"
    },
    roles: {
        title: "Gobernanza",
        description: "Defina las capacidades globales de cada rol. Base para todos los miembros.",
        icon: <ShieldCheck size={20} strokeWidth={1.5} />,
        color: "text-purple-500", bg: "bg-purple-500/10"
    },
    salas: {
        title: "Espacios",
        description: "Optimice el uso de sus instalaciones físicas y consultorios.",
        icon: <Layout size={20} strokeWidth={1.5} />,
        color: "text-orange-500", bg: "bg-orange-500/10"
    }
};

const ResourcePill = ({ active, label, onClick, disabled = false }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`
            flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-300 border
            ${active
                ? 'bg-adaptia-mint/10 border-adaptia-mint/40 text-adaptia-mint shadow-[0_0_10px_rgba(80,227,194,0.1)]'
                : 'bg-white/5 border-white/5 text-gray-500 opacity-60 hover:opacity-100 hover:border-white/20'}
            ${disabled ? 'cursor-not-allowed opacity-40 grayscale' : 'cursor-pointer active:scale-95'}
        `}
    >
        <span className="text-[9px] font-bold uppercase tracking-tight">{label}</span>
        {active && <Check size={8} strokeWidth={4} />}
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

    // Carga de datos inicial
    useEffect(() => {
        if (activeClinic?.id) {
            fetchDirectory(activeClinic.id);
            fetchGovernance(activeClinic.id);
        }
    }, [activeClinic?.id, fetchDirectory, fetchGovernance]);

    const handleRoleToggle = async (roleName, cap) => {
        if (!activeClinic?.id || !canManageGovernance) return;
        const isAssigned = governanceMatrix[roleName]?.some(g => g.resource === cap.slug);
        const action = isAssigned ? 'revoke' : 'grant';
        await toggleRolePermission(activeClinic.id, roleName, cap.id, action);
    };

    const handleMemberConsentToggle = async (memberId, capSlug, currentStatus) => {
        if (!activeClinic?.id) return;
        await toggleConsent(activeClinic.id, memberId, capSlug, !currentStatus);
    };

    const canManageGovernance = useMemo(() => {
        return hasRole(['Tech Owner', 'Owner']);
    }, [hasRole]);

    const clinicTabs = [
        { id: 'inicio', label: 'Ecosistema', icon: <Home size={16} /> },
        { id: 'miembros', label: 'Colaboradores', icon: <UserPlus size={16} /> },
        { id: 'roles', label: 'Gobernanza', icon: <ShieldCheck size={16} /> },
        { id: 'salas', label: 'Espacios', icon: <Layout size={16} /> },
    ];

    if (authLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-adaptia-mint" size={32} />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] animate-pulse">
                    Sincronizando Terminal...
                </p>
            </div>
        );
    }

    if (!activeClinic) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mb-4 border border-dashed border-gray-300 dark:border-white/10">
                    <Activity className="text-gray-300" size={32} />
                </div>
                <h2 className="text-lg font-light text-gray-500 dark:text-gray-300">Sin Ecosistema Activo</h2>
                <p className="text-sm text-gray-400 mt-2 max-w-xs">Tu cuenta no parece estar vinculada a una clínica o la sesión ha expirado.</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 p-4 pb-20">
            <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-2 text-adaptia-mint font-bold text-[10px] uppercase tracking-[0.2em] mb-2">
                        <Activity size={12} className="animate-pulse" /> Ecosistema Activo
                    </div>
                    <h1 className="text-4xl font-extralight tracking-tight text-gray-900 dark:text-white leading-none capitalize">
                        {activeClinic.name ? (
                            <>
                                {activeClinic.name.replace('Clinic', '')} <span className="font-semibold text-adaptia-blue">Clinic</span>
                            </>
                        ) : (
                            <span className="opacity-20 italic">Adaptia Ecosistema</span>
                        )}
                    </h1>
                </div>

                <div className="flex gap-4 p-1 bg-gray-100/50 dark:bg-white/5 rounded-2xl border border-gray-200/50 backdrop-blur-md">
                    <div className="px-5 py-2 text-center">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Rol de Acceso</p>
                        <p className="text-xs font-medium text-emerald-500 flex items-center gap-1 justify-center">
                            {hasRole(['Tech Owner']) ? <Cpu size={12} /> : <Shield size={12} />}
                            {activeClinic.role_name || 'Especialista'}
                        </p>
                    </div>
                </div>
            </header>

            <Tabs tabs={clinicTabs} activeTab={activeTab} onChange={setActiveTab} />

            <div className="grid grid-cols-12 gap-8 mt-10">
                <aside className="col-span-12 lg:col-span-3">
                    <div className="p-6 rounded-[2rem] bg-gray-50 dark:bg-[#1a1f2b] border border-gray-100 dark:border-white/5 shadow-xl sticky top-24">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-xl ${tabExplanations[activeTab].bg} ${tabExplanations[activeTab].color} flex items-center justify-center border border-white/5 shrink-0`}>
                                {tabExplanations[activeTab].icon}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight leading-tight">
                                {tabExplanations[activeTab].title}
                            </h3>
                        </div>
                        <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-snug font-light mb-6 opacity-80 italic">
                            "{tabExplanations[activeTab].description}"
                        </p>
                        {canManageGovernance && activeTab === 'miembros' && (
                            <button
                                onClick={() => setIsInviteModalOpen(true)}
                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white transition-all duration-300 group"
                            >
                                <Mail size={14} className="text-gray-400 group-hover:text-adaptia-mint" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Invitar Colaborador</span>
                            </button>
                        )}
                    </div>
                </aside>

                <main className="col-span-12 lg:col-span-9">
                    {dataLoading && members.length === 0 ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="animate-spin text-gray-300" size={24} />
                        </div>
                    ) : (
                        <>
                            {activeTab === 'miembros' && (
                                <div className="space-y-4 animate-in fade-in duration-500">
                                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em] px-4">Directorio de Miembros</h2>
                                    {members.length > 0 ? members.map((member) => (
                                        <div key={member.id} className="bg-white dark:bg-[#1a1f2b] p-5 rounded-[2.5rem] border border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-4 w-full md:w-1/3">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/5 dark:to-white/10 flex items-center justify-center text-lg font-light dark:text-white border border-gray-200 dark:border-white/10 shrink-0 capitalize">
                                                    {member.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 dark:text-white">{member.name}</h4>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{member.role_name}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2 md:w-1/2 justify-center md:justify-start">
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
                                            <div className="flex items-center gap-4 justify-end">
                                                <Settings size={16} className="text-gray-300 cursor-pointer hover:text-adaptia-mint transition-colors" />
                                                <ChevronRight className="text-gray-200" size={18} />
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="p-10 text-center border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[3rem]">
                                            <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">No hay colaboradores en esta clínica</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'roles' && (
                                <div className="space-y-8 animate-in fade-in duration-500">
                                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em] px-4">Matriz de Gobernanza Global</h2>
                                    <div className="flex flex-col gap-6">
                                        {availableRoles.map((role) => (
                                            <div key={role.id} className="bg-white dark:bg-[#1a1f2b] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm">
                                                <div className="flex items-center justify-between mb-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                                            <Shield size={20} className="text-purple-400" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-gray-900 dark:text-white text-xl font-light">{role.name}</h3>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Capacidades del Sistema</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                                    {capabilities.map((cap) => {
                                                        const isAssigned = governanceMatrix[role.name]?.some(g => g.resource === cap.slug);
                                                        return (
                                                            <ResourcePill
                                                                key={`${role.id}-${cap.id}`}
                                                                label={cap.slug.replace('clinic.', '')}
                                                                active={isAssigned}
                                                                disabled={!canManageGovernance}
                                                                onClick={() => handleRoleToggle(role.name, cap)}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(activeTab === 'inicio' || activeTab === 'salas') && (
                                <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[3rem]">
                                    <Layout className="text-gray-200 mb-2" size={40} />
                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Módulo en Desarrollo</p>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

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