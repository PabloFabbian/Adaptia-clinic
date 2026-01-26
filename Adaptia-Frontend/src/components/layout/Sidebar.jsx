import { Link, useLocation } from 'react-router-dom';
import {
    Home, Users, Calendar, Clock, CreditCard,
    Building2, PlusCircle, UserPlus, Receipt,
    Settings, Layers, Trash2, MessageSquare, Wallet
} from 'lucide-react';

const NavItem = ({ to, label, icon: Icon }) => {
    const location = useLocation();
    const active = location.pathname === to;

    return (
        <Link to={to} className={`
            flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-lg transition-all
            ${active
                ? 'text-blue-600 bg-blue-50/50'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50/50'}
        `}>
            {Icon && <Icon size={16} strokeWidth={1.5} />}
            <span className="font-light">{label}</span>
        </Link>
    );
};

export const Sidebar = () => {
    return (
        <aside className="w-60 bg-white/80 backdrop-blur-xl h-screen flex flex-col border-r border-gray-100 p-6 overflow-y-auto">

            {/* Logo */}
            <div className="flex items-center gap-2 mb-10 px-2">
                <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-light">
                    A
                </div>
                <span className="font-light text-sm text-gray-700 tracking-wide">Adaptia</span>
            </div>

            {/* Nav Principal */}
            <nav className="space-y-1 mb-10">
                <NavItem to="/" label="Inicio" icon={Home} />
                <NavItem to="/pacientes" label="Pacientes" icon={Users} />
                <NavItem to="/citas" label="Citas" icon={Clock} />
                <NavItem to="/calendario" label="Calendario" icon={Calendar} />
                <NavItem to="/facturacion" label="Facturación" icon={CreditCard} />
                <NavItem to="/clinicas" label="Clínicas" icon={Building2} />
            </nav>

            {/* Acciones */}
            <div className="space-y-1 mb-10">
                <p className="px-3 text-[10px] font-light text-gray-400 mb-3 tracking-widest uppercase">Acciones</p>
                <NavItem to="/agendar" label="Agendar cita" icon={PlusCircle} />
                <NavItem to="/nuevo-paciente" label="Nuevo paciente" icon={UserPlus} />
                <NavItem to="/registrar-gasto" label="Gasto" icon={Wallet} />
            </div>

            {/* Configuración */}
            <div className="space-y-1">
                <p className="px-3 text-[10px] font-light text-gray-400 mb-3 tracking-widest uppercase">Sistema</p>
                <NavItem to="/settings" label="Disponibilidad" icon={Settings} />
                <NavItem to="/categorias" label="Categorías" icon={Layers} />
                <NavItem to="/nueva-factura" label="Facturar" icon={Receipt} />
                <NavItem to="/papelera" label="Papelera" icon={Trash2} />
            </div>

            {/* Footer */}
            <div className="mt-auto pt-6 border-t border-gray-100">
                <button className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] font-light text-gray-400 hover:text-gray-700 rounded-lg transition-colors">
                    <MessageSquare size={16} strokeWidth={1.5} />
                    Feedback
                </button>
            </div>
        </aside>
    );
};