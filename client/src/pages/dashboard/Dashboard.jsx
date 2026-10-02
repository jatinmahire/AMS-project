import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, UserCheck, CalendarCheck } from 'lucide-react';
import { getCounts, getRecentActivity, getRecentRegistrations } from '../../api/dashboard';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import RecentUpdatesCard from '../../components/RecentUpdatesCard';
import RecentRegistrationsCard from '../../components/RecentRegistrationsCard';
import AttendanceOverviewCard from '../../components/AttendanceOverviewCard';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errorMessage';
import './Dashboard.css';

const CARDS = [
  { key: 'contractorCount', label: 'Contractors', icon: Building2, to: '/contractors' },
  { key: 'supervisorCount', label: 'Supervisors', icon: UserCheck, to: '/supervisors' },
  { key: 'workerCount', label: 'Workers', icon: Users, to: '/workers' },
  { key: 'presentTodayCount', label: "Today's Present Workers", icon: CalendarCheck, to: '/attendance' },
];

const QUICK_ACTIONS = [
  { label: 'Mark Attendance', icon: CalendarCheck, to: '/attendance/new' },
];

export default function Dashboard() {
  const [counts, setCounts] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [registrationType, setRegistrationType] = useState('ALL');
  const [registrations, setRegistrations] = useState([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    getCounts()
      .then(setCounts)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));

    getRecentActivity(15)
      .then(setActivity)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setActivityLoading(false));
  }, [showToast]);

  useEffect(() => {
    setRegistrationsLoading(true);
    getRecentRegistrations(registrationType)
      .then(setRegistrations)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setRegistrationsLoading(false));
  }, [registrationType, showToast]);

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of workforce and today's attendance." />

      <div className="dashboard-cards-grid">
        {CARDS.map((card) => (
          <StatCard
            key={card.key}
            label={card.label}
            icon={card.icon}
            value={loading ? '-' : counts?.[card.key] ?? 0}
            onClick={() => navigate(card.to)}
          />
        ))}
      </div>

      <div className="dashboard-quick-actions">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.to)}
            className="dashboard-quick-action-button"
          >
            <action.icon size={16} className="dashboard-quick-action-icon" />
            {action.label}
          </button>
        ))}
      </div>

      <div className="dashboard-feature-row">
        <RecentRegistrationsCard
          items={registrations}
          loading={registrationsLoading}
          type={registrationType}
          onTypeChange={setRegistrationType}
        />
        <RecentUpdatesCard activity={activity} loading={activityLoading} />
        <AttendanceOverviewCard />
      </div>
    </div>
  );
}
