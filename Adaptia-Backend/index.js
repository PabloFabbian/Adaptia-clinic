import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
const { Pool } = pg;

import { createDatabaseSchema } from './src/auth/models.js';
import { getResourceFilter } from './src/auth/permissions.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

// --- 1. CONFIGURACIÓN DE POSTGRESQL (Neon Cloud) ---
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

app.use((req, res, next) => {
    req.pool = pool;
    next();
});

// --- 2. INICIALIZACIÓN ---
pool.query(createDatabaseSchema)
    .then(() => console.log("✨ Tablas sincronizadas en Neon"))
    .catch(err => console.error("❌ Error DB:", err));

// --- 3. ENDPOINTS DE AUTENTICACIÓN ---

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const query = 'SELECT id, name, email, password_hash FROM users WHERE email = $1';
        const { rows } = await pool.query(query, [email]);

        if (rows.length > 0) {
            const user = rows[0];
            if (user.password_hash === password) {
                const { password_hash: _, ...userWithoutPassword } = user;
                return res.json({ user: userWithoutPassword });
            }
        }
        res.status(401).json({ message: "Email o contraseña incorrectos" });
    } catch (err) {
        console.error("❌ Error en Login:", err.message);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// --- 4. ENDPOINTS DE RECURSOS (LECTURA) ---

app.get('/', (req, res) => res.send('🚀 Adaptia API Operativa'));

// CITAS
app.get(['/api/appointments', '/api/appointments/all'], async (req, res) => {
    try {
        const viewerMemberId = 1;
        const clinicId = 1;
        let filter;
        try {
            filter = await getResourceFilter(req.pool, viewerMemberId, clinicId, 'appointments');
        } catch (e) {
            filter = { query: '1=1', params: [] };
        }

        const query = `
            SELECT a.id, a.date, a.status, a.owner_member_id, p.name as patient_name 
            FROM appointments a
            LEFT JOIN patients p ON a.patient_id = p.id
            WHERE a.${filter.query} 
            ORDER BY a.date DESC
        `;
        const { rows } = await req.pool.query(query, filter.params);
        res.json({ data: rows || [] });
    } catch (err) {
        console.error("❌ Error en SQL Appointments:", err.message);
        res.status(200).json({ data: [], message: "Error controlado" });
    }
});

// PACIENTES: Lista general
app.get('/api/patients', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM patients ORDER BY name ASC');
        res.json({ data: rows });
    } catch (err) {
        res.status(500).json({ error: "Error en base de pacientes" });
    }
});

// HISTORIAL DE NOTAS (Actualizado para mostrar nuevos campos)
app.get('/api/patients/:id/notes', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT cn.id, cn.patient_id, cn.member_id, cn.content, cn.title, cn.summary, cn.category, cn.created_at, m.name as author 
            FROM clinical_notes cn
            LEFT JOIN members m ON cn.member_id = m.id
            WHERE cn.patient_id = $1
            ORDER BY cn.created_at DESC
        `;
        const { rows } = await req.pool.query(query, [id]);
        res.json({ data: rows });
    } catch (err) {
        console.error("❌ Error al obtener notas:", err.message);
        res.status(500).json({ error: "Error al obtener el historial" });
    }
});

// --- 5. ACCIONES DE ESCRITURA ---

// NUEVA NOTA CLÍNICA (Sincronizada con el ClinicalNoteModal automatizado)
app.post('/api/clinical-notes', async (req, res) => {
    // Desestructuramos los campos que vienen del frontend
    const { patient_id, member_id, content, title, summary, category } = req.body;

    // Validación mínima de seguridad
    if (!patient_id || !content) {
        return res.status(400).json({ error: "Falta el ID del paciente o el contenido de la nota." });
    }

    try {
        const query = `
            INSERT INTO clinical_notes (patient_id, member_id, content, title, summary, category, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            RETURNING *;
        `;

        const values = [
            patient_id,
            member_id || 1, // ID del profesional (por defecto 1 si no viene)
            content,        // El 'formData.details' del modal
            title || 'Nota de Evolución',
            summary || '',  // Lo que generó Gemini
            category || 'Evolución'
        ];

        const { rows } = await req.pool.query(query, values);

        console.log(`✅ Nota guardada para paciente #${patient_id}`);
        res.status(201).json({ success: true, data: rows[0] });

    } catch (err) {
        console.error("❌ Error SQL al guardar nota:", err.message);
        // Respuesta clara para el frontend
        res.status(500).json({
            error: "Error interno en la base de datos",
            detail: err.message
        });
    }
});

// REGISTRO DE PACIENTE
app.post('/api/patients', async (req, res) => {
    try {
        const { name, ownerMemberId, history } = req.body;
        const query = `
            INSERT INTO patients (name, owner_member_id, history) 
            VALUES ($1, $2, $3) RETURNING *
        `;
        const values = [name, ownerMemberId || 1, history ? JSON.stringify(history) : '{}'];
        const { rows } = await req.pool.query(query, values);
        res.status(201).json({ data: rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Error al crear el registro" });
    }
});

app.listen(PORT, () => console.log(`🚀 Servidor Adaptia corriendo en puerto ${PORT}`));