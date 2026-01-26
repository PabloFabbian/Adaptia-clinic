import { User, Calendar, Share2, Clock } from 'lucide-react';

export const AppointmentTable = ({ appointments }) => {
    return (
        <div className="overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-white text-gray-600 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4 font-semibold text-left text-xs uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                Paciente
                            </div>
                        </th>
                        <th className="px-6 py-4 font-semibold text-left text-xs uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                Fecha
                            </div>
                        </th>
                        <th className="px-6 py-4 font-semibold text-left text-xs uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <Share2 className="w-4 h-4 text-gray-400" />
                                Estado
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {appointments.length === 0 ? (
                        <tr>
                            <td colSpan="3" className="px-6 py-12 text-center">
                                <div className="flex flex-col items-center gap-3 text-gray-400">
                                    <Clock className="w-12 h-12 opacity-20" />
                                    <p className="text-sm font-medium">No hay citas programadas</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        appointments.map((appo, index) => (
                            <tr
                                key={appo.id}
                                className="group hover:bg-gradient-to-r hover:from-blue-50/40 hover:to-transparent transition-all duration-200"
                                style={{ animationDelay: `${index * 40}ms` }}
                            >
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md shadow-blue-500/30">
                                            {appo.patientName?.charAt(0).toUpperCase() || 'P'}
                                        </div>
                                        <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {appo.patientName}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-gray-600 font-medium">
                                        {appo.date}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    {appo.ownerId === 1 ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                            Propia
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200">
                                            <Share2 className="w-3 h-3" />
                                            Compartida
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};