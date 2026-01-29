import { useState } from 'react';
import { Users, UserPlus, Search, Filter, ExternalLink, Mail, Phone, ShieldCheck } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner'; // <--- Importamos toast

// Hooks y API
import { usePatients } from '../hooks/usePatients';

// Componentes
import { PatientDetailsPanel } from '../components/PatientDetailsPanel';
import { ClinicalNoteModal } from '../components/ClinicalNoteModal';

export const PatientsPage = () => {
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const { patients, loading } = usePatients(setSelectedPatient);

    const closePanel = () => {
        setSelectedPatient(null);
        setSearchParams({});
    };

    const handleSaveNote = async (formData) => {
        try {
            if (!selectedPatient) {
                toast.error("Error de selección", { description: "No hay ningún paciente seleccionado" });
                return;
            }

            const response = await fetch('http://localhost:3001/api/clinical-notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patient_id: selectedPatient.id,
                    member_id: 1,
                    content: formData.details,
                    title: formData.title,
                    summary: formData.summary,
                    category: formData.category
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al guardar en el servidor");
            }

            // ÉXITO: Ya no hay alert(). El Modal se encarga de mostrar el toast de éxito.
            setIsNoteModalOpen(false);

        } catch (err) {
            console.error("Error al guardar:", err);
            toast.error("Error al guardar", { description: err.message }); // Cambiado alert por toast
        }
    };

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.history?.dni && p.history.dni.includes(searchTerm))
    );

    return (
        <div className="relative min-h-screen bg-gray-50/30">
            <div className={`max-w-7xl mx-auto px-4 py-8 transition-all duration-500 ease-in-out ${selectedPatient ? 'pr-[420px]' : ''}`}>
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-500 rounded-2xl text-white shadow-lg shadow-orange-100">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pacientes</h1>
                            <p className="text-gray-400 text-sm font-light">
                                <span className="text-gray-900 font-medium">{filteredPatients.length}</span> registros sincronizados
                            </p>
                        </div>
                    </div>
                    <Link to="/nuevo-paciente" className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-gray-800 transition-all shadow-xl active:scale-95">
                        <UserPlus size={18} /> Nuevo Registro
                    </Link>
                </header>

                <div className="flex gap-4 mb-8">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o DNI..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-orange-50 transition-all shadow-sm"
                        />
                    </div>
                    <button className="p-4 bg-white border border-gray-100 rounded-[1.5rem] text-gray-400 hover:text-gray-900 transition-all">
                        <Filter size={20} />
                    </button>
                </div>

                <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                    <th className="px-8 py-5">Identificación</th>
                                    <th className="px-8 py-5">Contacto</th>
                                    <th className="px-8 py-5">Propiedad</th>
                                    <th className="px-8 py-5 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan="4" className="px-8 py-32 text-center text-gray-400 animate-pulse">Sincronizando...</td></tr>
                                ) : filteredPatients.map((patient) => (
                                    <tr
                                        key={patient.id}
                                        onClick={() => setSelectedPatient(patient)}
                                        className={`hover:bg-orange-50/30 transition-all group cursor-pointer ${selectedPatient?.id === patient.id ? 'bg-orange-50/50' : ''}`}
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-2xl flex items-center justify-center font-bold text-sm border border-gray-200 group-hover:border-orange-200">
                                                    {patient.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 leading-tight">{patient.name}</p>
                                                    <p className="text-[11px] text-gray-400 font-mono mt-1 uppercase">ID-{patient.history?.dni || 'SN'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-xs text-gray-600 space-y-1">
                                                <p className="flex items-center gap-2"><Mail size={12} className="text-gray-300" /> {patient.history?.email || '—'}</p>
                                                <p className="flex items-center gap-2"><Phone size={12} className="text-gray-300" /> {patient.history?.phone || '—'}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                                                <ShieldCheck size={12} /> {patient.owner_name || 'Luis David'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="p-2 text-gray-300 group-hover:text-orange-500 transition-colors"><ExternalLink size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <PatientDetailsPanel
                patient={selectedPatient}
                onClose={closePanel}
                onOpenNote={() => setIsNoteModalOpen(true)}
            />

            <ClinicalNoteModal
                isOpen={isNoteModalOpen}
                patientName={selectedPatient?.name}
                onSave={handleSaveNote}
                onClose={() => setIsNoteModalOpen(false)}
            />
        </div>
    );
};