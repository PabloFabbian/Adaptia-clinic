import { useState, useCallback } from 'react';

export const useClinics = () => {
    const [members, setMembers] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(false);

    // Puerto 3001 según tu configuración de Backend en Neon
    const API_BASE_URL = 'http://localhost:3001';

    const fetchDirectory = useCallback(async (clinicId) => {
        if (!clinicId) return;
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${API_BASE_URL}/api/clinics/${clinicId}/members-and-invitations`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Error en el servidor: ${response.status}`);
            }

            const data = await response.json();

            // Mapeamos los datos que vienen del backend
            setMembers(data.members || []);
            setInvitations(data.invitations || []);

        } catch (error) {
            console.error("❌ Error en fetchDirectory:", error);
            // Limpiamos estados en caso de error para evitar UI inconsistente
            setMembers([]);
            setInvitations([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const toggleConsent = async (clinicId, memberId, resourceType, isGranted) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/clinics/consent`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    memberId,
                    resourceType,
                    isGranted
                    // clinicId ya no es estrictamente necesario si tu tabla consents no lo usa, 
                    // pero lo dejamos si planeas agregarlo a la tabla luego.
                })
            });

            if (response.ok) {
                // Forzamos el refresco para que los ResourcePills cambien de color inmediatamente
                await fetchDirectory(clinicId);
            } else {
                console.error("Error al actualizar el consentimiento");
            }
        } catch (error) {
            console.error("❌ Error en toggleConsent:", error);
        }
    };

    return {
        members,
        invitations,
        loading,
        fetchDirectory,
        toggleConsent
    };
};