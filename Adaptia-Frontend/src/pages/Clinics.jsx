import { useState } from 'react';
import { Tabs } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
    Home, Users, Briefcase, Calendar,
    ArrowLeft, ExternalLink, UserPlus, Layout,
    ShieldCheck, Globe, Activity, Settings
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

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-700">
            <header className="mb-10">
                <div className="flex justify-between items-start">
                    <div>
                        <button className="flex items-center gap-2 text-gray-400 text-sm mb-4 hover:text-gray-700 transition-colors group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={1.5} />
                            <span className="font-light">Red de Clínicas</span>
                        </button>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-light tracking-tight text-gray-800">
                                Melon Clinic España, 30
                            </h1>
                            <span className="bg-blue-50/50 text-blue-500 text-[10px] font-light px-3 py-1 rounded-full border border-blue-100/50 uppercase tracking-wider backdrop-blur-sm">
                                Sede Central
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="text-right">
                            <p className="text-[10px] font-light text-gray-400 uppercase tracking-widest mb-1">Miembros</p>
                            <p className="text-lg font-light text-gray-700">12 Activos</p>
                        </div>
                        <div className="text-right border-l border-gray-100 pl-6">
                            <p className="text-[10px] font-light text-gray-400 uppercase tracking-widest mb-1">Estatus</p>
                            <p className="text-lg font-light text-emerald-500 flex items-center gap-2">
                                <Activity size={14} strokeWidth={1.5} /> Operativo
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <Tabs tabs={clinicTabs} activeTab={activeTab} onChange={setActiveTab} />

            <div className="grid grid-cols-12 gap-6 mt-8">
                <div className="col-span-12 lg:col-span-3 space-y-6">
                    <Card title="Gobernanza">
                        <div className="p-5 space-y-5">
                            <div className="flex items-start gap-3 text-sm">
                                <ShieldCheck className="text-blue-400 w-5 h-5 shrink-0" strokeWidth={1.5} />
                                <div>
                                    <p className="font-light text-gray-700">Protección de Datos</p>
                                    <p className="text-xs text-gray-400 font-light mt-1">GDPR / HIPAA Compliant activo.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                                <Globe className="text-gray-300 w-5 h-5 shrink-0" strokeWidth={1.5} />
                                <div>
                                    <p className="font-light text-gray-700">Visibilidad Global</p>
                                    <p className="text-xs text-gray-400 font-light mt-1">Privada (Solo invitados).</p>
                                </div>
                            </div>
                            <Button variant="secondary" className="w-full justify-center text-xs mt-3">
                                <Settings size={14} strokeWidth={1.5} /> Ajustes de Sede
                            </Button>
                        </div>
                    </Card>
                </div>

                <div className="col-span-12 lg:col-span-9">
                    {activeTab === 'roles' && (
                        <Card
                            title="Gestión de Roles y Capacidades"
                            extra={<Button variant="primary">+ Nuevo rol</Button>}
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-white/50 text-gray-400 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 font-light text-left text-[10px] uppercase tracking-widest">Rol</th>
                                            <th className="px-6 py-4 font-light text-left text-[10px] uppercase tracking-widest">Nivel</th>
                                            <th className="px-6 py-4 font-light text-left text-[10px] uppercase tracking-widest">Descripción</th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {rolesData.map((role) => (
                                            <tr key={role.name} className="group hover:bg-blue-50/20 transition-all duration-300">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                                        <span className="font-light text-gray-700">{role.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="px-2.5 py-1 bg-gray-50/80 text-gray-500 rounded-lg text-[10px] font-light uppercase tracking-wider">
                                                        {role.level}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-gray-500 font-light text-xs max-w-md">
                                                    {role.description}
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <button className="opacity-0 group-hover:opacity-100 transition-all text-[11px] font-light flex items-center gap-1.5 ml-auto text-blue-500 hover:text-blue-600">
                                                        Gestionar <ExternalLink size={12} strokeWidth={1.5} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {activeTab !== 'roles' && (
                        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-gray-200/50 rounded-2xl bg-gray-50/30 backdrop-blur-sm">
                            <p className="text-gray-400 font-light">Módulo de {activeTab} en construcción</p>
                            <p className="text-xs text-gray-300 font-light mt-1">Configurando orquestación de recursos...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Clinics;