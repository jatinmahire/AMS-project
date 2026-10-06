import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, Pencil, Ban, CheckCircle, FileSpreadsheet } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Button from '../../components/Button';
import FilterBar from '../../components/FilterBar';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import { listContractors, updateContractorStatus } from '../../api/contractors';
import { getErrorMessage } from '../../utils/errorMessage';
import { formatDate } from '../../utils/format';
import { useToast } from '../../context/ToastContext';
import { exportToCsv } from '../../utils/exportCsv';
import './Contractors.css';

const EXPORT_FIELDS = [
  ['contractorCode', 'Code'], ['user', 'Login ID', (v) => v?.loginId || '-'], ['contractorName', 'Name'], ['establishmentName', 'Establishment'],
  ['contactPerson', 'Contact Person'], ['phone', 'Phone'], ['email', 'Email'], ['email2', 'Email 2'],
  ['email3', 'Email 3'], ['email4', 'Email 4'], ['buildingName', 'Building Name'], ['address', 'Address'],
  ['village', 'Village'], ['taluka', 'Taluka'], ['city', 'City'], ['state', 'State'], ['pincode', 'Pincode'],
  ['aadhaarNo', 'Aadhaar No'], ['panNo', 'PAN No'], ['rc', 'RC'], ['rcCount', 'RC Count'],
  ['principalEmployerName', 'Principal Employer'], ['principalEmployerAddress', 'Principal Employer Address'],
  ['wcPolicyNo', 'WC Policy No'], ['wcStartDate', 'WC Start Date', formatDate], ['wcExpiryDate', 'WC Expiry Date', formatDate],
  ['serviceType', 'Service Type'], ['serviceTaxNo', 'Service Tax No'], ['shopActLicenseNo', 'Shop Act License No'],
  ['shopActExpiryDate', 'Shop Act Expiry', formatDate], ['labourLicenseNo', 'Labour License No'],
  ['labourLicenseStart', 'Labour License Start', formatDate], ['labourLicenseExpiry', 'Labour License Expiry', formatDate],
  ['bocwNo', 'BOCW No'], ['bocwStartDate', 'BOCW Start Date', formatDate], ['bocwExpiryDate', 'BOCW Expiry Date', formatDate],
  ['pfEstablishmentCode', 'PF Establishment Code'], ['esicEstablishmentCode', 'ESIC Establishment Code'],
  ['mlwfNo', 'MLWF No'], ['ptecNo', 'PTEC No'], ['ptrcNo', 'PTRC No'], ['status', 'Status'],
];

const LIMIT = 20;

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'BLACKLISTED', label: 'Blacklisted' },
  { value: 'ALL', label: 'All' },
];

const FILTERS = [
  { type: 'search', key: 'q', label: 'Search', placeholder: 'Search by name, code, or phone' },
  { type: 'select', key: 'status', label: 'Status', options: STATUS_OPTIONS },
];

