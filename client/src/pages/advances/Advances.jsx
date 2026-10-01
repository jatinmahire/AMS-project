import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Button from '../../components/Button';
import FilterBar from '../../components/FilterBar';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import { listAdvances, deleteAdvance } from '../../api/advances';
import { formatDate, formatCurrency } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import './Advances.css';

const LIMIT = 20;

const FILTERS = [
  { type: 'search', key: 'q', label: 'Search', placeholder: 'Search by worker name or code' },
  { type: 'contractor', key: 'contractorId' },
  { type: 'dateRange', key: 'advanceDate' },
];

export default function Advances() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterValues = {
    q: searchParams.get('q') || '',
    contractorId: searchParams.get('contractorId') || '',
    advanceDateFrom: searchParams.get('advanceDateFrom') || '',
    advanceDateTo: searchParams.get('advanceDateTo') || '',
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
    listAdvances({
      search: filterValues.q,
      contractorId: filterValues.contractorId,
      from: filterValues.advanceDateFrom,
      to: filterValues.advanceDateTo,
      page,
      limit: LIMIT,
    })
      .then(setResult)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [filterValues.q, filterValues.contractorId, filterValues.advanceDateFrom, filterValues.advanceDateTo, page]);

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
      await deleteAdvance(deleteTarget.id);
      showToast('Advance deleted');
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
    { key: 'advanceDate', label: 'Advance Date', render: (row) => formatDate(row.advanceDate) },
    { key: 'purpose', label: 'Purpose' },
    { key: 'amount', label: 'Amount', render: (row) => formatCurrency(row.amount) },
    { key: 'installmentsCount', label: 'Installments' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="advances-actions-cell">
          <button onClick={() => navigate(`/advances/${row.id}`)} className="advances-action-btn">
            <Eye size={16} />
          </button>
          <button onClick={() => navigate(`/advances/${row.id}/edit`)} className="advances-action-btn">
            <Pencil size={16} />
          </button>
          <button onClick={() => setDeleteTarget(row)} className="advances-action-btn-danger">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Advance"
        description="Record wage advances and their auto-generated repayment schedule."
        action={<Button icon={Plus} onClick={() => navigate('/advances/new')}>Add Advance</Button>}
      />

      <FilterBar filters={FILTERS} values={filterValues} onChange={handleFilterChange} />

      <DataTable columns={columns} rows={result.data} loading={loading} />
      <Pagination page={page} limit={LIMIT} total={result.total} onPageChange={(p) => updateParams({ page: p })} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Advance"
        message="Are you sure you want to delete this advance and its repayment schedule? This cannot be undone."
        confirmLabel="Delete"
        danger
        loading={saving}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
