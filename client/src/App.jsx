import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AppShell from './components/AppShell';
const NotFound = lazy(() => import('./pages/NotFound'));

const Login = lazy(() => import('./pages/auth/Login'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const SupervisorDashboard = lazy(() => import('./pages/dashboard/SupervisorDashboard'));
const ContractorDashboard = lazy(() => import('./pages/dashboard/ContractorDashboard'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const Designations = lazy(() => import('./pages/designations/Designations'));
const DesignationForm = lazy(() => import('./pages/designations/DesignationForm'));
const DesignationView = lazy(() => import('./pages/designations/DesignationView'));
const LabourCategories = lazy(() => import('./pages/labourCategories/LabourCategories'));
const LabourCategoryForm = lazy(() => import('./pages/labourCategories/LabourCategoryForm'));
const LabourCategoryView = lazy(() => import('./pages/labourCategories/LabourCategoryView'));
const Contractors = lazy(() => import('./pages/contractors/Contractors'));
const ContractorForm = lazy(() => import('./pages/contractors/ContractorForm'));
const ContractorView = lazy(() => import('./pages/contractors/ContractorView'));
const Supervisors = lazy(() => import('./pages/supervisors/Supervisors'));
const SupervisorForm = lazy(() => import('./pages/supervisors/SupervisorForm'));
const SupervisorView = lazy(() => import('./pages/supervisors/SupervisorView'));
const Workers = lazy(() => import('./pages/workers/Workers'));
const VerificationList = lazy(() => import('./pages/verifications/VerificationList'));
const VerificationForm = lazy(() => import('./pages/verifications/VerificationForm'));
const WorkerForm = lazy(() => import('./pages/workers/WorkerForm'));
const WorkerView = lazy(() => import('./pages/workers/WorkerView'));
const KycLookup = lazy(() => import('./pages/kyc/KycLookup'));
const Attendance = lazy(() => import('./pages/attendance/Attendance'));
const AttendanceForm = lazy(() => import('./pages/attendance/AttendanceForm'));
const AttendanceView = lazy(() => import('./pages/attendance/AttendanceView'));
const GateLogs = lazy(() => import('./pages/gateLogs/GateLogs'));
const GateLogForm = lazy(() => import('./pages/gateLogs/GateLogForm'));
const Damages = lazy(() => import('./pages/damages/Damages'));
const DamageForm = lazy(() => import('./pages/damages/DamageForm'));
const DamageView = lazy(() => import('./pages/damages/DamageView'));
const Fines = lazy(() => import('./pages/fines/Fines'));
const FineForm = lazy(() => import('./pages/fines/FineForm'));
const FineView = lazy(() => import('./pages/fines/FineView'));
const Accidents = lazy(() => import('./pages/accidents/Accidents'));
const AccidentForm = lazy(() => import('./pages/accidents/AccidentForm'));
const AccidentView = lazy(() => import('./pages/accidents/AccidentView'));
const Advances = lazy(() => import('./pages/advances/Advances'));
const AdvanceForm = lazy(() => import('./pages/advances/AdvanceForm'));
const AdvanceView = lazy(() => import('./pages/advances/AdvanceView'));
const Overtimes = lazy(() => import('./pages/overtimes/Overtimes'));
const OvertimeForm = lazy(() => import('./pages/overtimes/OvertimeForm'));
const OvertimeView = lazy(() => import('./pages/overtimes/OvertimeView'));
const Policies = lazy(() => import('./pages/policies/Policies'));
const PolicyForm = lazy(() => import('./pages/policies/PolicyForm'));
const PolicyView = lazy(() => import('./pages/policies/PolicyView'));
const Holidays = lazy(() => import('./pages/holidays/Holidays'));
const HolidayForm = lazy(() => import('./pages/holidays/HolidayForm'));
const HolidayView = lazy(() => import('./pages/holidays/HolidayView'));
const Notifications = lazy(() => import('./pages/notifications/Notifications'));
const ActivityLog = lazy(() => import('./pages/activity/ActivityLog'));
const WorkerIdCard = lazy(() => import('./pages/reports/WorkerIdCard'));
const NinetyDaysForm = lazy(() => import('./pages/reports/NinetyDaysForm'));
const StatutoryRegisters = lazy(() => import('./pages/reports/StatutoryRegisters'));
const MusterRoll = lazy(() => import('./pages/reports/MusterRoll'));
const PfChalan = lazy(() => import('./pages/reports/PfChalan'));

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
          <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
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
            <Route path="/verifications/:type" element={<Protected roles={SHARED_ROLES}><VerificationList /></Protected>} />
            <Route path="/verifications/:type/:workerId" element={<Protected roles={SHARED_ROLES}><VerificationForm /></Protected>} />
            <Route path="/workers/:id/edit" element={<Protected><WorkerForm /></Protected>} />
            <Route path="/workers/:id" element={<Protected roles={ALL_ROLES}><WorkerView /></Protected>} />

            <Route path="/kyc" element={<Protected roles={ALL_ROLES}><KycLookup /></Protected>} />
            <Route path="/attendance" element={<Protected roles={ALL_ROLES}><Attendance /></Protected>} />
            <Route path="/attendance/new" element={<Protected roles={ALL_ROLES}><AttendanceForm /></Protected>} />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
