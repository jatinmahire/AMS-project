import './StatusBadge.css';
import { statusColor } from '../utils/format';

export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${statusColor(status)}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
