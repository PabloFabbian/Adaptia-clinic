import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ClinicSelector } from './ClinicSelector';
import { ROLE, NAV_PERMISSIONS } from '../../constants/roles'; // Importamos NAV_PERMISSIONS
import {
    Home, Users, Calendar, Clock, CreditCard,
    Building2, PlusCircle, UserPlus, Receipt,
    Settings, Layers, Trash2, MessageSquare, Wallet
} from 'lucide-react';

// --- NAVITEM ACTUALIZADO CON LÓGICA DE ACCESO ---
const NavItem = ({ to, label, icon: Icon, access = 'PUBLIC', currentRoleId, hasContext }) => {
    const location = useLocation();
    const active = location.pathname === to;

    // 1. Verificamos si el rol actual está incluido en los permitidos para este item
    const allowedRoles = NAV_PERMISSIONS[access] || NAV_PERMISSIONS.PUBLIC;
    const isHidden = currentRoleId !== null && !allowedRoles.includes(currentRoleId);

    // 2. Definimos si está deshabilitado (items que requieren clínica activa)
    // El Tech Owner (0) nunca tiene nada disabled
    const isTechOwner = currentRoleId === ROLE.TECH_OWNER;
    const isDisabled = !isTechOwner && !hasContext && to !== "/";

    if (isHidden) return null;

    return (
        <Link
            to={isDisabled ? "#" : to}
            className={`
                flex items-center gap-3 px-4 py-2.5 text-[13px] rounded-xl transition-all duration-300
                ${isDisabled ? 'opacity-30 cursor-not-allowed grayscale' : ''}
                ${active && !isDisabled
                    ? 'text-gray-900 bg-gray-100/80 font-semibold shadow-sm dark:text-white dark:bg-white/10'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-white/5'}
            `}
        >
            {Icon && (
                <Icon
                    size={19}
                    strokeWidth={active ? 2.2 : 1.8}
                    className={`${active ? 'text-blue-500' : 'text-gray-400'}`}
                />
            )}
            <span className="tracking-tight">{label}</span>
        </Link>
    );
};

export const Sidebar = () => {
    const { activeClinic, user, loading } = useAuth();

    const rawRoleId = activeClinic?.role_id ?? user?.role_id;
    const roleId = (rawRoleId !== null && rawRoleId !== undefined) ? Number(rawRoleId) : null;
    const hasContext = !!activeClinic;

    if (loading) {
        return <aside className="w-64 h-screen bg-white dark:bg-dark-surface border-r border-gray-100" />;
    }

    // Helper para no repetir props en cada NavItem
    const navProps = { currentRoleId: roleId, hasContext };

    return (
        <aside className="w-64 h-screen flex flex-col overflow-hidden bg-white dark:bg-dark-surface border-r border-gray-100 dark:border-white/5 relative z-10">
            <div className="pt-8 pb-6 px-7">
                <Link to="/" className="block transition-transform duration-300 hover:scale-[1.02]">
                    <img src="/Logo1.png" alt="Adaptia" className="h-9 w-auto object-contain dark:brightness-110" />
                </Link>
            </div>

            <div className="px-3 mb-0">
                <ClinicSelector />
            </div>

            <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
                <nav className="mb-9">
                    <p className="px-4 text-[10px] font-bold text-gray-400/80 dark:text-gray-500 mb-3 tracking-[0.15em] uppercase">Principal</p>
                    <div className="space-y-0.5">
                        <NavItem to="/" label="Inicio" icon={Home} {...navProps} />
                        <NavItem to="/pacientes" label="Pacientes" icon={Users} {...navProps} />
                        <NavItem to="/citas" label="Citas" icon={Clock} {...navProps} />
                        <NavItem to="/calendario" label="Calendario" icon={Calendar} {...navProps} />
                        <NavItem to="/facturacion" label="Facturación" icon={CreditCard} access="MASTER" {...navProps} />
                        <NavItem to="/clinicas" label="Gobernanza" icon={Building2} access="MASTER" {...navProps} />
                    </div>
                </nav>

                <div className="mb-9">
                    <p className="px-4 text-[10px] font-bold text-gray-400/80 dark:text-gray-500 mb-3 tracking-[0.15em] uppercase">Acciones</p>
                    <div className="space-y-0.5">
                        <NavItem to="/agendar" label="Agendar" icon={PlusCircle} {...navProps} />
                        <NavItem to="/nuevo-paciente" label="Nuevo paciente" icon={UserPlus} access="PROFESSIONAL" {...navProps} />
                        <NavItem to="/registrar-gasto" label="Gasto" icon={Wallet} access="MASTER" {...navProps} />
                    </div>
                </div>

                <div className="mb-12">
                    <p className="px-4 text-[10px] font-bold text-gray-400/80 dark:text-gray-500 mb-3 tracking-[0.15em] uppercase">Sistema</p>
                    <div className="space-y-0.5">
                        <NavItem to="/settings" label="Configuración" icon={Settings} access="MASTER" {...navProps} />
                        <NavItem to="/categorias" label="Categorías" icon={Layers} access="MASTER" {...navProps} />
                        <NavItem to="/nueva-factura" label="Facturar" icon={Receipt} access="MASTER" {...navProps} />
                        <NavItem to="/papelera" label="Papelera" icon={Trash2} access="MASTER" {...navProps} />
                    </div>
                </div>
            </div>

            <div className="p-4 mt-auto border-t border-gray-50 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.02]">
                <button className="flex items-center gap-3 w-full px-4 py-3 text-[13px] text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-all rounded-xl hover:bg-white dark:hover:bg-white/5">
                    <MessageSquare size={18} strokeWidth={1.8} className="text-gray-400" />
                    <span className="font-medium tracking-tight">Soporte técnico</span>
                </button>
            </div>
        </aside>
    );
};