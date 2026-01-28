import { useState, useEffect } from 'react';

export const usePatients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPatients = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/patients');
            const data = await res.json();
            setPatients(data.data || []);
        } catch (error) {
            console.error("Error cargando pacientes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPatients(); }, []);

    return { patients, loading, refresh: fetchPatients };
};