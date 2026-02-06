import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export const usePatients = (clinicId, userId, onPatientFound) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();

    const fetchPatients = useCallback(async () => {
        // Evitamos peticiones innecesarias si el contexto de Auth aún no está listo
        if (!clinicId || !userId) return;

        setLoading(true);
        try {
            // Pasamos los parámetros de identidad y clínica en la URL
            const res = await fetch(`http://localhost:3001/api/patients?clinicId=${clinicId}&userId=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const json = await res.json();
            const data = json.data || [];
            setPatients(data);

            // Lógica para abrir un paciente específico desde la URL (ej: ?open=123)
            const openId = searchParams.get('open');
            if (openId && onPatientFound) {
                const p = data.find(item => item.id.toString() === openId);
                if (p) onPatientFound(p);
            }
        } catch (error) {
            console.error("❌ Error en Adaptia Cloud Fetch:", error);
            setPatients([]);
        } finally {
            setLoading(false);
        }
    }, [clinicId, userId, searchParams, onPatientFound]);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    return { patients, loading, refresh: fetchPatients };
};