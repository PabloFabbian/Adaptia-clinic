import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { User, FileText, Lock, Search, Plus } from 'lucide-react';

const Patients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/patients');
                const json = await res.json();
                setPatients(json.data || []);
            } catch (err) {
                console.error("Error cargando pacientes", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-700 px-4">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Pacientes</h1>
                    <p className="text-gray-500 text-sm">Gestión de historias clínicas y recursos compartidos.</p>
                </div>
                <button className="flex items-center justify-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all shadow-sm active:scale-95">
                    <Plus size={18} />
                    Nuevo Paciente
                </button>
            </header>

            {/* Barra de búsqueda simple */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Buscar paciente por nombre..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#f9f9f8] text-[#a1a19f] border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Paciente</th>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Contexto</th>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Historial</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-400">Cargando base de datos...</td></tr>
                            ) : patients.length === 0 ? (
                                <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-400">No se encontraron pacientes disponibles.</td></tr>
                            ) : (
                                patients.map((patient) => (
                                    <tr key={patient.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-white border border-gray-100 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:border-blue-100 transition-all">
                                                    <User size={18} />
                                                </div>
                                                <span className="font-semibold text-gray-900">{patient.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {patient.is_mine ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                                                    Propio
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-400 border border-gray-100">
                                                    Compartido
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 italic text-xs">
                                            {Object.keys(patient.history || {}).length} registros clínicos
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all">
                                                <FileText size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Patients;