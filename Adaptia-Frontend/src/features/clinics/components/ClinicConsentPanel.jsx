import { ShieldCheck, UserCheck } from 'lucide-react';
import { PermissionToggle } from './PermissionToggle';

export const ClinicConsentPanel = ({ member }) => {
    if (!member) return null;

    // Estos son los recursos sobre los que se puede ceder soberanía
    const resources = [
        { id: 'patients', label: 'Mis Pacientes', icon: '👥' },
        { id: 'appointments', label: 'Mis Citas', icon: '📅' },
        { id: 'clinical_notes', label: 'Mis Notas Clínicas', icon: '📝' }
    ];

    return (
        <div className="bg-[#1a1f2b] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 p-10 opacity-5">
                <ShieldCheck size={120} className="text-adaptia-mint" />
            </div>

            <div className="relative z-10">
                <header className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-adaptia-mint/10 rounded-2xl flex items-center justify-center text-adaptia-mint">
                        <UserCheck size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Soberanía de Datos</h3>
                        <p className="text-sm text-gray-400">Gestiona quién accede a tu información profesional</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {resources.map((res) => (
                        <div key={res.id} className="bg-black/20 border border-white/5 rounded-2xl p-2">
                            <PermissionToggle
                                memberId={member.id}
                                resourceType={res.id}
                                label={`${res.icon} ${res.label}`}
                                initialValue={member.consents?.includes(res.id)}
                                isRolePermission={false} // IMPORTANTE: Es consentimiento individual
                            />
                        </div>
                    ))}
                </div>

                <footer className="mt-8 pt-6 border-t border-white/5">
                    <p className="text-[11px] text-gray-500 flex items-center gap-2">
                        <ShieldCheck size={14} className="text-adaptia-mint" />
                        Los cambios en la soberanía se aplican de forma inmediata en toda la red de la clínica.
                    </p>
                </footer>
            </div>
        </div>
    );
};