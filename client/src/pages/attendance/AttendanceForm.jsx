import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QrCode, Search } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import BackButton from '../../components/BackButton';
import Button from '../../components/Button';
import FormField, { TextInput, Select } from '../../components/FormField';
import WorkerSearchSelect from '../../components/WorkerSearchSelect';
import QrScanner from '../../components/QrScanner';
import { getAttendance, createAttendance, updateAttendance } from '../../api/attendance';
import { scanWorkerQr } from '../../api/workers';
import { toDateInputValue, dayNameOf } from '../../utils/format';
import { getErrorMessage, getFieldErrors } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import { enqueueAttendance } from '../../utils/offlineQueue';
import { isNetworkError } from '../../utils/offlineSync';
import './AttendanceForm.css';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function buildEmptyForm() {
  return { date: todayIso(), inTime: '', outTime: '', status: 'PRESENT', buildingNo: '' };
}

function nowTimeString() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function ReadOnlyField({ label, value }) {
  return (
    <FormField label={label}>
      <TextInput value={value || '-'} disabled />
    </FormField>
  );
}

export default function AttendanceForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [worker, setWorker] = useState(null);
  const [form, setForm] = useState(buildEmptyForm());
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [scannerMode, setScannerMode] = useState(true);

  const handleScan = useCallback(
    (code) => {
      scanWorkerQr(code)
        .then((scannedWorker) => {
          setWorker(scannedWorker);
          setForm((prev) => ({ ...prev, inTime: prev.inTime || nowTimeString() }));
          setErrors({});
          setScannerMode(false);
          showToast(`Scanned ${scannedWorker.workerCode} — ${scannedWorker.firstName} ${scannedWorker.lastName}`);
        })
        .catch((err) => showToast(getErrorMessage(err), 'error'));
    },
    [showToast]
  );

  const handleScannerError = useCallback(() => {
    setScannerMode(false);
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    getAttendance(id)
      .then((data) => {
        setWorker(data.worker);
        setForm({
          date: toDateInputValue(data.date),
          inTime: data.inTime,
          outTime: data.outTime || '',
          status: data.status,
          buildingNo: data.buildingNo || '',
        });
      })
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [id]);

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
      if (isEdit) {
        await updateAttendance(id, payload);
        showToast('Attendance updated');
        navigate(`/attendance/${id}`, { replace: true });
      } else {
        const created = await createAttendance(payload);
        showToast('Attendance marked');
        navigate(`/attendance/${created.id}`, { replace: true });
      }
    } catch (err) {
      if (isNetworkError(err)) {
        await enqueueAttendance({ isEdit, editId: id, payload, createdAt: Date.now() });
        showToast(`No connection — ${worker.workerCode}'s attendance saved offline and will sync automatically`);
        navigate('/attendance', { replace: true });
        return;
      }
      setErrors(getFieldErrors(err));
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="attendance-form-loading">Loading...</div>;

  return (
    <div>
      <BackButton to={isEdit ? `/attendance/${id}` : '/attendance'} />

      <PageHeader
        title={isEdit ? 'Edit Attendance' : 'Worker Attendance'}
        description={isEdit ? `Updating record for ${worker?.workerCode}` : 'Scan a worker QR code or search to mark attendance.'}
      />

      <form onSubmit={handleSubmit} className="attendance-form-card">
        {!isEdit && scannerMode && (
          <div className="attendance-form-scanner-wrap">
            <QrScanner onScan={handleScan} onError={handleScannerError} />
            <button
              type="button"
              onClick={() => setScannerMode(false)}
              className="attendance-form-toggle-link"
            >
              <Search size={14} /> Search manually instead
            </button>
          </div>
        )}

        {!isEdit && !scannerMode && (
          <button
            type="button"
            onClick={() => setScannerMode(true)}
            className="attendance-form-toggle-link"
          >
            <QrCode size={14} /> Use camera to scan instead
          </button>
        )}

        <FormField label="Worker ID / Search" required error={errors.workerId}>
          {isEdit ? (
            <TextInput value={`${worker.workerCode} — ${worker.firstName} ${worker.lastName}`} disabled />
          ) : (
            <WorkerSearchSelect
              value={worker}
              onSelect={setWorker}
              error={errors.workerId}
              placeholder="Scan QR code or search by worker code / name"
            />
          )}
        </FormField>

        <div className="attendance-form-readonly-grid">
          <ReadOnlyField label="Worker ID" value={worker?.workerCode} />
          <ReadOnlyField label="First Name" value={worker?.firstName} />
          <ReadOnlyField label="Last Name" value={worker?.lastName} />
          <ReadOnlyField label="Contractor Name" value={worker?.contractor?.contractorName} />
        </div>

        <div className="attendance-form-row-3">
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

        <div className="attendance-form-row-3">
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

        <div className="attendance-form-actions-row">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Submit'}</Button>
        </div>
      </form>
    </div>
  );
}
