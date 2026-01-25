// src/App.jsx
import { useAppointments } from './hooks/useAppointments';
import { AppointmentTable } from './components/AppointmentTable';
import { PermissionToggle } from './components/PermissionToggle';

function App() {
  const { appointments, user, fetchAppointments } = useAppointments();

  return (
    <main>
      <header>
        <h1>Adaptia Clinic</h1>
        {user && <p>Sesión iniciada: {user}</p>}
      </header>

      <section>
        <h2>Panel de Citas</h2>
        <AppointmentTable appointments={appointments} />
      </section>

      <aside>
        <h2>Configuración de Permisos</h2>
        <PermissionToggle onUpdate={fetchAppointments} />
      </aside>
    </main>
  );
}

export default App;