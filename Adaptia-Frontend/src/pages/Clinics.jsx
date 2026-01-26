import { Tabs } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Home, Users, Briefcase, DoorOpen, Calendar, UsersRound, ArrowLeft, ExternalLink, UserPlus, Layout } from 'lucide-react';

const clinicTabs = [
    { id: 'inicio', label: 'Inicio', icon: <Home size={16} /> },
    { id: 'miembros', label: 'Miembros', icon: <UserPlus size={16} /> },
    { id: 'roles', label: 'Roles', icon: <Briefcase size={16} /> },
    { id: 'salas', label: 'Salas', icon: <Layout size={16} /> },
    { id: 'citas', label: 'Citas', icon: <Calendar size={16} /> },
    { id: 'pacientes', label: 'Pacientes', icon: <Users size={16} /> },
];

const rolesData = [
    { name: 'Owner', description: 'Acceso total al sistema, gestión de suscripciones y configuración global de la clínica.' },
    { name: 'Administrador', description: 'Gestión de personal, reportes financieros y control de permisos de usuarios.' },
    { name: 'Especialista', description: 'Acceso a su propia agenda, fichas clínicas de sus pacientes y prescripciones médicas.' },
    { name: 'Secretaría', description: 'Gestión de citas, recepción de pacientes y manejo de datos de contacto.' },
    { name: 'Contador', description: 'Acceso limitado únicamente a facturación, pagos y reportes de ingresos.' }
];

const Clinics = () => {
    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            <header className="mb-8">
                <button className="flex items-center gap-2 text-gray-500 text-sm mb-4 hover:text-gray-900 transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Clínicas
                </button>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Melon Clinic España, 30
                </h1>
            </header>

            <Tabs tabs={clinicTabs} />

            <section className="mt-8">
                <Card
                    title="Roles"
                    extra={<Button variant="primary">+ Nuevo rol</Button>}
                >
                    <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-gray-50 to-white text-gray-600 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-left text-xs uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-4 font-semibold text-left text-xs uppercase tracking-wider">Descripción</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rolesData.map((role, index) => (
                                <tr
                                    key={role.name}
                                    className="group hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-transparent transition-all duration-200"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <td className="px-6 py-5">
                                        <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {role.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-gray-600 leading-relaxed">
                                        {role.description}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-xs font-semibold inline-flex items-center gap-1.5 text-gray-700 hover:text-blue-600 bg-white border border-gray-200 hover:border-blue-300 px-3 py-2 rounded-lg shadow-sm hover:shadow-md hover:scale-105">
                                            Abrir
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </section>
        </div>
    );
};

export default Clinics;