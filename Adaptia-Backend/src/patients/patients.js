import express from 'express';
import { getResourceFilter } from '../auth/permissions.js';
const router = express.Router();

// 1. LISTAR PACIENTES (Integrado con Gobernanza)
router.get('/', async (req, res) => {
    try {
        const viewerMemberId = req.query.userId;
        const clinicId = req.query.clinicId;

        if (!viewerMemberId || !clinicId) {
            return res.status(200).json({ data: [] });
        }

        const filter = await getResourceFilter(req.pool, viewerMemberId, clinicId, 'patients');

        // Modificamos la query para traer el nombre del dueño
        const query = `
            SELECT 
                p.*, 
                m.name as owner_name 
            FROM patients p
            LEFT JOIN members m ON p.owner_member_id = m.user_id
            WHERE ${filter.query.replace(/owner_member_id/g, 'p.owner_member_id')}
            ORDER BY p.name ASC
        `;

        const { rows } = await req.pool.query(query, filter.params);
        res.json({ data: rows });
    } catch (error) {
        console.error("❌ Error al obtener pacientes:", error);
        res.status(500).json({ error: "Error al obtener pacientes" });
    }
});

// 2. OBTENER UN PACIENTE POR ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `SELECT * FROM patients WHERE id = $1`;
        const { rows } = await req.pool.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Paciente no encontrado" });
        }

        const patient = rows[0];
        if (!patient.history) patient.history = {};

        res.json({ data: patient });
    } catch (error) {
        console.error("❌ Error al obtener el paciente:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// 3. REGISTRO DE NUEVO PACIENTE
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
            owner_member_id,
            history || {},
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

// 4. ACTUALIZAR PERFIL
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
            birth_date || null, gender || null,
            insurance_name || null, insurance_number || null,
            history || {}, id
        ];

        const { rows } = await req.pool.query(query, values);
        if (rows.length === 0) return res.status(404).json({ error: "No encontrado" });

        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error("❌ Error al actualizar:", error);
        res.status(500).json({ error: "Error al actualizar perfil" });
    }
});

// 5. EXPORTAR DATOS PARA PDF
router.get('/:id/export-pdf', async (req, res) => {
    const { id } = req.params;
    try {
        const patientRes = await req.pool.query(`SELECT * FROM patients WHERE id = $1`, [id]);
        const notesRes = await req.pool.query(`SELECT * FROM clinical_notes WHERE patient_id = $1 ORDER BY created_at DESC`, [id]);

        if (patientRes.rows.length === 0) return res.status(404).json({ error: "No encontrado" });

        res.json({ patient: patientRes.rows[0], notes: notesRes.rows });
    } catch (error) {
        res.status(500).json({ error: "Error en exportación" });
    }
});

// 6. OBTENER NOTAS DEL PACIENTE
router.get('/:id/notes', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await req.pool.query(`SELECT * FROM clinical_notes WHERE patient_id = $1 ORDER BY created_at DESC`, [id]);
        res.json({ data: rows });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener notas" });
    }
});

export default router;