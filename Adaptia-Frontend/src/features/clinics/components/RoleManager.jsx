import { useState, useEffect } from 'react';
import { Shield, Lock } from 'lucide-react';
import { useClinics } from '../../../hooks/useClinics';
import { PermissionToggle } from './PermissionToggle';

export const RoleManager = ({ clinicId }) => {
    const { roles, capabilities, fetchGovernance, loading, governanceMatrix } = useClinics();
    const [selectedRole, setSelectedRole] = useState(null);

    useEffect(() => {
        if (clinicId) fetchGovernance(clinicId);
    }, [clinicId]);

    // Agrupar capacidades por módulo (extraído del slug: clinic.PATIENTS.read)
    const groupedCapabilities = capabilities.reduce((acc, cap) => {
        const parts = cap.slug.split('.');
        const group = parts.length > 1 ? parts[1] : 'general';
        if (!acc[group]) acc[group] = [];
        acc[group].push(cap);
        return acc;
    }, {});

    if (loading && !roles.length) {
        return <div className="p-10 text-center text-gray-400">Sincronizando registros de gobernanza...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Selector de Roles */}
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                {roles.map(role => (
                    <button
                        key={role.id}
                        onClick={() => setSelectedRole(role)}
                        className={`px-6 py-3 rounded-2xl border transition-all shrink-0 ${selectedRole?.id === role.id
                            ? 'bg-adaptia-mint border-adaptia-mint text-black font-bold shadow-lg shadow-adaptia-mint/20'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                            }`}
                    >
                        {role.name}
                    </button>
                ))}
            </div>

            {selectedRole ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(groupedCapabilities).map(([group, caps]) => (
                        <div key={group} className="bg-[#1a1f2b] border border-white/5 rounded-[2rem] p-6 shadow-xl">
                            <h4 className="text-[10px] uppercase tracking-[0.2em] text-adaptia-mint font-black mb-4 flex items-center gap-2">
                                <Shield size={12} /> Módulo: {group}
                            </h4>
                            <div className="space-y-1">
                                {caps.map(cap => {
                                    // Verificamos si el rol tiene esta capacidad en la matriz que viene del backend
                                    const hasPermission = governanceMatrix[selectedRole.name]?.some(
                                        p => p.resource === cap.slug
                                    );

                                    return (
                                        <PermissionToggle
                                            key={`${selectedRole.id}-${cap.id}`}
                                            memberId={selectedRole.name} // Enviamos el nombre del rol al backend
                                            resourceType={cap.id}      // Enviamos el ID numérico de la capacidad
                                            label={cap.slug.split('.').pop().replace('read', 'Ver').replace('write', 'Crear')}
                                            initialValue={hasPermission}
                                            isRolePermission={true}    // IMPORTANTE: Indica que es para Roles
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.02]">
                    <Lock size={30} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-500 text-sm italic">Selecciona un nivel de gobernanza para gestionar sus privilegios técnicos.</p>
                </div>
            )}
        </div>
    );
};