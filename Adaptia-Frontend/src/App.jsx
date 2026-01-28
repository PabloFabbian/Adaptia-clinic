import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAppointments } from './hooks/useAppointments';
import { Layout } from './components/layout/Layout';
import { AppointmentTable } from './features/appointments/AppointmentTable';
import { PermissionToggle } from './features/settings/PermissionToggle';
import Clinics from './pages/Clinics';
import { PatientsPage } from './pages/PatientsPage'; // Importamos tu nueva página
import { Calendar, Shield, Building2, Users } from 'lucide-react'; // Añadimos Users

function App() {
  const { appointments, user, fetchAppointments } = useAppointments();

  return (
    <Router>
      <Layout>
        <Routes>

          {/* RUTA: INICIO / DASHBOARD */}
          <Route path="/" element={
            <div className="max-w-6xl mx-auto px-4">
              <header className="mb-10 pt-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Agenda de {user || 'Luis David'}
                    </h1>
                    <p className="text-gray-600 mt-0.5">Gestiona las citas y pacientes de hoy</p>
                  </div>
                </div>
              </header>

              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:shadow-gray-100/70 transition-all duration-300">
                <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <h3 className="font-semibold text-base text-gray-800 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                    Citas Programadas
                  </h3>
                </div>
                <AppointmentTable appointments={appointments} />
              </div>
            </div>
          } />

          {/* RUTA: PACIENTES (NUEVA) */}
          <Route path="/pacientes" element={
            <div className="max-w-6xl mx-auto px-4">
              <header className="mb-10 pt-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-500/30">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Gestión de Pacientes
                    </h1>
                    <p className="text-gray-600 mt-0.5">Historial clínico y base de datos en la nube</p>
                  </div>
                </div>
              </header>
              {/* Llamamos al componente que creamos antes */}
              <PatientsPage />
            </div>
          } />

          {/* RUTA: CLÍNICAS */}
          <Route path="/clinicas" element={
            <div className="max-w-6xl mx-auto px-4">
              <header className="mb-10 pt-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/30">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Clínicas
                    </h1>
                    <p className="text-gray-600 mt-0.5">Gestiona tus centros médicos</p>
                  </div>
                </div>
              </header>
              <Clinics />
            </div>
          } />

          {/* RUTA: AJUSTES / DISPONIBILIDAD */}
          <Route path="/settings" element={
            <div className="max-w-6xl mx-auto px-4">
              <header className="mb-10 pt-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/30">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Privacidad y Permisos
                    </h1>
                    <p className="text-gray-600 mt-0.5">Control de acceso a la información clínica</p>
                  </div>
                </div>
              </header>

              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:shadow-gray-100/70 transition-all duration-300">
                <div className="max-w-2xl">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                      <Shield className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2 text-gray-900">Consentimiento de Esteban</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Al activar esta option, permites que otros especialistas vean tus citas compartidas
                        según las reglas de visibilidad de Adaptia.
                      </p>
                    </div>
                  </div>
                  <div className="pl-16">
                    <PermissionToggle onUpdate={fetchAppointments} />
                  </div>
                </div>
              </div>
            </div>
          } />

        </Routes>
      </Layout>
    </Router>
  );
}

export default App;