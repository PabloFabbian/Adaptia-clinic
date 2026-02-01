import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import nodemailer from 'nodemailer';
const { Pool } = pg;

// Importaciones de lógica de negocio
import { createDatabaseSchema } from './src/auth/models.js';
import { getResourceFilter } from './src/auth/permissions.js';
import patientRouter from './src/patients/patients.js';
import clinicRouter from './src/clinics/clinics.js';
import { getRoles } from './src/clinics/roles.js';

const app = express();

// --- CONFIGURACIÓN DE NODEMAILER (GRATUITO) ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Configuración de CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const PORT = process.env.PORT || 3001;

// Conexión a Neon (PostgreSQL)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Middleware para inyectar el pool en cada request
app.use((req, res, next) => {
    req.pool = pool;
    next();
});

// Sincronización automática de esquema
pool.query(createDatabaseSchema)
    .then(() => console.log("✨ Tablas sincronizadas en Neon"))
    .catch(err => console.error("❌ Error DB al sincronizar:", err));

// --- 1. LOGIN / AUTH ---
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const query = `
            SELECT u.id, u.name, u.email, u.password_hash, r.name as role_name, m.clinic_id 
            FROM users u
            LEFT JOIN members m ON u.name = m.name 
            LEFT JOIN roles r ON m.role_id = r.id
            WHERE u.email = $1
        `;
        const { rows } = await pool.query(query, [email]);
        if (rows.length > 0) {
            const user = rows[0];
            if (user.password_hash === password) {
                return res.json({
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role_name || 'Especialista',
                        activeClinicId: user.clinic_id
                    }
                });
            }
        }
        res.status(401).json({ message: "Email o contraseña incorrectos" });
    } catch (err) {
        console.error("❌ Error en Login:", err);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// --- 2. RUTAS DE MÓDULOS ---
app.use('/api/patients', patientRouter);
app.use('/api/clinics', clinicRouter);
app.get('/api/roles', getRoles);

// --- 3. GESTIÓN DE INVITACIONES (UNIFICADO) ---
app.post('/api/clinics/:id/invitations', async (req, res) => {
    const { id: clinic_id } = req.params;
    const { email, role_id, invited_by } = req.body;

    console.log("📩 Intento de invitación para Clínica:", clinic_id, "Email:", email);

    if (!email || !role_id) {
        return res.status(400).json({ message: "Email y Nivel de gobernanza son obligatorios" });
    }

    try {
        const query = `
            INSERT INTO invitations (clinic_id, email, role_id, invited_by, status, created_at)
            VALUES ($1, $2, $3, $4, 'pending', NOW())
            RETURNING *;
        `;

        const values = [
            parseInt(clinic_id),
            email.trim().toLowerCase(),
            parseInt(role_id),
            invited_by ? parseInt(invited_by) : null
        ];

        const { rows } = await req.pool.query(query, values);

        // Email en segundo plano
        const mailOptions = {
            from: `"Adaptia" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Invitación a colaborar en Adaptia',
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #101828;">¡Hola!</h2>
                    <p>Has sido invitado a unirte a una red profesional en <strong>Adaptia</strong>.</p>
                    <div style="margin: 30px 0;">
                        <a href="http://localhost:5173/register?email=${email}" 
                           style="background: #101828; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                           Aceptar Invitación y Registrarse
                        </a>
                    </div>
                </div>
            `
        };

        transporter.sendMail(mailOptions).catch(e => console.error("⚠️ Error mailer:", e.message));

        res.status(201).json({ success: true, data: rows[0] });

    } catch (err) {
        console.error("❌ ERROR DB DETALLE:", err.message);
        res.status(400).json({
            message: "La base de datos rechazó la invitación",
            error: err.message
        });
    }
});

// --- 4. NOTAS CLÍNICAS ---
app.get('/api/patients/:id/notes', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT cn.*, m.name as author 
            FROM clinical_notes cn
            LEFT JOIN members m ON cn.member_id = m.id
            WHERE cn.patient_id = $1
            ORDER BY cn.created_at DESC
        `;
        const { rows } = await req.pool.query(query, [id]);
        res.json({ data: rows });
    } catch (err) {
        res.status(500).json({ error: "Error al obtener historial de notas" });
    }
});

app.post('/api/clinical-notes', async (req, res) => {
    const { patient_id, member_id, content, title, summary, category } = req.body;
    try {
        const query = `
            INSERT INTO clinical_notes (patient_id, member_id, content, title, summary, category, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *;
        `;
        const values = [patient_id, member_id || 1, content, title || 'Nota', summary || '', category || 'Evolución'];
        const { rows } = await req.pool.query(query, values);
        res.status(201).json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Error al guardar nota clínica" });
    }
});

// --- 5. CITAS CON GOBERNANZA (CORREGIDO) ---
app.get(['/api/appointments', '/api/appointments/all'], async (req, res) => {
    try {
        const viewerMemberId = 1;
        const clinicId = 1;

        // Obtenemos el filtro. IMPORTANTE: Los parámetros dentro del filtro deben empezar desde $2
        const filter = await getResourceFilter(req.pool, viewerMemberId, clinicId, 'appointments');

        const query = `
            SELECT a.*, p.name as patient_name 
            FROM appointments a
            LEFT JOIN patients p ON a.patient_id = p.id
            WHERE a.clinic_id = $1 AND ${filter.query} 
            ORDER BY a.date DESC
        `;

        // Pasamos clinicId como $1, y luego desestructuramos el resto de parámetros del filtro ($2, $3...)
        const { rows } = await pool.query(query, [clinicId, ...filter.params]);
        res.json({ data: rows || [] });
    } catch (err) {
        console.error("❌ Error en Appointments:", err.message);
        res.status(200).json({ data: [] });
    }
});

app.get('/', (req, res) => res.send('🚀 Adaptia API Operativa'));

app.listen(PORT, () => console.log(`🚀 Servidor Adaptia corriendo en puerto ${PORT}`));