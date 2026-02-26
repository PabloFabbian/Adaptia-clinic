import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppointments } from './hooks/useAppointments';
import { Layout } from './components/layout/Layout';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'sonner';

// --- PÁGINAS ---
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import SovereigntyPage from './pages/SovereigntyPage';
import { PatientsPage } from './pages/PatientsPage';
import { PatientHistoryPage } from './pages/PatientHistoryPage';
import { CalendarPage } from './pages/CalendarPage';
import { BookingPage } from './pages/BookingPage';
import { BillingPage } from './pages/BillingPage';
import { CategoriesPage } from './pages/SystemPages';
import Clinics from './pages/Clinics';
import { NewPatient } from './pages/NewPatient';
import { EditPatient } from './pages/EditPatient'; // <--- IMPORTACIÓN AÑADIDA
import { Login } from './pages/Login';

// --- UI & ICONS ---
import { PlaceholderPage } from './components/ui/PlaceholderPage';
import { Trash2, HeartHandshake, ClipboardList } from 'lucide-react';

const ProtectedRoute = ({ children, permission }) => {
  const { can, loading } = useAuth();
  if (loading) return null;

  if (permission && !can(permission)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const { user, loading } = useAuth();
  const { appointments, fetchAppointments } = useAppointments();

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-[#101828]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-[#50e3c2]/20 border-t-[#50e3c2] rounded-full animate-spin" />
          <div className="text-gray-400 dark:text-gray-500 font-medium italic animate-pulse tracking-[0.2em] text-[10px] uppercase">
            Sincronizando con Adaptia Cloud...
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />

        {!user ? (
          <Route path="*" element={<Navigate to="/login" replace />} />
        ) : (
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard user={user} appointments={appointments} />} />

            {/* SECCIÓN CLÍNICA */}
            <Route path="pacientes" element={
              <ProtectedRoute permission="patients.read">
                <PatientsPage />
              </ProtectedRoute>
            } />

            {/* NUEVA RUTA DE EDICIÓN AÑADIDA */}
            <Route path="pacientes/editar/:id" element={
              <ProtectedRoute permission="patients.write">
                <EditPatient />
              </ProtectedRoute>
            } />

            <Route path="pacientes/:id/historial" element={<PatientHistoryPage />} />

            <Route path="nuevo-paciente" element={
              <ProtectedRoute permission="patients.write">
                <NewPatient />
              </ProtectedRoute>
            } />

            <Route path="calendario" element={<CalendarPage />} />
            <Route path="agendar" element={<BookingPage />} />

            <Route path="notas" element={
              <ProtectedRoute permission="clinical_notes.read">
                <PlaceholderPage title="Notas Clínicas" icon={ClipboardList} />
              </ProtectedRoute>
            } />

            {/* SECCIÓN SOBERANÍA */}
            <Route path="mis-permisos" element={
              <ProtectedRoute permission="clinic.resources.manage">
                <SovereigntyPage fetchAppointments={fetchAppointments} />
              </ProtectedRoute>
            } />

            <Route path="supervision" element={
              <PlaceholderPage title="Espacio de Supervisión" icon={HeartHandshake}
                description="Módulo para compartir casos de forma anónima con supervisores." />
            } />

            {/* ADMINISTRACIÓN */}
            <Route path="facturacion" element={
              <ProtectedRoute permission="clinic.billing.read">
                <BillingPage mode="list" />
              </ProtectedRoute>
            } />

            {/* SISTEMA */}
            <Route path="clinicas" element={<Clinics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="categorias" element={<CategoriesPage />} />
            <Route path="papelera" element={<PlaceholderPage title="Papelera" icon={Trash2} color="bg-gray-700" />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </Router>
  );
}

export default App;