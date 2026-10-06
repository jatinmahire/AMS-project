import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CalendarCheck } from 'lucide-react';
import { getSupervisorCounts, getRecentActivity, getRecentRegistrations } from '../../api/dashboard';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Button from '../../components/Button';
import RecentUpdatesCard from '../../components/RecentUpdatesCard';
import RecentRegistrationsCard from '../../components/RecentRegistrationsCard';
import AttendanceOverviewCard from '../../components/AttendanceOverviewCard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errorMessage';
import { displayName } from '../../utils/format';
import './SupervisorDashboard.css';

const CARDS = [
  { key: 'assignedWorkerCount', label: 'Assigned Workers', icon: Users },
  { key: 'activeTodayCount', label: "Today's Active Workers", icon: CalendarCheck },
];

export default function SupervisorDashboard() {
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    getSupervisorCounts()
      .then(setCounts)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));

    getRecentActivity(15)
      .then(setActivity)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setActivityLoading(false));

    getRecentRegistrations('WORKER')
      .then(setRegistrations)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setRegistrationsLoading(false));
  }, [showToast]);

  return (
    <div>
      <PageHeader
        centered
        title={`Welcome, ${displayName(user)}`}
        description="Your assigned workforce and today's attendance."
      />

      <div className="supervisor-dashboard-cards-grid">
        {CARDS.map((card) => (
          <StatCard key={card.key} label={card.label} icon={card.icon} value={loading ? '-' : counts?.[card.key] ?? 0} />
        ))}
      </div>

      <div className="supervisor-dashboard-action-row">
        <Button className="supervisor-dashboard-action-button" icon={CalendarCheck} onClick={() => navigate('/attendance/new')}>
          Mark Daily Attendance
        </Button>
      </div>

      <div className="supervisor-dashboard-feature-row">
        <RecentRegistrationsCard items={registrations} loading={registrationsLoading} type="WORKER" showTypeFilter={false} />
        <RecentUpdatesCard activity={activity} loading={activityLoading} />
        <AttendanceOverviewCard />
      </div>
    </div>
  );
}
