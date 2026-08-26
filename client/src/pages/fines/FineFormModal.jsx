import { useEffect, useState } from 'react';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import FormField, { TextInput, Select, Textarea } from '../../components/FormField';
import WorkerSearchSelect from '../../components/WorkerSearchSelect';
import WorkerInfoCard from '../../components/WorkerInfoCard';
import { createFine, updateFine } from '../../api/fines';
import { toDateInputValue } from '../../utils/format';
import { getErrorMessage, getFieldErrors } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';

function buildEmptyForm() {
  return { offenceDate: '', offence: '', causeShown: 'false', witnessName: '', wagePeriod: '', wagesPayable: '', fineAmount: '', remarks: '' };
}

export default function FineFormModal({ open, onClose, onSaved, editing }) {
  const [worker, setWorker] = useState(null);
  const [form, setForm] = useState(buildEmptyForm());
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (editing) {
      setWorker(editing.worker);
      setForm({
        offenceDate: toDateInputValue(editing.offenceDate),
        offence: editing.offence,
        causeShown: String(editing.causeShown),
        witnessName: editing.witnessName || '',
        wagePeriod: editing.wagePeriod || '',
        wagesPayable: editing.wagesPayable || '',
        fineAmount: editing.fineAmount,
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
        await updateFine(editing.id, payload);
        showToast('Fine record updated');
      } else {
        await createFine(payload);
        showToast('Fine record created');
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
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Fine Record' : 'Add Fine Record'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Worker" required error={errors.workerId}>
          {editing ? <WorkerInfoCard worker={editing.worker} /> : <WorkerSearchSelect value={worker} onSelect={setWorker} error={errors.workerId} />}
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Offence Date" required error={errors.offenceDate}>
            <TextInput type="date" value={form.offenceDate} onChange={(e) => setForm({ ...form, offenceDate: e.target.value })} error={errors.offenceDate} />
          </FormField>
          <FormField label="Cause Shown" required error={errors.causeShown}>
            <Select value={form.causeShown} onChange={(e) => setForm({ ...form, causeShown: e.target.value })}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </Select>
          </FormField>
        </div>

        <FormField label="Offence" required error={errors.offence}>
          <Textarea value={form.offence} onChange={(e) => setForm({ ...form, offence: e.target.value })} error={errors.offence} />
        </FormField>

        <FormField label="Witness Name" error={errors.witnessName}>
          <TextInput value={form.witnessName} onChange={(e) => setForm({ ...form, witnessName: e.target.value })} error={errors.witnessName} />
        </FormField>

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Wage Period" error={errors.wagePeriod}>
            <TextInput value={form.wagePeriod} onChange={(e) => setForm({ ...form, wagePeriod: e.target.value })} error={errors.wagePeriod} />
          </FormField>
          <FormField label="Wages Payable" error={errors.wagesPayable}>
            <TextInput type="number" step="0.01" value={form.wagesPayable} onChange={(e) => setForm({ ...form, wagesPayable: e.target.value })} error={errors.wagesPayable} />
          </FormField>
          <FormField label="Fine Amount" required error={errors.fineAmount}>
            <TextInput type="number" step="0.01" value={form.fineAmount} onChange={(e) => setForm({ ...form, fineAmount: e.target.value })} error={errors.fineAmount} />
          </FormField>
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
