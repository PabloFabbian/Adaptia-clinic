import { usePatients } from '../hooks/usePatients';

export const PatientsPage = () => {
    const { patients, loading } = usePatients();

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Panel de Pacientes</h1>
                <button className="bg-black text-white px-4 py-2 rounded-xl text-sm font-medium">
                    + Nuevo Paciente
                </button>
            </div>

            {loading ? (
                <p className="text-gray-500">Cargando base de datos cloud...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patients.length === 0 ? (
                        <p className="text-gray-400 italic">No hay pacientes registrados aún.</p>
                    ) : (
                        patients.map(p => (
                            <div key={p.id} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                <h3 className="font-semibold text-gray-900">{p.patient_name}</h3>
                                <p className="text-xs text-gray-400 mt-1">ID: #00{p.id}</p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};