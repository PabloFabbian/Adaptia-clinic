import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useClinics } from '../hooks/useClinics';
import { Tabs } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import { InviteMemberModal } from '../features/clinics/components/InviteMemberModal';
import {
    Home, Users, Calendar, Settings, UserPlus, Layout,
    ShieldCheck, Activity, Mail, Lock,
    FileText, ChevronRight, Loader2, ShieldAlert, Cpu
} from 'lucide-react';

const tabExplanations = {
    inicio: {
        title: "Ecosistema",
        description: "Vista holística de tu clínica. Convergencia de actividad en tiempo real y salud operativa.",
        icon: <Activity size={20} strokeWidth={1.5} />,
        color: "text-adaptia-mint", bg: "bg-adaptia-mint/10"
    },
    miembros: {
        title: "Colaboradores",
        description: "Gestión de red profesional. Cada especialista es soberano de su información.",
        icon: <Users size={20} strokeWidth={1.5} />,
        color: "text-blue-500", bg: "bg-blue-500/10"
    },
    roles: {
        title: "Gobernanza",
        description: "Defina niveles de autoridad. Basado en consentimiento explícito y transparencia.",
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

const ResourcePill = ({ active, icon: Icon, label, onClick }) => (
    <button
        onClick={onClick}
        className={`
            flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-300 border
            ${active
                ? 'bg-adaptia-mint/5 border-adaptia-mint/30 text-adaptia-mint shadow-[0_0_10px_rgba(80,227,194,0.05)]'
                : 'bg-gray-50/50 dark:bg-white/5 border-transparent text-gray-400 opacity-60 hover:opacity-100'}
        `}
    >
        <Icon size={12} strokeWidth={active ? 2.5 : 1.5} />
        <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
    </button>
);

export const Clinics = () => {
    const { activeClinic, hasRole, loading: authLoading } = useAuth();
    const { members, invitations, loading: dataLoading, fetchDirectory, toggleConsent } = useClinics();

    const [activeTab, setActiveTab] = useState('miembros');
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    const canManageGovernance = useMemo(() => {
        return hasRole(['Tech Owner', 'tech', 'Owner', 'owner', 'Administrador']);
    }, [hasRole]);

    useEffect(() => {
        if (activeClinic?.id) {
            fetchDirectory(activeClinic.id);
        }
    }, [activeClinic?.id, fetchDirectory]);

    // Función optimizada para verificar consentimientos
    const hasConsent = (member, resourceType) => {
        if (!member.consents) return false;
        return member.consents.some(c => c.type === resourceType && c.granted === true);
    };

    const clinicTabs = [
        { id: 'inicio', label: 'Ecosistema', icon: <Home size={16} /> },
        { id: 'miembros', label: 'Colaboradores', icon: <UserPlus size={16} /> },
        { id: 'roles', label: 'Gobernanza', icon: <ShieldCheck size={16} /> },
        { id: 'salas', label: 'Espacios', icon: <Layout size={16} /> },
    ];

    if (authLoading) return <div className="h-screen flex items-center justify-center bg-dark-bg"><Loader2 className="animate-spin text-adaptia-mint" /></div>;

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 p-4">
            <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-2 text-adaptia-mint font-bold text-[10px] uppercase tracking-[0.2em] mb-2">
                        <Activity size={12} className="animate-pulse" /> Ecosistema Activo
                    </div>
                    <h1 className="text-4xl font-extralight tracking-tight text-gray-900 dark:text-white leading-none">
                        {activeClinic?.name || 'Mi'} <span className="font-semibold text-adaptia-blue">Clinic</span>
                    </h1>
                </div>

                <div className="flex gap-4 p-1 bg-gray-100/50 dark:bg-white/5 rounded-2xl border border-gray-200/50 backdrop-blur-md">
                    <div className="px-5 py-2 text-center">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Seguridad</p>
                        <p className="text-xs font-medium text-emerald-500 flex items-center gap-1 justify-center">
                            {hasRole(['Tech Owner', 'tech']) ? <Cpu size={12} /> : <Lock size={12} />}
                            {hasRole(['Tech Owner', 'tech']) ? 'Acceso de Arquitecto' : 'Cifrado de Roles'}
                        </p>
                    </div>
                </div>
            </header>

            <Tabs tabs={clinicTabs} activeTab={activeTab} onChange={setActiveTab} />

            <div className="grid grid-cols-12 gap-8 mt-10">
                <aside className="col-span-12 lg:col-span-3">
                    <div className="p-6 rounded-[2rem] bg-[#1a1f2b] border border-white/5 shadow-2xl sticky top-24">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-xl ${tabExplanations[activeTab].bg} ${tabExplanations[activeTab].color} flex items-center justify-center border border-white/5 shrink-0`}>
                                {tabExplanations[activeTab].icon}
                            </div>
                            <h3 className="text-lg font-semibold text-white tracking-tight leading-tight">
                                {tabExplanations[activeTab].title}
                            </h3>
                        </div>
                        <p className="text-[12px] text-gray-400 leading-snug font-light mb-6 opacity-80 italic">
                            "{tabExplanations[activeTab].description}"
                        </p>
                        <div className="space-y-3 mb-6 border-t border-white/5 pt-5">
                            <div className="flex items-center gap-2.5">
                                <div className={`w-1 h-1 rounded-full ${canManageGovernance ? 'bg-adaptia-mint' : 'bg-red-500'} shadow-[0_0_6px_rgba(80,227,194,0.4)]`} />
                                <span className="text-[11px] text-gray-400 font-medium">
                                    {canManageGovernance ? 'Permisos de Gestión' : 'Acceso Limitado'}
                                </span>
                            </div>
                        </div>
                        {canManageGovernance && (
                            <button
                                onClick={() => setIsInviteModalOpen(true)}
                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all duration-300 group"
                            >
                                <Mail size={14} className="text-gray-400 group-hover:text-adaptia-mint transition-colors" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Invitar Colaborador</span>
                            </button>
                        )}
                    </div>
                </aside>

                <main className="col-span-12 lg:col-span-9 space-y-6">
                    {!canManageGovernance ? (
                        <div className="bg-white dark:bg-white/5 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-white/10 p-20 text-center">
                            <ShieldAlert size={48} className="mx-auto text-gray-300 mb-6" />
                            <h3 className="text-lg font-medium text-gray-500">Restricción de Soberanía</h3>
                            <p className="text-sm text-gray-400 max-w-xs mx-auto mt-2 font-light">
                                Solo los administradores o dueños pueden gestionar el directorio.
                            </p>
                        </div>
                    ) : dataLoading && members.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                            <Loader2 className="animate-spin text-adaptia-mint mb-4" size={32} />
                            <p className="text-xs uppercase tracking-widest font-bold text-gray-400">Sincronizando Ecosistema...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'miembros' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-4">
                                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">Directorio Activo</h2>
                                        <span className="text-[10px] bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full text-gray-500 font-bold">
                                            {members.length} Profesionales
                                        </span>
                                    </div>

                                    {members.length === 0 && !dataLoading && (
                                        <div className="p-20 text-center border border-dashed border-gray-200 dark:border-white/10 rounded-[2.5rem]">
                                            <Users size={40} className="mx-auto text-gray-300 mb-4" />
                                            <p className="text-gray-400 text-sm italic">No se encontraron colaboradores en este ecosistema.</p>
                                        </div>
                                    )}

                                    {members.map((member) => (
                                        <div key={member.id} className="group bg-white dark:bg-[#1a1f2b] p-1 rounded-[2.5rem] border border-gray-100 dark:border-white/5 hover:border-adaptia-mint/30 transition-all duration-500 shadow-sm">
                                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-5">
                                                <div className="flex items-center gap-4 w-full md:w-1/3">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 flex items-center justify-center text-lg font-light text-gray-600 dark:text-white border border-gray-100 dark:border-white/10 shrink-0">
                                                        {member.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div className="truncate">
                                                        <h4 className="font-semibold text-gray-800 dark:text-white truncate">{member.name}</h4>
                                                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{member.role_name}</p>
                                                        {/* Agregué el email pequeño si existe */}
                                                        {member.email && <p className="text-[9px] text-gray-500 lowercase opacity-60 truncate">{member.email}</p>}
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 w-full md:w-auto justify-center">
                                                    <ResourcePill
                                                        label="Agenda"
                                                        active={hasConsent(member, 'appointments')}
                                                        icon={Calendar}
                                                        onClick={() => toggleConsent(activeClinic.id, member.id, 'appointments', !hasConsent(member, 'appointments'))}
                                                    />
                                                    <ResourcePill
                                                        label="Pacientes"
                                                        active={hasConsent(member, 'patients')}
                                                        icon={Users}
                                                        onClick={() => toggleConsent(activeClinic.id, member.id, 'patients', !hasConsent(member, 'patients'))}
                                                    />
                                                    <ResourcePill
                                                        label="Notas"
                                                        active={hasConsent(member, 'clinical_notes')}
                                                        icon={FileText}
                                                        onClick={() => toggleConsent(activeClinic.id, member.id, 'clinical_notes', !hasConsent(member, 'clinical_notes'))}
                                                    />
                                                </div>

                                                <div className="flex items-center gap-2 w-full md:w-1/4 justify-end">
                                                    <button className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-300 hover:text-gray-600 transition-all">
                                                        <Settings size={16} />
                                                    </button>
                                                    <ChevronRight className="text-gray-200" size={18} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {invitations.length > 0 && (
                                        <div className="mt-12 space-y-3">
                                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em] px-4">Invitaciones en espera</h2>
                                            {invitations.map((inv) => (
                                                <div key={inv.id} className="mx-2 bg-gray-50/50 dark:bg-white/[0.02] p-4 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 flex justify-between items-center opacity-70">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-500/10 rounded-lg"><Mail size={14} className="text-blue-500" /></div>
                                                        <div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{inv.email}</p>
                                                            <p className="text-[10px] text-gray-400 uppercase font-bold">{inv.role_name}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-[9px] font-black text-orange-500 bg-orange-500/10 px-2 py-1 rounded uppercase tracking-widest">Pendiente</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'roles' && (
                                <Card title="Estructura de Gobernanza" className="rounded-[2.5rem]">
                                    <div className="p-4 text-center py-20">
                                        <ShieldCheck size={40} className="mx-auto text-gray-200 mb-4" />
                                        <p className="text-gray-400 text-sm italic font-light">Configuración de autoridad delegada.</p>
                                    </div>
                                </Card>
                            )}
                        </>
                    )}
                </main>
            </div>

            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onSuccess={() => fetchDirectory(activeClinic.id)}
            />
        </div>
    );
};

export default Clinics;