import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Eye, Pencil } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Button from '../../components/Button';
import { TextInput } from '../../components/FormField';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import { listAttendance } from '../../api/attendance';
import { getErrorMessage } from '../../utils/errorMessage';
import { formatDate } from '../../utils/format';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import './Attendance.css';

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
  const { user } = useAuth();
  const isReadOnly = user?.role === 'CONTRACTOR';

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

  const columns = [
    { key: 'workerCode', label: 'Worker Code', render: (row) => row.worker.workerCode },
    { key: 'name', label: 'Name', render: (row) => `${row.worker.firstName} ${row.worker.lastName}` },
    { key: 'contractor', label: 'Contractor', render: (row) => row.worker.contractor?.contractorName || '-' },
    { key: 'date', label: 'Date', render: (row) => formatDate(row.date) },
    { key: 'day', label: 'Day' },
    { key: 'inTime', label: 'In Time' },
    { key: 'outTime', label: 'Out Time', render: (row) => row.outTime || '-' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'buildingNo', label: 'Building', render: (row) => row.buildingNo || '-' },
    { key: 'source', label: 'Source' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="attendance-actions-cell">
          <button onClick={() => navigate(`/attendance/${row.id}`)} className="attendance-action-btn">
            <Eye size={16} />
          </button>
          {!isReadOnly && (
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
        action={!isReadOnly && <Button icon={Plus} onClick={() => navigate('/attendance/new')}>Add Attendance</Button>}
      />

      <div className="attendance-date-filter-row">
        <label className="attendance-date-filter-label">Date</label>
        <TextInput type="date" value={date} onChange={(e) => updateParams({ date: e.target.value, page: null })} className="attendance-date-filter-input" />
      </div>

      <DataTable columns={columns} rows={result.data} loading={loading} emptyMessage="No attendance marked for this date" scrollable fullWidth maxHeight="500px" />
      <Pagination page={page} limit={LIMIT} total={result.total} onPageChange={(p) => updateParams({ page: p })} />
    </div>
  );
}
