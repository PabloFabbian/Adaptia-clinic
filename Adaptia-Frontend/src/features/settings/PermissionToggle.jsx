import { useState } from 'react';

export const PermissionToggle = ({ onUpdate }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        setIsLoading(true);
        await fetch('http://localhost:3000/toggle-esteban');
        onUpdate();
        setIsLoading(false);
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 text-sm font-light text-gray-700 hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-300 disabled:opacity-50"
        >
            {isLoading ? 'Actualizando...' : 'Simular Consentimiento de Esteban'}
        </button>
    );
};