import express from 'express';
import { getResourceFilter } from '../auth/permissions.js';
const router = express.Router();

// 1. LISTAR PACIENTES (Con filtros de privacidad)
router.get('/', async (req, res) => {
    try {
        const viewerMemberId = 1; // En producción: req.user.id
        const clinicId = 1;
        const filter = await getResourceFilter(req.pool, viewerMemberId, clinicId, 'patients');

        const query = `
            SELECT id, name, history, owner_member_id, email, phone
            FROM patients
            WHERE ${filter.query}
            ORDER BY name ASC
        `;
        const { rows } = await req.pool.query(query, filter.params);
        res.json({ data: rows });
    } catch (error) {
        console.error("❌ Error al obtener pacientes:", error);
        res.status(500).json({ error: "Error al obtener pacientes" });
    }
});

// 2. REGISTRO DE NUEVO PACIENTE (Movido desde index.js)
router.post('/', async (req, res) => {
    try {
        const { name, ownerMemberId, history, email, phone } = req.body;
        const query = `
            INSERT INTO patients (name, owner_member_id, history, email, phone) 
            VALUES ($1, $2, $3, $4, $5) RETURNING *
        `;
        const values = [
            name,
            ownerMemberId || 1,
            history ? JSON.stringify(history) : '{}',
            email || null,
            phone || null
        ];
        const { rows } = await req.pool.query(query, values);
        res.status(201).json({ data: rows[0] });
    } catch (err) {
        console.error("❌ Error al crear paciente:", err);
        res.status(500).json({ error: "Error al crear el registro" });
    }
});

// 3. ACTUALIZAR PERFIL DE PACIENTE (Edición)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, history } = req.body;
    try {
        const query = `
            UPDATE patients 
            SET name = $1, email = $2, phone = $3, history = $4
            WHERE id = $5 RETURNING *
        `;
        const { rows } = await req.pool.query(query, [
            name,
            email,
            phone,
            history ? JSON.stringify(history) : null,
            id
        ]);
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error("❌ Error al actualizar perfil:", error);
        res.status(500).json({ error: "Error al actualizar perfil" });
    }
});

// 4. EXPORTAR DATOS PARA PDF
router.get('/:id/export-pdf', async (req, res) => {
    const { id } = req.params;
    try {
        const patientQuery = `SELECT * FROM patients WHERE id = $1`;
        const notesQuery = `SELECT * FROM clinical_notes WHERE patient_id = $1 ORDER BY created_at DESC`;

        const patient = await req.pool.query(patientQuery, [id]);
        const notes = await req.pool.query(notesQuery, [id]);

        if (patient.rows.length === 0) {
            return res.status(404).json({ error: "Paciente no encontrado" });
        }

        res.json({
            patient: patient.rows[0],
            notes: notes.rows
        });
    } catch (error) {
        console.error("❌ Error en exportación:", error);
        res.status(500).json({ error: "Error al generar datos de exportación" });
    }
});

export default router;