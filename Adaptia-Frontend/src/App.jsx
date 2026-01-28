import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAppointments } from './hooks/useAppointments';
import { Layout } from './components/layout/Layout';

// Imports de Páginas
import { PatientsPage } from './pages/PatientsPage';
import { AppointmentsPage } from './pages/AppointmentsPage'; // Deberías renombrar tu archivo actual
import { CalendarPage } from './pages/CalendarPage';
import { BillingPage } from './pages/BillingPage';
import { CategoriesPage } from './pages/SystemPages';
import Clinics from './pages/Clinics';
import { PermissionToggle } from './features/settings/PermissionToggle';
import { AppointmentTable } from './features/appointments/AppointmentTable';

// Iconos para el Dashboard
import { Calendar, Shield, Building2, Users, Clock, CreditCard, PlusCircle, UserPlus, Wallet, Layers, Receipt, Trash2 } from 'lucide-react';

function App() {
  const { appointments, user, fetchAppointments } = useAppointments();

  return (
    <Router>
      <Layout>
        <Routes>
          {/* GRUPO PRINCIPAL */}
          <Route path="/" element={<DashboardHome user={user} appointments={appointments} />} />
          <Route path="/pacientes" element={<PatientsPage />} />
          <Route path="/citas" element={<AppointmentsPage />} />
          <Route path="/calendario" element={<CalendarPage />} />
          <Route path="/facturacion" element={<BillingPage mode="list" />} />
          <Route path="/clinicas" element={<Clinics />} />

          {/* GRUPO ACCIONES */}
          <Route path="/agendar" element={<PlaceholderPage title="Agendar Cita" icon={PlusCircle} color="bg-blue-500" />} />
          <Route path="/nuevo-paciente" element={<PlaceholderPage title="Nuevo Paciente" icon={UserPlus} color="bg-orange-500" />} />
          <Route path="/registrar-gasto" element={<PlaceholderPage title="Registrar Gasto" icon={Wallet} color="bg-red-500" />} />

          {/* GRUPO SISTEMA */}
          <Route path="/settings" element={<SettingsView fetchAppointments={fetchAppointments} />} />
          <Route path="/categorias" element={<CategoriesPage />} />
          <Route path="/nueva-factura" element={<BillingPage mode="create" />} />
          <Route path="/papelera" element={<PlaceholderPage title="Papelera de Reciclaje" icon={Trash2} color="bg-gray-700" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

// --- COMPONENTES AUXILIARES PARA MANTENER APP.JSX LIMPIO ---

const DashboardHome = ({ user, appointments }) => (
  <div className="max-w-6xl mx-auto px-4">
    <header className="mb-10 pt-8">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg text-white"><Calendar className="w-6 h-6" /></div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agenda de {user || 'Luis David'}</h1>
          <p className="text-gray-600">Gestión centralizada de hoy</p>
        </div>
      </div>
    </header>
    <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
      <AppointmentTable appointments={appointments} />
    </div>
  </div>
);

const SettingsView = ({ fetchAppointments }) => (
  <div className="max-w-6xl mx-auto px-4 py-8">
    <header className="flex items-center gap-3 mb-8">
      <div className="p-2.5 bg-purple-600 rounded-xl text-white shadow-lg"><Shield className="w-6 h-6" /></div>
      <h1 className="text-3xl font-bold">Privacidad y Sistema</h1>
    </header>
    <div className="bg-white border rounded-2xl p-8 shadow-sm max-w-2xl">
      <PermissionToggle onUpdate={fetchAppointments} />
    </div>
  </div>
);

const PlaceholderPage = ({ title, icon: Icon, color }) => (
  <div className="max-w-6xl mx-auto px-4 py-8">
    <header className="flex items-center gap-3 mb-8">
      <div className={`p-2.5 ${color} rounded-xl text-white shadow-lg`}><Icon className="w-6 h-6" /></div>
      <h1 className="text-3xl font-bold">{title}</h1>
    </header>
    <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-20 text-center">
      <p className="text-gray-400 font-light">Módulo de {title} listo para conectar con el API de Neon.</p>
    </div>
  </div>
);

export default App;