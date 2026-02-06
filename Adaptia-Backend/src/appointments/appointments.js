import express from 'express';
import { getResourceFilter } from '../auth/permissions.js';
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const clinicId = req.user?.activeClinicId || null;

        if (!userId || !clinicId) {
            return res.json({ data: [] });
        }

        // 1. Obtenemos el filtro dinámico. 
        // El filtro ya trae la lógica de "Mis Citas OR Consentimiento"
        const filter = await getResourceFilter(req.pool, userId, clinicId, 'appointments');

        // 2. Construimos la Query.
        // Importante: Usamos 'a.clinic_id' para evitar ambigüedad con el JOIN de pacientes
        const query = `
            SELECT 
                a.*, 
                p.name as patient_name 
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            WHERE a.clinic_id = $1 
            AND ${filter.query}
            ORDER BY a.date ASC
        `;

        // 3. Ejecutamos.
        // filter.params ya trae el viewerMemberId y el resourceType en el orden correcto ($2, $3...)
        const { rows } = await req.pool.query(query, [clinicId, ...filter.params]);

        res.json({ data: rows });

    } catch (error) {
        console.error("❌ Error en Appointments Controller:", error);
        res.status(500).json({ data: [], error: "Error al consultar citas" });
    }
});

export default router;