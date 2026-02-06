import { useClinics } from '../../../hooks/useClinics';
import { toast } from 'sonner';

/**
 * @param {string} memberId - ID del miembro o nombre del rol
 * @param {string|number} resourceType - Slug (ej: 'patients') o Capability ID
 * @param {string} label - Texto a mostrar
 * @param {boolean} initialValue - Estado inicial del switch
 * @param {boolean} isRolePermission - Si es true, afecta a la gobernanza global del rol. 
 * Si es false, afecta al consentimiento individual.
 */
export const PermissionToggle = ({
    memberId,
    resourceType,
    label,
    initialValue,
    isRolePermission = false
}) => {
    const { toggleConsent, toggleRolePermission, loading } = useClinics();

    const handleChange = async (e) => {
        const newValue = e.target.checked;
        const action = newValue ? 'grant' : 'revoke';

        // Definimos qué función del hook llamar según el contexto
        const promise = isRolePermission
            ? toggleRolePermission(memberId, resourceType, action) // Para Roles
            : toggleConsent(memberId, resourceType, newValue);    // Para Soberanía/Miembros

        toast.promise(promise, {
            loading: `Actualizando ${label.toLowerCase()}...`,
            success: () => `${label} actualizado correctamente`,
            error: (err) => `Error: ${err.message || 'No se pudo actualizar'}`,
            position: 'bottom-center',
        });
    };

    return (
        <div className="flex items-center justify-between p-3 rounded-xl transition-all group hover:bg-gray-50 dark:hover:bg-dark-border/30">
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                {label}
            </span>

            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked={initialValue}
                    onChange={handleChange}
                    disabled={loading}
                />
                <div className="w-10 h-5.5 bg-gray-200 dark:bg-dark-border rounded-full 
                    peer 
                    peer-checked:bg-adaptia-blue 
                    dark:peer-checked:bg-adaptia-mint
                    peer-disabled:opacity-50 
                    peer-disabled:cursor-not-allowed
                    after:content-[''] 
                    after:absolute 
                    after:top-[2px] 
                    after:left-[2px] 
                    after:bg-white 
                    after:rounded-full 
                    after:h-4.5 
                    after:w-4.5 
                    after:transition-all 
                    peer-checked:after:translate-x-full 
                    peer-checked:after:bg-white
                    dark:peer-checked:after:bg-dark-bg">
                </div>
            </label>
        </div>
    );
};