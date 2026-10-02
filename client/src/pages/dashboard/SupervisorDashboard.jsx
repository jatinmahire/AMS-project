import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CalendarCheck } from 'lucide-react';
import { getSupervisorCounts, getRecentActivity } from '../../api/dashboard';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Button from '../../components/Button';
import RecentUpdatesCard from '../../components/RecentUpdatesCard';
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

      <div className="supervisor-dashboard-updates">
        <RecentUpdatesCard activity={activity} loading={activityLoading} />
      </div>
    </div>
  );
}
