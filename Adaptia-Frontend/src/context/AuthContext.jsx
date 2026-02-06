import { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeClinic, setActiveClinic] = useState(null);
    const [userPermissions, setUserPermissions] = useState([]);

    const API_BASE_URL = 'http://localhost:3001';

    /**
     * fetchMyPermissions:
     * Obtiene permisos desde la tabla role_capabilities.
     * Si el rol es 17 (Master), evitamos que el error 404 rompa la experiencia.
     */
    const fetchMyPermissions = useCallback(async (roleId, clinicId) => {
        if (!roleId || !clinicId) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/${clinicId}/roles/${roleId}/capabilities`);

            // Si el backend devuelve 404, tratamos los permisos como vacíos sin lanzar excepción
            if (response.status === 404) {
                console.warn(`⚠️ No se encontraron capacidades definidas para el rol ${roleId}.`);
                setUserPermissions([]);
                return;
            }

            if (!response.ok) throw new Error('Error al obtener capacidades');

            const capabilities = await response.json();

            // Normalizamos los slugs de permisos
            const permissions = capabilities.map(c => c.slug || c.capability?.slug || c);

            setUserPermissions(permissions);
            localStorage.setItem('adaptia_permissions', JSON.stringify(permissions));
        } catch (error) {
            console.error("❌ Error en AuthContext (fetchMyPermissions):", error.message);
            setUserPermissions([]);
        }
    }, []);

    const switchClinic = useCallback(async (membership) => {
        if (!membership) return;

        const clinicData = {
            id: String(membership.clinic_id || membership.id),
            name: membership.clinic_name || membership.name || "Clínica Adaptia",
            role_id: String(membership.role_id || ""),
            role_name: membership.role_name || membership.role?.name || "Member"
        };

        setActiveClinic(clinicData);
        localStorage.setItem('adaptia_active_clinic', JSON.stringify(clinicData));

        // Para el Tech Owner (17), el Sidebar ya le da acceso total, 
        // pero igual intentamos refrescar por si hay capacidades extra.
        if (clinicData.role_id && clinicData.id) {
            await fetchMyPermissions(clinicData.role_id, clinicData.id);
        }
    }, [fetchMyPermissions]);

    const login = async (userData) => {
        let initialMemberships = userData.memberships || [];

        // Inyección de membresía para el Tech Owner si viene aplanado
        if (initialMemberships.length === 0 && userData.activeClinic) {
            initialMemberships = [{
                clinic_id: userData.activeClinic.id,
                clinic_name: userData.activeClinic.name,
                role_name: userData.activeClinic.role_name || userData.role,
                role_id: "17"
            }];
        }

        const normalizedUser = {
            ...userData,
            memberships: initialMemberships
        };

        setUser(normalizedUser);
        localStorage.setItem('adaptia_user', JSON.stringify(normalizedUser));

        const primaryMembership = normalizedUser.memberships[0];
        if (primaryMembership) {
            await switchClinic(primaryMembership);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                const savedUser = localStorage.getItem('adaptia_user');
                const savedClinic = localStorage.getItem('adaptia_active_clinic');
                const savedPerms = localStorage.getItem('adaptia_permissions');

                if (savedUser) {
                    const parsedUser = JSON.parse(savedUser);
                    setUser(parsedUser);

                    if (savedClinic && savedClinic !== "undefined") {
                        const clinic = JSON.parse(savedClinic);
                        setActiveClinic(clinic);

                        // Si tenemos permisos guardados, los cargamos para rapidez visual
                        if (savedPerms) setUserPermissions(JSON.parse(savedPerms));

                        // Refrescamos en segundo plano
                        fetchMyPermissions(clinic.role_id, clinic.id);
                    }
                }
            } catch (error) {
                console.error("Error inicializando Auth:", error);
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, [fetchMyPermissions]);

    const logout = () => {
        setUser(null);
        setActiveClinic(null);
        setUserPermissions([]);
        localStorage.clear();
    };

    const hasRole = (roleIdentifiers) => {
        if (!activeClinic) return false;

        const identifiers = Array.isArray(roleIdentifiers) ? roleIdentifiers : [roleIdentifiers];
        const currentRoleName = activeClinic.role_name?.toLowerCase().trim();
        const currentRoleId = String(activeClinic.role_id || "").trim();

        return identifiers.some(id => {
            const search = String(id).toLowerCase().trim();
            return currentRoleName === search || currentRoleId === search;
        });
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            loading,
            activeClinic,
            userPermissions,
            switchClinic,
            hasRole
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