import { useState, useEffect } from 'react';

export const useAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [user, setUser] = useState(null);

    const fetchAppointments = async () => {
        try {
            const res = await fetch('http://localhost:3000/appointments');
            const data = await res.json();
            setAppointments(data.data);
            setUser(data.user);
        } catch (err) {
            console.error("Error cargando citas", err);
        }
    };

    useEffect(() => { fetchAppointments(); }, []);

    return { appointments, user, fetchAppointments };
};