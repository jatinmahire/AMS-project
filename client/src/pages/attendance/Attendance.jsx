import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Eye, Pencil, ScanLine, Search } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Button from '../../components/Button';
import { TextInput } from '../../components/FormField';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import QrScanner from '../../components/QrScanner';
import { listAttendance, scanAttendance } from '../../api/attendance';
import { enqueueAttendance } from '../../utils/offlineQueue';
import { isNetworkError } from '../../utils/offlineSync';
import { getErrorMessage } from '../../utils/errorMessage';
import { displayName, formatDate, formatTime12hr } from '../../utils/format';
import { useToast } from '../../context/ToastContext';
import './Attendance.css';

const ACTION_LABEL = {
  CHECK_IN: 'Checked in',
  CHECK_OUT: 'Checked out',
  ALREADY_COMPLETE: 'Already completed today',
  INACTIVE: 'Worker is not active',
};

const LIMIT = 25;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function Attendance() {
  const [searchParams, setSearchParams] = useSearchParams();
  const date = searchParams.get('date') || todayIso();
  const page = Number(searchParams.get('page')) || 1;

  const [result, setResult] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();
  // Every role that can mark attendance (scan or manual) can also correct a time it
  // auto-filled — the server scopes a contractor's edit to their own workers regardless.
  const canEdit = true;
  const canScan = true;
  const [scanMode, setScanMode] = useState(false);
  const [banner, setBanner] = useState(null);

  function showBanner(type, message) {
    setBanner({ type, message });
    setTimeout(() => setBanner(null), 2500);
  }

  async function handleScanResult(code) {
    try {
      const result = await scanAttendance({ code });
      const isSuccess = result.action === 'CHECK_IN' || result.action === 'CHECK_OUT';
      showBanner(isSuccess ? 'success' : 'warn', `${ACTION_LABEL[result.action]}: ${result.worker.name} (${result.worker.code})`);
      if (isSuccess) {
        navigator.vibrate?.(100);
        load();
      }
    } catch (err) {
      if (isNetworkError(err)) {
        await enqueueAttendance({ isScan: true, payload: { code }, createdAt: Date.now() });
        showBanner('offline', 'No connection — scan queued and will sync automatically');
        return;
      }
      showBanner('error', getErrorMessage(err));
    }
  }

  function load() {
    setLoading(true);
    listAttendance({ date, page, limit: LIMIT })
      .then(setResult)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [date, page]);

  function updateParams(next) {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      Object.entries(next).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      return params;
    });
  }

  // The date input's own underlying value goes blank and unreadable for as long as its year
  // segment has overflowed past 4 digits — including mid-typing, before the day/month are even
  // touched — with no way to tell that apart from the user genuinely clearing the field.
  // Committing that immediately reloaded the list with today's date. Delaying only the empty
  // case gives a momentary glitch a chance to resolve before it's treated as a real clear.
  const dateClearTimerRef = useRef(null);
  function handleDateFilterChange(value) {
    clearTimeout(dateClearTimerRef.current);
    if (value) {
      updateParams({ date: value, page: null });
      return;
    }
    dateClearTimerRef.current = setTimeout(() => updateParams({ date: value, page: null }), 700);
  }

  useEffect(() => () => clearTimeout(dateClearTimerRef.current), []);

  const columns = [
    { key: 'workerCode', label: 'Worker Code', render: (row) => row.worker.workerCode },
    { key: 'name', label: 'Name', render: (row) => `${row.worker.firstName} ${row.worker.lastName}` },
    { key: 'contractor', label: 'Contractor', render: (row) => row.worker.contractor?.contractorName || '-' },
    { key: 'date', label: 'Date', render: (row) => formatDate(row.date) },
    { key: 'day', label: 'Day' },
    { key: 'inTime', label: 'In Time', render: (row) => formatTime12hr(row.inTime) },
    { key: 'outTime', label: 'Out Time', render: (row) => formatTime12hr(row.outTime) },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'buildingNo', label: 'Building', render: (row) => row.buildingNo || '-' },
    { key: 'source', label: 'Source' },
    { key: 'markedBy', label: 'Marked By', render: (row) => displayName(row.markedByUser) || '-' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="attendance-actions-cell">
          <button onClick={() => navigate(`/attendance/${row.id}`)} className="attendance-action-btn">
            <Eye size={16} />
          </button>
          {canEdit && (
            <button onClick={() => navigate(`/attendance/${row.id}/edit`)} className="attendance-action-btn">
              <Pencil size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Daily Attendance"
        description="Mark and review worker attendance by date."
        action={
          (
            <div className="attendance-header-actions">
              {canScan && (
                <Button variant="secondary" icon={ScanLine} onClick={() => setScanMode((v) => !v)}>
                  {scanMode ? 'Close Scanner' : 'Scan QR'}
                </Button>
              )}
              <Button icon={Plus} onClick={() => navigate('/attendance/new')}>Add Attendance</Button>
            </div>
          )
        }
      />

      {banner && <div className={`attendance-scan-banner attendance-scan-banner-${banner.type}`}>{banner.message}</div>}

      {scanMode && (
        <div className="attendance-scan-wrap">
          <QrScanner continuous onScan={handleScanResult} />
          <button type="button" onClick={() => navigate('/attendance/new')} className="attendance-scan-fallback-link">
            <Search size={14} /> Camera not working? Mark manually instead
          </button>
        </div>
      )}

      <div className="attendance-date-filter-row">
        <label className="attendance-date-filter-label">Date</label>
        <TextInput type="date" name="attendance-filter-date" autoComplete="off" value={date} onChange={(e) => handleDateFilterChange(e.target.value)} className="attendance-date-filter-input" />
      </div>

      <DataTable columns={columns} rows={result.data} loading={loading} emptyMessage="No attendance marked for this date" scrollable fullWidth maxHeight="500px" />
      <Pagination page={page} limit={LIMIT} total={result.total} onPageChange={(p) => updateParams({ page: p })} />
    </div>
  );
}
