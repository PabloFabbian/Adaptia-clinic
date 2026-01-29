import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppointments } from './hooks/useAppointments';
import { Layout } from './components/layout/Layout';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'sonner'; // <--- Importación de Sonner

// Páginas
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import { PatientsPage } from './pages/PatientsPage';
import { PatientHistoryPage } from './pages/PatientHistoryPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { CalendarPage } from './pages/CalendarPage';
import { BillingPage } from './pages/BillingPage';
import { CategoriesPage } from './pages/SystemPages';
import Clinics from './pages/Clinics';
import { NewPatient } from './pages/NewPatient';
import { Login } from './pages/Login';

// UI
import { PlaceholderPage } from './components/ui/PlaceholderPage';
import { PlusCircle, Wallet, Trash2 } from 'lucide-react';

function App() {
  const { user, loading } = useAuth();
  const { appointments, fetchAppointments } = useAppointments();

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <div className="text-gray-400 font-medium italic animate-pulse tracking-widest text-sm uppercase">
          Sincronizando con Adaptia Cloud...
        </div>
      </div>
    );
  }

  return (
    <Router>
      {/* Configuración de Toaster: 
          - expand: permite ver múltiples notificaciones
          - richColors: para que los estados (success/error) tengan color
          - closeButton: permite cerrar manualmente
      */}
      <Toaster
        position="top-right"
        expand={false}
        richColors
        closeButton
        toastOptions={{
          style: { borderRadius: '1.25rem', padding: '1rem' },
        }}
      />

      <Routes>
        {!user ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <Route path="/" element={<Layout />}>
            {/* Vistas Principales */}
            <Route index element={<Dashboard user={user} appointments={appointments} />} />

            {/* Gestión de Pacientes */}
            <Route path="pacientes" element={<PatientsPage />} />
            <Route path="pacientes/:id/historial" element={<PatientHistoryPage />} />
            <Route path="nuevo-paciente" element={<NewPatient />} />

            {/* Gestión Operativa */}
            <Route path="citas" element={<AppointmentsPage />} />
            <Route path="calendario" element={<CalendarPage />} />
            <Route path="facturacion" element={<BillingPage mode="list" />} />
            <Route path="nueva-factura" element={<BillingPage mode="create" />} />

            {/* Configuración y Sistema */}
            <Route path="clinicas" element={<Clinics />} />
            <Route path="settings" element={<Settings fetchAppointments={fetchAppointments} />} />
            <Route path="categorias" element={<CategoriesPage />} />

            {/* Accesos Rápidos */}
            <Route path="agendar" element={<PlaceholderPage title="Agendar Cita" icon={PlusCircle} color="bg-blue-500" />} />
            <Route path="registrar-gasto" element={<PlaceholderPage title="Registrar Gasto" icon={Wallet} color="bg-red-500" />} />
            <Route path="papelera" element={<PlaceholderPage title="Papelera" icon={Trash2} color="bg-gray-700" />} />

            {/* Redirección de seguridad */}
            <Route path="login" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </Router>
  );
}

export default App;