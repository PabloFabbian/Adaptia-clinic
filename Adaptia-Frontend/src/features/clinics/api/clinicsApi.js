const API_URL = `${import.meta.env.VITE_API_URL}/api`;

export const clinicsApi = {
    // Enviar invitación
    inviteMember: async (clinicId, inviteData) => {
        const res = await fetch(`${API_URL}/patients/${clinicId}/invitations`, { // Ajustado a tu ruta de backend
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inviteData),
        });
        if (!res.ok) throw new Error('Error al enviar invitación');
        return res.json();
    },

    // Obtener roles reales de la DB
    getRoles: async () => {
        const res = await fetch(`${API_URL}/roles`);
        if (!res.ok) throw new Error('Error al obtener roles');
        return res.json();
    },

    // Actualizar consentimiento
    updateConsent: async (consentData) => {
        const res = await fetch(`${API_URL}/consent`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(consentData),
        });
        return res.json();
    }
};