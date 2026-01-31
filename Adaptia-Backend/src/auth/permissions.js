/**
 * CONFIGURACIÓN DE CAPACIDADES (Slugs de la Base de Datos)
 * Estos deben coincidir exactamente con los nombres en la tabla 'capabilities'.
 */
export const CAPABILITIES = {
    // Lectura (Global/Clínica)
    READ_APPOINTMENTS: 'clinic.appointments.read',
    READ_PATIENTS: 'clinic.patients.read',
    READ_NOTES: 'clinic.notes.read',
    READ_MEMBERS: 'clinic.members.read',
    READ_ROLES: 'clinic.roles.read',

    // Escritura/Gestión
    WRITE_APPOINTMENTS: 'clinic.appointments.write',
    WRITE_MEMBERS: 'clinic.members.write',
    WRITE_SETTINGS: 'clinic.settings.write',

    // El rol 'Owner' suele tener permisos de administración general
    MANAGE_CLINIC: 'clinic.settings.read'
};

/**
 * Genera el filtro SQL dinámico (La "Llave" de Adaptia).
 * Permite ver registros propios O registros de terceros que han otorgado consentimiento.
 */
export const getResourceFilter = async (pool, viewerMemberId, clinicId, resourceType) => {
    // Mapeo interno: qué recurso requiere qué capacidad para ver lo de otros
    const resourceToCapability = {
        'appointments': CAPABILITIES.READ_APPOINTMENTS,
        'patients': CAPABILITIES.READ_PATIENTS,
        'clinical_notes': CAPABILITIES.READ_NOTES
    };

    const capabilityNeeded = resourceToCapability[resourceType];

    try {
        // 1. Obtener todas las capacidades del miembro en esta clínica
        const capsRes = await pool.query(`
            SELECT c.slug 
            FROM members m
            JOIN role_capabilities rc ON m.role_id = rc.role_id
            JOIN capabilities c ON rc.capability_id = c.id
            WHERE m.id = $1 AND m.clinic_id = $2`,
            [viewerMemberId, clinicId]
        );

        const capabilities = capsRes.rows.map(r => r.slug);

        // 2. Verificar si tiene la capacidad de lectura global para este recurso
        const canViewGlobal = capabilities.includes(capabilityNeeded);

        if (canViewGlobal) {
            /**
             * FILTRO ADAPTIA:
             * registros donde:
             * (Soy el dueño) 
             * O 
             * (El dueño es un colaborador que dio permiso a la clínica para este recurso)
             */
            return {
                query: `(owner_member_id = $1 OR owner_member_id IN (
                    SELECT member_id FROM consents 
                    WHERE resource_type = $2 AND is_granted = TRUE AND clinic_id = $3
                ))`,
                params: [viewerMemberId, resourceType, clinicId]
            };
        }

        // Si no tiene capacidad global, blindaje total: solo ve lo propio
        return {
            query: `owner_member_id = $1`,
            params: [viewerMemberId]
        };

    } catch (error) {
        console.error("❌ Error crítico en getResourceFilter:", error);
        // Por seguridad, si falla la consulta, devolvemos solo lo propio (Fail-safe)
        return { query: `owner_member_id = $1`, params: [viewerMemberId] };
    }
};

/**
 * Verifica si un miembro tiene una capacidad específica.
 * Útil para proteger rutas de API o botones en el frontend.
 */
export const hasPermission = async (pool, memberId, capabilitySlug) => {
    try {
        const res = await pool.query(`
            SELECT count(*) 
            FROM members m
            JOIN role_capabilities rc ON m.role_id = rc.role_id
            JOIN capabilities c ON rc.capability_id = c.id
            WHERE m.id = $1 AND c.slug = $2`,
            [memberId, capabilitySlug]
        );
        return parseInt(res.rows[0].count) > 0;
    } catch (error) {
        console.error("❌ Error en hasPermission:", error);
        return false;
    }
};