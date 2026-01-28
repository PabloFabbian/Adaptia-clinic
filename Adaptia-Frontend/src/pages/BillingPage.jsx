import { CreditCard, Receipt } from 'lucide-react';

export const BillingPage = ({ mode = "list" }) => (
    <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="flex items-center gap-3 mb-8">
            <div className={`p-2.5 rounded-xl text-white ${mode === 'create' ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                {mode === 'create' ? <Receipt className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
                {mode === 'create' ? 'Nueva Factura' : 'Base de Facturación'}
            </h1>
        </header>
        <div className="bg-white border rounded-2xl p-8 shadow-sm">
            <p className="text-gray-500 italic">No se encontraron registros financieros en Neon Cloud.</p>
        </div>
    </div>
);