export default function Contractors() {
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
    listContractors({
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
      await updateContractorStatus(statusTarget.id, nextStatus);
      showToast(`Contractor ${nextStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`);
      setStatusTarget(null);
      load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: 'contractorCode', label: 'Code' },
    { key: 'loginId', label: 'Login ID', render: (row) => row.user?.loginId || '-' },
    { key: 'contractorName', label: 'Name' },
    { key: 'establishmentName', label: 'Establishment', render: (row) => row.establishmentName || '-' },
    { key: 'contactPerson', label: 'Contact Person' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'email2', label: 'Email 2', render: (row) => row.email2 || '-' },
    { key: 'email3', label: 'Email 3', render: (row) => row.email3 || '-' },
    { key: 'email4', label: 'Email 4', render: (row) => row.email4 || '-' },
    { key: 'buildingName', label: 'Building Name', render: (row) => row.buildingName || '-' },
    { key: 'address', label: 'Address' },
    { key: 'village', label: 'Village', render: (row) => row.village || '-' },
    { key: 'taluka', label: 'Taluka', render: (row) => row.taluka || '-' },
    { key: 'city', label: 'City', render: (row) => row.city || '-' },
    { key: 'state', label: 'State', render: (row) => row.state || '-' },
    { key: 'pincode', label: 'Pincode', render: (row) => row.pincode || '-' },
    { key: 'aadhaarNo', label: 'Aadhaar No' },
    { key: 'panNo', label: 'PAN No' },
    { key: 'rc', label: 'RC', render: (row) => row.rc || '-' },
    { key: 'rcCount', label: 'RC Count', render: (row) => row.rcCount ?? '-' },
    { key: 'principalEmployerName', label: 'Principal Employer', render: (row) => row.principalEmployerName || '-' },
    { key: 'principalEmployerAddress', label: 'Principal Employer Address', render: (row) => row.principalEmployerAddress || '-' },
    { key: 'wcPolicyNo', label: 'WC Policy No', render: (row) => row.wcPolicyNo || '-' },
    { key: 'wcStartDate', label: 'WC Start Date', render: (row) => formatDate(row.wcStartDate) },
    { key: 'wcExpiryDate', label: 'WC Expiry Date', render: (row) => formatDate(row.wcExpiryDate) },
    { key: 'serviceType', label: 'Service Type', render: (row) => row.serviceType || '-' },
    { key: 'serviceTaxNo', label: 'Service Tax No', render: (row) => row.serviceTaxNo || '-' },
    { key: 'shopActLicenseNo', label: 'Shop Act License No', render: (row) => row.shopActLicenseNo || '-' },
    { key: 'shopActExpiryDate', label: 'Shop Act Expiry', render: (row) => formatDate(row.shopActExpiryDate) },
    { key: 'labourLicenseNo', label: 'Labour License No', render: (row) => row.labourLicenseNo || '-' },
    { key: 'labourLicenseStart', label: 'Labour License Start', render: (row) => formatDate(row.labourLicenseStart) },
    { key: 'labourLicenseExpiry', label: 'Labour License Expiry', render: (row) => formatDate(row.labourLicenseExpiry) },
    { key: 'bocwNo', label: 'BOCW No', render: (row) => row.bocwNo || '-' },
    { key: 'bocwStartDate', label: 'BOCW Start Date', render: (row) => formatDate(row.bocwStartDate) },
    { key: 'bocwExpiryDate', label: 'BOCW Expiry Date', render: (row) => formatDate(row.bocwExpiryDate) },
    { key: 'pfEstablishmentCode', label: 'PF Establishment Code', render: (row) => row.pfEstablishmentCode || '-' },
    { key: 'esicEstablishmentCode', label: 'ESIC Establishment Code', render: (row) => row.esicEstablishmentCode || '-' },
    { key: 'mlwfNo', label: 'MLWF No', render: (row) => row.mlwfNo || '-' },
    { key: 'ptecNo', label: 'PTEC No', render: (row) => row.ptecNo || '-' },
    { key: 'ptrcNo', label: 'PTRC No', render: (row) => row.ptrcNo || '-' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="contractors-actions-cell">
          <button
            onClick={() => navigate(`/contractors/${row.id}`)}
            className="contractors-action-btn"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => navigate(`/contractors/${row.id}/edit`)}
            className="contractors-action-btn"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => setStatusTarget(row)}
            className={row.status === 'ACTIVE' ? 'contractors-action-toggle-active' : 'contractors-action-toggle-inactive'}
          >
            {row.status === 'ACTIVE' ? <Ban size={16} /> : <CheckCircle size={16} />}
          </button>
        </div>
      ),
    },
  ];

  function handleExport() {
    exportToCsv(
      'contractors.csv',
      EXPORT_FIELDS.map(([, label]) => label),
      result.data.map((row) => EXPORT_FIELDS.map(([key, , fmt]) => (fmt ? fmt(row[key]) : row[key] ?? '-')))
    );
  }

  return (
    <div>
      <PageHeader
        title="Contractors"
        description="Contractors registered on this site."
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
        title={statusTarget?.status === 'ACTIVE' ? 'Deactivate Contractor' : 'Activate Contractor'}
        message={`Are you sure you want to ${statusTarget?.status === 'ACTIVE' ? 'deactivate' : 'activate'} "${statusTarget?.contractorName}"?`}
        confirmLabel={statusTarget?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        danger={statusTarget?.status === 'ACTIVE'}
        loading={saving}
        onConfirm={handleToggleStatus}
        onCancel={() => setStatusTarget(null)}
      />
    </div>
  );
}
