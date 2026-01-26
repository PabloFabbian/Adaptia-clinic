import { useAppointments } from '../hooks/useAppointments';
import { Card } from '../components/ui/Card';
import { Clock, User } from 'lucide-react';

const Home = () => {
    const { appointments, loading } = useAppointments();

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-700">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Panel de Control</h1>
                <p className="text-gray-500">Visualizando recursos compartidos de la clínica.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card title="Próximas Citas">
                    {loading ? (
                        <p className="p-4 text-gray-400 text-sm">Cargando agenda compartida...</p>
                    ) : appointments.length === 0 ? (
                        <p className="p-4 text-gray-400 text-sm">No hay citas disponibles o no tienes permisos concedidos.</p>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {appointments.map((appointment) => (
                                <div key={appointment.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                            <User size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{appointment.patient_name}</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock size={12} /> {new Date(appointment.date).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Badge indicando de quién es la cita */}
                                    <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded uppercase font-bold">
                                        {appointment.is_mine ? 'Mía' : 'Compartida'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Home;