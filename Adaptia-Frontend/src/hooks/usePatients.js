import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export const usePatients = (clinicId, userId, onPatientFound) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();

    const fetchPatients = useCallback(async () => {
        if (!clinicId || !userId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(
                `http://localhost:3001/api/patients?clinicId=${clinicId}&userId=${userId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `HTTP Error: ${res.status}`);
            }

            const json = await res.json();
            const data = json.data || [];

            setPatients(data);

            // Manejo de Deep Linking
            const openId = searchParams.get('open');
            if (openId && onPatientFound && data.length > 0) {
                const p = data.find(item => item.id.toString() === openId);
                if (p) onPatientFound(p);
            }
        } catch (error) {
            console.error("❌ Error en usePatients Hook:", error.message);
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