import { statusColor } from '../utils/format';

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(status)}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
