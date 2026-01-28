import { useEffect, useState } from 'react';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const AppointmentsPage = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3001/api/appointments/all')
            .then(res => res.json())
            .then(json => setData(json.data));
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Base de Citas</h1>
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-medium">Paciente</th>
                            <th className="px-6 py-4 font-medium">Fecha</th>
                            <th className="px-6 py-4 font-medium">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.length === 0 ? (
                            <tr><td colSpan="3" className="px-6 py-10 text-center text-gray-400">Sin citas registradas</td></tr>
                        ) : (
                            data.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{item.patient_name}</td>
                                    <td className="px-6 py-4 text-gray-600">{item.date}</td>
                                    <td className="px-6 py-4">
                                        <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-1 rounded-full w-fit text-[11px]">
                                            <Clock size={12} /> {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};