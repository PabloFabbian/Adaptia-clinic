const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Guarda una nueva nota clínica en la base de datos
 */
export const saveClinicalNote = async (patientId, noteData) => {
    try {
        const response = await fetch(`${API_URL}/clinical-notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                patient_id: patientId,
                member_id: noteData.member_id || 1,
                title: noteData.title,          // <--- AGREGADO
                content: noteData.details,      // <--- CAMBIADO (de noteData.content a details)
                category: noteData.category,    // <--- AGREGADO
                summary: noteData.summary       // <--- AGREGADO (el resultado de Gemini)
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al guardar en Neon');
        }

        return await response.json();
    } catch (error) {
        console.error("Error en saveClinicalNote:", error);
        throw error;
    }
};

/**
 * Obtiene todas las notas de un paciente específico desde Neon
 */
export const getPatientNotes = async (patientId) => {
    try {
        const response = await fetch(`${API_URL}/patients/${patientId}/notes`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al obtener notas');
        }

        const result = await response.json();
        return result.data; // Retorna el array de notas
    } catch (error) {
        console.error("Error en getPatientNotes:", error);
        return []; // Retornamos un array vacío para evitar que el frontend rompa
    }
};