/**
 * ADAPTIA - ESQUEMA DE BASE DE DATOS PROFESIONAL
 * Este esquema permite la colaboración entre iguales (psicólogos)
 * mediante el sistema de Capacidades (Roles) y Scopes (Consentimientos).
 */

export const createDatabaseSchema = `
  CREATE TABLE IF NOT EXISTS clinics (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS capabilities (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS role_capabilities (
    role_id INTEGER REFERENCES roles(id),
    capability_id INTEGER REFERENCES capabilities(id),
    PRIMARY KEY (role_id, capability_id)
  );

  CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    clinic_id INTEGER REFERENCES clinics(id)
  );

  CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    owner_member_id INTEGER REFERENCES members(id),
    history JSONB DEFAULT '{}'
  );

  CREATE TABLE IF NOT EXISTS consents (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id),
    clinic_id INTEGER REFERENCES clinics(id),
    resource_type TEXT NOT NULL,
    is_granted BOOLEAN DEFAULT FALSE,
    UNIQUE(member_id, resource_type, clinic_id)
  );
  
  CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    owner_member_id INTEGER REFERENCES members(id),
    date DATE NOT NULL,
    status TEXT DEFAULT 'pending'
  );
`;