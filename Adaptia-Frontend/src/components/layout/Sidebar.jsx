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
                flex items-center gap-3 px-4 py-2.5 text-[13px] rounded-xl transition-all duration-300
                ${disabled ? 'opacity-30 cursor-not-allowed grayscale' : ''}
                ${active && !disabled
                    ? 'text-gray-900 bg-gray-100/80 font-semibold shadow-sm dark:text-white dark:bg-white/10'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-white/5'}
            `}
        >
            {Icon && (
                <Icon
                    size={19}
                    strokeWidth={active ? 2.2 : 1.8}
                    className={`${active ? 'text-adaptia-blue' : 'text-gray-400'}`}
                />
            )}
            <span className="tracking-tight">{label}</span>
        </Link>
    );
};

export const Sidebar = () => {
    const { hasRole, activeClinic, userPermissions, loading } = useAuth();

    if (loading) {
        return <aside className="w-64 h-screen bg-white dark:bg-dark-surface border-r border-gray-100" />;
    }

    const isMaster = hasRole(['Tech Owner', '17', 'Owner', '19']);
    const checkPerm = (slug) => {
        if (isMaster) return true;
        return userPermissions?.some(p => p === slug || p === `clinic.${slug}`);
    };
    const hasContext = !!activeClinic || isMaster;

    return (
        <aside className="
            w-64 h-screen flex flex-col overflow-hidden
            bg-white dark:bg-dark-surface 
            border-r border-gray-100 dark:border-white/5
            relative z-10
        ">
            {/* Logo Section - Padding ajustado */}
            <div className="pt-8 pb-6 px-7">
                <Link to="/" className="block transition-transform duration-300 hover:scale-[1.02]">
                    <img
                        src="/Logo1.png"
                        alt="Adaptia Logo"
                        className="h-9 w-auto object-contain dark:brightness-110"
                    />
                </Link>
            </div>

            {/* Selector - Más aire abajo */}
            <div className="px-3 mb-0">
                <ClinicSelector />
            </div>

            {/* Contenedor de Scroll con espaciado interno */}
            <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">

                {/* Nav Principal */}
                <nav className="mb-9">
                    <p className="px-4 text-[10px] font-bold text-gray-400/80 dark:text-gray-500 mb-3 tracking-[0.15em] uppercase">
                        Principal
                    </p>
                    <div className="space-y-0.5">
                        <NavItem to="/" label="Inicio" icon={Home} />
                        <NavItem to="/pacientes" label="Pacientes" icon={Users} hidden={!checkPerm('clinic.patients.read')} disabled={!hasContext} />
                        <NavItem to="/citas" label="Citas" icon={Clock} hidden={!checkPerm('clinic.appointments.read')} disabled={!hasContext} />
                        <NavItem to="/calendario" label="Calendario" icon={Calendar} disabled={!hasContext} />
                        <NavItem to="/facturacion" label="Facturación" icon={CreditCard} disabled={!hasContext} hidden={!isMaster && !hasRole(['Administrador', '21'])} />
                        <NavItem to="/clinicas" label="Gobernanza" icon={Building2} hidden={!isMaster && !checkPerm('clinic.settings.read')} />
                    </div>
                </nav>

                {/* Acciones Rápidas - Grupo visualmente separado */}
                <div className="mb-9">
                    <p className="px-4 text-[10px] font-bold text-gray-400/80 dark:text-gray-500 mb-3 tracking-[0.15em] uppercase">
                        Acciones
                    </p>
                    <div className="space-y-0.5">
                        <NavItem to="/agendar" label="Agendar cita" icon={PlusCircle} disabled={!hasContext || !checkPerm('clinic.appointments.write')} />
                        <NavItem to="/nuevo-paciente" label="Nuevo paciente" icon={UserPlus} disabled={!hasContext || !checkPerm('clinic.patients.write')} />
                        <NavItem to="/registrar-gasto" label="Gasto" icon={Wallet} hidden={!isMaster} />
                    </div>
                </div>

                {/* Sistema - Grupo final */}
                <div className="mb-12">
                    <p className="px-4 text-[10px] font-bold text-gray-400/80 dark:text-gray-500 mb-3 tracking-[0.15em] uppercase">
                        Sistema
                    </p>
                    <div className="space-y-0.5">
                        <NavItem to="/settings" label="Disponibilidad" icon={Settings} hidden={!checkPerm('clinic.settings.read')} />
                        <NavItem to="/categorias" label="Categorías" icon={Layers} hidden={!isMaster} />
                        <NavItem to="/nueva-factura" label="Facturar" icon={Receipt} disabled={!hasContext} hidden={!isMaster} />
                        <NavItem to="/papelera" label="Papelera" icon={Trash2} hidden={!isMaster} />
                    </div>
                </div>
            </div>

            {/* Soporte - Stick to bottom con estilo sutil */}
            <div className="p-4 mt-auto border-t border-gray-50 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.02]">
                <button className="flex items-center gap-3 w-full px-4 py-3 text-[13px] text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-all rounded-xl hover:bg-white dark:hover:bg-white/5 hover:shadow-sm">
                    <MessageSquare size={18} strokeWidth={1.8} className="text-gray-400" />
                    <span className="font-medium tracking-tight">Soporte técnico</span>
                </button>
            </div>
        </aside>
    );
};