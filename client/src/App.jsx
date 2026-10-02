import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AppShell from './components/AppShell';

import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import SupervisorDashboard from './pages/dashboard/SupervisorDashboard';
import ContractorDashboard from './pages/dashboard/ContractorDashboard';
import ProfilePage from './pages/profile/ProfilePage';
import Designations from './pages/designations/Designations';
import DesignationForm from './pages/designations/DesignationForm';
import DesignationView from './pages/designations/DesignationView';
import LabourCategories from './pages/labourCategories/LabourCategories';
import LabourCategoryForm from './pages/labourCategories/LabourCategoryForm';
import LabourCategoryView from './pages/labourCategories/LabourCategoryView';
import Contractors from './pages/contractors/Contractors';
import ContractorForm from './pages/contractors/ContractorForm';
import ContractorView from './pages/contractors/ContractorView';
import Supervisors from './pages/supervisors/Supervisors';
import SupervisorForm from './pages/supervisors/SupervisorForm';
import SupervisorView from './pages/supervisors/SupervisorView';
import Workers from './pages/workers/Workers';
import WorkerForm from './pages/workers/WorkerForm';
import WorkerView from './pages/workers/WorkerView';
import KycLookup from './pages/kyc/KycLookup';
import Attendance from './pages/attendance/Attendance';
import AttendanceForm from './pages/attendance/AttendanceForm';
import AttendanceView from './pages/attendance/AttendanceView';
import GateLogs from './pages/gateLogs/GateLogs';
import GateLogForm from './pages/gateLogs/GateLogForm';
import Damages from './pages/damages/Damages';
import DamageForm from './pages/damages/DamageForm';
import DamageView from './pages/damages/DamageView';
import Fines from './pages/fines/Fines';
import FineForm from './pages/fines/FineForm';
import FineView from './pages/fines/FineView';
import Accidents from './pages/accidents/Accidents';
import AccidentForm from './pages/accidents/AccidentForm';
import AccidentView from './pages/accidents/AccidentView';
import Advances from './pages/advances/Advances';
import AdvanceForm from './pages/advances/AdvanceForm';
import AdvanceView from './pages/advances/AdvanceView';
import Overtimes from './pages/overtimes/Overtimes';
import OvertimeForm from './pages/overtimes/OvertimeForm';
import OvertimeView from './pages/overtimes/OvertimeView';
import Policies from './pages/policies/Policies';
import PolicyForm from './pages/policies/PolicyForm';
import PolicyView from './pages/policies/PolicyView';
import Holidays from './pages/holidays/Holidays';
import HolidayForm from './pages/holidays/HolidayForm';
import HolidayView from './pages/holidays/HolidayView';
import Notifications from './pages/notifications/Notifications';
import ActivityLog from './pages/activity/ActivityLog';
import WorkerIdCard from './pages/reports/WorkerIdCard';
import NinetyDaysForm from './pages/reports/NinetyDaysForm';
import StatutoryRegisters from './pages/reports/StatutoryRegisters';
import MusterRoll from './pages/reports/MusterRoll';
import PfChalan from './pages/reports/PfChalan';

