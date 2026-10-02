import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import BackButton from '../../components/BackButton';
import FormSection from '../../components/FormSection';
import FormField, { TextInput, Textarea } from '../../components/FormField';
import Button from '../../components/Button';
import WorkerSearchSelect from '../../components/WorkerSearchSelect';
import WorkerInfoCard from '../../components/WorkerInfoCard';
import { getOvertime, createOvertime, updateOvertime } from '../../api/overtimes';
import { toDateInputValue, formatCurrency } from '../../utils/format';
import { getErrorMessage, getFieldErrors } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import './OvertimeForm.css';

const EMPTY_FORM = { otDate: '', hoursWorked: '', normalWageRate: '', otWageRate: '', remarks: '' };

const POSITIVE_FIELDS = [['hoursWorked', 'Hours worked'], ['normalWageRate', 'Normal wage rate'], ['otWageRate', 'OT wage rate']];

export default function OvertimeForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [worker, setWorker] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    getOvertime(id)
      .then((data) => {
        setWorker(data.worker);
        setForm({
          otDate: toDateInputValue(data.otDate),
          hoursWorked: data.hoursWorked,
          normalWageRate: data.normalWageRate,
          otWageRate: data.otWageRate,
          remarks: data.remarks || '',
        });
      })
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  function field(name) {
    return { value: form[name] ?? '', onChange: (e) => setForm({ ...form, [name]: e.target.value }) };
  }

  const estimatedEarnings = Number(form.hoursWorked || 0) * Number(form.otWageRate || 0);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!worker) {
      setErrors({ workerId: 'Select a worker' });
      return;
    }
    const amountErrors = {};
    for (const [key, label] of POSITIVE_FIELDS) {
      if (!(Number(form[key]) > 0)) amountErrors[key] = `${label} must be greater than 0`;
    }
    if (Object.keys(amountErrors).length) {
      setErrors(amountErrors);
      return;
    }
    setSaving(true);
    setErrors({});
    const payload = { ...form, workerId: worker.id };
    try {
      if (isEdit) {
        await updateOvertime(id, payload);
        showToast('Overtime record updated');
        navigate(`/overtimes/${id}`, { replace: true });
      } else {
        const created = await createOvertime(payload);
        showToast('Overtime record created');
        navigate(`/overtimes/${created.id}`, { replace: true });
      }
    } catch (err) {
      setErrors(getFieldErrors(err));
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="overtime-form-loading">Loading...</div>;

  return (
    <div>
      <BackButton to={isEdit ? `/overtimes/${id}` : '/overtimes'} />

      <PageHeader title={isEdit ? 'Edit Overtime Record' : 'Add Overtime Record'} description="Fields marked with * are required." />

      <form onSubmit={handleSubmit} className="overtime-form-card">
        <FormSection title="Worker">
          <div className="overtime-form-col-span">
            {isEdit ? <WorkerInfoCard worker={worker} /> : <WorkerSearchSelect value={worker} onSelect={setWorker} error={errors.workerId} />}
          </div>
        </FormSection>

        <FormSection title="Overtime Details">
          <FormField label="Overtime Date" required error={errors.otDate}>
            <TextInput type="date" {...field('otDate')} error={errors.otDate} />
          </FormField>
          <FormField label="Hours Worked" required error={errors.hoursWorked}>
            <TextInput type="number" step="0.25" min="0" {...field('hoursWorked')} error={errors.hoursWorked} />
          </FormField>
          <FormField label="Normal Wage Rate" required error={errors.normalWageRate}>
            <TextInput type="number" step="0.01" min="0" {...field('normalWageRate')} error={errors.normalWageRate} />
          </FormField>
          <FormField label="OT Wage Rate" required error={errors.otWageRate}>
            <TextInput type="number" step="0.01" min="0" {...field('otWageRate')} error={errors.otWageRate} />
          </FormField>
          <div className="overtime-form-earnings-box">
            Estimated OT Earnings: <span className="overtime-form-earnings-value">{formatCurrency(estimatedEarnings)}</span>
          </div>
          <FormField label="Remarks" error={errors.remarks} className="overtime-form-col-span">
            <Textarea {...field('remarks')} error={errors.remarks} />
          </FormField>
        </FormSection>

        <div className="overtime-form-actions-row">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </form>
    </div>
  );
}
