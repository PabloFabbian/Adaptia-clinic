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

// --- 3. ENDPOINTS (LAS BASES) ---

app.get('/', (req, res) => res.send('🚀 Adaptia API Operativa'));

// BASE: CITAS (Filtradas por seguridad)
app.get('/api/appointments', async (req, res) => {
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
            SELECT a.*, p.name as patient_name 
            FROM appointments a
            LEFT JOIN patients p ON a.patient_id = p.id
            WHERE ${filter.query} ORDER BY a.date DESC
        `;
        const { rows } = await req.pool.query(query, filter.params);
        res.json({ user: "Luis David", data: rows || [] });
    } catch (err) {
        res.status(200).json({ data: [] });
    }
});

// BASE: PACIENTES
app.get('/api/patients', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM patients ORDER BY name ASC');
        res.json({ data: rows });
    } catch (err) {
        res.status(500).json({ error: "Error en base de pacientes" });
    }
});

// BASE: CLÍNICAS
app.get('/api/clinics', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM clinics ORDER BY id ASC');
        res.json({ data: rows });
    } catch (err) {
        res.status(500).json({ error: "Error en base de clínicas" });
    }
});

// ACCIONES: REGISTRO
app.post('/api/patients', async (req, res) => {
    try {
        const { name, ownerMemberId } = req.body;
        const query = 'INSERT INTO patients (name, owner_member_id, history) VALUES ($1, $2, \'{}\'::jsonb) RETURNING *';
        const { rows } = await req.pool.query(query, [name, ownerMemberId || 1]);
        res.status(201).json({ data: rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Error al crear" });
    }
});

// ACCIONES: CONSENTIMIENTO
app.get('/api/toggle-esteban', async (req, res) => {
    try {
        const current = await pool.query("SELECT is_granted FROM consents WHERE member_id = 2 AND resource_type = 'appointments'");
        const newValue = current.rows.length > 0 ? !current.rows[0].is_granted : true;
        await pool.query(`
            INSERT INTO consents (member_id, resource_type, is_granted, clinic_id)
            VALUES (2, 'appointments', $1, 1)
            ON CONFLICT (member_id, resource_type, clinic_id) DO UPDATE SET is_granted = $1
        `, [newValue]);
        res.send(`Estado: ${newValue ? 'Compartiendo' : 'Privado'}`);
    } catch (err) {
        res.status(500).send("Error");
    }
});

app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));