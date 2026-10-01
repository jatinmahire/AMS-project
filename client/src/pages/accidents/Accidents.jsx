import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Button from '../../components/Button';
import FilterBar from '../../components/FilterBar';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import { listAccidents, deleteAccident } from '../../api/accidents';
import { formatDate } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import './Accidents.css';

const LIMIT = 20;

const FILTERS = [
  { type: 'search', key: 'q', label: 'Search', placeholder: 'Search by worker name or code' },
  { type: 'contractor', key: 'contractorId' },
  { type: 'dateRange', key: 'accidentDate' },
];

export default function Accidents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterValues = {
    q: searchParams.get('q') || '',
    contractorId: searchParams.get('contractorId') || '',
    accidentDateFrom: searchParams.get('accidentDateFrom') || '',
    accidentDateTo: searchParams.get('accidentDateTo') || '',
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
    listAccidents({
      search: filterValues.q,
      contractorId: filterValues.contractorId,
      from: filterValues.accidentDateFrom,
      to: filterValues.accidentDateTo,
      page,
      limit: LIMIT,
    })
      .then(setResult)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [filterValues.q, filterValues.contractorId, filterValues.accidentDateFrom, filterValues.accidentDateTo, page]);

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
      await deleteAccident(deleteTarget.id);
      showToast('Accident record deleted');
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
    { key: 'accidentDate', label: 'Accident Date', render: (row) => formatDate(row.accidentDate) },
    { key: 'natureOfAccident', label: 'Nature of Accident' },
    { key: 'daysAbsent', label: 'Days Absent' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="accidents-actions-cell">
          <button onClick={() => navigate(`/accidents/${row.id}`)} className="accidents-action-btn">
            <Eye size={16} />
          </button>
          <button onClick={() => navigate(`/accidents/${row.id}/edit`)} className="accidents-action-btn">
            <Pencil size={16} />
          </button>
          <button onClick={() => setDeleteTarget(row)} className="accidents-action-btn-danger">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Accident"
        description="Record workplace accidents and recovery details."
        action={<Button icon={Plus} onClick={() => navigate('/accidents/new')}>Add Accident Record</Button>}
      />

      <FilterBar filters={FILTERS} values={filterValues} onChange={handleFilterChange} />

      <DataTable columns={columns} rows={result.data} loading={loading} />
      <Pagination page={page} limit={LIMIT} total={result.total} onPageChange={(p) => updateParams({ page: p })} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Accident Record"
        message="Are you sure you want to delete this accident record? This cannot be undone."
        confirmLabel="Delete"
        danger
        loading={saving}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
