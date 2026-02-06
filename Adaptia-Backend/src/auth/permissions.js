export const CAPABILITIES = {
    READ_APPOINTMENTS: 'clinic.appointments.read',
    READ_PATIENTS: 'clinic.patients.read',
    READ_NOTES: 'clinic.notes.read'
};

/**
 * Genera un filtro SQL dinámico basado en Capacidades de Rol (Nivel 1)
 * y Consentimiento/Soberanía (Nivel 2).
 */
export const getResourceFilter = async (pool, viewerUserId, clinicId, resourceType) => {
    // Mapeo de recurso al slug de capacidad y al nombre de recurso en la tabla 'consents'
    const resourceMap = {
        'appointments': { cap: CAPABILITIES.READ_APPOINTMENTS, consentKey: 'appointments' },
        'patients': { cap: CAPABILITIES.READ_PATIENTS, consentKey: 'patients' },
        'clinical_notes': { cap: CAPABILITIES.READ_NOTES, consentKey: 'notes' }
    };

    const config = resourceMap[resourceType];

    try {
        // 1. Obtener el ID de Miembro del que está mirando (viewer)
        const viewerMemberRes = await pool.query(
            'SELECT id FROM members WHERE user_id = $1 AND clinic_id = $2',
            [viewerUserId, clinicId]
        );
        const viewerMemberId = viewerMemberRes.rows[0]?.id;

        if (!viewerMemberId) return { query: `FALSE`, params: [] };

        // 2. Verificar si el viewer tiene la CAPACIDAD técnica en su ROL (Nivel 1)
        const capsRes = await pool.query(`
            SELECT 1 FROM role_capabilities rc
            JOIN members m ON m.role_id = rc.role_id
            JOIN capabilities c ON rc.capability_id = c.id
            WHERE m.id = $1 AND c.slug = $2`,
            [viewerMemberId, config.cap]
        );

        const hasGlobalCapability = capsRes.rowCount > 0;

        // 3. CONSTRUCCIÓN DEL FILTRO DE SOBERANÍA
        // Un miembro ve un recurso si:
        // A) Es el dueño (propietario) del recurso.
        // B) TIENE la capacidad técnica Y el dueño ha dado CONSENTIMIENTO a la clínica.

        if (hasGlobalCapability) {
            // Caso: Tiene permiso de rol. Ve lo suyo + lo compartido.
            return {
                query: `(
                    a.owner_member_id = $2 
                    OR EXISTS (
                        SELECT 1 FROM consents c 
                        WHERE c.member_id = a.owner_member_id 
                        AND c.resource_type = $3 
                        AND c.is_granted = TRUE 
                        AND c.clinic_id = $1
                    )
                )`,
                params: [viewerMemberId, config.consentKey]
                // Nota: $1 es clinicId (ya pasado en el controller), 
                // aquí ajustamos los índices para el array final.
            };
        } else {
            // Caso: No tiene capacidad en su rol. SOLO ve lo suyo.
            return {
                query: `a.owner_member_id = $2`,
                params: [viewerMemberId]
            };
        }

    } catch (error) {
        console.error("❌ Error en getResourceFilter:", error);
        return { query: `FALSE`, params: [] }; // Bloqueo preventivo ante error
    }
};