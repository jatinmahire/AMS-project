import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Button from '../../components/Button';
import FilterBar from '../../components/FilterBar';
import Pagination from '../../components/Pagination';
import { listGateLogs } from '../../api/gateLogs';
import { formatDateTime } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import './GateLogs.css';

const LIMIT = 20;

const FILTERS = [
  { type: 'date', key: 'date', label: 'Date' },
  { type: 'contractor', key: 'contractorId' },
];

export default function GateLogs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterValues = {
    date: searchParams.get('date') || '',
    contractorId: searchParams.get('contractorId') || '',
  };
  const page = Number(searchParams.get('page')) || 1;

  const [result, setResult] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  function load() {
    setLoading(true);
    listGateLogs({
      date: filterValues.date,
      contractorId: filterValues.contractorId,
      page,
      limit: LIMIT,
    })
      .then(setResult)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [filterValues.date, filterValues.contractorId, page]);

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

  const columns = [
    { key: 'workerCode', label: 'Worker Code', render: (row) => row.worker.workerCode },
    { key: 'workerName', label: 'Worker Name', render: (row) => `${row.worker.firstName} ${row.worker.lastName}` },
    { key: 'contractor', label: 'Contractor', render: (row) => row.worker.contractor?.contractorName || '-' },
    {
      key: 'direction',
      label: 'Direction',
      render: (row) => (
        <span className={row.direction === 'INWARD' ? 'gate-logs-badge-inward' : 'gate-logs-badge-outward'}>
          {row.direction === 'INWARD' ? 'Inward' : 'Outward'}
        </span>
      ),
    },
    { key: 'gateNo', label: 'Gate No.' },
    { key: 'timestamp', label: 'Timestamp', render: (row) => formatDateTime(row.timestamp) },
  ];

  return (
    <div>
      <PageHeader
        title="Gate Movement"
        description="Worker inward/outward movement recorded at the gate."
        action={<Button icon={Plus} onClick={() => navigate('/gate-logs/new')}>Record Movement</Button>}
      />

      <FilterBar filters={FILTERS} values={filterValues} onChange={handleFilterChange} />

      <DataTable columns={columns} rows={result.data} loading={loading} scrollable fullWidth maxHeight="500px" />
      <Pagination page={page} limit={LIMIT} total={result.total} onPageChange={(p) => updateParams({ page: p })} />
    </div>
  );
}
