export const PermissionToggle = ({ onUpdate }) => {
    const handleToggle = async () => {
        await fetch('http://localhost:3000/toggle-esteban');
        onUpdate(); // Refresca la lista de citas tras el cambio
    };

    return (
        <button onClick={handleToggle}>
            Simular Consentimiento de Esteban
        </button>
    );
};