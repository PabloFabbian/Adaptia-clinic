// src/constants/roles.js
export const ROLE = {
    TECH_OWNER: 0,
    OWNER: 2,
    PSICOLOGO: 4,
    SECRETARIA: 6
};

// Definimos quién puede ver qué cosa por "clave"
export const NAV_PERMISSIONS = {
    // Solo Tech Owner y Owner (0, 2)
    MASTER: [ROLE.TECH_OWNER, ROLE.OWNER],

    // Tech Owner, Owner y Psicólogo (0, 2, 4)
    PROFESSIONAL: [ROLE.TECH_OWNER, ROLE.OWNER, ROLE.PSICOLOGO],

    // Todos (0, 2, 4, 6)
    PUBLIC: [ROLE.TECH_OWNER, ROLE.OWNER, ROLE.PSICOLOGO, ROLE.SECRETARIA]
};