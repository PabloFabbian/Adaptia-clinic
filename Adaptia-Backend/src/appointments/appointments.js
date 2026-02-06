import express from 'express';
import { getResourceFilter } from '../auth/permissions.js';
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        // Fallback: Si req.user no existe (aún no hay JWT), usamos IDs por defecto o evitamos el crash
        const userId = req.user?.id || null;
        const clinicId = req.user?.activeClinicId || null;

        if (!userId || !clinicId) {
            // Si el frontend pide citas sin estar logueado, devolvemos éxito pero sin datos
            return res.json({ data: [] });
        }

        // Obtenemos el filtro de gobernanza (Gobernanza/Soberanía)
        const filter = await getResourceFilter(req.pool, userId, clinicId, 'appointments');

        const query = `
            SELECT a.*, p.name as patient_name 
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            WHERE a.clinic_id = $1 AND ${filter.query}
            ORDER BY a.date ASC
        `;

        // El primer parámetro siempre es clinicId, los demás vienen del filtro
        const { rows } = await req.pool.query(query, [clinicId, ...filter.params]);

        // Respondemos con el formato que espera tu useAppointments.js ({ data: [...] })
        res.json({ data: rows });

    } catch (error) {
        console.error("❌ Error en Appointments Controller:", error);
        res.status(500).json({ data: [], error: "Error al consultar citas" });
    }
});

export default router;