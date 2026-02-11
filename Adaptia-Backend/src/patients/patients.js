import express from 'express';
import pool from '../config/db.js';
import { getResourceFilter } from '../auth/permissions.js';

const router = express.Router();

/**
 * 1. LISTAR PACIENTES (Arquitectura Dinámica)
 */
router.get('/', async (req, res) => {
    try {
        const { userId, clinicId } = req.query;
        if (!userId || !clinicId) return res.json({ data: [] });

        const uId = parseInt(userId, 10);
        const cId = parseInt(clinicId, 10);

        const memberKey = await pool.query(
            `SELECT m.id, r.name as role_name FROM members m 
             JOIN roles r ON m.role_id = r.id 
             WHERE m.user_id = $1 AND m.clinic_id = $2`,
            [uId, cId]
        );

        if (memberKey.rows.length === 0) return res.json({ data: [] });

        const myRoleName = memberKey.rows[0].role_name;
        const isStaff = ['Tech Owner', 'Admin', 'Owner', 'Secretaría'].includes(myRoleName);

        let query = `
            SELECT p.*, m.name as owner_name FROM patients p
            LEFT JOIN members m ON p.owner_member_id = m.id
            WHERE p.clinic_id = $1
        `;

        let params = [cId];

        if (!isStaff) {
            const filter = await getResourceFilter(pool, uId, cId, 'patients');
            let filterQuery = filter.query.replace(/a\./g, 'p.');
            const offset = params.length;
            filterQuery = filterQuery.replace(/\$(\d+)/g, (match, num) => `$${parseInt(num) + offset}`);

            query += ` AND ${filterQuery}`;
            params = [...params, ...filter.params];
        }

        query += ` ORDER BY p.name ASC`;

        const { rows } = await pool.query(query, params);
        res.json({ data: rows });

    } catch (error) {
        console.error("❌ Error en GET /patients:", error.message);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

/**
 * 2. OBTENER UN PACIENTE POR ID
 */
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { rows } = await pool.query(`SELECT * FROM patients WHERE id = $1`, [id]);
        if (rows.length === 0) return res.status(404).json({ error: "No encontrado" });

        const patient = rows[0];
        if (!patient.history) patient.history = {};
        res.json({ data: patient });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener paciente" });
    }
});

/**
 * 3. REGISTRO DE NUEVO PACIENTE
 */
router.post('/', async (req, res) => {
    try {
        const {
            name, owner_member_id, history, email, phone,
            dni, address, birth_date, gender, insurance_name, insurance_number, clinic_id
        } = req.body;

        const query = `
            INSERT INTO patients (
                name, owner_member_id, history, email, phone, dni, address, 
                birth_date, gender, insurance_name, insurance_number, clinic_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *
        `;

        const { rows } = await pool.query(query, [
            name, owner_member_id, history || {}, email || null, phone || null,
            dni || null, address || null, birth_date || null, gender || null,
            insurance_name || null, insurance_number || null, clinic_id
        ]);
        res.status(201).json({ data: rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Error al crear registro" });
    }
});

/**
 * 4. ACTUALIZAR PERFIL
 */
router.put('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const f = req.body;
    try {
        const query = `
            UPDATE patients SET name = $1, email = $2, phone = $3, dni = $4, address = $5, 
            birth_date = $6, gender = $7, insurance_name = $8, insurance_number = $9, history = $10
            WHERE id = $11 RETURNING *
        `;
        const { rows } = await pool.query(query, [
            f.name, f.email, f.phone, f.dni, f.address, f.birth_date || null,
            f.gender || null, f.insurance_name || null, f.insurance_number || null,
            f.history || {}, id
        ]);
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar" });
    }
});

/**
 * 5. OBTENER NOTAS DEL PACIENTE (Ajustado para Secretaría)
 */
router.get('/:id/notes', async (req, res) => {
    try {
        const patientId = parseInt(req.params.id, 10);
        const { userId, clinicId } = req.query;

        if (isNaN(patientId) || !userId || !clinicId) {
            return res.status(400).json({ error: "Faltan parámetros de identificación" });
        }

        const userAccess = await pool.query(
            `SELECT m.id as current_member_id, m.role_id 
             FROM members m 
             WHERE m.user_id = $1 AND m.clinic_id = $2`,
            [parseInt(userId, 10), parseInt(clinicId, 10)]
        );

        if (userAccess.rows.length === 0) return res.json({ data: [] });

        const { current_member_id, role_id } = userAccess.rows[0];

        let query = `
            SELECT n.*, m.name as author_name 
            FROM clinical_notes n
            LEFT JOIN members m ON n.member_id = m.id
            WHERE n.patient_id = $1
        `;

        let params = [patientId];

        // --- CAMBIO CLAVE AQUÍ ---
        // 0: Tech Owner, 2: Owner, 6: Secretaría
        // Si no es ninguno de estos tres, filtramos para que solo vea sus propias notas.
        const isAdminRole = [0, 2, 6].includes(role_id);

        if (!isAdminRole) {
            query += ` AND n.member_id = $2`;
            params.push(current_member_id);
        }

        query += ` ORDER BY n.created_at DESC`;
        const { rows } = await pool.query(query, params);

        const notesWithPermissions = rows.map(note => ({
            ...note,
            canEdit: note.member_id === current_member_id
        }));

        res.json({ success: true, data: notesWithPermissions });
    } catch (error) {
        console.error("❌ ERROR:", error.message);
        res.status(500).json({ error: "Error al recuperar notas" });
    }
});

export default router;