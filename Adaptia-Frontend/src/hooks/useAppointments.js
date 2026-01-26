import { useState, useEffect, useCallback } from 'react';

export const useAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Usamos useCallback para poder llamar a refresh desde otros componentes sin bucles infinitos
    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Nota: Asegúrate de que el puerto (3000 o 3001) coincida con tu servidor de Node
            const res = await fetch('http://localhost:3001/api/appointments');

            if (!res.ok) throw new Error('Error en la respuesta del servidor');

            const data = await res.json();

            /**
             * data.data: El array de citas filtradas por el Backend (propias + compartidas)
             * data.user: Info del usuario actual (nombre, rol, etc.)
             */
            setAppointments(data.data || []);
            setUser(data.user || null);
        } catch (err) {
            console.error("Error cargando citas:", err);
            setError(err.message);
        } finally {
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