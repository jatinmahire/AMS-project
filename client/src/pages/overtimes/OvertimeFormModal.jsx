import { useEffect, useState } from 'react';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import FormField, { TextInput, Textarea } from '../../components/FormField';
import WorkerSearchSelect from '../../components/WorkerSearchSelect';
import WorkerInfoCard from '../../components/WorkerInfoCard';
import { createOvertime, updateOvertime } from '../../api/overtimes';
import { toDateInputValue, formatCurrency } from '../../utils/format';
import { getErrorMessage, getFieldErrors } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';

function buildEmptyForm() {
  return { otDate: '', hoursWorked: '', normalWageRate: '', otWageRate: '', remarks: '' };
}

export default function OvertimeFormModal({ open, onClose, onSaved, editing }) {
  const [worker, setWorker] = useState(null);
  const [form, setForm] = useState(buildEmptyForm());
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (editing) {
      setWorker(editing.worker);
      setForm({
        otDate: toDateInputValue(editing.otDate),
        hoursWorked: editing.hoursWorked,
        normalWageRate: editing.normalWageRate,
        otWageRate: editing.otWageRate,
        remarks: editing.remarks || '',
      });
    } else {
      setWorker(null);
      setForm(buildEmptyForm());
    }
    setErrors({});
  }, [editing, open]);

  const estimatedEarnings = Number(form.hoursWorked || 0) * Number(form.otWageRate || 0);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!worker && !editing) {
      setErrors({ workerId: 'Select a worker' });
      return;
    }
    setSaving(true);
    setErrors({});
    const payload = { ...form, workerId: worker?.id || editing.workerId };
    try {
      if (editing) {
        await updateOvertime(editing.id, payload);
        showToast('Overtime record updated');
      } else {
        await createOvertime(payload);
        showToast('Overtime record created');
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
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Overtime Record' : 'Add Overtime Record'} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Worker" required error={errors.workerId}>
          {editing ? <WorkerInfoCard worker={editing.worker} /> : <WorkerSearchSelect value={worker} onSelect={setWorker} error={errors.workerId} />}
        </FormField>

        <FormField label="Overtime Date" required error={errors.otDate}>
          <TextInput type="date" value={form.otDate} onChange={(e) => setForm({ ...form, otDate: e.target.value })} error={errors.otDate} />
        </FormField>

        <FormField label="Hours Worked" required error={errors.hoursWorked}>
          <TextInput type="number" step="0.25" value={form.hoursWorked} onChange={(e) => setForm({ ...form, hoursWorked: e.target.value })} error={errors.hoursWorked} />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Normal Wage Rate" required error={errors.normalWageRate}>
            <TextInput type="number" step="0.01" value={form.normalWageRate} onChange={(e) => setForm({ ...form, normalWageRate: e.target.value })} error={errors.normalWageRate} />
          </FormField>
          <FormField label="OT Wage Rate" required error={errors.otWageRate}>
            <TextInput type="number" step="0.01" value={form.otWageRate} onChange={(e) => setForm({ ...form, otWageRate: e.target.value })} error={errors.otWageRate} />
          </FormField>
        </div>

        <div className="rounded-md bg-slate-50 px-4 py-2 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
          Estimated OT Earnings: <span className="font-medium text-slate-800 dark:text-slate-100">{formatCurrency(estimatedEarnings)}</span>
        </div>

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
