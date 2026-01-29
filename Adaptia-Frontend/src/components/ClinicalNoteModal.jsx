import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Animaciones
import { toast } from 'sonner'; // Notificaciones
import { X, Type, Activity, Loader2, ClipboardList, Stethoscope, Pill, Beaker, Users, AlertCircle, Check } from 'lucide-react';
import { getClinicalSummary } from '../api/gemini';

const CATEGORIES = [
    { id: 'Evolución', label: 'Evolución', color: 'bg-blue-50 text-blue-600 ring-blue-100', icon: ClipboardList },
    { id: 'Diagnóstico', label: 'Diagnóstico', color: 'bg-purple-50 text-purple-600 ring-purple-100', icon: Stethoscope },
    { id: 'Tratamiento', label: 'Tratamiento', color: 'bg-green-50 text-green-600 ring-green-100', icon: Pill },
    { id: 'Examen', label: 'Examen/Lab', color: 'bg-amber-50 text-amber-600 ring-amber-100', icon: Beaker },
    { id: 'Interconsulta', label: 'Interconsulta', color: 'bg-indigo-50 text-indigo-600 ring-indigo-100', icon: Users },
    { id: 'Urgencia', label: 'Urgencia', color: 'bg-red-50 text-red-600 ring-red-100', icon: AlertCircle },
];

export const ClinicalNoteModal = ({ isOpen, onClose, onSave, patientName }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        details: '',
        category: 'Evolución',
    });

    const handleSubmit = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        setIsSaving(true);

        try {
            const aiSummary = await getClinicalSummary(formData.details);

            // Llamamos al onSave del padre (PatientsPage)
            await onSave({
                ...formData,
                summary: aiSummary
            });

            // ÚNICA NOTIFICACIÓN:
            toast.success('Registro completado', {
                description: "La nota se ha sincronizado correctamente con Adaptia Cloud.",
            });

            setFormData({ title: '', category: 'Evolución', details: '' });
            onClose();
        } catch (error) {
            console.error("Error:", error);
            toast.error('Error al procesar', {
                description: "No se pudo completar la operación.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    {/* Backdrop con Framer Motion */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-gray-900/40 backdrop-blur-md"
                    />

                    {/* Contenedor del Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 relative z-10"
                    >
                        {/* HEADER */}
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Nueva Nota Clínica</h2>
                                <p className="text-sm text-gray-400 font-medium">Paciente: <span className="text-gray-600 uppercase text-xs tracking-wider font-bold">{patientName}</span></p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* BODY */}
                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="group space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                                    <Type size={12} /> Título de la Nota
                                </label>
                                <input
                                    type="text"
                                    disabled={isSaving}
                                    placeholder="Ej: Control Post-operatorio"
                                    className="w-full bg-gray-50/50 border-2 border-transparent focus:border-orange-100 focus:bg-white outline-none py-4 px-6 rounded-2xl text-gray-700 transition-all font-semibold placeholder:text-gray-300"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                                    <Activity size={12} /> Categoría de Atención
                                </label>
                                <div className="flex flex-wrap gap-2.5">
                                    {CATEGORIES.map((cat) => {
                                        const Icon = cat.icon;
                                        const isSelected = formData.category === cat.id;
                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, category: cat.id })}
                                                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-tight transition-all duration-300 active:scale-95 ${isSelected
                                                    ? `${cat.color} ring-2 ring-offset-2 scale-105 shadow-md`
                                                    : 'bg-white border border-gray-100 text-gray-400 hover:border-gray-300 shadow-sm'
                                                    }`}
                                            >
                                                <Icon size={14} strokeWidth={2.5} />
                                                {cat.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="group space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1 flex justify-between items-center">
                                    <span>Evolución y Hallazgos</span>
                                    <span className="text-gray-300 italic normal-case font-medium">{formData.details.length} caracteres</span>
                                </label>
                                <textarea
                                    disabled={isSaving}
                                    placeholder="Describa detalladamente los hallazgos clínicos..."
                                    className="w-full bg-gray-50/50 border-2 border-transparent focus:border-orange-100 focus:bg-white outline-none h-48 p-6 rounded-[2rem] resize-none leading-relaxed text-gray-600 transition-all shadow-inner placeholder:text-gray-300 font-medium"
                                    value={formData.details}
                                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="p-8 bg-gray-50/30 border-t border-gray-100 flex justify-end items-center gap-6">
                            {isSaving && (
                                <div className="flex items-center gap-2 text-orange-600 animate-pulse font-black text-[10px] tracking-widest bg-orange-50 px-4 py-2 rounded-full">
                                    <Loader2 size={14} className="animate-spin" /> IA PROCESANDO
                                </div>
                            )}
                            <button
                                onClick={handleSubmit}
                                disabled={!formData.title || !formData.details || isSaving}
                                className="flex items-center gap-2 px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-xl shadow-gray-200 hover:bg-black transition-all disabled:opacity-20 active:scale-95 group"
                            >
                                {isSaving ? 'Guardando...' : (
                                    <>
                                        <span>Guardar Registro</span>
                                        <Check size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};