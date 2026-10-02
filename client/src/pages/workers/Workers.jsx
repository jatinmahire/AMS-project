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
import { listWorkers, updateWorkerStatus } from '../../api/workers';
import { getErrorMessage } from '../../utils/errorMessage';
import { formatDate } from '../../utils/format';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { exportToCsv } from '../../utils/exportCsv';
import './Workers.css';

const EXPORT_FIELDS = [
  ['workerCode', 'Worker Id'], ['firstName', 'First Name'], ['middleName', 'Middle Name'], ['lastName', 'Last Name'],
  ['gender', 'Gender'], ['dob', 'DOB', formatDate],
  ['maritalStatus', 'Marital Status'], ['mobileNo', 'Mobile No'], ['permanentAddress', 'Permanent Address'],
  ['currentAddress', 'Current Address'], ['village', 'Village'], ['taluka', 'Taluka'], ['city', 'City'],
  ['district', 'District'], ['state', 'State'], ['pincode', 'Pin Code'],
  ['contractor', 'Contractor', (v) => v?.contractorName || '-'], ['designation', 'Designation', (v) => v?.designationName || '-'],
  ['labourCategory', 'Labour Type', (v) => v?.categoryName || '-'], ['idType', 'ID Type'], ['idNumber', 'ID No.'],
  ['photoUrl', 'Photo'], ['idFrontUrl', 'Aadhar Image'], ['idBackUrl', 'Aadhar Back'], ['bankPassbookUrl', 'Bank Photo'],
  ['bocwRegistrationNo', 'BOCW Reg'], ['bocwIssueDate', 'Issue Date', formatDate], ['bocwValidDate', 'Valid Date', formatDate],
  ['joinDate', 'Join Date', formatDate], ['pfNumber', 'PF No.'], ['uanNumber', 'UAN No.'], ['esicNumber', 'ESIC No.'],
  ['panNumber', 'Pan No.'], ['ipNumber', 'IP No.'], ['policeVerified', 'Police Verify', (v) => (v ? 'Yes' : 'No')],
  ['bankName', 'Bank Name'], ['bankBranch', 'Branch'], ['accountNo', 'Account No.'], ['ifscCode', 'IFSC'],
  ['nomineeName', 'Nominee'], ['nomineeRelation', 'Relation'], ['nomineeChildrenCount', 'Children'],
  ['nomineeQualification', 'Qualification'], ['nomineeMobile', 'Nominee Mobile No.'], ['sector', 'Sector'],
  ['status', 'Status'],
];

function imageCell(url) {
  if (!url) return '-';
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="workers-image-cell">
      <img src={url} alt="" className="workers-image-cell-img" />
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
  { type: 'search', key: 'q', label: 'Search', placeholder: 'Search by name, code, mobile, or ID number' },
  { type: 'contractor', key: 'contractorId' },
  { type: 'select', key: 'status', label: 'Status', options: STATUS_OPTIONS },
  { type: 'dateRange', key: 'joinDate' },
];

