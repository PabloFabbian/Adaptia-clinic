import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ClinicSelector } from './ClinicSelector';
import {
    Home, Users, Calendar, Clock, CreditCard,
    Building2, PlusCircle, UserPlus, Receipt,
    Settings, Layers, Trash2, MessageSquare, Wallet
} from 'lucide-react';

const NavItem = ({ to, label, icon: Icon, hidden = false, disabled = false }) => {
    const location = useLocation();
    const active = location.pathname === to;

    if (hidden) return null;

    return (
        <Link
            to={disabled ? "#" : to}
            className={`
                flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-xl transition-all duration-200
                ${disabled ? 'opacity-40 cursor-not-allowed grayscale' : ''}
                ${active && !disabled
                    ? 'text-gray-900 bg-gray-100 font-medium dark:text-white dark:bg-white/10'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50/80 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-white/5'}
            `}
        >
            {Icon && <Icon size={18} strokeWidth={active ? 2 : 1.5} />}
            <span className="tracking-tight">{label}</span>
        </Link>
    );
};

export const Sidebar = () => {
    const { hasRole, activeClinic, userPermissions, loading } = useAuth();

    // Estado de carga visualmente coherente
    if (loading) {
        return <aside className="w-64 h-screen bg-white dark:bg-dark-surface border-r border-[#50e3c2]/30" />;
    }

    /**
     * GOBERNANZA PARA PABLO (TECH OWNER):
     * Validamos contra el ID 17 que confirmamos en Neon.
     */
    const isMaster = hasRole(['Tech Owner', '17', 'Owner', '19']);

    /**
     * checkPerm: Bypass de seguridad.
     * Si eres Master, no validamos contra el array de userPermissions.
     */
    const checkPerm = (slug) => {
        if (isMaster) return true;
        return userPermissions?.some(p => p === slug || p === `clinic.${slug}`);
    };

    /**
     * hasContext:
     * El Tech Owner (isMaster) puede ver los botones habilitados 
     * incluso si la hidratación de la clínica tarda un milisegundo extra.
     */
    const hasContext = !!activeClinic || isMaster;

    return (
        <aside className="
            w-64 h-screen flex flex-col p-6 overflow-y-auto transition-colors duration-500
            bg-white dark:bg-dark-surface 
            border-r border-[#50e3c2] dark:border-[#50e3c2]/30 
            shadow-[1px_0_10px_rgba(80,227,194,0.1)] dark:shadow-[4px_0_20px_rgba(80,227,194,0.05)]
            relative z-10
        ">
            {/* Logo */}
            <div className="flex items-center -mt-1 mb-8 px-2">
                <Link to="/" className="block transition-opacity hover:opacity-80">
                    <img
                        src="/Logo1.png"
                        alt="Adaptia Logo"
                        className="h-10 w-auto object-contain dark:brightness-110"
                    />
                </Link>
            </div>

            {/* Selector de Sede Activa */}
            <div className="mb-8">
                <ClinicSelector />
            </div>

            {/* Nav Principal */}
            <nav className="space-y-1 mb-8">
                <p className="px-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-3 tracking-widest uppercase">Principal</p>

                <NavItem to="/" label="Inicio" icon={Home} />

                <NavItem
                    to="/pacientes"
                    label="Pacientes"
                    icon={Users}
                    hidden={!checkPerm('clinic.patients.read')}
                    disabled={!hasContext}
                />

                <NavItem
                    to="/citas"
                    label="Citas"
                    icon={Clock}
                    hidden={!checkPerm('clinic.appointments.read')}
                    disabled={!hasContext}
                />

                <NavItem
                    to="/calendario"
                    label="Calendario"
                    icon={Calendar}
                    disabled={!hasContext}
                />

                <NavItem
                    to="/facturacion"
                    label="Facturación"
                    icon={CreditCard}
                    disabled={!hasContext}
                    hidden={!isMaster && !hasRole(['Administrador', '21'])}
                />

                <NavItem
                    to="/clinicas"
                    label="Gobernanza"
                    icon={Building2}
                    hidden={!isMaster && !checkPerm('clinic.settings.read')}
                />
            </nav>

            {/* Acciones Rápidas */}
            <div className="space-y-1 mb-8">
                <p className="px-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-3 tracking-widest uppercase">Acciones</p>
                <NavItem
                    to="/agendar"
                    label="Agendar cita"
                    icon={PlusCircle}
                    disabled={!hasContext || !checkPerm('clinic.appointments.write')}
                />
                <NavItem
                    to="/nuevo-paciente"
                    label="Nuevo paciente"
                    icon={UserPlus}
                    disabled={!hasContext || !checkPerm('clinic.patients.write')}
                />
                <NavItem to="/registrar-gasto" label="Gasto" icon={Wallet} hidden={!isMaster} />
            </div>

            {/* Sistema */}
            <div className="space-y-1">
                <p className="px-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-3 tracking-widest uppercase">Sistema</p>
                <NavItem to="/settings" label="Disponibilidad" icon={Settings} hidden={!checkPerm('clinic.settings.read')} />
                <NavItem to="/categorias" label="Categorías" icon={Layers} hidden={!isMaster} />
                <NavItem to="/nueva-factura" label="Facturar" icon={Receipt} disabled={!hasContext} hidden={!isMaster} />
                <NavItem to="/papelera" label="Papelera" icon={Trash2} hidden={!isMaster} />
            </div>

            {/* Soporte */}
            <div className="mt-auto pt-6 border-t border-gray-100 dark:border-dark-border">
                <button className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all">
                    <MessageSquare size={18} strokeWidth={1.5} />
                    <span className="font-medium">Soporte técnico</span>
                </button>
            </div>
        </aside>
    );
};