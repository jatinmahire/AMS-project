import { useEffect, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import { TextInput } from '../../components/FormField';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import AttendancePanel from './AttendancePanel';
import { listAttendance } from '../../api/attendance';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';

const LIMIT = 25;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function Attendance() {
  const [date, setDate] = useState(todayIso());
  const [result, setResult] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const panelRef = useRef(null);
  const { showToast } = useToast();

  function load() {
    setLoading(true);
    listAttendance({ date, page, limit: LIMIT })
      .then(setResult)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [date, page]);

  function openEdit(row) {
    setEditing(row);
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleSaved() {
    setEditing(null);
    load();
  }

  const columns = [
    { key: 'workerCode', label: 'Worker Code', render: (row) => row.worker.workerCode },
    { key: 'name', label: 'Name', render: (row) => `${row.worker.firstName} ${row.worker.lastName}` },
    { key: 'contractor', label: 'Contractor', render: (row) => row.worker.contractor?.contractorName || '-' },
    { key: 'day', label: 'Day' },
    { key: 'inTime', label: 'In Time' },
    { key: 'outTime', label: 'Out Time', render: (row) => row.outTime || '-' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'buildingNo', label: 'Building', render: (row) => row.buildingNo || '-' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <button
          onClick={() => openEdit(row)}
          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
        >
          <Pencil size={16} />
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Daily Attendance" description="Mark and review worker attendance by date." />

      <div ref={panelRef} className="mb-6">
        <AttendancePanel editing={editing} onSaved={handleSaved} onCancelEdit={() => setEditing(null)} />
      </div>

      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
        <TextInput type="date" value={date} onChange={(e) => { setPage(1); setDate(e.target.value); }} className="w-48" />
      </div>

      <Table columns={columns} rows={result.data} loading={loading} emptyMessage="No attendance marked for this date" />
      <Pagination page={page} limit={LIMIT} total={result.total} onPageChange={setPage} />
    </div>
  );
}
