import { useEffect, useState } from 'react';
import { Users, CalendarCheck } from 'lucide-react';
import { getContractorCounts, getRecentActivity, getRecentRegistrations } from '../../api/dashboard';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import RecentUpdatesCard from '../../components/RecentUpdatesCard';
import RecentRegistrationsCard from '../../components/RecentRegistrationsCard';
import AttendanceOverviewCard from '../../components/AttendanceOverviewCard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errorMessage';
import { displayName } from '../../utils/format';
import './ContractorDashboard.css';

const CARDS = [
  { key: 'totalWorkerCount', label: 'Registered Workers', icon: Users },
  { key: 'presentTodayCount', label: "Today's Present Workers", icon: CalendarCheck },
];

export default function ContractorDashboard() {
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    getContractorCounts()
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
        description="Your registered workforce and today's attendance."
      />

      <div className="contractor-dashboard-cards-grid">
        {CARDS.map((card) => (
          <StatCard key={card.key} label={card.label} icon={card.icon} value={loading ? '-' : counts?.[card.key] ?? 0} />
        ))}
      </div>

      <div className="contractor-dashboard-feature-row">
        <RecentRegistrationsCard items={registrations} loading={registrationsLoading} type="WORKER" showTypeFilter={false} />
        <RecentUpdatesCard activity={activity} loading={activityLoading} />
        <AttendanceOverviewCard />
      </div>
    </div>
  );
}
