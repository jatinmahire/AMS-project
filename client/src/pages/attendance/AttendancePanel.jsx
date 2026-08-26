import { useEffect, useState } from 'react';
import { QrCode, X } from 'lucide-react';
import Button from '../../components/Button';
import FormField, { TextInput, Select } from '../../components/FormField';
import WorkerSearchSelect from '../../components/WorkerSearchSelect';
import { createAttendance, updateAttendance } from '../../api/attendance';
import { toDateInputValue, dayNameOf } from '../../utils/format';
import { getErrorMessage, getFieldErrors } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function buildEmptyForm() {
  return { date: todayIso(), inTime: '', outTime: '', status: 'PRESENT', buildingNo: '' };
}

function ReadOnlyField({ label, value }) {
  return (
    <FormField label={label}>
      <TextInput value={value || '-'} disabled />
    </FormField>
  );
}

export default function AttendancePanel({ editing, onSaved, onCancelEdit }) {
  const [worker, setWorker] = useState(editing?.worker || null);
  const [form, setForm] = useState(buildEmptyForm());
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (editing) {
      setWorker(editing.worker);
      setForm({
        date: toDateInputValue(editing.date),
        inTime: editing.inTime,
        outTime: editing.outTime || '',
        status: editing.status,
        buildingNo: editing.buildingNo || '',
      });
    } else {
      setWorker(null);
      setForm(buildEmptyForm());
    }
    setErrors({});
  }, [editing]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!worker) {
      setErrors({ workerId: 'Scan a QR code or search for a worker' });
      return;
    }
    setSaving(true);
    setErrors({});
    const payload = { ...form, workerId: worker.id };
    try {
      if (editing) {
        await updateAttendance(editing.id, payload);
        showToast('Attendance updated');
      } else {
        await createAttendance(payload);
        showToast('Attendance marked');
        setWorker(null);
        setForm(buildEmptyForm());
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
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {editing ? 'Edit Attendance' : 'Worker Attendance'}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {editing ? `Updating record for ${worker?.workerCode}` : 'Scan a worker QR code or search to mark attendance.'}
          </p>
        </div>
        {editing && (
          <button
            onClick={onCancelEdit}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            aria-label="Cancel edit"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {!editing && (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/40">
            <div className="relative flex h-32 w-32 items-center justify-center rounded-lg border-2 border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
              <span className="absolute left-1.5 top-1.5 h-4 w-4 border-l-2 border-t-2 border-indigo-500" />
              <span className="absolute right-1.5 top-1.5 h-4 w-4 border-r-2 border-t-2 border-indigo-500" />
              <span className="absolute bottom-1.5 left-1.5 h-4 w-4 border-b-2 border-l-2 border-indigo-500" />
              <span className="absolute bottom-1.5 right-1.5 h-4 w-4 border-b-2 border-r-2 border-indigo-500" />
              <QrCode size={48} className="text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-center text-xs text-slate-400 dark:text-slate-500">
              Camera QR scanning is coming in Phase 2 — search by worker code or name below for now.
            </p>
          </div>
        )}

        <FormField label="Worker ID / Search" required error={errors.workerId}>
          {editing ? (
            <TextInput value={`${editing.worker.workerCode} — ${editing.worker.firstName} ${editing.worker.lastName}`} disabled />
          ) : (
            <WorkerSearchSelect
              value={worker}
              onSelect={setWorker}
              error={errors.workerId}
              placeholder="Scan QR code or search by worker code / name"
            />
          )}
        </FormField>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <ReadOnlyField label="Worker ID" value={worker?.workerCode} />
          <ReadOnlyField label="First Name" value={worker?.firstName} />
          <ReadOnlyField label="Last Name" value={worker?.lastName} />
          <ReadOnlyField label="Contractor Name" value={worker?.contractor?.contractorName} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField label="In Time" required error={errors.inTime}>
            <TextInput type="time" value={form.inTime} onChange={(e) => setForm({ ...form, inTime: e.target.value })} error={errors.inTime} />
          </FormField>
          <FormField label="Out Time" error={errors.outTime}>
            <TextInput type="time" value={form.outTime} onChange={(e) => setForm({ ...form, outTime: e.target.value })} error={errors.outTime} />
          </FormField>
          <FormField label="Status" required error={errors.status}>
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="HALF_DAY">Half Day</option>
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField label="Date" required error={errors.date}>
            <TextInput type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} error={errors.date} />
          </FormField>
          <FormField label="Day">
            <TextInput value={dayNameOf(form.date)} disabled />
          </FormField>
          <FormField label="Building Number" error={errors.buildingNo}>
            <TextInput value={form.buildingNo} onChange={(e) => setForm({ ...form, buildingNo: e.target.value })} error={errors.buildingNo} />
          </FormField>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          {editing && (
            <Button type="button" variant="secondary" onClick={onCancelEdit} disabled={saving}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Submit'}
          </Button>
        </div>
      </form>
    </div>
  );
}
