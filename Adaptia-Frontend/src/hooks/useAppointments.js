import { useState, useEffect, useCallback } from 'react';

export const useAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAppointments = useCallback(async () => {
        // No ponemos loading(true) aquí si ya hay datos, 
        // para evitar que la pantalla parpadee al refrescar.
        setError(null);

        try {
            // 1. Verificamos que el puerto sea el 3001 del nuevo index.js
            const res = await fetch('http://localhost:3001/api/appointments');

            if (!res.ok) {
                throw new Error(`Error del servidor: ${res.status}`);
            }

            const json = await res.json();

            // 2. Mapeo correcto de la respuesta:
            // En tu index.js envías: { user: "Luis David", data: rows }
            setAppointments(json.data || []);
            setUser(json.user || "Usuario");

        } catch (err) {
            console.error("❌ Error en el fetch de citas:", err);
            setError(err.message);
            // Si hay error, nos aseguramos de vaciar las citas para no mostrar basura
            setAppointments([]);
        } finally {
            // 3. Importante: Esto quita el mensaje de "Cargando..."
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    return {
        appointments,
        user,
        loading,
        error,
        refresh: fetchAppointments
    };
};