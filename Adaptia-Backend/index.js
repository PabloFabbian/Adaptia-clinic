import express from 'express';
import { CAPABILITIES, SCOPES } from './src/auth/permissions.js';
import { createMember, createAppointment } from './src/auth/models.js';
import { filterResources } from './src/auth/filters.js';
import cors from 'cors';

const app = express();
app.use(cors());

const PORT = 3000;

// --- 1. MOCK DE BASE DE DATOS (Estado Inicial) ---
// Simulamos lo que tenías en tu script: Luis David (Admin) y Esteban (Psicólogo)
const members = [
    createMember(1, 'Luis David', 'Admin', [CAPABILITIES.VIEW_ALL_APPOINTMENTS]),
    createMember(2, 'Esteban', 'Psicólogo', [])
];

// Añadimos citas para que el filtro tenga qué procesar
const appointments = [
    createAppointment(101, 1, 'Paciente de Luis David', '2023-10-20'),
    createAppointment(102, 2, 'Paciente de Esteban', '2023-10-21')
];

// --- 2. ENDPOINTS (La magia de Express) ---

// Endpoint para ver qué citas son visibles para el usuario actual
app.get('/appointments', (req, res) => {
    // Simulamos que el usuario que hace la petición es Luis David (ID: 1)
    const currentUser = members.find(m => m.id === 1);

    // Aplicamos el motor de filtrado de Adaptia
    const visibleAppointments = filterResources(
        currentUser,
        appointments,
        members,
        CAPABILITIES.VIEW_ALL_APPOINTMENTS,
        SCOPES.SHARE_APPOINTMENTS
    );

    res.json({
        user: currentUser.name,
        totalInClinic: appointments.length,
        visibleForYou: visibleAppointments.length,
        data: visibleAppointments
    });
});

// Endpoint para simular que Esteban cambia su privacidad (Progreso Visual)
app.get('/toggle-esteban', (req, res) => {
    const esteban = members.find(m => m.id === 2);

    if (esteban.consents.includes(SCOPES.SHARE_APPOINTMENTS)) {
        esteban.consents = []; // Quitar permiso
    } else {
        esteban.consents.push(SCOPES.SHARE_APPOINTMENTS); // Dar permiso
    }

    res.send(`Permisos de Esteban actualizados. Ahora comparte: ${esteban.consents.length > 0}`);
});

// --- 3. INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
    console.log(`
    🚀 ADAPTIA API CORRIENDO
    -------------------------------------------
    🔗 Ver citas filtradas: http://localhost:${PORT}/appointments
    🔄 Alternar permiso de Esteban: http://localhost:${PORT}/toggle-esteban
    -------------------------------------------
    `);
});