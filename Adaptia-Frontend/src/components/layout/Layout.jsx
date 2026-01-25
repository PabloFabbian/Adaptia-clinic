import { Sidebar } from './Sidebar';

export const Layout = ({ children }) => {
    return (
        <div className="flex h-screen bg-white">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header Superior estilo Breadcrumb */}
                <header className="h-14 flex items-center px-8 border-b border-border-light gap-4">
                    <button className="text-gray-400 hover:text-black">←</button>
                    <h1 className="text-sm font-medium">Clínicas</h1>
                </header>

                {/* Área de Scroll */}
                <div className="flex-1 overflow-y-auto p-12">
                    <div className="max-w-5xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};