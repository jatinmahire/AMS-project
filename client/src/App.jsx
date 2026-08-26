import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AppShell from './components/AppShell';

import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Designations from './pages/designations/Designations';
import LabourCategories from './pages/labourCategories/LabourCategories';
import Contractors from './pages/contractors/Contractors';
import ContractorForm from './pages/contractors/ContractorForm';
import Supervisors from './pages/supervisors/Supervisors';
import SupervisorForm from './pages/supervisors/SupervisorForm';
import Workers from './pages/workers/Workers';
import WorkerForm from './pages/workers/WorkerForm';
import KycLookup from './pages/kyc/KycLookup';
import Attendance from './pages/attendance/Attendance';
import Damages from './pages/damages/Damages';
import Fines from './pages/fines/Fines';
import Accidents from './pages/accidents/Accidents';
import Advances from './pages/advances/Advances';
import Overtimes from './pages/overtimes/Overtimes';
import Policies from './pages/policies/Policies';
import Holidays from './pages/holidays/Holidays';
import WorkerIdCard from './pages/reports/WorkerIdCard';
import NinetyDaysForm from './pages/reports/NinetyDaysForm';
import StatutoryRegisters from './pages/reports/StatutoryRegisters';
import MusterRoll from './pages/reports/MusterRoll';
import PfChalan from './pages/reports/PfChalan';

function Protected({ children }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />

              <Route path="/designations" element={<Protected><Designations /></Protected>} />
              <Route path="/labour-categories" element={<Protected><LabourCategories /></Protected>} />

              <Route path="/contractors" element={<Protected><Contractors /></Protected>} />
              <Route path="/contractors/new" element={<Protected><ContractorForm /></Protected>} />
              <Route path="/contractors/:id/edit" element={<Protected><ContractorForm /></Protected>} />

              <Route path="/supervisors" element={<Protected><Supervisors /></Protected>} />
              <Route path="/supervisors/new" element={<Protected><SupervisorForm /></Protected>} />
              <Route path="/supervisors/:id/edit" element={<Protected><SupervisorForm /></Protected>} />

              <Route path="/workers" element={<Protected><Workers /></Protected>} />
              <Route path="/workers/new" element={<Protected><WorkerForm /></Protected>} />
              <Route path="/workers/:id/edit" element={<Protected><WorkerForm /></Protected>} />

              <Route path="/kyc" element={<Protected><KycLookup /></Protected>} />
              <Route path="/attendance" element={<Protected><Attendance /></Protected>} />

              <Route path="/damages" element={<Protected><Damages /></Protected>} />
              <Route path="/fines" element={<Protected><Fines /></Protected>} />
              <Route path="/accidents" element={<Protected><Accidents /></Protected>} />
              <Route path="/advances" element={<Protected><Advances /></Protected>} />
              <Route path="/overtimes" element={<Protected><Overtimes /></Protected>} />

              <Route path="/reports/id-card" element={<Protected><WorkerIdCard /></Protected>} />
              <Route path="/reports/90-days" element={<Protected><NinetyDaysForm /></Protected>} />
              <Route path="/reports/statutory" element={<Protected><StatutoryRegisters /></Protected>} />
              <Route path="/reports/muster-roll" element={<Protected><MusterRoll /></Protected>} />
              <Route path="/reports/pf-chalan" element={<Protected><PfChalan /></Protected>} />

              <Route path="/policies" element={<Protected><Policies /></Protected>} />
              <Route path="/holidays" element={<Protected><Holidays /></Protected>} />

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
