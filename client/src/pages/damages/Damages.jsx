import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import Button from '../../components/Button';
import ContractorMonthFilter from '../../components/ContractorMonthFilter';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import DamageFormModal from './DamageFormModal';
import { listDamages, deleteDamage } from '../../api/damages';
import { formatDate, formatCurrency } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';

const LIMIT = 20;

export default function Damages() {
  const [result, setResult] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [contractorId, setContractorId] = useState('');
  const [month, setMonth] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  function load() {
    setLoading(true);
    listDamages({ contractorId, month, page, limit: LIMIT })
      .then(setResult)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [contractorId, month, page]);

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
      await deleteDamage(deleteTarget.id);
      showToast('Damage record deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: 'workerCode', label: 'Worker', render: (row) => `${row.worker.workerCode} — ${row.worker.firstName} ${row.worker.lastName}` },
    { key: 'contractor', label: 'Contractor', render: (row) => row.worker.contractor?.contractorName || '-' },
    { key: 'damageDate', label: 'Date', render: (row) => formatDate(row.damageDate) },
    { key: 'particulars', label: 'Particulars' },
    { key: 'deductionAmount', label: 'Deduction', render: (row) => formatCurrency(row.deductionAmount) },
    { key: 'installments', label: 'Installments' },
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
        title="Damage"
        description="Record property or material damage caused by a worker."
        action={<Button icon={Plus} onClick={openCreate}>Add Damage Record</Button>}
      />

      <ContractorMonthFilter
        contractorId={contractorId}
        onContractorChange={(v) => { setPage(1); setContractorId(v); }}
        month={month}
        onMonthChange={(v) => { setPage(1); setMonth(v); }}
      />

      <Table columns={columns} rows={result.data} loading={loading} />
      <Pagination page={page} limit={LIMIT} total={result.total} onPageChange={setPage} />

      <DamageFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={handleSaved} editing={editing} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Damage Record"
        message="Are you sure you want to delete this damage record? This cannot be undone."
        confirmLabel="Delete"
        danger
        loading={saving}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
