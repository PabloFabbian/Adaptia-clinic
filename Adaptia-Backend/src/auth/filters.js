import { hasPermission, CAPABILITIES, SCOPES } from './permissions.js';

//Filtra recursos (citas o pacientes) basándose en permisos.

export const filterResources = (requestingMember, allResources, allMembers, capability, scope) => {
    return allResources.filter(resource => {
        // Buscamos quién es el dueño del recurso
        const owner = allMembers.find(m => m.id === resource.ownerId);

        // Aplicamos tu lógica maestra
        return hasPermission(requestingMember, owner, capability, scope);
    });
};