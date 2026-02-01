export const CAPABILITIES = {
    READ_APPOINTMENTS: 'clinic.appointments.read',
    READ_PATIENTS: 'clinic.patients.read',
    READ_NOTES: 'clinic.notes.read',
    READ_MEMBERS: 'clinic.members.read',
    READ_ROLES: 'clinic.roles.read',
    WRITE_APPOINTMENTS: 'clinic.appointments.write',
    WRITE_MEMBERS: 'clinic.members.write',
    WRITE_SETTINGS: 'clinic.settings.write',
    MANAGE_CLINIC: 'clinic.settings.read'
};

export const getResourceFilter = async (pool, viewerMemberId, clinicId, resourceType) => {
    const resourceToCapability = {
        'appointments': CAPABILITIES.READ_APPOINTMENTS,
        'patients': CAPABILITIES.READ_PATIENTS,
        'clinical_notes': CAPABILITIES.READ_NOTES
    };

    const capabilityNeeded = resourceToCapability[resourceType];

    try {
        const capsRes = await pool.query(`
            SELECT c.slug FROM members m
            JOIN role_capabilities rc ON m.role_id = rc.role_id
            JOIN capabilities c ON rc.capability_id = c.id
            WHERE m.id = $1 AND m.clinic_id = $2`,
            [viewerMemberId, clinicId]
        );

        const capabilities = capsRes.rows.map(r => r.slug);
        const canViewGlobal = capabilities.includes(capabilityNeeded);

        if (canViewGlobal) {
            return {
                query: `(a.owner_member_id = $2 OR a.owner_member_id IN (
                    SELECT member_id FROM consents 
                    WHERE resource_type = $3 AND is_granted = TRUE AND clinic_id = $4
                ))`,
                params: [viewerMemberId, resourceType, clinicId]
            };
        }

        return {
            query: `a.owner_member_id = $2`,
            params: [viewerMemberId]
        };

    } catch (error) {
        console.error("❌ Error en getResourceFilter:", error);
        return { query: `a.owner_member_id = $2`, params: [viewerMemberId] };
    }
};