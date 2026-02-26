import { useState, useEffect, useRef } from 'react';
import { UserPlus, ArrowLeft, Mail, Phone, CreditCard, MapPin, AlertCircle, ExternalLink, Calendar, Save, Edit3, HeartPulse, Fingerprint, BrainCircuit, Plus, X } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export const NewPatient = () => {
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();
    const { user } = useAuth();
    const errorRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditMode);
    const [error, setError] = useState('');
    const [duplicatePatient, setDuplicatePatient] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        dni: '',
        address: '',
        birth_date: '',
        gender: '',
        insurance_name: '',
        insurance_number: '',
        history: {
            motivo_consulta: '',
            antecedentes: '',
            medicacion: ''
        }
    });

    useEffect(() => {
        if (isEditMode) {
            const fetchPatient = async () => {
                try {
                    const res = await fetch(`http://localhost:3001/api/patients/${id}`);
                    const json = await res.json();
                    if (json.data) {
                        const p = json.data;
                        setFormData({
                            name: p.name || '',
                            email: p.email || '',
                            phone: p.phone || '',
                            dni: p.dni || '',
                            address: p.address || '',
                            gender: p.gender || '',
                            insurance_name: p.insurance_name || '',
                            insurance_number: p.insurance_number || '',
                            birth_date: p.birth_date ? p.birth_date.split('T')[0] : '',
                            history: p.history && typeof p.history === 'object' ? p.history : {
                                motivo_consulta: '',
                                antecedentes: '',
                                medicacion: ''
                            }
                        });
                    }
                } catch (err) {
                    toast.error("No se pudieron cargar los datos del paciente");
                } finally {
                    setFetching(false);
                }
            };
            fetchPatient();
        }
    }, [id, isEditMode]);

    const scrollToError = () => {
        setTimeout(() => {
            errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setError('');
        setDuplicatePatient(null);
        if (name.startsWith('history.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                history: { ...prev.history, [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (!isEditMode) {
                const checkRes = await fetch('http://localhost:3001/api/patients');
                const { data } = await checkRes.json();
                const existing = data.find(p => p.dni === formData.dni && formData.dni !== '');
                if (existing) {
                    setError(`El paciente "${existing.name}" ya está registrado con ese DNI.`);
                    setDuplicatePatient(existing);
                    setLoading(false);
                    scrollToError();
                    return;
                }
            }
            const url = isEditMode ? `http://localhost:3001/api/patients/${id}` : 'http://localhost:3001/api/patients';
            const method = isEditMode ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, owner_member_id: user?.id || 1 })
            });
            if (response.ok) {
                toast.success(isEditMode ? "Paciente actualizado correctamente" : "Paciente registrado con éxito");
                navigate('/pacientes');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al procesar la solicitud');
            }
        } catch (err) {
            setError(err.message || 'Error al conectar con el servidor.');
            scrollToError();
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (isError) => `
        w-full pl-12 pr-4 py-3 rounded-xl border text-sm transition-all duration-200 outline-none
        ${isError
            ? 'border-red-500 bg-red-50 dark:bg-red-500/10 text-red-600'
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:border-[#50e3c2] focus:ring-4 focus:ring-[#50e3c2]/5'}
    `;

    const labelClass = "text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-2 block ml-1";

    if (fetching) return (
        <div className="h-screen flex items-center justify-center text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] animate-pulse">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-1 bg-[#50e3c2] rounded-full" />
                Sincronizando Expediente...
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-6 pt-8 pb-20 animate-in fade-in duration-700">
            {/* Botón Volver - Estilo Dashboard */}
            <Link to="/pacientes" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mb-8 text-[11px] font-bold uppercase tracking-widest transition-colors group">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Volver a pacientes
            </Link>

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-[#50e3c2]" />
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                            {isEditMode ? 'Edición de registro' : 'Alta de paciente'}
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {isEditMode ? 'Editar' : 'Nuevo'} <span className="text-[#50e3c2]">Paciente</span>
                    </h1>
                </div>
            </header>

            {/* Banner de Error Estilo Dashboard */}
            <div ref={errorRef}>
                {error && (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-800 border-l-4 border-red-500 shadow-sm rounded-xl mb-10 animate-in slide-in-from-top-2">
                        <div className="flex items-center gap-3">
                            <AlertCircle size={18} className="text-red-500" />
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{error}</span>
                        </div>
                        {duplicatePatient && (
                            <button
                                type="button"
                                onClick={() => navigate(`/pacientes?open=${duplicatePatient.id}`)}
                                className="bg-slate-900 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all"
                            >
                                Ver Perfil Existente
                            </button>
                        )}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* GRID PRINCIPAL */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* SECCIÓN 1: DATOS PERSONALES */}
                    <div className="bg-white dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                        <h2 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                            <span className="text-[#50e3c2]">01</span> Información Base
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className={labelClass}>Nombre Completo</label>
                                <div className="relative">
                                    <UserPlus size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" />
                                    <input name="name" required value={formData.name} onChange={handleChange} className={inputClass(false)} placeholder="Nombre y Apellidos" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>DNI/NIE</label>
                                    <div className="relative">
                                        <Fingerprint size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" />
                                        <input name="dni" required value={formData.dni} onChange={handleChange} className={inputClass(false)} placeholder="Documento" />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Género</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass(false)}>
                                        <option value="">Seleccionar...</option>
                                        <option value="Masculino">Masculino</option>
                                        <option value="Femenino">Femenino</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Fecha de Nacimiento</label>
                                <div className="relative">
                                    <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#50e3c2]" />
                                    <input name="birth_date" type="date" value={formData.birth_date} onChange={handleChange} className={inputClass(false)} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 2: CONTACTO Y SEGURO */}
                    <div className="space-y-8 mt-2">
                        <div className="bg-white dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                            <h2 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                                <span className="text-[#50e3c2]">02</span> Contacto
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input name="email" type="email" value={formData.email} onChange={handleChange} className={inputClass(false)} placeholder="Email" />
                                </div>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input name="phone" type="tel" value={formData.phone} onChange={handleChange} className={inputClass(false)} placeholder="Móvil" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                            <h2 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                                <span className="text-[#50e3c2]">03</span> Cobertura Médica
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <HeartPulse size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#50e3c2]" />
                                    <input name="insurance_name" value={formData.insurance_name} onChange={handleChange} className={inputClass(false)} placeholder="Aseguradora" />
                                </div>
                                <div className="relative">
                                    <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input name="insurance_number" value={formData.insurance_number} onChange={handleChange} className={inputClass(false)} placeholder="Nº Póliza" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECCIÓN 4: HISTORIAL (ANCHO COMPLETO) */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-sm">
                    <h2 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
                        <span className="text-[#50e3c2]">04</span> Perfil Clínico Inicial
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <label className={labelClass}>Motivo de Consulta Principal</label>
                            <div className="relative">
                                <BrainCircuit size={18} className="absolute left-4 top-4 text-slate-300" />
                                <textarea
                                    name="history.motivo_consulta"
                                    value={formData.history.motivo_consulta}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:border-[#50e3c2] focus:ring-4 focus:ring-[#50e3c2]/5 outline-none min-h-[120px] transition-all"
                                    placeholder="Describa el motivo de la consulta..."
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Antecedentes Relevantes</label>
                                <input name="history.antecedentes" value={formData.history.antecedentes} onChange={handleChange} className={inputClass(false)} placeholder="Notas médicas previas..." />
                            </div>
                            <div>
                                <label className={labelClass}>Medicación Actual</label>
                                <input name="history.medicacion" value={formData.history.medicacion} onChange={handleChange} className={inputClass(false)} placeholder="Fármacos activos..." />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ACCIONES FINALES */}
                <div className="flex items-center justify-end gap-4 pt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/pacientes')}
                        className="px-6 py-3 text-[10px] font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest transition-all"
                    >
                        Descartar
                    </button>
                    <button
                        disabled={loading}
                        className="bg-slate-900 dark:bg-[#50e3c2] text-white dark:text-slate-900 px-10 py-4 rounded-xl text-[11px] font-bold uppercase tracking-[0.15em] hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-slate-200 dark:shadow-none active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Procesando...' : (
                            <>
                                <Save size={16} />
                                {isEditMode ? 'Actualizar Expediente' : 'Confirmar Registro'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};