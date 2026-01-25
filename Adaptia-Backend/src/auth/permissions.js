// Adaptia - Sistema de Permisos Flexibles

export const CAPABILITIES = {
    VIEW_ALL_APPOINTMENTS: 'clinic:appointments:view_all',
    VIEW_ALL_PATIENTS: 'clinic:patients:view_all',
    MANAGE_MEMBERS: 'clinic:members:manage'
};

export const SCOPES = {
    SHARE_APPOINTMENTS: 'member:share:appointments',
    SHARE_PATIENTS: 'member:share:patients'
};

// Asegúrate de que el nombre sea "hasPermission"
export const hasPermission = (requestingMember, ownerMember, capability, scope) => {
    // Si soy el dueño del recurso, siempre tengo acceso
    if (requestingMember.id === ownerMember.id) return true;

    // Verificamos Capacidad (del Rol) y Consentimiento (del Dueño)
    const canDoIt = requestingMember.role.capabilities.includes(capability);
    const isAllowedByOwner = ownerMember.consents.includes(scope);

    return canDoIt && isAllowedByOwner;
};