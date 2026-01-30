import express from 'express';
import { getResourceFilter } from '../auth/permissions.js';
const router = express.Router();

// 1. LISTAR PACIENTES (Incluyendo nuevos campos)
router.get('/', async (req, res) => {
    try {
        const viewerMemberId = 1;
        const clinicId = 1;
        const filter = await getResourceFilter(req.pool, viewerMemberId, clinicId, 'patients');

        const query = `
            SELECT id, name, email, phone, dni, address, birth_date, gender, insurance_name, insurance_number, history, owner_member_id
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

// 2. OBTENER UN PACIENTE POR ID (Precarga completa para edición)
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `SELECT * FROM patients WHERE id = $1`;
        const { rows } = await req.pool.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Paciente no encontrado" });
        }
        res.json({ data: rows[0] });
    } catch (error) {
        console.error("❌ Error al obtener el paciente:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// 3. REGISTRO DE NUEVO PACIENTE (INSERT con campos de Neon)
router.post('/', async (req, res) => {
    try {
        const {
            name, owner_member_id, history, email, phone,
            dni, address, birth_date, gender, insurance_name, insurance_number
        } = req.body;

        const query = `
            INSERT INTO patients (
                name, owner_member_id, history, email, phone, 
                dni, address, birth_date, gender, insurance_name, insurance_number
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *
        `;

        const values = [
            name,
            owner_member_id || 1,
            history ? JSON.stringify(history) : '{}',
            email || null,
            phone || null,
            dni || null,
            address || null,
            birth_date || null,
            gender || null,
            insurance_name || null,
            insurance_number || null
        ];

        const { rows } = await req.pool.query(query, values);
        res.status(201).json({ data: rows[0] });
    } catch (err) {
        console.error("❌ Error al crear paciente:", err);
        res.status(500).json({ error: "Error al crear el registro" });
    }
});

// 4. ACTUALIZAR PERFIL (PUT con campos de Neon)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const {
        name, email, phone, dni, address, birth_date,
        gender, insurance_name, insurance_number, history
    } = req.body;

    try {
        const query = `
            UPDATE patients 
            SET name = $1, email = $2, phone = $3, dni = $4, address = $5, 
                birth_date = $6, gender = $7, insurance_name = $8, 
                insurance_number = $9, history = $10
            WHERE id = $11 RETURNING *
        `;

        const values = [
            name, email, phone, dni, address,
            birth_date || null,
            gender || null,
            insurance_name || null,
            insurance_number || null,
            history ? JSON.stringify(history) : '{}',
            id
        ];

        const { rows } = await req.pool.query(query, values);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Paciente no encontrado" });
        }

        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error("❌ Error al actualizar perfil:", error);
        res.status(500).json({ error: "Error al actualizar perfil" });
    }
});

// 5. EXPORTAR DATOS PARA PDF
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