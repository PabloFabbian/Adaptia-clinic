import { useState, useRef } from 'react';
import { UserPlus, ArrowLeft, Mail, Phone, CreditCard, MapPin, AlertCircle, ExternalLink, Calendar, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export const NewPatient = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const errorRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [duplicatePatient, setDuplicatePatient] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        dni: '',
        address: '',
        birth_date: '' // Cambiado para coincidir con el estándar de DB (snake_case)
    });

    const scrollToError = () => {
        setTimeout(() => {
            errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    const handleChange = (e) => {
        setError('');
        setDuplicatePatient(null);
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Verificación de duplicados (Ahora busca en columnas directas)
            const checkRes = await fetch('http://localhost:3001/api/patients');
            const { data } = await checkRes.json();

            const existing = data.find(p =>
                (p.dni === formData.dni && formData.dni !== '') ||
                p.name.toLowerCase() === formData.name.toLowerCase()
            );

            if (existing) {
                setError(`El paciente "${existing.name}" ya está registrado.`);
                setDuplicatePatient(existing);
                setLoading(false);
                scrollToError();
                return;
            }

            // 2. Petición POST con el esquema normalizado
            const response = await fetch('http://localhost:3001/api/patients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    dni: formData.dni,
                    address: formData.address,
                    birth_date: formData.birth_date,
                    owner_member_id: user?.id || 1,
                    history: {} // Se envía vacío o con datos no estructurales
                })
            });

            if (response.ok) {
                toast.success("Paciente registrado correctamente");
                navigate('/pacientes');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al guardar');
            }
        } catch (err) {
            setError(err.message || 'Error al conectar con el servidor.');
            scrollToError();
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (isError) => `
        w-full pl-12 pr-4 py-3 rounded-2xl border outline-none transition-all duration-300
        ${isError
            ? 'border-red-400/50 bg-red-500/5 ring-4 ring-red-500/10 text-red-600 dark:text-red-400'
            : 'border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-white/5 text-gray-800 dark:text-gray-100 focus:bg-white dark:focus:bg-dark-surface focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50'}
    `;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Link to="/pacientes" className="flex items-center gap-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-200 mb-8 text-sm transition-colors group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-light tracking-wide">Volver a la base de datos</span>
            </Link>

            <header className="mb-10">
                <div className="flex items-center gap-5 mb-2">
                    <div className="p-4 bg-orange-500 rounded-[1.5rem] text-white shadow-2xl shadow-orange-500/20">
                        <UserPlus className="w-7 h-7" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-light text-gray-900 dark:text-white tracking-tight">
                            Nuevo <span className="font-bold">Paciente</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-light mt-1">Crea una nueva ficha clínica normalizada</p>
                    </div>
                </div>

                <div ref={errorRef}>
                    {error && (
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-[2rem] mt-8 animate-in zoom-in-95 duration-300 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <AlertCircle size={20} className="shrink-0" />
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                            {duplicatePatient && (
                                <button
                                    type="button"
                                    onClick={() => navigate(`/pacientes?open=${duplicatePatient.id}`)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 shrink-0"
                                >
                                    <ExternalLink size={14} /> Abrir Perfil
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* SECCIÓN 1: DATOS PERSONALES */}
                <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-[2.5rem] p-10 shadow-sm">
                    <h2 className="text-sm font-bold mb-8 flex items-center gap-3 text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                        <span className="w-9 h-9 bg-orange-500/10 text-orange-500 rounded-md flex items-center justify-center text-xs">01</span>
                        Información Personal
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2 relative">
                            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-3 ml-1 uppercase tracking-widest">Nombre Completo</label>
                            <div className="relative">
                                <UserPlus size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" />
                                <input
                                    name="name" required value={formData.name} onChange={handleChange}
                                    className={inputClass(error.includes('registrado'))}
                                    placeholder="Ej. Juan Pérez García"
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-3 ml-1 uppercase tracking-widest">DNI/NIE</label>
                            <div className="relative">
                                <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" />
                                <input
                                    name="dni" required value={formData.dni} onChange={handleChange}
                                    className={inputClass(false)}
                                    placeholder="12345678X"
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-3 ml-1 uppercase tracking-widest">Fecha de Nacimiento</label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" />
                                <input
                                    name="birth_date" type="date" value={formData.birth_date} onChange={handleChange}
                                    className={inputClass(false)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECCIÓN 2: CONTACTO */}
                <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-[2.5rem] p-10 shadow-sm">
                    <h2 className="text-sm font-bold mb-8 flex items-center gap-3 text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                        <span className="w-9 h-9 bg-blue-500/10 text-blue-500 rounded-md flex items-center justify-center text-xs">02</span>
                        Contacto y Ubicación
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-3 ml-1 uppercase tracking-widest">Email</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" />
                                <input
                                    name="email" type="email" value={formData.email} onChange={handleChange}
                                    className={inputClass(false)}
                                    placeholder="correo@paciente.com"
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-3 ml-1 uppercase tracking-widest">Móvil</label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" />
                                <input
                                    name="phone" type="tel" value={formData.phone} onChange={handleChange}
                                    className={inputClass(false)}
                                    placeholder="+34 000 000 000"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 relative">
                            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-3 ml-1 uppercase tracking-widest">Dirección Residencial</label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" />
                                <input
                                    name="address" value={formData.address} onChange={handleChange}
                                    className={inputClass(false)}
                                    placeholder="Calle, Ciudad, Provincia"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-6 pt-6 pb-20">
                    <button
                        type="button"
                        onClick={() => navigate('/pacientes')}
                        className="text-sm font-bold text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-white transition-all uppercase tracking-widest"
                    >
                        Descartar
                    </button>
                    <button
                        disabled={loading}
                        className="px-12 py-4 bg-gray-900 dark:bg-adaptia-blue text-white rounded-2xl font-bold flex items-center gap-3 hover:opacity-90 transition-all disabled:opacity-50 shadow-xl shadow-adaptia-blue/20 active:scale-95 text-sm uppercase tracking-widest"
                    >
                        {loading ? 'Procesando...' : (
                            <>
                                <Save size={18} strokeWidth={2.5} />
                                Guardar Paciente
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};