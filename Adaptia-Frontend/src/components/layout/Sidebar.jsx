import { Link, useLocation } from 'react-router-dom';

const NavItem = ({ to, label, icon }) => {
    const location = useLocation();
    const active = location.pathname === to;

    return (
        <Link to={to} className={`
      flex items-center px-3 py-1.5 text-sm rounded-md transition-colors
      ${active ? 'bg-gray-200 font-semibold' : 'hover:bg-gray-200 text-text-muted'}
    `}>
            {label}
        </Link>
    );
};

export const Sidebar = () => {
    return (
        <aside className="w-60 bg-sidebar-bg h-screen flex flex-col border-r border-border-light p-4 overflow-y-auto">
            {/* Header Perfil */}
            <div className="flex items-center gap-2 mb-8 px-2">
                <div className="w-6 h-6 bg-gray-300 rounded flex items-center justify-center text-xs">L</div>
                <span className="font-medium">Adaptia</span>
            </div>

            {/* Navegación Principal */}
            <nav className="space-y-1">
                <NavItem to="/" label="Inicio" />
                <NavItem to="/pacientes" label="Pacientes" />
                <NavItem to="/citas" label="Citas" />
                <NavItem to="/clinicas" label="Clínicas" />
            </nav>

            {/* Sección Opciones */}
            <div className="mt-8">
                <h3 className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Opciones</h3>
                <nav className="space-y-1">
                    <NavItem to="/agendar" label="Agendar cita" />
                    <NavItem to="/settings" label="Disponibilidad" />
                    <NavItem to="/papelera" label="Abrir papelera" />
                </nav>
            </div>

            <div className="mt-auto pt-4 border-t border-border-light">
                <button className="text-sm text-gray-400 hover:text-gray-600 px-3">Dar feedback</button>
            </div>
        </aside>
    );
};