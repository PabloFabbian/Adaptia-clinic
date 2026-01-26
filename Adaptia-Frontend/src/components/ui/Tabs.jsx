import { useState } from 'react';

export const Tabs = ({ tabs }) => {
    // Inicializamos con el id de "Roles" (asumiendo que es el tercero en el array)
    const [activeTab, setActiveTab] = useState(tabs[2]?.id || tabs[0].id);

    return (
        <div className="flex items-center gap-6 border-b border-[#e5e5e3] mb-8 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-2 text-sm font-medium transition-all relative cursor-pointer whitespace-nowrap outline-none ${activeTab === tab.id
                        ? "text-black after:absolute after:bottom-[-1px] after:left-0 after:w-full after:h-[2px] after:bg-black after:z-10"
                        : "text-[#a1a19f] hover:text-gray-600"
                        }`}
                >
                    <span className="flex items-center gap-2">
                        {tab.icon && (
                            <span className="flex items-center justify-center pointer-events-none">
                                {tab.icon}
                            </span>
                        )}
                        {tab.label}
                    </span>
                </button>
            ))}
        </div>
    );
};