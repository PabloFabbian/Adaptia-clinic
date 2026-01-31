import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeClinic, setActiveClinic] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('adaptia_user');
        const savedClinic = localStorage.getItem('adaptia_active_clinic');

        if (savedUser) setUser(JSON.parse(savedUser));
        if (savedClinic) setActiveClinic(JSON.parse(savedClinic));

        setLoading(false);
    }, []);

    /**
     * LOGIN: Estandarizamos para que el objeto tenga siempre 'role_name'
     */
    const login = (userData) => {
        // Normalizamos el objeto user para que siempre use role_name
        const normalizedUser = {
            ...userData,
            role_name: userData.role_name || userData.role // Soporta ambas versiones del backend
        };

        setUser(normalizedUser);
        localStorage.setItem('adaptia_user', JSON.stringify(normalizedUser));

        // Si el backend envía datos de la clínica (id Y nombre)
        if (userData.activeClinicId) {
            const clinicData = {
                id: userData.activeClinicId,
                name: userData.clinicName || 'Mi Clínica', // IMPORTANTE: Guardamos el nombre para el Header
                role_name: normalizedUser.role_name
            };
            setActiveClinic(clinicData);
            localStorage.setItem('adaptia_active_clinic', JSON.stringify(clinicData));
        }
    };

    const logout = () => {
        setUser(null);
        setActiveClinic(null);
        localStorage.removeItem('adaptia_user');
        localStorage.removeItem('adaptia_active_clinic');
    };

    const switchClinic = (membership) => {
        // 'membership' debe ser el objeto completo de la tabla members con clinic.name
        const newActiveClinic = {
            id: membership.clinic_id,
            name: membership.clinic?.name || membership.name,
            role_name: membership.role?.name || membership.role_name
        };
        setActiveClinic(newActiveClinic);
        localStorage.setItem('adaptia_active_clinic', JSON.stringify(newActiveClinic));
    };

    /**
     * VERIFICACIÓN DE ROLES (La fuente de verdad para la UI)
     */
    const hasRole = (allowedRoles) => {
        const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        // Priorizamos el rol que tiene el usuario en la clínica activa actualmente
        const currentRole = activeClinic?.role_name || user?.role_name;

        return rolesArray.includes(currentRole);
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            loading,
            activeClinic,
            switchClinic,
            hasRole // Ahora podemos usar esto en Clinics.jsx
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
    return context;
};