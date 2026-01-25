import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useAppointments } from './hooks/useAppointments';
import { AppointmentTable } from './components/AppointmentTable';
import { PermissionToggle } from './components/PermissionToggle';

function App() {
  const { appointments, user, fetchAppointments } = useAppointments();

  return (
    <Router>
      <nav>
        {/* Aquí puedes aplicar tu diseño de Sidebar o Navbar */}
        <Link to="/">Citas</Link> | <Link to="/settings">Privacidad</Link>
      </nav>

      <Routes>
        {/* RUTA PRINCIPAL: AGENDA */}
        <Route path="/" element={
          <section>
            <h1>Agenda de {user}</h1>
            <AppointmentTable appointments={appointments} />
          </section>
        } />

        {/* RUTA DE CONFIGURACIÓN: PERMISOS */}
        <Route path="/settings" element={
          <section>
            <h1>Configuración de Permisos</h1>
            <p>Gestiona quién puede ver tus citas en la clínica.</p>
            <PermissionToggle onUpdate={fetchAppointments} />
          </section>
        } />
      </Routes>
    </Router>
  );
}

export default App;