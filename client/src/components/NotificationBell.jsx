import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, FileWarning, Clock, DoorOpen, AlertTriangle, Calendar } from 'lucide-react';
import './NotificationBell.css';
import Button from './Button';
import { listNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../api/notifications';
import { formatRelativeTime } from '../utils/format';
import { getErrorMessage } from '../utils/errorMessage';
import { useToast } from '../context/ToastContext';

const TYPE_ICONS = {
  KYC_MISSING: FileWarning,
  COMPLIANCE_90_DAY: Clock,
  GATE_MISMATCH: DoorOpen,
  LICENSE_EXPIRING: AlertTriangle,
};

const ENTITY_ROUTES = {
  worker: (id) => `/workers/${id}`,
  contractor: (id) => `/contractors/${id}`,
  policy: (id) => `/policies/${id}`,
  gateLog: () => '/gate-logs',
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  function refreshUnreadCount() {
    listNotifications({ isRead: false, limit: 1 })
      .then((res) => setUnreadCount(res.total))
      .catch(() => {});
  }

  useEffect(refreshUnreadCount, []);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listNotifications({ isRead: false, date: dateFilter === 'today' ? 'today' : undefined, limit: 20 })
      .then((res) => setNotifications(res.data))
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [open, dateFilter]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleItemClick(notification) {
    try {
      await markNotificationAsRead(notification.id);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
    setOpen(false);
    refreshUnreadCount();
    const routeFor = ENTITY_ROUTES[notification.entityType];
    if (routeFor) navigate(routeFor(notification.entityId));
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsAsRead();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  }

  return (
    <div className="notification-bell" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="notification-bell-trigger"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-bell-count">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="notification-bell-backdrop" onClick={() => setOpen(false)} />
          <div className="notification-bell-panel">
            <div className="notification-bell-panel-header">
              <h3 className="notification-bell-panel-title">Notifications ({unreadCount})</h3>
              <button onClick={handleMarkAllRead} className="notification-bell-mark-all">
                Mark all as read
              </button>
            </div>

            <div className="notification-bell-filter-row">
              <button
                onClick={() => setDateFilter((f) => (f === 'today' ? 'all' : 'today'))}
                className={`notification-bell-filter-toggle ${
                  dateFilter === 'today' ? 'notification-bell-filter-toggle-active' : 'notification-bell-filter-toggle-inactive'
                }`}
              >
                <Calendar size={12} /> Today
              </button>
            </div>

            <div className="notification-bell-list">
              {loading && <p className="notification-bell-empty">Loading...</p>}
              {!loading && notifications.length === 0 && (
                <p className="notification-bell-empty">Nothing to show.</p>
              )}
              {!loading &&
                notifications.map((n) => {
                  const Icon = TYPE_ICONS[n.type] || Bell;
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleItemClick(n)}
                      className="notification-bell-item"
                    >
                      <span className="notification-bell-item-icon">
                        <Icon size={16} />
                      </span>
                      <div className="notification-bell-item-body">
                        <p className="notification-bell-item-message">{n.message}</p>
                        <p className="notification-bell-item-time">{formatRelativeTime(n.createdAt)}</p>
                      </div>
                    </button>
                  );
                })}
            </div>

            <div className="notification-bell-panel-footer">
              <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  setOpen(false);
                  navigate('/notifications');
                }}
              >
                View All
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
