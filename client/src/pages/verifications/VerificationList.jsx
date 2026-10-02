import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import Pagination from '../../components/Pagination';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { listVerifications } from '../../api/verifications';
import { VERIFICATION_TYPES } from '../../constants/verificationTypes';
import { displayName, formatDate } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';

const LIMIT = 20;

export default function VerificationList() {
  const { type: typeParam } = useParams();
  const type = typeParam.toUpperCase();
  const config = VERIFICATION_TYPES[type];
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const filterValues = {
    q: searchParams.get('q') || '',
    status: searchParams.get('status') || '',
    contractorId: searchParams.get('contractorId') || '',
  };
  const page = Number(searchParams.get('page')) || 1;

  const [result, setResult] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);

  const FILTERS = [
    { type: 'search', key: 'q', label: 'Search', placeholder: 'Search by worker code or name' },
    {
      type: 'select',
      key: 'status',
      label: 'Status',
      options: [{ value: '', label: 'All Statuses' }, ...config.statuses.map(([value, label]) => ({ value, label }))],
    },
    { type: 'contractor', key: 'contractorId' },
  ];

  function load() {
    setLoading(true);
    listVerifications(typeParam.toLowerCase(), {
      search: filterValues.q,
      status: filterValues.status,
      contractorId: filterValues.contractorId,
      page,
      limit: LIMIT,
    })
      .then(setResult)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [typeParam, filterValues.q, filterValues.status, filterValues.contractorId, page]);

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
    { key: 'workerCode', label: 'Worker Code' },
    { key: 'workerName', label: 'Worker Name' },
    { key: 'contractorName', label: 'Contractor' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'verifiedBy', label: 'Verified By', render: (r) => (r.verifiedByUser ? displayName(r.verifiedByUser) : '-') },
    { key: 'verifiedAt', label: 'Verified Date', render: (r) => (r.verifiedAt ? formatDate(r.verifiedAt) : '-') },
    ...(config.hasReferenceNo ? [{ key: 'referenceNo', label: 'Reference No.', render: (r) => r.referenceNo || '-' }] : []),
    {
      key: 'actions',
      label: 'Action',
      render: (r) => (
        <Button variant="secondary" onClick={() => navigate(`/verifications/${typeParam}/${r.workerId}`)}>
          Update
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={config.label} description="Manual attestation log — review the physical document, then record the outcome." />

      <FilterBar filters={FILTERS} values={filterValues} onChange={(key, value) => updateParams({ [key]: value, page: null })} />

      <DataTable columns={columns} rows={result.data} loading={loading} fullWidth emptyMessage="No workers found" />
      <Pagination page={page} limit={LIMIT} total={result.total} onPageChange={(p) => updateParams({ page: p })} />
    </div>
  );
}
