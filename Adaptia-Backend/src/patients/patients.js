import express from 'express';
import { getResourceFilter } from '../auth/permissions.js';
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { memberId, clinicId } = req.user;

        // Aplicamos el filtro para el recurso 'patients'
        const filter = await getResourceFilter(req.pool, memberId, clinicId, 'patients');

        const query = `
            SELECT id, name, history, owner_member_id,
            (owner_member_id = $1) as is_mine
            FROM patients
            WHERE ${filter.query}
            ORDER BY name ASC
        `;

        const { rows } = await req.pool.query(query, filter.params);
        res.json({ data: rows });
    } catch (error) {
        res.status(500).json({ error: "Error de privacidad en pacientes" });
    }
});

export default router;