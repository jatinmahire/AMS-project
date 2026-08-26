import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, FileText } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import PolicyFormModal from './PolicyFormModal';
import { listPolicies, deletePolicy } from '../../api/policies';
import { formatDate } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';

const LIMIT = 20;

export default function Policies() {
  const [result, setResult] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  function load() {
    setLoading(true);
    listPolicies({ page, limit: LIMIT })
      .then(setResult)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page]);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setModalOpen(true);
  }

  function handleSaved() {
    setModalOpen(false);
    load();
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
      <a href={row.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-600 hover:underline dark:text-indigo-400">
        <FileText size={14} /> View
      </a>
    ) },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400">
            <Pencil size={16} />
          </button>
          <button onClick={() => setDeleteTarget(row)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-red-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-red-400">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Policy"
        description="Insurance policies covering contractors and their workers."
        action={<Button icon={Plus} onClick={openCreate}>Add Policy</Button>}
      />

      <Table columns={columns} rows={result.data} loading={loading} />
      <Pagination page={page} limit={LIMIT} total={result.total} onPageChange={setPage} />

      <PolicyFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={handleSaved} editing={editing} />

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
