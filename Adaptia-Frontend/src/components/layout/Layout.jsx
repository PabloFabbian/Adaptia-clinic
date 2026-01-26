import { Sidebar } from './Sidebar';
import { ArrowLeft } from 'lucide-react';

export const Layout = ({ children }) => {
    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50/50 to-white">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header Superior */}
                <header className="h-16 flex items-center px-10 border-b border-gray-100/50 backdrop-blur-sm bg-white/80">
                    <button className="text-gray-400 hover:text-gray-700 transition-colors mr-4">
                        <ArrowLeft size={18} strokeWidth={1.5} />
                    </button>
                    <h1 className="text-sm font-light text-gray-600 tracking-wide">Clínicas</h1>
                </header>

                {/* Área de Scroll */}
                <div className="flex-1 overflow-y-auto px-10 py-8">
                    {children}
                </div>
            </main>
        </div>
    );
};