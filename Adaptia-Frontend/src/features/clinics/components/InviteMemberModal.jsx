import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext'; // Importante para el ID del owner
import { Mail, Shield, X, Loader2, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

export const InviteMemberModal = ({ isOpen, onClose, onSuccess }) => {
    const { user, activeClinic } = useAuth(); // Obtenemos el usuario logueado y la clínica activa
    const [email, setEmail] = useState('');
    const [roleId, setRoleId] = useState('');
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingRoles, setFetchingRoles] = useState(true);
    const [sentStatus, setSentStatus] = useState(false);

    // Cargar los roles de gobernanza disponibles
    useEffect(() => {
        if (isOpen) {
            const fetchRoles = async () => {
                setFetchingRoles(true);
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/roles`);
                    const data = await response.json();

                    // Filtramos para no permitir invitar a otro "Owner" si es necesario
                    const availableRoles = data.filter(r => r.name !== 'Owner');
                    setRoles(availableRoles);

                    if (availableRoles.length > 0) setRoleId(availableRoles[0].id);
                } catch (error) {
                    console.error("❌ Error cargando roles:", error);
                } finally {
                    setFetchingRoles(false);
                }
            };
            fetchRoles();
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!activeClinic?.id) return;

        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/clinics/${activeClinic.id}/invitations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    role_id: roleId,
                    invited_by: user.id // Dinámico: Pablo o el admin actual
                }),
            });

            if (!response.ok) throw new Error('Error al enviar invitación');

            setSentStatus(true);

            // Pequeño delay para mostrar el feedback visual de éxito
            setTimeout(() => {
                onSuccess(); // Refresca el directorio en Clinics.jsx
                handleClose();
            }, 1500);

        } catch (error) {
            console.error("❌ Error:", error);
            alert("No se pudo procesar la invitación. Verifica los datos.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setEmail('');
        setSentStatus(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300 p-4">
            <div className="w-full max-w-md">
                <Card className="shadow-2xl border-white/5 overflow-hidden bg-white dark:bg-[#1a1f2b]">
                    <div className="p-8">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white tracking-tight">Expandir Red</h2>
                                <p className="text-xs text-gray-400 mt-1 font-light italic">
                                    El nuevo miembro mantendrá su soberanía de datos.
                                </p>
                            </div>
                            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} strokeWidth={1.5} />
                            </button>
                        </div>

                        {sentStatus ? (
                            <div className="py-10 text-center animate-in zoom-in duration-300">
                                <div className="w-16 h-16 bg-adaptia-mint/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="text-adaptia-mint" size={32} />
                                </div>
                                <h3 className="text-white font-medium">¡Invitación Enviada!</h3>
                                <p className="text-gray-400 text-xs mt-2">Se ha enviado el acceso a {email}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Email */}
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Email Profesional</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-adaptia-mint transition-colors" size={16} />
                                        <input
                                            required
                                            type="email"
                                            placeholder="doctor@ejemplo.com"
                                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-adaptia-mint/20 transition-all text-white"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Rol */}
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Nivel de Gobernanza</label>
                                    <div className="relative group">
                                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                        <select
                                            disabled={fetchingRoles}
                                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-adaptia-mint/20 transition-all text-white appearance-none disabled:opacity-50"
                                            value={roleId}
                                            onChange={(e) => setRoleId(e.target.value)}
                                        >
                                            {fetchingRoles ? (
                                                <option>Cargando roles...</option>
                                            ) : (
                                                roles.map(role => (
                                                    <option key={role.id} value={role.id} className="bg-[#1a1f2b] text-white">
                                                        {role.name}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                    </div>
                                </div>

                                {/* Info Box */}
                                <div className="bg-adaptia-mint/5 border border-adaptia-mint/10 rounded-2xl p-4">
                                    <p className="text-[10px] text-adaptia-mint/80 leading-relaxed">
                                        💡 El colaborador invitado recibirá un correo para activar su cuenta. Por defecto, su información será privada hasta que otorgue consentimiento.
                                    </p>
                                </div>

                                {/* Acciones */}
                                <div className="flex gap-4 pt-4">
                                    <Button
                                        variant="secondary"
                                        type="button"
                                        onClick={handleClose}
                                        className="flex-1 justify-center py-6 bg-white/5 border-white/10 text-gray-400 hover:text-white"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={loading || fetchingRoles || !email}
                                        className="flex-1 justify-center py-6 bg-adaptia-mint text-black hover:bg-adaptia-mint/90 shadow-lg shadow-adaptia-mint/20"
                                    >
                                        {loading ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <span className="flex items-center gap-2 font-bold text-[11px] uppercase tracking-widest">
                                                Enviar <Send size={14} />
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};