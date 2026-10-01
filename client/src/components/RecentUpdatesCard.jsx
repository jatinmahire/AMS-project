import { useNavigate } from 'react-router-dom';
import { History } from 'lucide-react';
import './RecentUpdatesCard.css';
import Button from './Button';
import { formatRelativeTime } from '../utils/format';
import { activityIcon, activityRoute } from '../utils/activityMeta';

export default function RecentUpdatesCard({ activity, loading }) {
  const navigate = useNavigate();

  return (
    <div className="recent-updates-card">
      <div className="recent-updates-card-header">
        <span className="recent-updates-card-header-title-group">
          <History size={16} className="recent-updates-card-header-icon" />
          <h2 className="recent-updates-card-header-title">Recent Updates</h2>
        </span>
        <Button variant="secondary" onClick={() => navigate('/activity')}>
          View All
        </Button>
      </div>

      {loading ? (
        <p className="recent-updates-card-message">Loading...</p>
      ) : activity.length === 0 ? (
        <p className="recent-updates-card-message">No recent activity.</p>
      ) : (
        <ul className="recent-updates-card-list">
          {activity.map((log) => {
            const Icon = activityIcon(log.action);
            const route = activityRoute(log);
            return (
              <li key={log.id}>
                <button
                  onClick={() => route && navigate(route)}
                  disabled={!route}
                  className="recent-updates-card-item"
                >
                  <span className="recent-updates-card-item-icon">
                    <Icon size={16} />
                  </span>
                  <span className="recent-updates-card-item-body">
                    <span className="recent-updates-card-item-message">{log.message}</span>
                    <span className="recent-updates-card-item-meta">
                      by {log.actor} &middot; {formatRelativeTime(log.timestamp)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
