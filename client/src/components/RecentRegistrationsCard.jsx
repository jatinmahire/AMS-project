import { useNavigate } from 'react-router-dom';
import { Building2, UserCog, Users } from 'lucide-react';
import { Select } from './FormField';
import './RecentRegistrationsCard.css';

const TYPE_META = {
  CONTRACTOR: {
    label: 'Contractor',
    icon: Building2,
    route: (id) => `/contractors/${id}`,
    badgeClass: 'recent-registrations-badge-contractor',
    avatarClass: 'recent-registrations-avatar-contractor',
  },
  SUPERVISOR: {
    label: 'Supervisor',
    icon: UserCog,
    route: (id) => `/supervisors/${id}`,
    badgeClass: 'recent-registrations-badge-supervisor',
    avatarClass: 'recent-registrations-avatar-supervisor',
  },
  WORKER: {
    label: 'Worker',
    icon: Users,
    route: (id) => `/workers/${id}`,
    badgeClass: 'recent-registrations-badge-worker',
    avatarClass: 'recent-registrations-avatar-worker',
  },
};

export default function RecentRegistrationsCard({ items, loading, type, onTypeChange }) {
  const navigate = useNavigate();

  return (
    <div className="recent-registrations-card">
      <div className="recent-registrations-card-header">
        <h2 className="recent-registrations-card-header-title">Recent Registrations</h2>
        <Select
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          className="recent-registrations-filter"
        >
          <option value="ALL">All</option>
          <option value="CONTRACTOR">Contractors</option>
          <option value="SUPERVISOR">Supervisors</option>
          <option value="WORKER">Workers</option>
        </Select>
      </div>

      {loading ? (
        <p className="recent-registrations-card-message">Loading...</p>
      ) : items.length === 0 ? (
        <p className="recent-registrations-card-message">No recent registrations.</p>
      ) : (
        <ul className="recent-registrations-card-list">
          {items.map((item) => {
            const meta = TYPE_META[item.type];
            const Icon = meta.icon;
            return (
              <li key={`${item.type}-${item.id}`}>
                <button onClick={() => navigate(meta.route(item.id))} className="recent-registrations-card-item">
                  <span className={`recent-registrations-avatar ${meta.avatarClass}`}>
                    {item.photoUrl ? (
                      <img src={item.photoUrl} alt="" className="recent-registrations-avatar-img" />
                    ) : (
                      <Icon size={18} />
                    )}
                  </span>
                  <span className="recent-registrations-card-item-body">
                    <span className="recent-registrations-card-item-name">{item.name}</span>
                    <span className="recent-registrations-card-item-code">{item.code}</span>
                  </span>
                  <span className={`recent-registrations-badge ${meta.badgeClass}`}>{meta.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
