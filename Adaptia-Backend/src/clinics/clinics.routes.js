import { Router } from 'express';
import {
    getClinicDirectory,
    getAllCapabilities,
    getGovernance,
    getCapabilitiesByRole, // <--- Nueva importación
    toggleRolePermission,
    createInvitation,
    toggleMemberConsent
} from './clinics.controller.js';
import { getRoles } from './roles.js';

const router = Router();

/** 1. RUTAS GLOBALES / CATÁLOGOS */
// Estas rutas no dependen de una clínica específica
router.get('/roles', getRoles);
router.get('/capabilities', getAllCapabilities);

/** 2. RUTAS BASADAS EN CLÍNICA (/:clinicId) */

// Obtener capacidades específicas de un rol (Usado por AuthContext para permisos)
// Esta es la ruta que tu Frontend busca como: /api/clinics/8/roles/17/capabilities
router.get('/:clinicId/roles/:roleId/capabilities', getCapabilitiesByRole);

// Directorio de miembros e invitaciones pendientes
router.get('/:id/directory', getClinicDirectory);

// Matriz de gobernanza (vista general de qué puede hacer cada rol)
router.get('/:clinicId/governance', getGovernance);

// Envío de nuevas invitaciones
router.post('/:clinicId/invitations', createInvitation);

// Modificar permisos de la matriz de gobernanza
router.post('/:clinicId/permissions/toggle', toggleRolePermission);

// Modificar consentimiento de soberanía de un miembro específico
router.patch('/:clinicId/members/:memberId/consent', toggleMemberConsent);

export default router;