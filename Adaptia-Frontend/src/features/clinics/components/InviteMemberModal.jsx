import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Mail, Shield, X, Loader2, Send, CheckCircle2, ChevronDown } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

export const InviteMemberModal = ({ isOpen, onClose, onSuccess }) => {
    const { user, activeClinic } = useAuth();
    const [email, setEmail] = useState('');
    const [roleId, setRoleId] = useState('');
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingRoles, setFetchingRoles] = useState(true);
    const [sentStatus, setSentStatus] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchRoles = async () => {
                setFetchingRoles(true);
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/roles`);

                    // Verificación de integridad: si no es 200 OK, no intentamos parsear
                    if (!response.ok) throw new Error('Error al obtener roles del servidor');

                    const result = await response.json();

                    // Manejo robusto: acepta tanto array directo como objeto { data: [] }
                    const rawRoles = Array.isArray(result) ? result : (result.data || []);

                    // Filtramos 'Owner' para que el usuario no pueda auto-asignarse el nivel máximo
                    const availableRoles = rawRoles.filter(r => r.name !== 'Owner');
                    setRoles(availableRoles);

                    // Auto-seleccionar el primer rol disponible (ej. Administrador o Especialista)
                    if (availableRoles.length > 0) setRoleId(availableRoles[0].id);
                } catch (error) {
                    console.error("❌ Error cargando roles:", error);
                    // Fallback visual en caso de error de red
                    setRoles([]);
                } finally {
                    setFetchingRoles(false);
                }
            };
            fetchRoles();
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 🛡️ Validación de seguridad: No dispares la petición si faltan datos
        if (!activeClinic?.id || !roleId || !email) {
            console.error("❌ Datos locales incompletos:", { clinicId: activeClinic?.id, roleId, email });
            alert("Por favor completa todos los campos.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                email: email.trim(),
                role_id: parseInt(roleId), // Aseguramos que sea un número
                invited_by: user.id
            };

            console.log("📤 Enviando al servidor:", payload);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/clinics/${activeClinic.id}/invitations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                // Ahora el backend nos dirá exactamente qué falta en result.message
                throw new Error(result.message || 'Error en el servidor');
            }

            setSentStatus(true);
            setTimeout(() => {
                onSuccess();
                handleClose();
            }, 1800);

        } catch (error) {
            console.error("❌ Error en invitación:", error);
            alert(error.message);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md">
                <Card className="shadow-2xl border-white/5 overflow-hidden bg-white dark:bg-[#1a1f2b]">
                    <div className="p-8">
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
                                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="text-emerald-500" size={32} />
                                </div>
                                <h3 className="text-gray-800 dark:text-white font-medium">¡Invitación Enviada!</h3>
                                <p className="text-gray-400 text-xs mt-2">Se ha enviado el acceso a <span className="text-gray-200 font-medium">{email}</span></p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Email Input */}
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Email Profesional</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={16} />
                                        <input
                                            required
                                            type="email"
                                            placeholder="doctor@ejemplo.com"
                                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-white"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Roles Select */}
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Nivel de Gobernanza</label>
                                    <div className="relative group">
                                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors z-10" size={16} />

                                        <select
                                            required
                                            disabled={fetchingRoles}
                                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl py-4 pl-12 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-white appearance-none disabled:opacity-50 cursor-pointer relative z-0"
                                            value={roleId}
                                            onChange={(e) => setRoleId(e.target.value)}
                                        >
                                            {fetchingRoles ? (
                                                <option>Cargando roles...</option>
                                            ) : roles.length > 0 ? (
                                                roles.map(role => (
                                                    <option key={role.id} value={role.id} className="bg-[#1a1f2b] text-white">
                                                        {role.name}
                                                    </option>
                                                ))
                                            ) : (
                                                <option>No se encontraron roles</option>
                                            )}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-focus-within:text-blue-400 transition-colors" size={16} />
                                    </div>
                                </div>

                                <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4">
                                    <p className="text-[10px] text-blue-400/80 leading-relaxed italic">
                                        💡 El colaborador invitado recibirá un correo para activar su cuenta.
                                        Por defecto, su información será privada hasta que otorgue consentimiento.
                                    </p>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button
                                        variant="secondary"
                                        type="button"
                                        onClick={handleClose}
                                        className="flex-1 justify-center py-6 bg-gray-100 dark:bg-white/5 border-transparent dark:border-white/10 text-gray-500 hover:text-gray-700 dark:hover:text-white transition-all"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={loading || fetchingRoles || !email}
                                        className="flex-1 justify-center py-6 bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-900/20"
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