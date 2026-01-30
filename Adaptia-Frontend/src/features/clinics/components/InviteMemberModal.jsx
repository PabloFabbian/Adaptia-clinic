import { useState, useEffect } from 'react';
import { Mail, Shield, X, Loader2, Send } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

export const InviteMemberModal = ({ isOpen, onClose, clinicId, onInviteSuccess }) => {
    const [email, setEmail] = useState('');
    const [roleId, setRoleId] = useState('');
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingRoles, setFetchingRoles] = useState(true);

    // Cargar los roles disponibles al abrir el modal
    useEffect(() => {
        if (isOpen) {
            const fetchRoles = async () => {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/roles`);
                    const data = await response.json();
                    setRoles(data);
                    if (data.length > 0) setRoleId(data[0].id);
                } catch (error) {
                    console.error("Error cargando roles:", error);
                } finally {
                    setFetchingRoles(false);
                }
            };
            fetchRoles();
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/patients/${clinicId}/invitations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    role_id: roleId,
                    invited_by: 1 // Aquí deberías usar el ID del usuario logueado desde AuthContext
                }),
            });

            if (!response.ok) throw new Error('Error al enviar invitación');

            const result = await response.json();
            onInviteSuccess(result.invitation);
            onClose();
            setEmail('');
        } catch (error) {
            alert("No se pudo enviar la invitación");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-md p-4">
                <Card className="shadow-2xl border-dark-border overflow-hidden">
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-medium text-gray-800 dark:text-white">Invitar Miembro</h2>
                                <p className="text-xs text-gray-400 mt-1 italic">Vincular un nuevo profesional a la sede.</p>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                <X size={20} strokeWidth={1.5} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Input Email */}
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Email Profesional</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-adaptia-blue transition-colors" size={16} />
                                    <input
                                        required
                                        type="email"
                                        placeholder="ejemplo@profesional.com"
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-dark-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-adaptia-blue/20 transition-all text-gray-700 dark:text-gray-200"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Select Role */}
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Asignar Rol Inicial</label>
                                <div className="relative group">
                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <select
                                        disabled={fetchingRoles}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-dark-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-adaptia-blue/20 transition-all text-gray-700 dark:text-gray-200 appearance-none disabled:opacity-50"
                                        value={roleId}
                                        onChange={(e) => setRoleId(e.target.value)}
                                    >
                                        {fetchingRoles ? (
                                            <option>Cargando roles...</option>
                                        ) : (
                                            roles.map(role => (
                                                <option key={role.id} value={role.id}>{role.name}</option>
                                            ))
                                        )}
                                    </select>
                                </div>
                            </div>

                            {/* Nota informativa sobre gobernanza */}
                            <div className="bg-blue-50/50 dark:bg-adaptia-blue/5 border border-blue-100/50 dark:border-adaptia-blue/10 rounded-xl p-4">
                                <p className="text-[10px] text-blue-600 dark:text-adaptia-blue/80 leading-relaxed italic">
                                    * Al aceptar, el miembro se unirá con acceso restringido. Deberá otorgar consentimiento explícito para compartir sus pacientes o agenda con la clínica.
                                </p>
                            </div>

                            {/* Acciones */}
                            <div className="flex gap-3 pt-2">
                                <Button variant="secondary" type="button" onClick={onClose} className="flex-1 justify-center dark:bg-white/5">
                                    Cancelar
                                </Button>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    disabled={loading || fetchingRoles}
                                    className="flex-1 justify-center bg-gray-900 dark:bg-adaptia-blue"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                        <>Enviar Invitación <Send size={14} className="ml-2" /></>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Card>
            </div>
        </div>
    );
};