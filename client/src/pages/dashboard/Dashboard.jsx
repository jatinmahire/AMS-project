import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, UserCheck, CalendarCheck, ArrowUpRight } from 'lucide-react';
import { getCounts } from '../../api/dashboard';
import Button from '../../components/Button';
import PageHeader from '../../components/PageHeader';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errorMessage';

const CARDS = [
  {
    key: 'contractorCount',
    label: 'Contractors',
    icon: Building2,
    color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10',
  },
  {
    key: 'supervisorCount',
    label: 'Supervisors',
    icon: UserCheck,
    color: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-500/10',
  },
  {
    key: 'workerCount',
    label: 'Workers',
    icon: Users,
    color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10',
  },
  {
    key: 'presentTodayCount',
    label: "Today's Present Workers",
    icon: CalendarCheck,
    color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10',
  },
];

export default function Dashboard() {
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    getCounts()
      .then(setCounts)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of workforce and today's attendance."
        action={
          <Button icon={ArrowUpRight} onClick={() => navigate('/attendance')}>
            Go to Daily Attendance
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card) => (
          <div
            key={card.key}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className={`mb-3 inline-flex rounded-lg p-2.5 ${card.color}`}>
              <card.icon size={20} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              {loading ? (
                <span className="inline-block h-8 w-14 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              ) : (
                (counts?.[card.key] ?? 0)
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
