import { useEffect, useState } from 'react';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import FormField, { TextInput, Select, Textarea } from '../../components/FormField';
import WorkerSearchSelect from '../../components/WorkerSearchSelect';
import WorkerInfoCard from '../../components/WorkerInfoCard';
import { createDamage, updateDamage } from '../../api/damages';
import { toDateInputValue } from '../../utils/format';
import { toFormData } from '../../utils/toFormData';
import { getErrorMessage, getFieldErrors } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';

function buildEmptyForm() {
  return { damageDate: '', particulars: '', causeShown: 'false', witnessName: '', deductionAmount: '', installments: '1', remarks: '' };
}

export default function DamageFormModal({ open, onClose, onSaved, editing }) {
  const [worker, setWorker] = useState(null);
  const [form, setForm] = useState(buildEmptyForm());
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (editing) {
      setWorker(editing.worker);
      setForm({
        damageDate: toDateInputValue(editing.damageDate),
        particulars: editing.particulars,
        causeShown: String(editing.causeShown),
        witnessName: editing.witnessName || '',
        deductionAmount: editing.deductionAmount,
        installments: editing.installments,
        remarks: editing.remarks || '',
      });
    } else {
      setWorker(null);
      setForm(buildEmptyForm());
    }
    setImage(null);
    setErrors({});
  }, [editing, open]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!worker && !editing) {
      setErrors({ workerId: 'Select a worker' });
      return;
    }
    setSaving(true);
    setErrors({});
    const payload = toFormData({ ...form, image, workerId: worker?.id || editing.workerId });
    try {
      if (editing) {
        await updateDamage(editing.id, payload);
        showToast('Damage record updated');
      } else {
        await createDamage(payload);
        showToast('Damage record created');
      }
      onSaved();
    } catch (err) {
      setErrors(getFieldErrors(err));
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Damage Record' : 'Add Damage Record'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Worker" required error={errors.workerId}>
          {editing ? <WorkerInfoCard worker={editing.worker} /> : <WorkerSearchSelect value={worker} onSelect={setWorker} error={errors.workerId} />}
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Damage Date" required error={errors.damageDate}>
            <TextInput type="date" value={form.damageDate} onChange={(e) => setForm({ ...form, damageDate: e.target.value })} error={errors.damageDate} />
          </FormField>
          <FormField label="Cause Shown" required error={errors.causeShown}>
            <Select value={form.causeShown} onChange={(e) => setForm({ ...form, causeShown: e.target.value })}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </Select>
          </FormField>
        </div>

        <FormField label="Particulars" required error={errors.particulars}>
          <Textarea value={form.particulars} onChange={(e) => setForm({ ...form, particulars: e.target.value })} error={errors.particulars} />
        </FormField>

        <FormField label="Witness Name" error={errors.witnessName}>
          <TextInput value={form.witnessName} onChange={(e) => setForm({ ...form, witnessName: e.target.value })} error={errors.witnessName} />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Deduction Amount" required error={errors.deductionAmount}>
            <TextInput type="number" step="0.01" value={form.deductionAmount} onChange={(e) => setForm({ ...form, deductionAmount: e.target.value })} error={errors.deductionAmount} />
          </FormField>
          <FormField label="Installments" required error={errors.installments}>
            <TextInput type="number" min="1" value={form.installments} onChange={(e) => setForm({ ...form, installments: e.target.value })} error={errors.installments} />
          </FormField>
        </div>

        <FormField label="Photo" error={errors.imageUrl}>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setImage(e.target.files[0])}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200 dark:text-slate-400 dark:file:bg-slate-700 dark:file:text-slate-200 dark:hover:file:bg-slate-600" />
          {editing?.imageUrl && <a href={editing.imageUrl} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-indigo-600 hover:underline dark:text-indigo-400">View current file</a>}
        </FormField>

        <FormField label="Remarks" error={errors.remarks}>
          <Textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} error={errors.remarks} />
        </FormField>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </form>
    </Modal>
  );
}
