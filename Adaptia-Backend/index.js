import 'dotenv/config'; // Carga las variables del archivo .env
import express from 'express';
import cors from 'cors';
import pg from 'pg';
const { Pool } = pg;

// Importamos la estructura de la base de datos y la lógica de permisos
import { createDatabaseSchema } from './src/auth/models.js';
import { getResourceFilter } from './src/auth/permissions.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

// --- 1. CONFIGURACIÓN DE POSTGRESQL (Nube - Neon) ---
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Middleware para inyectar el pool en cada petición
app.use((req, res, next) => {
    req.pool = pool;
    next();
});

// --- 2. INICIALIZACIÓN DE LA BASE DE DATOS ---
pool.query(createDatabaseSchema)
    .then(async () => {
        console.log("✨ ¡Conectado a Neon! Tablas de Adaptia sincronizadas en São Paulo");

        // LLAMADA CLAVE: Esto insertará a Luis David y los roles en la nube
        await seedDatabase();
    })
    .catch(err => console.error("❌ Error al sincronizar tablas en la nube:", err));

// --- 3. ENDPOINTS ---

// GET: Citas filtradas por consentimiento
app.get('/api/appointments', async (req, res) => {
    try {
        const viewerMemberId = 1;
        const clinicId = 1;

        // Obtenemos el filtro
        const filter = await getResourceFilter(req.pool, viewerMemberId, clinicId, 'appointments');

        // Cambiamos el query a un LEFT JOIN para que no falle si no hay pacientes aún
        const query = `
            SELECT a.*, p.name as patient_name 
            FROM appointments a
            LEFT JOIN patients p ON a.patient_id = p.id
            WHERE ${filter.query}
        `;

        const { rows } = await req.pool.query(query, filter.params);

        res.json({
            user: "Luis David",
            data: rows || [] // Enviamos array vacío si no hay filas
        });
    } catch (err) {
        console.error("❌ ERROR EN EL BACKEND:", err.message);
        // Enviamos un JSON incluso en el error para que el front no se rompa
        res.status(500).json({ error: "Error en la consulta SQL", details: err.message });
    }
});

// POST: Registrar nuevo paciente
app.post('/api/patients', async (req, res) => {
    try {
        const { name, ownerMemberId } = req.body;
        const query = `
            INSERT INTO patients (name, owner_member_id, history)
            VALUES ($1, $2, '{}'::jsonb)
            RETURNING *;
        `;
        const { rows } = await req.pool.query(query, [name, ownerMemberId]);
        res.status(201).json({ data: rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Error al crear paciente" });
    }
});

// POST: Añadir nota al historial JSONB del paciente
app.post('/api/patients/:id/notes', async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const date = new Date().toISOString().split('T')[0];

        const query = `
            UPDATE patients 
            SET history = history || jsonb_build_object($2, $3)
            WHERE id = $1
            RETURNING *;
        `;
        const { rows } = await req.pool.query(query, [id, date, content]);
        res.json({ message: "Nota guardada", data: rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Error al guardar nota" });
    }
});

// GET: Alternar consentimiento de Esteban (Simulación para demo)
app.get('/api/toggle-esteban', async (req, res) => {
    try {
        const current = await pool.query(
            "SELECT is_granted FROM consents WHERE member_id = 2 AND resource_type = 'appointments'"
        );
        const newValue = current.rows.length > 0 ? !current.rows[0].is_granted : true;

        await pool.query(`
            INSERT INTO consents (member_id, resource_type, is_granted, clinic_id)
            VALUES (2, 'appointments', $1, 1)
            ON CONFLICT (member_id, resource_type) DO UPDATE SET is_granted = $1
        `, [newValue]);

        res.send(`Estado de Esteban: ${newValue ? 'Compartiendo' : 'Privado'}`);
    } catch (err) {
        res.status(500).send("Error en el toggle");
    }
});

// --- 4. INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
    console.log(`
    🚀 ADAPTIA CLOUD BACKEND READY
    -------------------------------------------
    🔗 Base de Datos: Neon (AWS São Paulo)
    🔗 URL: http://localhost:${PORT}
    -------------------------------------------
    `);
});

const seedDatabase = async () => {
    try {
        console.log("🌱 Sembrando datos maestros...");

        // 1. Clínicas
        const clinicRes = await pool.query(`
            INSERT INTO clinics (name) VALUES ('Adaptia Clinic') 
            ON CONFLICT DO NOTHING RETURNING id
        `);
        const clinicId = clinicRes.rows[0]?.id || 1;

        // 2. Roles
        await pool.query(`INSERT INTO roles (name) VALUES ('Admin'), ('Psicólogo') ON CONFLICT DO NOTHING`);

        // 3. Capacidades (Solo usamos slug ahora)
        await pool.query(`
            INSERT INTO capabilities (slug) VALUES 
            ('view_all_appointments'), 
            ('view_all_patients') 
            ON CONFLICT (slug) DO NOTHING
        `);

        // 4. Miembro (Luis David - ID 1)
        await pool.query(`
            INSERT INTO members (id, name, role_id, clinic_id) 
            VALUES (1, 'Luis David', 1, $1) 
            ON CONFLICT (id) DO NOTHING
        `, [clinicId]);

        console.log("✅ Datos maestros listos.");
    } catch (err) {
        console.error("❌ Error en el seed corregido:", err.message);
    }
};