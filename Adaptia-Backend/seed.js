import pg from 'pg';
const { Pool } = pg;
import { createDatabaseSchema } from './src/auth/models.js';
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
    console.error("❌ ERROR: No se encontró DATABASE_URL");
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: true }
});

const seed = async () => {
    try {
        console.log("🚀 Iniciando Sincronización Global de Adaptia...");

        // 1. Asegurar esquema
        await pool.query(createDatabaseSchema);

        // 2. Definición de Roles
        const roles = [
            { name: 'Tech Owner', desc: 'Control total del sistema' },
            { name: 'Owner', desc: 'Acceso administrativo total a la clínica' },
            { name: 'Administrador', desc: 'Gestión operativa' },
            { name: 'Especialista', desc: 'Acceso clínico' },
            { name: 'Secretaría', desc: 'Gestión de agenda y pacientes' }
        ];

        for (const r of roles) {
            await pool.query(
                "INSERT INTO roles (name, description) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description",
                [r.name, r.desc]
            );
        }

        // 3. Definición de Capacidades
        const capabilities = [
            { slug: 'clinic.appointments.read', name: 'Ver citas médicas' },
            { slug: 'clinic.appointments.write', name: 'Crear y editar citas' },
            { slug: 'clinic.patients.read', name: 'Ver lista de pacientes' },
            { slug: 'clinic.patients.write', name: 'Registrar o editar pacientes' },
            { slug: 'clinic.records.read', name: 'Ver expedientes clínicos' },
            { slug: 'clinic.records.write', name: 'Editar expedientes clínicos' },
            { slug: 'clinic.records.read.all', name: 'Ver todos los expedientes (toda la clínica)' },
            { slug: 'clinic.notes.read', name: 'Leer notas de evolución' },
            { slug: 'clinic.notes.write', name: 'Crear notas clínicas' },
            { slug: 'clinic.members.read', name: 'Ver personal de la clínica' },
            { slug: 'clinic.roles.read', name: 'Ver roles y permisos' },
            { slug: 'clinic.settings.write', name: 'Configurar datos de la clínica' },
            { slug: 'manage_clinic', name: 'Gestión total de clínica' }
        ];

        for (const cap of capabilities) {
            await pool.query(`
                INSERT INTO capabilities (slug, name) 
                VALUES ($1, $2) 
                ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name`,
                [cap.slug, cap.name]
            );
        }

        // 4. Obtener Clínica
        const clinicRes = await pool.query("INSERT INTO clinics (name) VALUES ('Melon Clinic España') ON CONFLICT DO NOTHING RETURNING id");
        let clinicId = clinicRes.rows.length > 0 ? clinicRes.rows[0].id : (await pool.query("SELECT id FROM clinics LIMIT 1")).rows[0].id;

        // 5. Asignar permisos a roles administrativos
        const allCaps = await pool.query("SELECT id FROM capabilities");
        const adminRoles = await pool.query("SELECT id FROM roles WHERE name IN ('Owner', 'Tech Owner')");

        for (const role of adminRoles.rows) {
            for (const cap of allCaps.rows) {
                await pool.query(
                    "INSERT INTO role_capabilities (role_id, capability_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                    [role.id, cap.id]
                );
            }
        }

        // 6. Gestión de Usuarios y Vinculación con Members
        const usersToCreate = [
            { name: 'Pablo Fabbian', email: 'pablo.fabbian@adaptia.com', pass: 'Admin159', role: 'Tech Owner' },
            { name: 'Luis David', email: 'luis@adaptia.com', pass: '123', role: 'Administrador' }
        ];

        for (const userData of usersToCreate) {
            // Insertar o actualizar usuario
            const userRes = await pool.query(`
                INSERT INTO users (name, email, password_hash) 
                VALUES ($1, $2, $3) 
                ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
                RETURNING id`,
                [userData.name, userData.email, userData.pass]
            );
            const userId = userRes.rows[0].id;

            const roleRes = await pool.query("SELECT id FROM roles WHERE name = $1", [userData.role]);
            const roleId = roleRes.rows[0].id;

            // Insertar o actualizar miembro vinculado al usuario
            await pool.query(`
                INSERT INTO members (name, role_id, clinic_id, user_id) 
                VALUES ($1, $2, $3, $4) 
                ON CONFLICT (user_id) DO UPDATE SET role_id = EXCLUDED.role_id, name = EXCLUDED.name`,
                [userData.name, roleId, clinicId, userId]
            );
        }

        console.log("✅ SEED COMPLETADO: Sistema listo para login.");

    } catch (err) {
        console.error("❌ Error en el seed:", err);
    } finally {
        await pool.end();
    }
};

seed();