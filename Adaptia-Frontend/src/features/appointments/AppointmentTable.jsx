import { useState } from 'react';
import {
    Home, Users, Briefcase, Calendar,
    ArrowLeft, ExternalLink, UserPlus, Layout,
    ShieldCheck, Globe, Activity, Settings,
    User, Share2, Clock
} from 'lucide-react';

// ===== APPOINTMENT TABLE =====
export const AppointmentTable = ({ appointments }) => {
    return (
        <div className="overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-white/50 text-gray-400 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4 font-light text-left text-xs uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" strokeWidth={1.5} />
                                Paciente
                            </div>
                        </th>
                        <th className="px-6 py-4 font-light text-left text-xs uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" strokeWidth={1.5} />
                                Fecha
                            </div>
                        </th>
                        <th className="px-6 py-4 font-light text-left text-xs uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <Share2 className="w-4 h-4" strokeWidth={1.5} />
                                Estado
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {appointments.length === 0 ? (
                        <tr>
                            <td colSpan="3" className="px-6 py-16 text-center">
                                <div className="flex flex-col items-center gap-3 text-gray-300">
                                    <Clock className="w-12 h-12 opacity-20" strokeWidth={1} />
                                    <p className="text-sm font-light">No hay citas programadas</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        appointments.map((appo, index) => (
                            <tr
                                key={appo.id}
                                className="group hover:bg-blue-50/20 transition-all duration-300"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400/80 to-blue-500/80 flex items-center justify-center text-white font-light text-sm backdrop-blur-sm">
                                            {appo.patientName?.charAt(0).toUpperCase() || 'P'}
                                        </div>
                                        <span className="font-light text-gray-700 group-hover:text-blue-600 transition-colors">
                                            {appo.patientName}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-gray-500 font-light">
                                        {appo.date}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    {appo.ownerId === 1 ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-light bg-emerald-50/50 text-emerald-600 border border-emerald-100/50">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                            Propia
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-light bg-purple-50/50 text-purple-600 border border-purple-100/50">
                                            <Share2 className="w-3 h-3" strokeWidth={1.5} />
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