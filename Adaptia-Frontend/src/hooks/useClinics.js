import { useState, useCallback } from 'react';

export const useClinics = () => {
    const [members, setMembers] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [roles, setRoles] = useState([]);
    const [capabilities, setCapabilities] = useState([]);
    const [governanceMatrix, setGovernanceMatrix] = useState({});
    const [loading, setLoading] = useState(false);

    const API_BASE_URL = 'http://localhost:3001';

    // 1. Obtener Directorio (Miembros e Invitaciones)
    const fetchDirectory = useCallback(async (clinicId) => {
        if (!clinicId) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/${clinicId}/directory`);
            const data = await response.json();
            setMembers(data.members || []);
            setInvitations(data.invitations || []);
        } catch (error) {
            console.error("❌ Error en fetchDirectory:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. Obtener Gobernanza (Roles, Capacidades y Matriz)
    const fetchGovernance = useCallback(async (clinicId) => {
        if (!clinicId) return;
        setLoading(true);
        try {
            const [rolesRes, capsRes, govRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/clinics/roles`),
                fetch(`${API_BASE_URL}/api/clinics/capabilities`),
                fetch(`${API_BASE_URL}/api/clinics/${clinicId}/governance`)
            ]);

            if (!rolesRes.ok || !capsRes.ok || !govRes.ok) {
                throw new Error("Uno de los endpoints de gobernanza falló");
            }

            const [rolesData, capsData, govData] = await Promise.all([
                rolesRes.json(),
                capsRes.json(),
                govRes.json()
            ]);

            setRoles(rolesData || []);
            setCapabilities(capsData || []);
            setGovernanceMatrix(govData || {});
        } catch (error) {
            console.error("❌ Error en fetchGovernance:", error);
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    // 3. Toggle de Permisos de Rol (Gobernanza)
    const toggleRolePermission = async (clinicId, roleName, capabilityId, action) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/${clinicId}/permissions/toggle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role_name: roleName,
                    capability_id: capabilityId,
                    action: action
                })
            });

            if (response.ok) {
                setGovernanceMatrix(prev => {
                    const newMatrix = { ...prev };
                    if (action === 'grant') {
                        const cap = capabilities.find(c => c.id === capabilityId);
                        if (!newMatrix[roleName]) newMatrix[roleName] = [];
                        newMatrix[roleName].push({ resource: cap.slug });
                    } else {
                        newMatrix[roleName] = newMatrix[roleName].filter(
                            p => p.resource !== capabilities.find(c => c.id === capabilityId)?.slug
                        );
                    }
                    return newMatrix;
                });
                return true;
            }
        } catch (error) {
            console.error("❌ Error en toggleRolePermission:", error);
            throw error;
        }
    };

    // 4. Toggle de Consentimiento Individual (Soberanía)
    const toggleConsent = async (clinicId, memberId, resourceSlug, isGranted) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/${clinicId}/members/${memberId}/consent`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resource_slug: resourceSlug,
                    granted: isGranted
                })
            });

            if (response.ok) {
                await fetchDirectory(clinicId);
                return true;
            }
        } catch (error) {
            console.error("❌ Error en toggleConsent:", error);
            throw error;
        }
    };

    return {
        members,
        invitations,
        roles,
        capabilities,
        governanceMatrix,
        loading,
        fetchDirectory,
        fetchGovernance,
        toggleRolePermission,
        toggleConsent
    };
};