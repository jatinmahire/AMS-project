import { useEffect, useState } from 'react';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import FormField, { TextInput, Textarea } from '../../components/FormField';
import WorkerSearchSelect from '../../components/WorkerSearchSelect';
import WorkerInfoCard from '../../components/WorkerInfoCard';
import StatusBadge from '../../components/StatusBadge';
import { createAdvance, updateAdvance } from '../../api/advances';
import { toDateInputValue, formatDate, formatCurrency } from '../../utils/format';
import { getErrorMessage, getFieldErrors } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';

function buildEmptyForm() {
  return { advanceDate: '', wagesPeriod: '', wagesPayable: '', amount: '', purpose: '', installmentsCount: '1', remarks: '' };
}

export default function AdvanceFormModal({ open, onClose, onSaved, editing }) {
  const [worker, setWorker] = useState(null);
  const [form, setForm] = useState(buildEmptyForm());
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (editing) {
      setWorker(editing.worker);
      setForm({
        advanceDate: toDateInputValue(editing.advanceDate),
        wagesPeriod: editing.wagesPeriod || '',
        wagesPayable: editing.wagesPayable || '',
        amount: editing.amount,
        purpose: editing.purpose,
        installmentsCount: editing.installmentsCount,
        remarks: editing.remarks || '',
      });
    } else {
      setWorker(null);
      setForm(buildEmptyForm());
    }
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
    const payload = { ...form, workerId: worker?.id || editing.workerId };
    try {
      if (editing) {
        await updateAdvance(editing.id, payload);
        showToast('Advance record updated');
      } else {
        await createAdvance(payload);
        showToast('Advance created with repayment schedule');
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
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Advance' : 'Add Advance'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Worker" required error={errors.workerId}>
          {editing ? <WorkerInfoCard worker={editing.worker} /> : <WorkerSearchSelect value={worker} onSelect={setWorker} error={errors.workerId} />}
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Advance Date" required error={errors.advanceDate}>
            <TextInput type="date" value={form.advanceDate} onChange={(e) => setForm({ ...form, advanceDate: e.target.value })} error={errors.advanceDate} />
          </FormField>
          <FormField label="Wages Period" error={errors.wagesPeriod}>
            <TextInput value={form.wagesPeriod} onChange={(e) => setForm({ ...form, wagesPeriod: e.target.value })} error={errors.wagesPeriod} />
          </FormField>
        </div>

        <FormField label="Purpose" required error={errors.purpose}>
          <Textarea value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} error={errors.purpose} />
        </FormField>

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Wages Payable" error={errors.wagesPayable}>
            <TextInput type="number" step="0.01" value={form.wagesPayable} onChange={(e) => setForm({ ...form, wagesPayable: e.target.value })} error={errors.wagesPayable} />
          </FormField>
          <FormField label="Amount" required error={errors.amount}>
            <TextInput type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} error={errors.amount} disabled={!!editing} />
          </FormField>
          <FormField label="Installments" required error={errors.installmentsCount}>
            <TextInput type="number" min="1" value={form.installmentsCount} onChange={(e) => setForm({ ...form, installmentsCount: e.target.value })} error={errors.installmentsCount} disabled={!!editing} />
          </FormField>
        </div>

        <FormField label="Remarks" error={errors.remarks}>
          <Textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} error={errors.remarks} />
        </FormField>

        {editing?.repayments?.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Repayment Schedule</p>
            <div className="overflow-hidden rounded-md border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-3 py-2 font-medium text-slate-600 dark:text-slate-400">#</th>
                    <th className="px-3 py-2 font-medium text-slate-600 dark:text-slate-400">Due Date</th>
                    <th className="px-3 py-2 font-medium text-slate-600 dark:text-slate-400">Amount</th>
                    <th className="px-3 py-2 font-medium text-slate-600 dark:text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {editing.repayments.map((r) => (
                    <tr key={r.id}>
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{r.installmentNo}</td>
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{formatDate(r.dueDate)}</td>
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{formatCurrency(r.amount)}</td>
                      <td className="px-3 py-2"><StatusBadge status={r.paidStatus} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </form>
    </Modal>
  );
}
