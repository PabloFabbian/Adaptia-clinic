import { useAuth } from '../../context/AuthContext';
import { ChevronsDownUp, Building2, Check, Plus } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

export const ClinicSelector = () => {
    const { user, activeClinic, switchClinic } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    // Normalizamos las membresías para que el componente siempre lea 'list'
    // independientemente de si la DB devuelve .members o .memberships
    const membershipList = useMemo(() => {
        return user?.members || user?.memberships || [];
    }, [user]);

    // EFECTO CRÍTICO: Si hay usuario pero no hay clínica activa,
    // seleccionamos la primera automáticamente usando la lista normalizada.
    useEffect(() => {
        if (membershipList.length > 0 && !activeClinic) {
            switchClinic(membershipList[0]);
        }
    }, [membershipList, activeClinic, switchClinic]);

    if (membershipList.length === 0) return null;

    // Normalizamos el ID para la comparación visual
    const currentClinicId = String(activeClinic?.id || activeClinic?.clinic_id || "");

    return (
        <div className="relative px-1 mb-6">

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-dark-border rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300 group"
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 shrink-0 rounded-xl bg-adaptia-blue/10 flex items-center justify-center text-adaptia-blue">
                        <Building2 size={16} />
                    </div>
                    <div className="text-left truncate">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate leading-none">
                            {activeClinic?.name || activeClinic?.clinic_name || 'Seleccionar Sede'}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">
                            {activeClinic?.role_name || 'Sin rol'}
                        </p>
                    </div>
                </div>
                <div className="pointer-events-none">
                    <ChevronsDownUp size={14} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors" />
                </div>
            </button>

            {/* Dropdown de Sedes */}
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute left-1 right-1 mt-2 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-2xl shadow-2xl z-20 py-2 animate-in slide-in-from-top-2 duration-200">
                        {membershipList.map((membership) => {
                            const mId = String(membership.clinic_id || membership.id);
                            const isActive = currentClinicId === mId;

                            return (
                                <button
                                    key={mId}
                                    onClick={() => {
                                        switchClinic(membership);
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex flex-col text-left">
                                        <span className={`text-xs ${isActive ? 'text-adaptia-blue font-semibold' : 'text-gray-600 dark:text-gray-300'}`}>
                                            {membership.clinic_name || membership.name}
                                        </span>
                                        <span className="text-[9px] text-gray-400 uppercase">{membership.role_name}</span>
                                    </div>
                                    {isActive && (
                                        <Check size={14} className="text-adaptia-blue" />
                                    )}
                                </button>
                            );
                        })}

                        <div className="h-px bg-gray-100 dark:bg-dark-border my-2 mx-4"></div>

                        <button className="w-full flex items-center gap-2 px-4 py-2 text-[10px] font-bold text-gray-400 hover:text-adaptia-blue transition-colors uppercase tracking-widest">
                            <Plus size={12} /> Nueva Sede
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};