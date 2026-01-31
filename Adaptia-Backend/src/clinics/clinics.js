import express from 'express';
const router = express.Router();

// --- 1. LECTURA Y VALIDACIÓN ---

/**
 * Valida un token de invitación antes de que el usuario la acepte.
 */
router.get('/invitations/validate/:token', async (req, res) => {
    const { token } = req.params;
    try {
        const query = `
            SELECT i.token, i.email, i.status, c.name as clinic_name, r.name as role_name 
            FROM invitations i
            JOIN clinics c ON i.clinic_id = c.id
            JOIN roles r ON i.role_id = r.id
            WHERE i.token = $1 AND i.status = 'pending'
        `;
        const { rows } = await req.pool.query(query, [token]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Invitación no válida o expirada." });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error("❌ Error al validar token:", err.message);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

/**
 * Obtiene miembros activos e invitaciones pendientes de una clínica.
 */
router.get('/:clinicId/members-and-invitations', async (req, res) => {
    const { clinicId } = req.params;

    if (!req.pool) {
        return res.status(500).json({ error: "Error de configuración de DB" });
    }

    try {
        // Query de Miembros: Trae el email desde USERS vía LEFT JOIN
        const membersQuery = `
            SELECT 
                m.id, 
                m.name, 
                u.email, 
                r.name as role_name, 
                m.user_id,
                COALESCE(
                    (SELECT json_agg(json_build_object('type', c.resource_type, 'granted', c.is_granted))
                    FROM consents c 
                    WHERE c.member_id = m.id), 
                    '[]'
                ) as consents
            FROM members m 
            JOIN roles r ON m.role_id = r.id 
            LEFT JOIN users u ON m.user_id = u.id 
            WHERE m.clinic_id = $1
            ORDER BY m.id DESC
        `;

        const invitationsQuery = `
            SELECT i.id, i.email, r.name as role_name, i.status, i.created_at
            FROM invitations i 
            JOIN roles r ON i.role_id = r.id 
            WHERE i.clinic_id = $1 AND i.status = 'pending'
            ORDER BY i.created_at DESC
        `;

        const [membersRes, invitationsRes] = await Promise.all([
            req.pool.query(membersQuery, [clinicId]),
            req.pool.query(invitationsQuery, [clinicId])
        ]);

        res.json({
            members: membersRes.rows,
            invitations: invitationsRes.rows
        });
    } catch (err) {
        console.error("❌ Error en GET members-and-invitations:", err.message);
        res.status(500).json({ error: "No se pudo obtener el directorio" });
    }
});

// --- 2. GESTIÓN DE INVITACIONES ---

router.post('/:clinicId/invitations', async (req, res) => {
    const { clinicId } = req.params;
    const { email, role_id, invited_by } = req.body;
    // Generación de token único
    const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);

    try {
        const query = `
            INSERT INTO invitations (clinic_id, email, role_id, token, invited_by)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const { rows } = await req.pool.query(query, [clinicId, email, role_id, token, invited_by]);
        res.status(201).json({ success: true, invitation: rows[0] });
    } catch (err) {
        console.error("❌ Error al crear invitación:", err.message);
        res.status(500).json({ error: "No se pudo procesar la invitación" });
    }
});

/**
 * Acepta una invitación: Crea el registro en members y establece la soberanía inicial.
 */
router.post('/accept-invitation', async (req, res) => {
    const { token, userId } = req.body;

    try {
        await req.pool.query('BEGIN');

        // 1. Validar la invitación
        const invRes = await req.pool.query(
            'SELECT * FROM invitations WHERE token = $1 AND status = $2',
            [token, 'pending']
        );

        if (invRes.rows.length === 0) throw new Error("Invitación no válida o ya aceptada.");
        const invitation = invRes.rows[0];

        // 2. Insertar en MEMBERS vinculando el USER_ID (Obteniendo el nombre desde users)
        const memberQuery = `
            INSERT INTO members (name, role_id, clinic_id, user_id) 
            SELECT name, $1, $2, $3 FROM users WHERE id = $3
            RETURNING id, name;
        `;
        const memberRes = await req.pool.query(memberQuery, [invitation.role_id, invitation.clinic_id, userId]);

        if (memberRes.rows.length === 0) throw new Error("El usuario no existe para ser vinculado.");

        const newMemberId = memberRes.rows[0].id;

        // 3. Establecer Soberanía Inicial: TRUE por defecto para el propio especialista (o FALSE según tu modelo)
        // Aquí lo dejamos en FALSE para que el especialista deba activarlos explícitamente.
        const resources = ['patients', 'appointments', 'clinical_notes'];
        const consentValues = resources.map(resType => `(${newMemberId}, '${resType}', false)`).join(',');

        await req.pool.query(`
            INSERT INTO consents (member_id, resource_type, is_granted) 
            VALUES ${consentValues}
            ON CONFLICT (member_id, resource_type) DO NOTHING
        `);

        // 4. Marcar invitación como aceptada
        await req.pool.query('UPDATE invitations SET status = $1 WHERE id = $2', ['accepted', invitation.id]);

        await req.pool.query('COMMIT');
        res.json({ success: true, member: memberRes.rows[0] });

    } catch (err) {
        await req.pool.query('ROLLBACK');
        console.error("❌ Error al aceptar invitación:", err.message);
        res.status(400).json({ error: err.message });
    }
});

// --- 3. GESTIÓN DE CONSENTIMIENTOS (SOBERANÍA) ---

router.patch('/consent', async (req, res) => {
    const { memberId, resourceType, isGranted } = req.body;

    try {
        const query = `
            INSERT INTO consents (member_id, resource_type, is_granted)
            VALUES ($1, $2, $3)
            ON CONFLICT (member_id, resource_type) 
            DO UPDATE SET is_granted = EXCLUDED.is_granted
            RETURNING *;
        `;
        const { rows } = await req.pool.query(query, [memberId, resourceType, isGranted]);
        res.json({ success: true, consent: rows[0] });
    } catch (error) {
        console.error("❌ Error en PATCH consent:", error.message);
        res.status(500).json({ error: "Error al actualizar soberanía" });
    }
});

export default router;