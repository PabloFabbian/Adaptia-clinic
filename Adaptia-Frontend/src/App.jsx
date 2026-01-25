import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAppointments } from './hooks/useAppointments';
import { AppointmentTable } from './components/AppointmentTable';
import { PermissionToggle } from './components/PermissionToggle';
import { Layout } from './components/layout/Layout'; // Importamos el nuevo Layout

function App() {
  const { appointments, user, fetchAppointments } = useAppointments();

  return (
    <Router>
      {/* El Layout contiene el Sidebar y define la estructura de dos columnas */}
      <Layout>
        <Routes>

          {/* RUTA PRINCIPAL: DASHBOARD DE CITAS */}
          <Route path="/" element={
            <section>
              <h1 className="text-2xl font-bold mb-4 text-gray-800">
                Agenda de {user || 'Cargando...'}
              </h1>
              <div className="bg-white shadow rounded-lg p-4">
                <AppointmentTable appointments={appointments} />
              </div>
            </section>
          } />

          {/* RUTA DE CONFIGURACIÓN: PERMISOS */}
          <Route path="/settings" element={
            <section>
              <h1 className="text-2xl font-bold mb-4 text-gray-800">
                Configuración de Privacidad
              </h1>
              <div className="bg-white shadow rounded-lg p-6">
                <p className="text-gray-600 mb-6">
                  Gestiona quién puede ver tus citas en la clínica.
                </p>
                <PermissionToggle onUpdate={fetchAppointments} />
              </div>
            </section>
          } />

        </Routes>
      </Layout>
    </Router>
  );
}

export default App;