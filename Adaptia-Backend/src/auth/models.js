// src/auth/models.js

/**
 * ADAPTIA - ESQUEMA DE BASE DE DATOS PROFESIONAL
 * Este esquema permite la colaboración entre iguales (psicólogos)
 * mediante el sistema de Capacidades (Roles) y Scopes (Consentimientos).
 */

export const createDatabaseSchema = `
  -- 1. USUARIOS (La identidad individual)
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- 2. CLÍNICAS (El paraguas de colaboración)
  CREATE TABLE IF NOT EXISTS clinics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- 3. ROLES (Definición de jerarquías flexibles)
  CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- 'Owner', 'Secretario', 'Socio'
    description TEXT
  );

  -- 4. CAPACIDADES (¿Qué permite hacer este rol?)
  -- Ej: 'view_all_appointments', 'edit_billing'
  CREATE TABLE IF NOT EXISTS capabilities (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL, 
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS role_capabilities (
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    capability_id INTEGER REFERENCES capabilities(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, capability_id)
  );

  -- 5. MIEMBROS (El corazón del sistema: une Usuario + Clínica + Rol)
  CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, clinic_id)
  );

  -- 6. CONSENTIMIENTOS / SCOPES (Lo que el miembro permite a la clínica)
  CREATE TABLE IF NOT EXISTS consents (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL, -- 'appointments', 'patients', 'notes'
    is_granted BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(member_id, resource_type)
  );

  -- 7. RECURSOS (Citas y Pacientes vinculados al MIEMBRO, no a la clínica directamente)
  CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    owner_member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    history JSONB DEFAULT '{}', -- Flexibilidad NoSQL dentro de SQL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    owner_member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled'
  );
`;