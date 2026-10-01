import { CloudOff } from 'lucide-react';
import './OfflineQueueBadge.css';
import { useOfflineQueue } from '../hooks/useOfflineQueue';

export default function OfflineQueueBadge() {
  const count = useOfflineQueue();
  if (count === 0) return null;

  return (
    <div className="no-print offline-queue-badge">
      <CloudOff size={16} />
      {count} attendance record{count > 1 ? 's' : ''} queued offline — syncing when back online
    </div>
  );
}
