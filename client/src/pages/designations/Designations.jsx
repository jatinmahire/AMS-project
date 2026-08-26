import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import FormField, { TextInput } from '../../components/FormField';
import { listDesignations, createDesignation, updateDesignation, deleteDesignation } from '../../api/designations';
import { getErrorMessage, getFieldErrors } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';

const EMPTY_FORM = { designationCode: '', designationName: '' };

export default function Designations() {
  const [designations, setDesignations] = useState([]);
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
    listDesignations()
      .then(setDesignations)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(designation) {
    setEditing(designation);
    setForm({ designationCode: designation.designationCode, designationName: designation.designationName });
    setErrors({});
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      if (editing) {
        await updateDesignation(editing.id, form);
        showToast('Designation updated');
      } else {
        await createDesignation(form);
        showToast('Designation created');
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
      await deleteDesignation(deleteTarget.id);
      showToast('Designation deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: 'designationCode', label: 'Code' },
    { key: 'designationName', label: 'Name' },
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
        title="Designations"
        description="Job designations used across worker registration."
        action={
          <Button icon={Plus} onClick={openCreate}>
            Add Designation
          </Button>
        }
      />

      <Table columns={columns} rows={designations} loading={loading} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Designation' : 'Add Designation'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Designation Code" required error={errors.designationCode}>
            <TextInput
              value={form.designationCode}
              onChange={(e) => setForm({ ...form, designationCode: e.target.value })}
              error={errors.designationCode}
            />
          </FormField>
          <FormField label="Designation Name" required error={errors.designationName}>
            <TextInput
              value={form.designationName}
              onChange={(e) => setForm({ ...form, designationName: e.target.value })}
              error={errors.designationName}
            />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Designation"
        message={`Are you sure you want to delete "${deleteTarget?.designationName}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={saving}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
