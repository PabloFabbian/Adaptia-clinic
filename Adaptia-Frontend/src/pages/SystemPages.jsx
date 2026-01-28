import { Layers } from 'lucide-react';

export const CategoriesPage = () => (
    <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-indigo-500 rounded-xl text-white">
                <Layers className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold">Categorías de Servicio</h1>
        </header>
        <div className="grid grid-cols-3 gap-4">
            {['Psicología', 'Nutrición', 'General'].map(cat => (
                <div key={cat} className="p-6 bg-white border rounded-2xl hover:border-blue-300 transition-colors cursor-pointer">
                    <span className="font-semibold text-gray-700">{cat}</span>
                </div>
            ))}
        </div>
    </div>
);