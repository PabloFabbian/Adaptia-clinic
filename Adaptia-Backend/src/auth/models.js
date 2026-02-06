export const createDatabaseSchema = `
  CREATE TABLE IF NOT EXISTS clinics (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
  );

  -- TABLA NUEVA: Matriz de Gobernanza por Rol
  -- Aquí se guarda qué puede hacer un 'doctor' o 'recepcionista' por defecto
  CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    role_name TEXT NOT NULL,
    resource TEXT NOT NULL, -- 'appointments', 'patients', 'clinical_notes'
    can_view BOOLEAN DEFAULT false,
    can_edit BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(clinic_id, role_name, resource)
  );

  CREATE TABLE IF NOT EXISTS capabilities (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS role_capabilities (
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    capability_id INTEGER REFERENCES capabilities(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, capability_id)
  );

  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE
  );

  -- TABLA NUEVA: Invitaciones
  -- Necesaria para el endpoint de envío de correos que tienes en index.js
  CREATE TABLE IF NOT EXISTS invitations (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    invited_by INTEGER REFERENCES users(id),
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'expired'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    owner_member_id INTEGER REFERENCES members(id),
    clinic_id INTEGER REFERENCES clinics(id),
    history JSONB DEFAULT '{}'
  );

  CREATE TABLE IF NOT EXISTS consents (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL,
    is_granted BOOLEAN DEFAULT FALSE,
    UNIQUE(member_id, resource_type, clinic_id)
  );
  
  CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    owner_member_id INTEGER REFERENCES members(id),
    clinic_id INTEGER REFERENCES clinics(id),
    date DATE NOT NULL,
    status TEXT DEFAULT 'pending'
  );

  CREATE TABLE IF NOT EXISTS clinical_notes (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    member_id INTEGER REFERENCES members(id),
    title TEXT,
    summary TEXT,
    category TEXT DEFAULT 'Evolución',
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`;