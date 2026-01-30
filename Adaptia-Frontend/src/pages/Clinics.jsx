import { useState } from 'react';
import { Tabs } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { InviteMemberModal } from '../features/clinics/components/InviteMemberModal';
import {
    Home, Users, Briefcase, Calendar,
    ArrowLeft, ExternalLink, UserPlus, Layout,
    ShieldCheck, Globe, Activity, Settings, Mail
} from 'lucide-react';

const clinicTabs = [
    { id: 'inicio', label: 'Inicio', icon: <Home size={16} strokeWidth={1.5} /> },
    { id: 'miembros', label: 'Miembros', icon: <UserPlus size={16} strokeWidth={1.5} /> },
    { id: 'roles', label: 'Roles', icon: <Briefcase size={16} strokeWidth={1.5} /> },
    { id: 'salas', label: 'Salas', icon: <Layout size={16} strokeWidth={1.5} /> },
    { id: 'citas', label: 'Citas', icon: <Calendar size={16} strokeWidth={1.5} /> },
];

const rolesData = [
    { name: 'Owner', description: 'Acceso total al sistema, gestión de suscripciones y configuración global.', level: 'Total' },
    { name: 'Administrador', description: 'Gestión de personal, reportes financieros y control de permisos.', level: 'Alto' },
    { name: 'Especialista', description: 'Acceso a agenda propia, fichas clínicas y prescripciones.', level: 'Clínico' },
    { name: 'Secretaría', description: 'Gestión de citas, recepción y manejo de datos de contacto.', level: 'Operativo' },
];

export const Clinics = () => {
    const [activeTab, setActiveTab] = useState('roles');
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    // En un entorno real, esto vendría de un context de la clínica seleccionada
    const clinicId = 1;

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-700">
            <header className="mb-10">
                <div className="flex justify-between items-start">
                    <div>
                        <button className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-sm mb-4 hover:text-gray-700 dark:hover:text-gray-200 transition-colors group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={1.5} />
                            <span className="font-light">Red de Clínicas</span>
                        </button>
                        <div className="flex items-center gap-3 text-balance">
                            <h1 className="text-4xl font-light tracking-tight text-gray-800 dark:text-white">
                                Melon Clinic <span className="font-medium text-gray-900 dark:text-adaptia-mint">España, 30</span>
                            </h1>
                            <span className="bg-blue-50/50 dark:bg-adaptia-blue/10 text-blue-500 dark:text-adaptia-blue text-[10px] font-bold px-3 py-1 rounded-full border border-blue-100/50 dark:border-adaptia-blue/20 uppercase tracking-widest backdrop-blur-sm">
                                Sede Central
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Miembros</p>
                            <p className="text-lg font-light text-gray-700 dark:text-gray-200">12 Activos</p>
                        </div>
                        <div className="text-right border-l border-gray-100 dark:border-dark-border pl-6">
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Estatus</p>
                            <p className="text-lg font-light text-emerald-500 flex items-center gap-2 justify-end">
                                <Activity size={14} strokeWidth={2} className="animate-pulse" /> Operativo
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <Tabs tabs={clinicTabs} activeTab={activeTab} onChange={setActiveTab} />

            <div className="grid grid-cols-12 gap-6 mt-8">
                {/* Lateral: Gobernanza */}
                <div className="col-span-12 lg:col-span-3 space-y-6">
                    <Card title="Gobernanza" className="dark:bg-dark-surface dark:border-dark-border">
                        <div className="p-5 space-y-5">
                            <div className="flex items-start gap-3 text-sm">
                                <div className="p-2 rounded-lg bg-blue-50 dark:bg-adaptia-blue/10">
                                    <ShieldCheck className="text-blue-400 dark:text-adaptia-blue w-5 h-5 shrink-0" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-700 dark:text-gray-200">Privacidad Pro</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 font-light mt-1 text-balance italic">Los miembros controlan sus recursos.</p>
                                </div>
                            </div>
                            <Button
                                variant="secondary"
                                onClick={() => setIsInviteModalOpen(true)}
                                className="w-full justify-center text-[10px] font-bold uppercase tracking-widest mt-3 dark:bg-white/5 dark:hover:bg-white/10"
                            >
                                <Mail size={14} strokeWidth={1.5} /> Invitar Profesional
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Principal */}
                <div className="col-span-12 lg:col-span-9">
                    {activeTab === 'roles' && (
                        <Card
                            title="Capacidades por Rol"
                            extra={<Button variant="primary" className="bg-gray-900 dark:bg-adaptia-blue text-xs">+ Definir Rol</Button>}
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50/50 dark:bg-white/5 text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-dark-border">
                                        <tr>
                                            <th className="px-6 py-4 font-bold text-left text-[10px] uppercase tracking-[0.15em]">Rol</th>
                                            <th className="px-6 py-4 font-bold text-left text-[10px] uppercase tracking-[0.15em]">Nivel</th>
                                            <th className="px-6 py-4 font-bold text-left text-[10px] uppercase tracking-[0.15em]">Descripción</th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                                        {rolesData.map((role) => (
                                            <tr key={role.name} className="group hover:bg-adaptia-blue/[0.03] transition-all duration-300">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-adaptia-mint shadow-[0_0_8px_rgba(80,227,194,0.4)]"></div>
                                                        <span className="font-medium text-gray-700 dark:text-gray-200">{role.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-transparent dark:border-white/5">
                                                        {role.level}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-gray-500 dark:text-gray-400 font-light text-xs max-w-md leading-relaxed">
                                                    {role.description}
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <button className="opacity-0 group-hover:opacity-100 transition-all text-[11px] font-bold text-blue-500 dark:text-adaptia-blue flex items-center gap-1.5 ml-auto">
                                                        Gestionar <ExternalLink size={12} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'miembros' && (
                        <Card title="Directorio de Miembros">
                            <div className="p-6">
                                <MemberList clinicId={clinicId} />

                                {/* Botón flotante o al final para invitar si está vacío */}
                                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-dark-border flex justify-center">
                                    <Button
                                        variant="primary"
                                        onClick={() => setIsInviteModalOpen(true)}
                                        className="bg-gray-900 dark:bg-adaptia-blue text-xs"
                                    >
                                        + Invitar nuevo profesional
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Estados de carga para otros módulos */}
                    {['inicio', 'salas', 'citas'].includes(activeTab) && (
                        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-gray-200 dark:border-dark-border rounded-[2.5rem] bg-gray-50/30 dark:bg-dark-surface/30 backdrop-blur-sm">
                            <div className="p-4 bg-white dark:bg-dark-surface rounded-2xl shadow-xl mb-4 text-gray-300 dark:text-gray-700">
                                <Activity size={32} strokeWidth={1} />
                            </div>
                            <p className="text-gray-400 dark:text-gray-500 font-medium">Módulo de <span className="capitalize">{activeTab}</span> en construcción</p>
                            <p className="text-[10px] text-gray-300 dark:text-gray-600 font-light mt-1 uppercase tracking-widest">Sincronizando con Adaptia Cloud...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Invitación */}
            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                clinicId={clinicId}
                onInviteSuccess={(newInv) => {
                    console.log("Invitación enviada con éxito:", newInv);
                    // Aquí podrías disparar una notificación de éxito
                }}
            />
        </div>
    );
};

export default Clinics;