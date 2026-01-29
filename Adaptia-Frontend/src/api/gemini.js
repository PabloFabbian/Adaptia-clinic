export const getClinicalSummary = async (text) => {
    if (!text || text.trim().length < 10) return "";

    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    // Usamos el endpoint oficial para Gemini 3 Flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `Resume esta nota clínica en 2 frases: ${text}` }]
                }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("❌ Error API Google:", data);
            return "";
        }

        // Estructura de respuesta estándar de Google
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("❌ Error de red con Gemini:", error);
        return "";
    }
};