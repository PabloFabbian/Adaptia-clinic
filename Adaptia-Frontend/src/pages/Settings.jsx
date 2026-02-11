import { Shield, Users, User, Mail, Fingerprint, Camera, Briefcase, Star, Save, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { PermissionToggle } from '../features/clinics/components/PermissionToggle';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const Settings = ({ fetchAppointments }) => {
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);

    // Estados locales para la personalización
    const [bio, setBio] = useState(user?.bio || '');
    const [specialty, setSpecialty] = useState(user?.specialty || '');

    const handleSaveProfile = async () => {
        setIsSaving(true);
        // Simulación de guardado - Aquí conectarías con tu API de actualización de perfil
        setTimeout(() => {
            toast.success("Perfil actualizado correctamente");
            setIsSaving(false);
        }, 1000);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#50e3c2] rounded-2xl text-gray-900 shadow-xl shadow-[#50e3c2]/20">
                        <User className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mi Perfil</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Personaliza tu presencia profesional en la plataforma</p>
                    </div>
                </div>

                <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-[#50e3c2] hover:bg-[#40b39a] text-gray-900 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-[#50e3c2]/20 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Guardar Cambios
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* COLUMNA IZQUIERDA: Avatar y Datos Básicos */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-[#161f31] border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm flex flex-col items-center text-center">
                        <div className="relative group cursor-pointer">
                            <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-tr from-[#50e3c2] to-teal-600 p-1">
                                <div className="w-full h-full rounded-[1.8rem] bg-white dark:bg-[#101828] flex items-center justify-center overflow-hidden">
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-black text-[#50e3c2]">{user?.name?.charAt(0)}</span>
                                    )}
                                </div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[1.8rem] opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-white" size={24} />
                            </div>
                        </div>
                        <h2 className="mt-4 text-xl font-bold dark:text-white">{user?.name}</h2>
                        <p className="text-[#50e3c2] text-xs font-black uppercase tracking-widest mt-1">{user?.role_name || 'Especialista'}</p>
                    </div>

                    <div className="bg-white dark:bg-[#161f31] border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-6 shadow-sm">
                        <h3 className="text-sm font-bold dark:text-white mb-4 flex items-center gap-2">
                            <Mail size={16} className="text-[#50e3c2]" /> Contacto
                        </h3>
                        <div className="text-xs text-gray-500 dark:text-gray-400 break-all bg-gray-50 dark:bg-[#101828] p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                            {user?.email}
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA: Personalización y Privacidad */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Personalización Profesional */}
                    <div className="bg-white dark:bg-[#161f31] border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                            <Briefcase size={18} className="text-[#50e3c2]" />
                            Perfil Profesional
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 mb-2 block">Especialidad Principal</label>
                                <div className="relative">
                                    <Star className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        value={specialty}
                                        onChange={(e) => setSpecialty(e.target.value)}
                                        placeholder="Ej: Psicología Clínica, Terapia Cognitivo Conductual"
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-[#101828] border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:border-[#50e3c2] transition-colors dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 mb-2 block">Breve Descripción / Bio</label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows="4"
                                    placeholder="Cuéntales un poco sobre tu enfoque terapéutico..."
                                    className="w-full p-4 bg-gray-50 dark:bg-[#101828] border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:border-[#50e3c2] transition-colors resize-none dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Privacidad de la Agenda */}
                    <div className="bg-white dark:bg-[#161f31] border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                    <Shield size={18} className="text-[#50e3c2]" />
                                    Privacidad de la Agenda
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 leading-relaxed">
                                    Si desactivas la visibilidad, tus citas aparecerán como "Privadas" para otros miembros, protegiendo tus datos.
                                </p>
                            </div>
                        </div>

                        <div className="bg-orange-50 dark:bg-orange-500/5 rounded-3xl p-6 flex items-center justify-between border border-orange-100 dark:border-orange-500/10 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white dark:bg-[#161f31] rounded-2xl flex items-center justify-center border border-orange-100 dark:border-gray-800 shadow-sm text-orange-500">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Consentimiento de Visibilidad</p>
                                    <p className="text-[11px] text-orange-600/70 dark:text-orange-400/70 font-medium italic">Permite que colegas vean tus horarios</p>
                                </div>
                            </div>
                            <PermissionToggle onUpdate={fetchAppointments} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;