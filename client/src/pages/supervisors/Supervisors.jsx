import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Eye, Pencil, Ban, CheckCircle, FileSpreadsheet } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Button from '../../components/Button';
import FilterBar from '../../components/FilterBar';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import { listSupervisors, updateSupervisorStatus } from '../../api/supervisors';
import { getErrorMessage } from '../../utils/errorMessage';
import { formatDate } from '../../utils/format';
import { useToast } from '../../context/ToastContext';
import { exportToCsv } from '../../utils/exportCsv';
import './Supervisors.css';

const EXPORT_FIELDS = [
  ['supervisorCode', 'Supervisor Code'], ['user', 'Login ID', (v) => v?.loginId || '-'], ['fullName', 'Full Name'], ['gender', 'Gender'], ['dob', 'DOB', formatDate],
  ['contactNo', 'Contact No'], ['email', 'Email'], ['aadhaarNo', 'Aadhaar No'],
  ['aadhaarFrontUrl', 'Aadhaar Front'], ['aadhaarBackUrl', 'Aadhaar Back'],
  ['street', 'Street'], ['city', 'City'], ['state', 'State'], ['pincode', 'Pincode'],
  ['assignedContractor', 'Assigned Contractor', (v) => v?.contractorName || '-'], ['status', 'Status'],
];

function imageCell(url) {
  if (!url) return '-';
  return (
    <a href={url} target="_blank" rel="noreferrer" className="supervisors-image-cell">
      <img src={url} alt="" className="supervisors-image-cell-img" />
    </a>
  );
}

const LIMIT = 20;

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'BLACKLISTED', label: 'Blacklisted' },
  { value: 'ALL', label: 'All' },
];

const FILTERS = [
  { type: 'search', key: 'q', label: 'Search', placeholder: 'Search by name, code, or contact' },
  { type: 'select', key: 'status', label: 'Status', options: STATUS_OPTIONS },
];

export default function Supervisors() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterValues = {
    q: searchParams.get('q') || '',
    status: searchParams.has('status') ? searchParams.get('status') : 'ACTIVE',
  };
  const page = Number(searchParams.get('page')) || 1;

  const [result, setResult] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [statusTarget, setStatusTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  function load() {
    setLoading(true);
    listSupervisors({
      search: filterValues.q,
      status: filterValues.status === 'ALL' ? '' : filterValues.status,
      page,
      limit: LIMIT,
    })
      .then(setResult)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [filterValues.q, filterValues.status, page]);

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
    { key: 'supervisorCode', label: 'Supervisor Code' },
    { key: 'loginId', label: 'Login ID', render: (row) => row.user?.loginId || '-' },
    { key: 'fullName', label: 'Full Name' },
    { key: 'gender', label: 'Gender' },
    { key: 'dob', label: 'DOB', render: (row) => formatDate(row.dob) },
    { key: 'contactNo', label: 'Contact No' },
    { key: 'email', label: 'Email' },
    { key: 'aadhaarNo', label: 'Aadhaar No' },
    { key: 'aadhaarFrontUrl', label: 'Aadhaar Front', render: (row) => imageCell(row.aadhaarFrontUrl) },
    { key: 'aadhaarBackUrl', label: 'Aadhaar Back', render: (row) => imageCell(row.aadhaarBackUrl) },
    { key: 'street', label: 'Street', render: (row) => row.street || '-' },
    { key: 'city', label: 'City', render: (row) => row.city || '-' },
    { key: 'state', label: 'State', render: (row) => row.state || '-' },
    { key: 'pincode', label: 'Pincode', render: (row) => row.pincode || '-' },
    { key: 'assignedContractor', label: 'Assigned Contractor', render: (row) => row.assignedContractor?.contractorName || '-' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="supervisors-actions-cell">
          <button
            onClick={() => navigate(`/supervisors/${row.id}`)}
            className="supervisors-action-btn"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => navigate(`/supervisors/${row.id}/edit`)}
            className="supervisors-action-btn"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => setStatusTarget(row)}
            className={row.status === 'ACTIVE' ? 'supervisors-action-toggle-active' : 'supervisors-action-toggle-inactive'}
          >
            {row.status === 'ACTIVE' ? <Ban size={16} /> : <CheckCircle size={16} />}
          </button>
        </div>
      ),
    },
  ];

  function handleExport() {
    exportToCsv(
      'supervisors.csv',
      EXPORT_FIELDS.map(([, label]) => label),
      result.data.map((row) => EXPORT_FIELDS.map(([key, , fmt]) => (fmt ? fmt(row[key]) : row[key] ?? '-')))
    );
  }

  return (
    <div>
      <PageHeader
        title="Supervisors"
        description="Supervisors assigned to contractors."
        action={
          <Button variant="secondary" icon={FileSpreadsheet} onClick={handleExport} disabled={result.data.length === 0}>
            Export to Excel
          </Button>
        }
      />

      <FilterBar filters={FILTERS} values={filterValues} onChange={handleFilterChange} />

      <DataTable columns={columns} rows={result.data} loading={loading} scrollable fullWidth maxHeight="500px" />
      <Pagination page={page} limit={LIMIT} total={result.total} onPageChange={(p) => updateParams({ page: p })} />

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
