export const saveClinicalNote = async (patientId, content) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                patient_id: patientId,
                content: content,
                member_id: 1 // Aquí luego usaremos el ID del usuario logueado
            })
        });
        return await response.json();
    } catch (error) {
        console.error("Error al guardar nota:", error);
    }
};