import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
const { Pool } = pg;

import { createDatabaseSchema } from './src/auth/models.js';
import { getResourceFilter } from './src/auth/permissions.js';
import patientRouter from './src/patients/patients.js';
import clinicRouter from './src/clinics/clinics.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Inyectar pool en el request para uso en routers
app.use((req, res, next) => {
    req.pool = pool;
    next();
});

// Sincronización automática de esquema
pool.query(createDatabaseSchema)
    .then(() => console.log("✨ Tablas sincronizadas en Neon"))
    .catch(err => console.error("❌ Error DB:", err));

// --- LOGIN CORREGIDO PARA TU ESTRUCTURA ACTUAL ---
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Usamos JOIN por 'name' ya que tu tabla 'members' no tiene 'user_id'
        const query = `
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.password_hash, 
                r.name as role_name, 
                m.clinic_id 
            FROM users u
            LEFT JOIN members m ON u.name = m.name 
            LEFT JOIN roles r ON m.role_id = r.id
            WHERE u.email = $1
        `;
        const { rows } = await pool.query(query, [email]);

        if (rows.length > 0) {
            const user = rows[0];

            // Verificación simple de contraseña
            if (user.password_hash === password) {
                return res.json({
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role_name || 'Especialista', // Fallback por seguridad
                        activeClinicId: user.clinic_id
                    }
                });
            }
        }

        res.status(401).json({ message: "Email o contraseña incorrectos" });
    } catch (err) {
        console.error("❌ Error en Login:", err.message);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

app.use('/api/patients', patientRouter);
app.use('/api/clinics', clinicRouter);

// --- ENDPOINTS DE NOTAS CLÍNICAS ---

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

app.get('/api/patients/:id/export-pdf', async (req, res) => {
    const { id } = req.params;
    try {
        const patientRes = await req.pool.query('SELECT id, name, email, phone, history FROM patients WHERE id = $1', [id]);
        if (patientRes.rows.length === 0) return res.status(404).json({ error: "Paciente no encontrado" });

        const notesRes = await req.pool.query(
            'SELECT title, content, summary, category, created_at FROM clinical_notes WHERE patient_id = $1 ORDER BY created_at DESC',
            [id]
        );

        res.json({
            patient: patientRes.rows[0],
            notes: notesRes.rows
        });
    } catch (err) {
        console.error("❌ Error en export-pdf:", err.message);
        res.status(500).json({ error: "Error al recopilar datos para PDF" });
    }
});

app.post('/api/clinical-notes', async (req, res) => {
    const { patient_id, member_id, content, title, summary, category } = req.body;
    if (!patient_id || !content) return res.status(400).json({ error: "Datos incompletos" });
    try {
        const query = `
            INSERT INTO clinical_notes (patient_id, member_id, content, title, summary, category, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            RETURNING *;
        `;
        const values = [patient_id, member_id || 1, content, title || 'Nota', summary || '', category || 'Evolución'];
        const { rows } = await req.pool.query(query, values);
        res.status(201).json({ success: true, data: rows[0] });
    } catch (err) {
        console.error("❌ Error SQL:", err.message);
        res.status(500).json({ error: "Error interno" });
    }
});

// --- ENDPOINT CITAS CON FILTRO DE SOBERANÍA ---

app.get(['/api/appointments', '/api/appointments/all'], async (req, res) => {
    try {
        // Estos IDs normalmente vendrían de un Token JWT. Usamos 1 por defecto para desarrollo.
        const viewerMemberId = 1;
        const clinicId = 1;

        const filter = await getResourceFilter(req.pool, viewerMemberId, clinicId, 'appointments');

        const query = `
            SELECT a.id, a.date, a.status, a.owner_member_id, p.name as patient_name 
            FROM appointments a
            LEFT JOIN patients p ON a.patient_id = p.id
            WHERE a.clinic_id = $1 AND ${filter.query} 
            ORDER BY a.date DESC
        `;

        const { rows } = await req.pool.query(query, [clinicId, ...filter.params]);
        res.json({ data: rows || [] });
    } catch (err) {
        console.error("❌ Error en Appointments:", err.message);
        res.status(200).json({ data: [], message: "Error de permisos controlado" });
    }
});

app.get('/', (req, res) => res.send('🚀 Adaptia API Operativa'));

app.listen(PORT, () => console.log(`🚀 Servidor Adaptia en puerto ${PORT}`));