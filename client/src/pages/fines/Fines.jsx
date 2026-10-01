import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Button from '../../components/Button';
import FilterBar from '../../components/FilterBar';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import { listFines, deleteFine } from '../../api/fines';
import { formatDate, formatCurrency } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import './Fines.css';

const LIMIT = 20;

const FILTERS = [
  { type: 'search', key: 'q', label: 'Search', placeholder: 'Search by worker name or code' },
  { type: 'contractor', key: 'contractorId' },
  { type: 'dateRange', key: 'offenceDate' },
];

export default function Fines() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterValues = {
    q: searchParams.get('q') || '',
    contractorId: searchParams.get('contractorId') || '',
    offenceDateFrom: searchParams.get('offenceDateFrom') || '',
    offenceDateTo: searchParams.get('offenceDateTo') || '',
  };
  const page = Number(searchParams.get('page')) || 1;

  const [result, setResult] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  function load() {
    setLoading(true);
    listFines({
      search: filterValues.q,
      contractorId: filterValues.contractorId,
      from: filterValues.offenceDateFrom,
      to: filterValues.offenceDateTo,
      page,
      limit: LIMIT,
    })
      .then(setResult)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [filterValues.q, filterValues.contractorId, filterValues.offenceDateFrom, filterValues.offenceDateTo, page]);

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

  function handleFilterChange(key, value) {
    updateParams({ [key]: value, page: null });
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await deleteFine(deleteTarget.id);
      showToast('Fine record deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: 'workerCode', label: 'Worker Code', render: (row) => row.worker.workerCode },
    { key: 'workerName', label: 'Worker Name', render: (row) => `${row.worker.firstName} ${row.worker.lastName}` },
    { key: 'contractor', label: 'Contractor', render: (row) => row.worker.contractor?.contractorName || '-' },
    { key: 'offenceDate', label: 'Offence Date', render: (row) => formatDate(row.offenceDate) },
    { key: 'offence', label: 'Offence' },
    { key: 'fineAmount', label: 'Fine Amount', render: (row) => formatCurrency(row.fineAmount) },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="fines-actions-cell">
          <button onClick={() => navigate(`/fines/${row.id}`)} className="fines-action-btn">
            <Eye size={16} />
          </button>
          <button onClick={() => navigate(`/fines/${row.id}/edit`)} className="fines-action-btn">
            <Pencil size={16} />
          </button>
          <button onClick={() => setDeleteTarget(row)} className="fines-action-btn-danger">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Fine"
        description="Record disciplinary fines issued to a worker."
        action={<Button icon={Plus} onClick={() => navigate('/fines/new')}>Add Fine Record</Button>}
      />

      <FilterBar filters={FILTERS} values={filterValues} onChange={handleFilterChange} />

      <DataTable columns={columns} rows={result.data} loading={loading} />
      <Pagination page={page} limit={LIMIT} total={result.total} onPageChange={(p) => updateParams({ page: p })} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Fine Record"
        message="Are you sure you want to delete this fine record? This cannot be undone."
        confirmLabel="Delete"
        danger
        loading={saving}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
