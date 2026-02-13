import { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeClinic, setActiveClinic] = useState(null);
    const [userPermissions, setUserPermissions] = useState([]);

    const API_BASE_URL = 'http://localhost:3001';

    // 1. Obtener permisos desde el backend
    const fetchMyPermissions = useCallback(async (roleId, clinicId) => {
        if (roleId === undefined || roleId === null || !clinicId) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/${clinicId}/roles/${roleId}/capabilities`);

            if (response.status === 404) {
                setUserPermissions([]);
                return;
            }

            if (!response.ok) throw new Error('Error al obtener capacidades');

            const capabilities = await response.json();

            // Normalizamos los permisos a un array de strings (slugs)
            // Esto permite hacer: userPermissions.includes('patients.read')
            const permissions = capabilities.map(c => {
                const slug = c.slug || c.capability?.slug || c;
                return typeof slug === 'string' ? slug.toLowerCase() : slug;
            });

            setUserPermissions(permissions);
            localStorage.setItem('adaptia_permissions', JSON.stringify(permissions));
        } catch (error) {
            console.error("❌ Error en AuthContext (fetchMyPermissions):", error.message);
            setUserPermissions([]);
        }
    }, []);

    // 2. Cambiar de clínica
    const switchClinic = useCallback(async (membership) => {
        if (!membership) return;

        const clinicData = {
            id: String(membership.clinic_id || membership.id),
            name: membership.clinic_name || membership.name || "Clínica",
            role_id: Number(membership.role_id),
            role_name: membership.role_name || (Number(membership.role_id) === 0 ? "Tech Owner" : "Miembro")
        };

        setActiveClinic(clinicData);
        localStorage.setItem('adaptia_active_clinic', JSON.stringify(clinicData));

        await fetchMyPermissions(clinicData.role_id, clinicData.id);
    }, [fetchMyPermissions]);

    // 3. Login
    const login = async (userData) => {
        try {
            const clinicRole = userData.activeClinic?.role_id;
            const numericRoleId = (clinicRole !== undefined && clinicRole !== null)
                ? Number(clinicRole)
                : null;

            const memberships = userData.memberships || (userData.activeClinic ? [userData.activeClinic] : []);

            const normalizedUser = {
                ...userData,
                role_id: numericRoleId,
                memberships: memberships
            };

            setUser(normalizedUser);
            localStorage.setItem('adaptia_user', JSON.stringify(normalizedUser));

            if (userData.activeClinic) {
                const clinicData = {
                    ...userData.activeClinic,
                    role_id: numericRoleId
                };
                setActiveClinic(clinicData);
                localStorage.setItem('adaptia_active_clinic', JSON.stringify(clinicData));
                await fetchMyPermissions(clinicData.role_id, clinicData.id);
            }

            return normalizedUser;
        } catch (error) {
            console.error("❌ Error en AuthContext Login:", error);
            throw error;
        }
    };

    // 4. Inicialización
    useEffect(() => {
        const initAuth = async () => {
            try {
                const savedUser = localStorage.getItem('adaptia_user');
                const savedClinic = localStorage.getItem('adaptia_active_clinic');
                const savedPerms = localStorage.getItem('adaptia_permissions');

                if (savedUser && savedUser !== "undefined") {
                    const parsedUser = JSON.parse(savedUser);
                    setUser(parsedUser);

                    if (savedClinic && savedClinic !== "undefined") {
                        const clinic = JSON.parse(savedClinic);
                        clinic.role_id = Number(clinic.role_id);
                        setActiveClinic(clinic);

                        if (savedPerms) setUserPermissions(JSON.parse(savedPerms));

                        // Re-validamos permisos con el servidor para estar seguros
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

    // 5. Logout
    const logout = () => {
        setUser(null);
        setActiveClinic(null);
        setUserPermissions([]);
        localStorage.clear();
        window.location.href = '/login';
    };

    // --- NUEVOS HELPERS DE GOBERNANZA ---

    /**
     * Comprueba si el usuario tiene una capacidad específica (Permiso Fino)
     * @param {string} permission - El slug del permiso (ej: 'patients.write')
     * @returns {boolean}
     */
    const can = useCallback((permission) => {
        if (!permission) return false;
        // El Tech Owner (Rol 0) suele saltarse las validaciones de permisos finos
        if (Number(activeClinic?.role_id) === 0) return true;

        return userPermissions.includes(permission.toLowerCase());
    }, [userPermissions, activeClinic]);

    /**
     * Verifica roles (Permiso Grueso)
     */
    const hasRole = useCallback((roleIdentifiers) => {
        if (!activeClinic) return false;
        const identifiers = Array.isArray(roleIdentifiers) ? roleIdentifiers : [roleIdentifiers];
        const currentRoleId = Number(activeClinic.role_id);
        const currentRoleName = activeClinic.role_name?.toLowerCase().trim();

        return identifiers.some(id => {
            if (typeof id === 'number') return currentRoleId === id;
            return currentRoleName === String(id).toLowerCase().trim();
        });
    }, [activeClinic]);

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            loading,
            activeClinic,
            userPermissions,
            switchClinic,
            hasRole,
            can // <--- Exportamos la nueva función
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