function Protected({ children, roles = ['ADMIN'] }) {
  return (
    <ProtectedRoute roles={roles}>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}

const SHARED_ROLES = ['ADMIN', 'SUPERVISOR'];
const ALL_ROLES = ['ADMIN', 'SUPERVISOR', 'CONTRACTOR'];
const POLICY_VIEW_ROLES = ['ADMIN', 'CONTRACTOR'];

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/supervisor/dashboard" element={<Protected roles={['SUPERVISOR']}><SupervisorDashboard /></Protected>} />
            <Route path="/contractor/dashboard" element={<Protected roles={['CONTRACTOR']}><ContractorDashboard /></Protected>} />
            <Route path="/profile" element={<Protected roles={ALL_ROLES}><ProfilePage /></Protected>} />
            <Route path="/notifications" element={<Protected roles={ALL_ROLES}><Notifications /></Protected>} />
            <Route path="/activity" element={<Protected roles={ALL_ROLES}><ActivityLog /></Protected>} />

            <Route path="/designations" element={<Protected><Designations /></Protected>} />
            <Route path="/designations/new" element={<Protected><DesignationForm /></Protected>} />
            <Route path="/designations/:id/edit" element={<Protected><DesignationForm /></Protected>} />
            <Route path="/designations/:id" element={<Protected><DesignationView /></Protected>} />
            <Route path="/labour-categories" element={<Protected><LabourCategories /></Protected>} />
            <Route path="/labour-categories/new" element={<Protected><LabourCategoryForm /></Protected>} />
            <Route path="/labour-categories/:id/edit" element={<Protected><LabourCategoryForm /></Protected>} />
            <Route path="/labour-categories/:id" element={<Protected><LabourCategoryView /></Protected>} />

            <Route path="/contractors" element={<Protected><Contractors /></Protected>} />
            <Route path="/contractors/new" element={<Protected><ContractorForm /></Protected>} />
            <Route path="/contractors/:id/edit" element={<Protected><ContractorForm /></Protected>} />
            <Route path="/contractors/:id" element={<Protected><ContractorView /></Protected>} />

            <Route path="/supervisors" element={<Protected><Supervisors /></Protected>} />
            <Route path="/supervisors/new" element={<Protected><SupervisorForm /></Protected>} />
            <Route path="/supervisors/:id/edit" element={<Protected><SupervisorForm /></Protected>} />
            <Route path="/supervisors/:id" element={<Protected><SupervisorView /></Protected>} />

            <Route path="/workers" element={<Protected roles={['ADMIN', 'CONTRACTOR']}><Workers /></Protected>} />
            <Route path="/workers/new" element={<Protected roles={ALL_ROLES}><WorkerForm /></Protected>} />
            <Route path="/workers/:id/edit" element={<Protected><WorkerForm /></Protected>} />
            <Route path="/workers/:id" element={<Protected roles={ALL_ROLES}><WorkerView /></Protected>} />

            <Route path="/kyc" element={<Protected roles={ALL_ROLES}><KycLookup /></Protected>} />
            <Route path="/attendance" element={<Protected roles={ALL_ROLES}><Attendance /></Protected>} />
            <Route path="/attendance/new" element={<Protected roles={SHARED_ROLES}><AttendanceForm /></Protected>} />
            <Route path="/attendance/:id/edit" element={<Protected roles={SHARED_ROLES}><AttendanceForm /></Protected>} />
            <Route path="/attendance/:id" element={<Protected roles={ALL_ROLES}><AttendanceView /></Protected>} />
            <Route path="/gate-logs" element={<Protected><GateLogs /></Protected>} />
            <Route path="/gate-logs/new" element={<Protected><GateLogForm /></Protected>} />

            <Route path="/damages" element={<Protected><Damages /></Protected>} />
            <Route path="/damages/new" element={<Protected><DamageForm /></Protected>} />
            <Route path="/damages/:id/edit" element={<Protected><DamageForm /></Protected>} />
            <Route path="/damages/:id" element={<Protected><DamageView /></Protected>} />
            <Route path="/fines" element={<Protected><Fines /></Protected>} />
            <Route path="/fines/new" element={<Protected><FineForm /></Protected>} />
            <Route path="/fines/:id/edit" element={<Protected><FineForm /></Protected>} />
            <Route path="/fines/:id" element={<Protected><FineView /></Protected>} />
            <Route path="/accidents" element={<Protected><Accidents /></Protected>} />
            <Route path="/accidents/new" element={<Protected><AccidentForm /></Protected>} />
            <Route path="/accidents/:id/edit" element={<Protected><AccidentForm /></Protected>} />
            <Route path="/accidents/:id" element={<Protected><AccidentView /></Protected>} />
            <Route path="/advances" element={<Protected><Advances /></Protected>} />
            <Route path="/advances/new" element={<Protected><AdvanceForm /></Protected>} />
            <Route path="/advances/:id/edit" element={<Protected><AdvanceForm /></Protected>} />
            <Route path="/advances/:id" element={<Protected><AdvanceView /></Protected>} />
            <Route path="/overtimes" element={<Protected><Overtimes /></Protected>} />
            <Route path="/overtimes/new" element={<Protected><OvertimeForm /></Protected>} />
            <Route path="/overtimes/:id/edit" element={<Protected><OvertimeForm /></Protected>} />
            <Route path="/overtimes/:id" element={<Protected><OvertimeView /></Protected>} />

            <Route path="/reports/id-card" element={<Protected><WorkerIdCard /></Protected>} />
            <Route path="/reports/90-days" element={<Protected roles={SHARED_ROLES}><NinetyDaysForm /></Protected>} />
            <Route path="/reports/90-days/:workerCode" element={<Protected roles={SHARED_ROLES}><NinetyDaysForm /></Protected>} />
            <Route path="/reports/statutory" element={<Protected><StatutoryRegisters /></Protected>} />
            <Route path="/reports/muster-roll" element={<Protected><MusterRoll /></Protected>} />
            <Route path="/reports/pf-chalan" element={<Protected><PfChalan /></Protected>} />

            <Route path="/policies" element={<Protected roles={POLICY_VIEW_ROLES}><Policies /></Protected>} />
            <Route path="/policies/new" element={<Protected><PolicyForm /></Protected>} />
            <Route path="/policies/:id/edit" element={<Protected><PolicyForm /></Protected>} />
            <Route path="/policies/:id" element={<Protected roles={POLICY_VIEW_ROLES}><PolicyView /></Protected>} />
            <Route path="/holidays" element={<Protected><Holidays /></Protected>} />
            <Route path="/holidays/new" element={<Protected><HolidayForm /></Protected>} />
            <Route path="/holidays/:id/edit" element={<Protected><HolidayForm /></Protected>} />
            <Route path="/holidays/:id" element={<Protected><HolidayView /></Protected>} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
