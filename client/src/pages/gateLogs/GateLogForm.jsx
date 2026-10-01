import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import BackButton from '../../components/BackButton';
import FormSection from '../../components/FormSection';
import FormField, { TextInput, Select } from '../../components/FormField';
import Button from '../../components/Button';
import WorkerSearchSelect from '../../components/WorkerSearchSelect';
import { createGateLog } from '../../api/gateLogs';
import { toDateTimeInputValue } from '../../utils/format';
import { getErrorMessage, getFieldErrors } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import './GateLogForm.css';

const EMPTY_FORM = { direction: 'INWARD', gateNo: '', timestamp: toDateTimeInputValue(new Date()) };

export default function GateLogForm() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [worker, setWorker] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function field(name) {
    return { value: form[name] ?? '', onChange: (e) => setForm({ ...form, [name]: e.target.value }) };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!worker) {
      setErrors({ workerId: 'Select a worker' });
      return;
    }
    setSaving(true);
    setErrors({});
    try {
      await createGateLog({ ...form, workerId: worker.id });
      showToast('Gate movement recorded');
      navigate('/gate-logs', { replace: true });
    } catch (err) {
      setErrors(getFieldErrors(err));
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <BackButton to="/gate-logs" />

      <PageHeader title="Record Gate Movement" description="Fields marked with * are required." />

      <form onSubmit={handleSubmit} className="gate-log-form-card">
        <FormSection title="Worker">
          <div className="gate-log-form-col-span">
            <WorkerSearchSelect value={worker} onSelect={setWorker} error={errors.workerId} />
          </div>
        </FormSection>

        <FormSection title="Movement Details">
          <FormField label="Direction" required error={errors.direction}>
            <Select {...field('direction')}>
              <option value="INWARD">Inward</option>
              <option value="OUTWARD">Outward</option>
            </Select>
          </FormField>
          <FormField label="Gate No." required error={errors.gateNo}>
            <TextInput {...field('gateNo')} error={errors.gateNo} />
          </FormField>
          <FormField label="Timestamp" required error={errors.timestamp}>
            <TextInput type="datetime-local" {...field('timestamp')} error={errors.timestamp} />
          </FormField>
        </FormSection>

        <div className="gate-log-form-actions-row">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </form>
    </div>
  );
}
