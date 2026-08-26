import { useEffect, useState } from 'react';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import FormField, { TextInput, Textarea } from '../../components/FormField';
import WorkerSearchSelect from '../../components/WorkerSearchSelect';
import WorkerInfoCard from '../../components/WorkerInfoCard';
import { createAccident, updateAccident } from '../../api/accidents';
import { toDateInputValue } from '../../utils/format';
import { toFormData } from '../../utils/toFormData';
import { getErrorMessage, getFieldErrors } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';

function buildEmptyForm() {
  return { accidentDate: '', form24ReportDate: '', natureOfAccident: '', dateReturnToWork: '', daysAbsent: '0' };
}

export default function AccidentFormModal({ open, onClose, onSaved, editing }) {
  const [worker, setWorker] = useState(null);
  const [form, setForm] = useState(buildEmptyForm());
  const [photo, setPhoto] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (editing) {
      setWorker(editing.worker);
      setForm({
        accidentDate: toDateInputValue(editing.accidentDate),
        form24ReportDate: toDateInputValue(editing.form24ReportDate),
        natureOfAccident: editing.natureOfAccident,
        dateReturnToWork: toDateInputValue(editing.dateReturnToWork),
        daysAbsent: editing.daysAbsent,
      });
    } else {
      setWorker(null);
      setForm(buildEmptyForm());
    }
    setPhoto(null);
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
    const payload = toFormData({ ...form, photo, workerId: worker?.id || editing.workerId });
    try {
      if (editing) {
        await updateAccident(editing.id, payload);
        showToast('Accident record updated');
      } else {
        await createAccident(payload);
        showToast('Accident record created');
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
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Accident Record' : 'Add Accident Record'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Worker" required error={errors.workerId}>
          {editing ? <WorkerInfoCard worker={editing.worker} /> : <WorkerSearchSelect value={worker} onSelect={setWorker} error={errors.workerId} />}
        </FormField>

        <FormField label="Nature of Accident" required error={errors.natureOfAccident}>
          <Textarea value={form.natureOfAccident} onChange={(e) => setForm({ ...form, natureOfAccident: e.target.value })} error={errors.natureOfAccident} />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Accident Date" required error={errors.accidentDate}>
            <TextInput type="date" value={form.accidentDate} onChange={(e) => setForm({ ...form, accidentDate: e.target.value })} error={errors.accidentDate} />
          </FormField>
          <FormField label="Form 24 Report Date" error={errors.form24ReportDate}>
            <TextInput type="date" value={form.form24ReportDate} onChange={(e) => setForm({ ...form, form24ReportDate: e.target.value })} error={errors.form24ReportDate} />
          </FormField>
          <FormField label="Date Return to Work" error={errors.dateReturnToWork}>
            <TextInput type="date" value={form.dateReturnToWork} onChange={(e) => setForm({ ...form, dateReturnToWork: e.target.value })} error={errors.dateReturnToWork} />
          </FormField>
          <FormField label="Days Absent" required error={errors.daysAbsent}>
            <TextInput type="number" min="0" value={form.daysAbsent} onChange={(e) => setForm({ ...form, daysAbsent: e.target.value })} error={errors.daysAbsent} />
          </FormField>
        </div>

        <FormField label="Photo" error={errors.photoUrl}>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setPhoto(e.target.files[0])}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200 dark:text-slate-400 dark:file:bg-slate-700 dark:file:text-slate-200 dark:hover:file:bg-slate-600" />
          {editing?.photoUrl && <a href={editing.photoUrl} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-indigo-600 hover:underline dark:text-indigo-400">View current file</a>}
        </FormField>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </form>
    </Modal>
  );
}
