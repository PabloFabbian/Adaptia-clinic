import express from 'express';
const router = express.Router();

// --- 1. LECTURA Y LISTADO ---

/**
 * Obtiene miembros activos e invitaciones pendientes de una clínica.
 * Útil para la pestaña "Miembros" de Clinics.jsx.
 */
router.get('/:clinicId/members-and-invitations', async (req, res) => {
    const { clinicId } = req.params;
    try {
        // Miembros actuales con sus nombres de roles
        const membersQuery = `
            SELECT m.*, r.name as role_name 
            FROM members m 
            JOIN roles r ON m.role_id = r.id 
            WHERE m.clinic_id = $1
            ORDER BY m.id DESC
        `;

        // Invitaciones que aún no han sido aceptadas
        const invitationsQuery = `
            SELECT i.*, r.name as role_name 
            FROM invitations i 
            JOIN roles r ON i.role_id = r.id 
            WHERE i.clinic_id = $1 AND i.status = 'pending'
            ORDER BY i.created_at DESC
        `;

        const [members, invitations] = await Promise.all([
            req.pool.query(membersQuery, [clinicId]),
            req.pool.query(invitationsQuery, [clinicId])
        ]);

        res.json({
            members: members.rows,
            invitations: invitations.rows
        });
    } catch (err) {
        console.error("❌ Error al listar miembros:", err);
        res.status(500).json({ error: "Error al obtener el listado del directorio" });
    }
});

// --- 2. GESTIÓN DE INVITACIONES ---

/**
 * Crea una invitación para un profesional.
 */
router.post('/:clinicId/invitations', async (req, res) => {
    const { clinicId } = req.params;
    const { email, role_id, invited_by } = req.body;
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    try {
        const query = `
            INSERT INTO invitations (clinic_id, email, role_id, token, invited_by)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const { rows } = await req.pool.query(query, [clinicId, email, role_id, invited_by]);
        res.status(201).json({ success: true, invitation: rows[0] });
    } catch (err) {
        console.error("❌ Error al invitar:", err);
        res.status(500).json({ error: "No se pudo procesar la invitación" });
    }
});

/**
 * Acepta una invitación y vincula al usuario como miembro.
 * Implementa la filosofía de "Consentimiento por Defecto: FALSE".
 */
router.post('/accept-invitation', async (req, res) => {
    const { token, userId } = req.body;

    try {
        await req.pool.query('BEGIN');

        const invRes = await req.pool.query(
            'SELECT * FROM invitations WHERE token = $1 AND status = $2',
            [token, 'pending']
        );

        if (invRes.rows.length === 0) throw new Error("Invitación inválida o expirada");
        const invitation = invRes.rows[0];

        // Crear miembro vinculado
        const memberQuery = `
            INSERT INTO members (name, role_id, clinic_id, user_id) 
            SELECT name, $1, $2, $3 FROM users WHERE id = $3
            RETURNING id, name;
        `;
        const memberRes = await req.pool.query(memberQuery, [invitation.role_id, invitation.clinic_id, userId]);
        const newMemberId = memberRes.rows[0].id;

        // Crear consentimientos apagados
        const resources = ['patients', 'appointments', 'clinical_notes'];
        for (const resType of resources) {
            await req.pool.query(
                'INSERT INTO consents (member_id, clinic_id, resource_type, is_granted) VALUES ($1, $2, $3, false)',
                [newMemberId, invitation.clinic_id, resType]
            );
        }

        await req.pool.query('UPDATE invitations SET status = $1 WHERE id = $2', ['accepted', invitation.id]);
        await req.pool.query('COMMIT');

        res.json({ success: true, member: memberRes.rows[0] });
    } catch (err) {
        await req.pool.query('ROLLBACK');
        res.status(400).json({ error: err.message });
    }
});

// --- 3. GESTIÓN DE CONSENTIMIENTOS ---

/**
 * El "Switch" de soberanía de datos del profesional.
 */
router.patch('/consent', async (req, res) => {
    const { memberId, resourceType, isGranted, clinicId } = req.body;

    try {
        const query = `
            INSERT INTO consents (member_id, resource_type, is_granted, clinic_id)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (member_id, resource_type, clinic_id) 
            DO UPDATE SET is_granted = EXCLUDED.is_granted
            RETURNING *;
        `;
        const { rows } = await req.pool.query(query, [memberId, resourceType, isGranted, clinicId]);
        res.json({ success: true, consent: rows[0] });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar soberanía de datos" });
    }
});

export default router;