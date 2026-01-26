// src/appointments/appointments.js
import express from 'express';
import { getResourceFilter } from '../auth/permissions.js';
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { memberId, clinicId } = req.user; // Obtenido del JWT/Sesión

        // Obtenemos el "escudo" de privacidad
        const filter = await getResourceFilter(req.pool, memberId, clinicId, 'appointments');

        const query = `
            SELECT a.*, p.name as patient_name 
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            WHERE ${filter.query}
            ORDER BY a.date ASC
        `;

        const { rows } = await req.pool.query(query, filter.params);
        res.json(rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al consultar citas con filtro de privacidad" });
    }
});

export default router;