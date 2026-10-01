import { useEffect, useState } from 'react';
import { Users, CalendarCheck } from 'lucide-react';
import { getContractorCounts, getRecentActivity } from '../../api/dashboard';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import RecentUpdatesCard from '../../components/RecentUpdatesCard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errorMessage';
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
  }, [showToast]);

  return (
    <div>
      <PageHeader
        centered
        title={`Welcome, ${user?.fullName || user?.loginId}`}
        description="Your registered workforce and today's attendance."
      />

      <div className="contractor-dashboard-cards-grid">
        {CARDS.map((card) => (
          <StatCard key={card.key} label={card.label} icon={card.icon} value={loading ? '-' : counts?.[card.key] ?? 0} />
        ))}
      </div>

      <div className="contractor-dashboard-updates">
        <RecentUpdatesCard activity={activity} loading={activityLoading} />
      </div>
    </div>
  );
}
