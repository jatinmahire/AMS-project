import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import FormField, { TextInput, Select } from '../../components/FormField';
import {
  listLabourCategories,
  createLabourCategory,
  updateLabourCategory,
  deleteLabourCategory,
} from '../../api/labourCategories';
import { formatCurrency } from '../../utils/format';
import { getErrorMessage, getFieldErrors } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';

const LABOUR_TYPES = ['SKILLED', 'SEMI_SKILLED', 'UNSKILLED', 'HIGH_SKILLED'];
const EMPTY_FORM = { categoryCode: '', categoryName: 'SKILLED', ratePerDay: '' };

export default function LabourCategories() {
  const [categories, setCategories] = useState([]);
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
    listLabourCategories()
      .then(setCategories)
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

  function openEdit(category) {
    setEditing(category);
    setForm({ categoryCode: category.categoryCode, categoryName: category.categoryName, ratePerDay: category.ratePerDay });
    setErrors({});
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      if (editing) {
        await updateLabourCategory(editing.id, form);
        showToast('Labour category updated');
      } else {
        await createLabourCategory(form);
        showToast('Labour category created');
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
      await deleteLabourCategory(deleteTarget.id);
      showToast('Labour category deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: 'categoryCode', label: 'Code' },
    { key: 'categoryName', label: 'Type', render: (row) => row.categoryName.replace('_', ' ') },
    { key: 'ratePerDay', label: 'Rate / Day', render: (row) => formatCurrency(row.ratePerDay) },
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
        title="Labour Categories"
        description="Skill categories and their daily wage rate."
        action={
          <Button icon={Plus} onClick={openCreate}>
            Add Category
          </Button>
        }
      />

      <Table columns={columns} rows={categories} loading={loading} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'Add Category'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Category Code" required error={errors.categoryCode}>
            <TextInput
              value={form.categoryCode}
              onChange={(e) => setForm({ ...form, categoryCode: e.target.value })}
              error={errors.categoryCode}
            />
          </FormField>
          <FormField label="Labour Type" required error={errors.categoryName}>
            <Select value={form.categoryName} onChange={(e) => setForm({ ...form, categoryName: e.target.value })}>
              {LABOUR_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replace('_', ' ')}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Rate Per Day" required error={errors.ratePerDay}>
            <TextInput
              type="number"
              step="0.01"
              value={form.ratePerDay}
              onChange={(e) => setForm({ ...form, ratePerDay: e.target.value })}
              error={errors.ratePerDay}
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
        title="Delete Labour Category"
        message={`Are you sure you want to delete "${deleteTarget?.categoryCode}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={saving}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
