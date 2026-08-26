import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import FormField, { TextInput, Select, Textarea } from '../../components/FormField';
import { listHolidays, createHoliday, updateHoliday, deleteHoliday } from '../../api/holidays';
import { contractorDropdown } from '../../api/contractors';
import { formatDate, toDateInputValue } from '../../utils/format';
import { getErrorMessage, getFieldErrors } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';

const EMPTY_FORM = { type: 'WEEKLY_OFF', date: '', notes: '', contractorId: '' };

export default function Holidays() {
  const [holidays, setHolidays] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { showToast } = useToast();

  function load() {
    setLoading(true);
    listHolidays({})
      .then((res) => setHolidays(res.data))
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);
  useEffect(() => {
    contractorDropdown().then(setContractors).catch(() => setContractors([]));
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(holiday) {
    setEditing(holiday);
    setForm({
      type: holiday.type,
      date: toDateInputValue(holiday.date),
      notes: holiday.notes || '',
      contractorId: holiday.contractorId || '',
    });
    setErrors({});
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      if (editing) {
        await updateHoliday(editing.id, form);
        showToast('Holiday updated');
      } else {
        await createHoliday(form);
        showToast('Holiday created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setErrors(getFieldErrors(err));
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await deleteHoliday(deleteTarget.id);
      showToast('Holiday deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: 'date', label: 'Date', render: (row) => formatDate(row.date) },
    { key: 'type', label: 'Type', render: (row) => row.type.replace('_', ' ') },
    { key: 'contractor', label: 'Applies To', render: (row) => row.contractor?.contractorName || 'All Contractors' },
    { key: 'notes', label: 'Notes', render: (row) => row.notes || '-' },
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
        title="Holiday"
        description="Weekly offs and paid leave, company-wide or per contractor."
        action={<Button icon={Plus} onClick={openCreate}>Add Holiday</Button>}
      />

      <Table columns={columns} rows={holidays} loading={loading} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Holiday' : 'Add Holiday'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Type" required error={errors.type}>
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="WEEKLY_OFF">Weekly Off</option>
              <option value="PAID_LEAVE">Paid Leave</option>
            </Select>
          </FormField>
          <FormField label="Date" required error={errors.date}>
            <TextInput type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} error={errors.date} />
          </FormField>
          <FormField label="Applies To" error={errors.contractorId}>
            <Select value={form.contractorId} onChange={(e) => setForm({ ...form, contractorId: e.target.value })}>
              <option value="">All Contractors</option>
              {contractors.map((c) => (
                <option key={c.id} value={c.id}>{c.contractorCode} — {c.contractorName}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Notes" error={errors.notes}>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} error={errors.notes} />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Holiday"
        message="Are you sure you want to delete this holiday? This cannot be undone."
        confirmLabel="Delete"
        danger
        loading={saving}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
