import { Pool } from 'pg';
import { createDatabaseSchema } from './src/auth/models.js';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const seed = async () => {
    try {
        console.log("🌱 Iniciando siembra de datos...");

        // 1. Crear tablas
        await pool.query(createDatabaseSchema);

        // 2. Crear Clínica y Roles
        const clinic = await pool.query("INSERT INTO clinics (name) VALUES ('Melon Clinic España') RETURNING id");
        const clinicId = clinic.rows[0].id;

        const adminRole = await pool.query("INSERT INTO roles (clinic_id, name) VALUES ($1, 'Administrador') RETURNING id", [clinicId]);
        const collabRole = await pool.query("INSERT INTO roles (clinic_id, name) VALUES ($1, 'Colaborador') RETURNING id", [clinicId]);

        // 3. Crear Usuarios (Luis David y Esteban)
        const luis = await pool.query("INSERT INTO users (name, email, password_hash) VALUES ('Luis David', 'luis@adaptia.com', '123') RETURNING id");
        const esteban = await pool.query("INSERT INTO users (name, email, password_hash) VALUES ('Esteban', 'esteban@adaptia.com', '123') RETURNING id");

        // 4. Convertirlos en Miembros de la clínica
        const memberLuis = await pool.query("INSERT INTO members (user_id, clinic_id, role_id) VALUES ($1, $2, $3) RETURNING id",
            [luis.rows[0].id, clinicId, adminRole.rows[0].id]);
        const memberEsteban = await pool.query("INSERT INTO members (user_id, clinic_id, role_id) VALUES ($1, $2, $3) RETURNING id",
            [esteban.rows[0].id, clinicId, collabRole.rows[0].id]);

        // 5. El Corazón: Consentimiento (Esteban otorga permiso inicial)
        await pool.query("INSERT INTO consents (member_id, resource_type, is_granted) VALUES ($1, 'appointments', TRUE)", [memberEsteban.rows[0].id]);

        // 6. Citas de prueba
        await pool.query("INSERT INTO appointments (owner_member_id, date) VALUES ($1, NOW())", [memberLuis.rows[0].id]);
        await pool.query("INSERT INTO appointments (owner_member_id, date) VALUES ($1, NOW() + interval '1 day')", [memberEsteban.rows[0].id]);

        console.log("✅ Datos sembrados con éxito. Luis David puede ver la cita de Esteban.");
    } catch (err) {
        console.error("❌ Error en el seed:", err);
    } finally {
        await pool.end();
    }
};

seed();