import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Ban, CheckCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import Button from '../../components/Button';
import SearchInput from '../../components/SearchInput';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import { listSupervisors, updateSupervisorStatus } from '../../api/supervisors';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';

const LIMIT = 20;

export default function Supervisors() {
  const [result, setResult] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusTarget, setStatusTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  function load() {
    setLoading(true);
    listSupervisors({ search, page, limit: LIMIT })
      .then(setResult)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [search, page]);

  async function handleToggleStatus() {
    setSaving(true);
    const nextStatus = statusTarget.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateSupervisorStatus(statusTarget.id, nextStatus);
      showToast(`Supervisor ${nextStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`);
      setStatusTarget(null);
      load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: 'supervisorCode', label: 'Code' },
    { key: 'fullName', label: 'Name' },
    { key: 'contactNo', label: 'Contact No.' },
    { key: 'assignedContractor', label: 'Assigned Contractor', render: (row) => row.assignedContractor?.contractorName || '-' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/supervisors/${row.id}/edit`)}
            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => setStatusTarget(row)}
            className={`rounded p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 ${row.status === 'ACTIVE' ? 'hover:text-red-600 dark:hover:text-red-400' : 'hover:text-green-600 dark:hover:text-green-400'}`}
          >
            {row.status === 'ACTIVE' ? <Ban size={16} /> : <CheckCircle size={16} />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Supervisors"
        description="Supervisors assigned to contractors."
        action={
          <Button icon={Plus} onClick={() => navigate('/supervisors/new')}>
            Add Supervisor
          </Button>
        }
      />

      <div className="mb-4">
        <SearchInput value={search} onChange={(v) => { setPage(1); setSearch(v); }} placeholder="Search by name, code, or contact" />
      </div>

      <Table columns={columns} rows={result.data} loading={loading} />
      <Pagination page={page} limit={LIMIT} total={result.total} onPageChange={setPage} />

      <ConfirmDialog
        open={!!statusTarget}
        title={statusTarget?.status === 'ACTIVE' ? 'Deactivate Supervisor' : 'Activate Supervisor'}
        message={`Are you sure you want to ${statusTarget?.status === 'ACTIVE' ? 'deactivate' : 'activate'} "${statusTarget?.fullName}"?`}
        confirmLabel={statusTarget?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        danger={statusTarget?.status === 'ACTIVE'}
        loading={saving}
        onConfirm={handleToggleStatus}
        onCancel={() => setStatusTarget(null)}
      />
    </div>
  );
}
