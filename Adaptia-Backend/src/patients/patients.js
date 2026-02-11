import express from 'express';
import { getResourceFilter } from '../auth/permissions.js';
import pool from '../config/db.js';

const router = express.Router();

// 1. LISTAR PACIENTES (ARQUITECTURA DINÁMICA)
router.get('/', async (req, res) => {
    try {
        const { userId, clinicId } = req.query;
        if (!userId || !clinicId) return res.json({ data: [] });

        // Identificamos al miembro y su rol
        const memberKey = await pool.query(
            `SELECT m.id, r.name as role_name FROM members m 
             JOIN roles r ON m.role_id = r.id 
             WHERE m.user_id = $1 AND m.clinic_id = $2`,
            [userId, clinicId]
        );

        if (memberKey.rows.length === 0) return res.json({ data: [] });

        const myMemberId = memberKey.rows[0].id;
        const myRoleName = memberKey.rows[0].role_name;

        // CORRECCIÓN: La secretaria ahora entra en isStaff para saltar el filtro de soberanía
        const isTechOwner = myRoleName === 'Tech Owner' || myRoleName === 'Admin' || myRoleName === 'Secretaría';

        // 1. Base de la Query
        let query = `
            SELECT p.*, m.name as owner_name FROM patients p
            LEFT JOIN members m ON p.owner_member_id = m.id
            WHERE p.clinic_id = $1
        `;

        // El primer parámetro siempre es clinicId ($1)
        let params = [clinicId];

        if (!isTechOwner) {
            // 2. Obtenemos el filtro de soberanía
            const filter = await getResourceFilter(pool, userId, clinicId, 'patients');

            // Reemplazamos el alias 'a.' por 'p.' (de pacientes) para que coincida con nuestra tabla
            let filterQuery = filter.query.replace(/a\./g, 'p.');

            // --- LÓGICA DE RE-INDEXACIÓN DINÁMICA ---
            const offset = params.length;
            filterQuery = filterQuery.replace(/\$(\d+)/g, (match, num) => `$${parseInt(num) + offset}`);

            query += ` AND ${filterQuery}`;

            // Añadimos los valores correspondientes al array de parámetros
            params = [...params, ...filter.params];
        }

        query += ` ORDER BY p.name ASC`;

        const { rows } = await pool.query(query, params);
        res.json({ data: rows });

    } catch (error) {
        console.error("❌ Error en GET /patients:", error);
        res.status(500).json({ error: "Error interno del servidor" });
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

// 4. ACTUALIZAR PERFIL
router.put('/:id', async (req, res) => {
    const { id } = req.params;
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

// 5. OBTENER NOTAS DEL PACIENTE (CORREGIDO)
router.get('/:id/notes', async (req, res) => {
    const { id } = req.params;
    const { userId, clinicId } = req.query;

    try {
        if (!userId || !clinicId) return res.status(400).json({ error: "Faltan credenciales" });

        const memberKey = await pool.query(
            `SELECT m.id, r.name as role_name FROM members m 
             JOIN roles r ON m.role_id = r.id 
             WHERE m.user_id = $1 AND m.clinic_id = $2`,
            [userId, clinicId]
        );

        if (memberKey.rows.length === 0) return res.status(403).json({ error: "No autorizado" });

        const myRoleName = memberKey.rows[0].role_name;
        const isStaff = ['Tech Owner', 'Admin', 'Secretaria'].includes(myRoleName);

        const filter = await getResourceFilter(pool, userId, clinicId, 'patients');

        const query = `
            SELECT n.*, m.name as author_name 
            FROM clinical_notes n
            JOIN members m ON n.member_id = m.id
            JOIN patients p ON n.patient_id = p.id
            WHERE n.patient_id = $1
            AND p.clinic_id = $2
            AND (${isStaff ? '1=1' : `(${filter.query.replace(/a\./g, 'p.')} OR p.owner_member_id = $3)`})
            ORDER BY n.created_at DESC
        `;

        const params = isStaff
            ? [id, clinicId]
            : [id, clinicId, memberKey.rows[0].id, ...filter.params];

        const { rows } = await pool.query(query, params);
        res.json({ data: rows });

    } catch (error) {
        console.error("❌ Error en GET Notes:", error.message);
        res.status(500).json({ error: "Error interno" });
    }
});

export default router;