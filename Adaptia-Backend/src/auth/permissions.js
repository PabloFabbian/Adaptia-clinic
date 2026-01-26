// src/auth/permissions.js

/**
 * Genera las condiciones de filtrado basadas en el Consentimiento.
 * @param {number} viewerMemberId - El ID del miembro que está logueado.
 * @param {number} clinicId - La clínica donde está operando.
 * @param {string} resourceType - 'appointments' o 'patients'.
 */
export const getResourceFilter = async (pool, viewerMemberId, clinicId, resourceType) => {
    // 1. Buscamos el rol y las capacidades del usuario actual
    const memberInfo = await pool.query(`
        SELECT r.id as role_id, c.slug as capability
        FROM members m
        JOIN roles r ON m.role_id = r.id
        JOIN role_capabilities rc ON r.id = rc.role_id
        JOIN capabilities c ON rc.capability_id = c.id
        WHERE m.id = $1`, [viewerMemberId]);

    const capabilities = memberInfo.rows.map(row => row.capability);
    const canViewAll = capabilities.includes(`view_all_${resourceType}`);

    if (canViewAll) {
        // LÓGICA CORE: 
        // Ver mis recursos + recursos de otros que HAN DADO CONSENTIMIENTO
        return {
            query: `(owner_member_id = $1 OR owner_member_id IN (
                SELECT member_id FROM consents 
                WHERE resource_type = $2 AND is_granted = TRUE
            ))`,
            params: [viewerMemberId, resourceType]
        };
    }

    // Si no tiene capacidad de ver todo, solo ve lo suyo
    return {
        query: `owner_member_id = $1`,
        params: [viewerMemberId]
    };
};