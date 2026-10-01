import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2, FileText } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Button from '../../components/Button';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import { listPolicies, deletePolicy } from '../../api/policies';
import { formatDate } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import './Policies.css';

const LIMIT = 20;

export default function Policies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;

  const [result, setResult] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const isReadOnly = user?.role === 'CONTRACTOR';

  function load() {
    setLoading(true);
    listPolicies({ page, limit: LIMIT })
      .then(setResult)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page]);

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

  async function handleDelete() {
    setSaving(true);
    try {
      await deletePolicy(deleteTarget.id);
      showToast('Policy deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: 'contractor', label: 'Contractor', render: (row) => row.contractor?.contractorName || '-' },
    { key: 'policyName', label: 'Policy Name' },
    { key: 'policyNumber', label: 'Policy Number' },
    { key: 'insuranceCompany', label: 'Insurer' },
    { key: 'validDate', label: 'Valid Till', render: (row) => formatDate(row.validDate) },
    { key: 'file', label: 'File', render: (row) => (
      <a href={row.fileUrl} target="_blank" rel="noreferrer" className="policies-file-link">
        <FileText size={14} /> View
      </a>
    ) },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="policies-actions-cell">
          <button onClick={() => navigate(`/policies/${row.id}`)} className="policies-action-btn">
            <Eye size={16} />
          </button>
          {!isReadOnly && (
            <>
              <button onClick={() => navigate(`/policies/${row.id}/edit`)} className="policies-action-btn">
                <Pencil size={16} />
              </button>
              <button onClick={() => setDeleteTarget(row)} className="policies-action-btn-danger">
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="policies-container">
      <PageHeader
        centered
        title="Policy"
        description="Insurance policies covering contractors and their workers."
        action={!isReadOnly && <Button icon={Plus} onClick={() => navigate('/policies/new')}>Add Policy</Button>}
      />

      <DataTable columns={columns} rows={result.data} loading={loading} />
      <Pagination page={page} limit={LIMIT} total={result.total} onPageChange={(p) => updateParams({ page: p })} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Policy"
        message="Are you sure you want to delete this policy? This cannot be undone."
        confirmLabel="Delete"
        danger
        loading={saving}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
