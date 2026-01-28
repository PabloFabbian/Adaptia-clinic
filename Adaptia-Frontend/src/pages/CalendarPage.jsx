import { Calendar as CalendarIcon } from 'lucide-react';

export const CalendarPage = () => (
    <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-blue-500 rounded-xl text-white shadow-lg shadow-blue-500/20">
                <CalendarIcon className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Calendario Maestro</h1>
        </header>
        <div className="bg-white border rounded-2xl p-12 text-center border-dashed border-gray-300">
            <p className="text-gray-400">Vista de calendario mensual en desarrollo...</p>
        </div>
    </div>
);