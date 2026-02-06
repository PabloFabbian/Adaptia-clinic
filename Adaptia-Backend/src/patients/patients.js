import express from 'express';
import { getResourceFilter } from '../auth/permissions.js';
import pool from '../config/db.js';

const router = express.Router();

// 1. LISTAR PACIENTES (Control Total para Tech Owner)
router.get('/', async (req, res) => {
    try {
        const { userId, clinicId } = req.query;

        if (!userId || !clinicId) {
            return res.json({ data: [] });
        }

        // Buscamos el Member ID y el nombre del Rol del usuario logueado
        const memberKey = await pool.query(
            `SELECT m.id, r.name as role_name 
             FROM members m 
             JOIN roles r ON m.role_id = r.id 
             WHERE m.user_id = $1 AND m.clinic_id = $2`,
            [userId, clinicId]
        );

        if (memberKey.rows.length === 0) return res.json({ data: [] });

        const myMemberId = memberKey.rows[0].id;
        const myRoleName = memberKey.rows[0].role_name;

        // Obtenemos el filtro de soberanía dinámico
        const filter = await getResourceFilter(pool, userId, clinicId, 'patients');

        /**
         * QUERY DEFINITIVA
         * Si es 'Tech Owner', el WHERE se convierte en 1=1 (acceso total).
         * Si no, aplica el filtro de soberanía y propiedad.
         */
        const isTechOwner = myRoleName === 'Tech Owner';

        const query = `
            SELECT 
                p.*, 
                m.name as owner_name 
            FROM patients p
            LEFT JOIN members m ON p.owner_member_id = m.id
            WHERE p.clinic_id = $1 
            AND (
                ${isTechOwner ? '1=1' : `(${filter.query.replace(/a\./g, 'p.')} OR p.owner_member_id = $2)`}
            )
            ORDER BY p.name ASC
        `;

        // Si es Tech Owner, solo pasamos el clinicId ($1). 
        // Si no, pasamos clinicId ($1), miMemberId ($2) y los parámetros del filtro.
        const params = isTechOwner ? [clinicId] : [clinicId, myMemberId, ...filter.params];

        const { rows } = await pool.query(query, params);
        res.json({ data: rows });

    } catch (error) {
        console.error("❌ Error en GET Patients:", error.message);
        res.status(500).json({ error: "Error interno", details: error.message });
    }
});

// 2. OBTENER UN PACIENTE POR ID
router.get('/:id', async (req, res) => {
    try {
        const { rows } = await pool.query(`SELECT * FROM patients WHERE id = $1`, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: "No encontrado" });

        const patient = rows[0];
        if (!patient.history) patient.history = {};
        res.json({ data: patient });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener paciente" });
    }
});

// 3. REGISTRO DE NUEVO PACIENTE
router.post('/', async (req, res) => {
    try {
        const {
            name, owner_member_id, history, email, phone,
            dni, address, birth_date, gender, insurance_name, insurance_number, clinic_id
        } = req.body;

        const query = `
            INSERT INTO patients (
                name, owner_member_id, history, email, phone, 
                dni, address, birth_date, gender, insurance_name, insurance_number, clinic_id
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *
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

// 4. ACTUALIZAR PERFIL
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const f = req.body;
    try {
        const query = `
            UPDATE patients 
            SET name = $1, email = $2, phone = $3, dni = $4, address = $5, 
                birth_date = $6, gender = $7, insurance_name = $8, 
                insurance_number = $9, history = $10
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

// 5. OBTENER NOTAS DEL PACIENTE (Control Total para Tech Owner)
router.get('/:id/notes', async (req, res) => {
    const { id } = req.params;
    const { userId, clinicId } = req.query;

    try {
        const memberKey = await pool.query(
            `SELECT m.id, r.name as role_name 
             FROM members m 
             JOIN roles r ON m.role_id = r.id 
             WHERE m.user_id = $1 AND m.clinic_id = $2`,
            [userId, clinicId]
        );

        if (memberKey.rows.length === 0) return res.json({ data: [] });
        const myRoleName = memberKey.rows[0].role_name;

        const filter = await getResourceFilter(pool, userId, clinicId, 'clinical_notes');
        const isTechOwner = myRoleName === 'Tech Owner';

        const query = `
            SELECT cn.*, m.name as author_name 
            FROM clinical_notes cn
            JOIN members m ON cn.member_id = m.id
            WHERE cn.patient_id = $1
            AND (
                ${isTechOwner ? '1=1' : filter.query.replace(/a\.owner_member_id/g, 'cn.member_id')}
            )
            ORDER BY cn.created_at DESC
        `;

        const { rows } = await pool.query(query, [id, ...filter.params]);
        res.json({ data: rows });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener notas" });
    }
});

export default router;