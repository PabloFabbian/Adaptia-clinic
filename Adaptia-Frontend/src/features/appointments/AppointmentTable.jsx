export const AppointmentTable = ({ appointments }) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>Paciente</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                {appointments.map(appo => (
                    <tr key={appo.id}>
                        <td>{appo.patientName}</td>
                        <td>{appo.date}</td>
                        <td>{appo.ownerId === 1 ? 'Propia' : 'Compartida'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};