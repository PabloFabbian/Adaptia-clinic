//Adaptia - Modelos de Datos base

export const createMember = (id, name, roleName, capabilities = []) => ({
    id,
    name,
    role: {
        name: roleName,
        capabilities: capabilities
    },
    consents: [] // Aquí se guardarán los SCOPES
});

export const createAppointment = (id, ownerId, patientName, date) => ({
    id,
    ownerId, // El ID del psicólogo dueño de la cita
    patientName,
    date
});

export const createPatient = (id, ownerId, name, history = "") => ({
    id,
    ownerId,
    name,
    history
});