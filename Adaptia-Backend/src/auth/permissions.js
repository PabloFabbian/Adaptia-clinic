/**
 * CONSTANTES DE CAPACIDADES
 * Mantenemos estas exportaciones para compatibilidad con filters.js
 */
export const CAPABILITIES = {
    VIEW_ALL_APPOINTMENTS: 'view_all_appointments',
    VIEW_ALL_PATIENTS: 'view_all_patients',
    MANAGE_CLINIC: 'manage_clinic'
};

/**
 * CONSTANTES DE SCOPES (RECURSOS)
 */
export const SCOPES = {
    APPOINTMENTS: 'appointments',
    PATIENTS: 'patients',
    NOTES: 'notes'
};

/**
 * LÓGICA CORE: getResourceFilter
 * Genera las condiciones de filtrado basadas en el Consentimiento y el Rol.
 * * @param {object} pool - Conexión a la base de datos PostgreSQL.
 * @param {number} viewerMemberId - El ID del miembro (psicólogo) que consulta.
 * @param {number} clinicId - La clínica en la que está operando.
 * @param {string} resourceType - El recurso solicitado (ej: 'appointments').
 */
export const getResourceFilter = async (pool, viewerMemberId, clinicId, resourceType) => {
    try {
        // 1. Buscamos las capacidades del rol que tiene el miembro en esta clínica
        const memberInfo = await pool.query(`
            SELECT c.slug as capability
            FROM members m
            JOIN roles r ON m.role_id = r.id
            JOIN role_capabilities rc ON r.id = rc.role_id
            JOIN capabilities c ON rc.capability_id = c.id
            WHERE m.id = $1 AND m.clinic_id = $2`,
            [viewerMemberId, clinicId]
        );

        const capabilities = memberInfo.rows.map(row => row.capability);

        // Verificamos si tiene el permiso global para ese recurso (ej: view_all_appointments)
        const canViewAll = capabilities.includes(`view_all_${resourceType}`);

        if (canViewAll) {
            /**
             * LÓGICA DE COLABORACIÓN:
             * Retorna: Mis propios recursos O recursos ajenos donde el dueño 
             * ha otorgado permiso explícito a la clínica.
             */
            return {
                query: `(owner_member_id = $1 OR owner_member_id IN (
                    SELECT member_id FROM consents 
                    WHERE resource_type = $2 AND is_granted = TRUE
                    AND clinic_id = $3
                ))`,
                params: [viewerMemberId, resourceType, clinicId]
            };
        }

        // Si el rol es limitado, solo puede ver lo que él mismo creó
        return {
            query: `owner_member_id = $1`,
            params: [viewerMemberId]
        };

    } catch (error) {
        console.error("Error en el motor de permisos:", error);
        // Por seguridad, si hay error, devolvemos un filtro que solo muestre lo propio
        return {
            query: `owner_member_id = $1`,
            params: [viewerMemberId]
        };
    }
};

/**
 * Función auxiliar para verificar un permiso específico (Boolean)
 */
export const hasPermission = async (pool, memberId, capabilitySlug) => {
    const res = await pool.query(`
        SELECT count(*) 
        FROM members m
        JOIN role_capabilities rc ON m.role_id = rc.role_id
        JOIN capabilities c ON rc.capability_id = c.id
        WHERE m.id = $1 AND c.slug = $2`,
        [memberId, capabilitySlug]
    );
    return parseInt(res.rows[0].count) > 0;
};