export const CAPABILITIES = {
    READ_APPOINTMENTS: 'clinic.appointments.read',
    READ_PATIENTS: 'clinic.patients.read',
    READ_NOTES: 'clinic.notes.read'
};

export const getResourceFilter = async (pool, viewerUserId, clinicId, resourceType) => {
    // Mapeo de recurso a la capacidad necesaria
    const resourceToCapability = {
        'appointments': CAPABILITIES.READ_APPOINTMENTS,
        'patients': CAPABILITIES.READ_PATIENTS,
        'clinical_notes': CAPABILITIES.READ_NOTES
    };

    const capabilityNeeded = resourceToCapability[resourceType];

    try {
        // Buscamos si el usuario tiene la capacidad asignada a través de su rol
        const capsRes = await pool.query(`
            SELECT c.slug FROM members m
            JOIN role_capabilities rc ON m.role_id = rc.role_id
            JOIN capabilities c ON rc.capability_id = c.id
            WHERE m.user_id = $1 AND m.clinic_id = $2`,
            [viewerUserId, clinicId]
        );

        const userCapabilities = capsRes.rows.map(r => r.slug);

        // Si tiene la capacidad global, devolvemos un filtro que permita ver todo
        if (userCapabilities.includes(capabilityNeeded)) {
            return { query: `(TRUE)`, params: [] };
        }

        // Si no tiene capacidad global, filtramos para que solo vea lo que él creó
        const memberRes = await pool.query(
            'SELECT id FROM members WHERE user_id = $1 AND clinic_id = $2',
            [viewerUserId, clinicId]
        );
        const memberId = memberRes.rows[0]?.id;

        return {
            query: `owner_member_id = $1`,
            params: [memberId || 0]
        };

    } catch (error) {
        console.error("❌ Error en getResourceFilter:", error);
        return { query: `owner_member_id = $1`, params: [0] };
    }
};