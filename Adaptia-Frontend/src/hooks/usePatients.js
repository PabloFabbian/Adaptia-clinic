import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export const usePatients = (onPatientFound) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();

    const fetchPatients = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3001/api/patients');
            const json = await res.json();
            const data = json.data || [];
            setPatients(data);

            const openId = searchParams.get('open');
            if (openId && onPatientFound) {
                const p = data.find(item => item.id.toString() === openId);
                if (p) onPatientFound(p);
            }
        } catch (error) {
            console.error("❌ Error en Adaptia Cloud Fetch:", error);
        } finally {
            setLoading(false);
        }
    }, [searchParams, onPatientFound]);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    return { patients, loading, refresh: fetchPatients };
};