export default function Workers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterValues = {
    q: searchParams.get('q') || '',
    contractorId: searchParams.get('contractorId') || '',
    status: searchParams.has('status') ? searchParams.get('status') : 'ACTIVE',
    joinDateFrom: searchParams.get('joinDateFrom') || '',
    joinDateTo: searchParams.get('joinDateTo') || '',
  };
  const page = Number(searchParams.get('page')) || 1;

  const [result, setResult] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [statusTarget, setStatusTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const isReadOnly = user?.role === 'CONTRACTOR';

  function load() {
    setLoading(true);
    listWorkers({
      search: filterValues.q,
      contractorId: filterValues.contractorId,
      status: filterValues.status === 'ALL' ? '' : filterValues.status,
      from: filterValues.joinDateFrom,
      to: filterValues.joinDateTo,
      page,
      limit: LIMIT,
    })
      .then(setResult)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [
    filterValues.q,
    filterValues.contractorId,
    filterValues.status,
    filterValues.joinDateFrom,
    filterValues.joinDateTo,
    page,
  ]);

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
      await updateWorkerStatus(statusTarget.id, nextStatus);
      showToast(`Worker ${nextStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`);
      setStatusTarget(null);
      load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: 'workerCode', label: 'Worker Id' },
    { key: 'firstName', label: 'First Name' },
    { key: 'middleName', label: 'Middle Name', render: (row) => row.middleName || '-' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'gender', label: 'Gender' },
    { key: 'dob', label: 'DOB', render: (row) => formatDate(row.dob) },
    { key: 'maritalStatus', label: 'Marital Status', render: (row) => row.maritalStatus || '-' },
    { key: 'mobileNo', label: 'Mobile No' },
    { key: 'permanentAddress', label: 'Permanent Address' },
    { key: 'currentAddress', label: 'Current Address', render: (row) => row.currentAddress || '-' },
    { key: 'village', label: 'Village', render: (row) => row.village || '-' },
    { key: 'taluka', label: 'Taluka', render: (row) => row.taluka || '-' },
    { key: 'city', label: 'City', render: (row) => row.city || '-' },
    { key: 'district', label: 'District', render: (row) => row.district || '-' },
    { key: 'state', label: 'State', render: (row) => row.state || '-' },
    { key: 'pincode', label: 'Pin Code', render: (row) => row.pincode || '-' },
    { key: 'contractor', label: 'Contractor', render: (row) => row.contractor?.contractorName || '-' },
    { key: 'designation', label: 'Designation', render: (row) => row.designation?.designationName || '-' },
    { key: 'labourCategory', label: 'Labour Type', render: (row) => row.labourCategory?.categoryName || '-' },
    { key: 'idType', label: 'ID Type' },
    { key: 'idNumber', label: 'ID No.' },
    { key: 'photoUrl', label: 'Photo', render: (row) => imageCell(row.photoUrl) },
    { key: 'idFrontUrl', label: 'Aadhar Image', render: (row) => imageCell(row.idFrontUrl) },
    { key: 'idBackUrl', label: 'Aadhar Back', render: (row) => imageCell(row.idBackUrl) },
    { key: 'bankPassbookUrl', label: 'Bank Photo', render: (row) => imageCell(row.bankPassbookUrl) },
    { key: 'bocwRegistrationNo', label: 'BOCW Reg', render: (row) => row.bocwRegistrationNo || '-' },
    { key: 'bocwIssueDate', label: 'Issue Date', render: (row) => formatDate(row.bocwIssueDate) },
    { key: 'bocwValidDate', label: 'Valid Date', render: (row) => formatDate(row.bocwValidDate) },
    { key: 'joinDate', label: 'Join Date', render: (row) => formatDate(row.joinDate) },
    { key: 'pfNumber', label: 'PF No.', render: (row) => row.pfNumber || '-' },
    { key: 'uanNumber', label: 'UAN No.', render: (row) => row.uanNumber || '-' },
    { key: 'esicNumber', label: 'ESIC No.', render: (row) => row.esicNumber || '-' },
    { key: 'panNumber', label: 'Pan No.', render: (row) => row.panNumber || '-' },
    { key: 'ipNumber', label: 'IP No.', render: (row) => row.ipNumber || '-' },
    { key: 'policeVerified', label: 'Police Verify', render: (row) => (row.policeVerified ? 'Yes' : 'No') },
    { key: 'bankName', label: 'Bank Name', render: (row) => row.bankName || '-' },
    { key: 'bankBranch', label: 'Branch', render: (row) => row.bankBranch || '-' },
    { key: 'accountNo', label: 'Account No.', render: (row) => row.accountNo || '-' },
    { key: 'ifscCode', label: 'IFSC', render: (row) => row.ifscCode || '-' },
    { key: 'nomineeName', label: 'Nominee', render: (row) => row.nomineeName || '-' },
    { key: 'nomineeRelation', label: 'Relation', render: (row) => row.nomineeRelation || '-' },
    { key: 'nomineeChildrenCount', label: 'Children', render: (row) => row.nomineeChildrenCount ?? '-' },
    { key: 'nomineeQualification', label: 'Qualification', render: (row) => row.nomineeQualification || '-' },
    { key: 'nomineeMobile', label: 'Nominee Mobile No.', render: (row) => row.nomineeMobile || '-' },
    { key: 'sector', label: 'Sector', render: (row) => row.sector || '-' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="workers-actions-cell">
          <button
            onClick={() => navigate(`/workers/${row.id}`)}
            className="workers-action-btn"
          >
            <Eye size={16} />
          </button>
          {!isReadOnly && (
            <>
              <button
                onClick={() => navigate(`/workers/${row.id}/edit`)}
                className="workers-action-btn"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => setStatusTarget(row)}
                className={row.status === 'ACTIVE' ? 'workers-action-toggle-active' : 'workers-action-toggle-inactive'}
              >
                {row.status === 'ACTIVE' ? <Ban size={16} /> : <CheckCircle size={16} />}
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  function handleExport() {
    exportToCsv(
      'workers.csv',
      EXPORT_FIELDS.map(([, label]) => label),
      result.data.map((row) => EXPORT_FIELDS.map(([key, , fmt]) => (fmt ? fmt(row[key]) : row[key] ?? '-')))
    );
  }

  return (
    <div>
      <PageHeader
        title="Workers"
        description="All registered workers across contractors."
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
        title={statusTarget?.status === 'ACTIVE' ? 'Deactivate Worker' : 'Activate Worker'}
        message={`Are you sure you want to ${statusTarget?.status === 'ACTIVE' ? 'deactivate' : 'activate'} "${statusTarget?.firstName} ${statusTarget?.lastName}"?`}
        confirmLabel={statusTarget?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        danger={statusTarget?.status === 'ACTIVE'}
        loading={saving}
        onConfirm={handleToggleStatus}
        onCancel={() => setStatusTarget(null)}
      />
    </div>
  );
}
