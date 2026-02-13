import { useAuth } from '../../context/AuthContext';

/**
 * Componente Wrapper para control de permisos finos.
 * @param {string} perform - El slug del permiso (ej: 'patients.write')
 * @param {React.ReactNode} children - Contenido a mostrar si tiene permiso
 * @param {React.ReactNode} fallback - (Opcional) Lo que se muestra si NO tiene permiso
 */
export const Can = ({ perform, children, fallback = null }) => {
    const { can } = useAuth();

    return can(perform) ? <>{children}</> : <>{fallback}</>;
};