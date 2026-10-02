import { useEffect, useState } from 'react';
import { Select } from './FormField';
import { getAttendanceOverview } from '../api/dashboard';
import { getErrorMessage } from '../utils/errorMessage';
import { useToast } from '../context/ToastContext';
import './AttendanceOverviewCard.css';

const RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'Last 7 Days' },
];

const EMPTY_SEGMENTS = [
  { key: 'present', label: 'Present', count: 0, percent: 0 },
  { key: 'absent', label: 'Absent', count: 0, percent: 0 },
  { key: 'overtime', label: 'Overtime', count: 0, percent: 0 },
];

// Every arc is drawn on the same half-circle path normalised to length 100,
// so a segment's percentage maps directly onto dash length.
const GAUGE_PATH = 'M 15 100 A 85 85 0 0 1 185 100';

export default function AttendanceOverviewCard() {
  const [range, setRange] = useState('today');
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    setLoading(true);
    getAttendanceOverview(range)
      .then(setOverview)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [range, showToast]);

  const segments = overview?.segments || EMPTY_SEGMENTS;
  let offset = 0;

  return (
    <div className="attendance-overview-card">
      <div className="attendance-overview-card-header">
        <h2 className="attendance-overview-card-title">Attendance Overview</h2>
        <Select value={range} onChange={(e) => setRange(e.target.value)} className="attendance-overview-filter">
          {RANGES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </Select>
      </div>

      <div className="attendance-overview-gauge">
        <svg viewBox="0 0 200 110" className="attendance-overview-gauge-svg" role="img" aria-label="Attendance gauge">
          <path d={GAUGE_PATH} pathLength="100" className="attendance-overview-arc-track" />
          {segments.map((segment) => {
            const start = offset;
            offset += segment.percent;
            if (segment.percent === 0) return null;
            return (
              <path
                key={segment.key}
                d={GAUGE_PATH}
                pathLength="100"
                strokeDasharray={`${segment.percent} ${100 - segment.percent}`}
                strokeDashoffset={-start}
                className={`attendance-overview-arc attendance-overview-arc-${segment.key}`}
              />
            );
          })}
        </svg>
        <div className="attendance-overview-gauge-center">
          <p className="attendance-overview-gauge-label">Total Attendance</p>
          <p className="attendance-overview-gauge-total">{loading ? '-' : overview?.total ?? 0}</p>
        </div>
      </div>

      <ul className="attendance-overview-list">
        {segments.map((segment) => (
          <li key={segment.key} className="attendance-overview-list-item">
            <span className={`attendance-overview-swatch attendance-overview-swatch-${segment.key}`} />
            <span className="attendance-overview-list-label">{segment.label}</span>
            <span className="attendance-overview-list-count">{loading ? '' : segment.count}</span>
            <span className="attendance-overview-list-percent">{loading ? '-' : `${segment.percent}%`}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
