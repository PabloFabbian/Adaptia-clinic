import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppointments } from './hooks/useAppointments';
import { Layout } from './components/layout/Layout';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'sonner';

// --- PÁGINAS ---
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

// --- UI & ICONS ---
import { PlaceholderPage } from './components/ui/PlaceholderPage';
import { PlusCircle, Wallet, Trash2 } from 'lucide-react';

function App() {
  const { user, loading } = useAuth();
  const { appointments, fetchAppointments } = useAppointments();

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-dark-bg transition-colors duration-500">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-adaptia-blue/20 border-t-adaptia-blue rounded-full animate-spin" />
          <div className="text-gray-400 dark:text-gray-500 font-medium italic animate-pulse tracking-widest text-xs uppercase">
            Sincronizando con Adaptia Cloud...
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster
        position="top-right"
        expand={false}
        richColors
        closeButton
        toastOptions={{
          style: {
            borderRadius: '1.25rem',
            padding: '1rem',
            background: 'var(--toast-bg)',
          },
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
            {/* VISTA PRINCIPAL */}
            <Route index element={<Dashboard user={user} appointments={appointments} />} />

            {/* GESTIÓN DE PACIENTES */}
            <Route path="pacientes">
              <Route index element={<PatientsPage />} />
              <Route path=":id/historial" element={<PatientHistoryPage />} />
              {/* Ruta corregida para que coincida con la navegación del Panel */}
              <Route path="editar/:id" element={<NewPatient />} />
            </Route>

            {/* Crear nuevo paciente (fuera del grupo /pacientes para mantener url limpia) */}
            <Route path="nuevo-paciente" element={<NewPatient />} />

            {/* GESTIÓN OPERATIVA */}
            <Route path="citas" element={<AppointmentsPage />} />
            <Route path="calendario" element={<CalendarPage />} />

            {/* FINANZAS */}
            <Route path="facturacion" element={<BillingPage mode="list" />} />
            <Route path="nueva-factura" element={<BillingPage mode="create" />} />

            {/* CONFIGURACIÓN Y SISTEMA */}
            <Route path="clinicas" element={<Clinics />} />
            <Route path="settings" element={<Settings fetchAppointments={fetchAppointments} />} />
            <Route path="categorias" element={<CategoriesPage />} />

            {/* ACCESOS RÁPIDOS */}
            <Route path="agendar" element={<PlaceholderPage title="Agendar Cita" icon={PlusCircle} color="bg-blue-500" />} />
            <Route path="registrar-gasto" element={<PlaceholderPage title="Registrar Gasto" icon={Wallet} color="bg-red-500" />} />
            <Route path="papelera" element={<PlaceholderPage title="Papelera" icon={Trash2} color="bg-gray-700" />} />

            {/* SEGURIDAD */}
            <Route path="login" element={<Navigate to="/" replace />} />

            {/* Fallback para rutas no encontradas dentro del layout */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </Router>
  );
}

export default App;