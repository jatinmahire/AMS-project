import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import BackButton from '../../components/BackButton';
import FormSection from '../../components/FormSection';
import FormField, { TextInput, Textarea } from '../../components/FormField';
import Button from '../../components/Button';
import WorkerSearchSelect from '../../components/WorkerSearchSelect';
import WorkerInfoCard from '../../components/WorkerInfoCard';
import { getAdvance, createAdvance, updateAdvance } from '../../api/advances';
import { toDateInputValue } from '../../utils/format';
import { getErrorMessage, getFieldErrors } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import './AdvanceForm.css';

const EMPTY_FORM = { advanceDate: '', wagesPeriod: '', wagesPayable: '', amount: '', purpose: '', installmentsCount: '1', remarks: '' };

export default function AdvanceForm() {
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
    getAdvance(id)
      .then((data) => {
        setWorker(data.worker);
        setForm({
          advanceDate: toDateInputValue(data.advanceDate),
          wagesPeriod: data.wagesPeriod || '',
          wagesPayable: data.wagesPayable || '',
          amount: data.amount,
          purpose: data.purpose,
          installmentsCount: data.installmentsCount,
          remarks: data.remarks || '',
        });
      })
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [id]);

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
    const payload = { ...form, workerId: worker.id };
    try {
      if (isEdit) {
        await updateAdvance(id, payload);
        showToast('Advance record updated');
        navigate(`/advances/${id}`, { replace: true });
      } else {
        const created = await createAdvance(payload);
        showToast('Advance created with repayment schedule');
        navigate(`/advances/${created.id}`, { replace: true });
      }
    } catch (err) {
      setErrors(getFieldErrors(err));
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="advance-form-loading">Loading...</div>;

  return (
    <div>
      <BackButton to={isEdit ? `/advances/${id}` : '/advances'} />

      <PageHeader title={isEdit ? 'Edit Advance' : 'Add Advance'} description="Fields marked with * are required." />

      <form onSubmit={handleSubmit} className="advance-form-card">
        <FormSection title="Worker">
          <div className="advance-form-col-span">
            {isEdit ? <WorkerInfoCard worker={worker} /> : <WorkerSearchSelect value={worker} onSelect={setWorker} error={errors.workerId} />}
          </div>
        </FormSection>

        <FormSection title="Advance Details">
          <FormField label="Advance Date" required error={errors.advanceDate}>
            <TextInput type="date" {...field('advanceDate')} error={errors.advanceDate} />
          </FormField>
          <FormField label="Wages Period" error={errors.wagesPeriod}>
            <TextInput {...field('wagesPeriod')} error={errors.wagesPeriod} />
          </FormField>
          <FormField label="Wages Payable" error={errors.wagesPayable}>
            <TextInput type="number" step="0.01" {...field('wagesPayable')} error={errors.wagesPayable} />
          </FormField>
          <FormField label="Purpose" required error={errors.purpose} className="advance-form-col-span">
            <Textarea {...field('purpose')} error={errors.purpose} />
          </FormField>
        </FormSection>

        <FormSection title="Amount & Installments">
          <FormField label="Amount" required error={errors.amount}>
            <TextInput type="number" step="0.01" {...field('amount')} error={errors.amount} disabled={isEdit} />
          </FormField>
          <FormField label="Installments" required error={errors.installmentsCount}>
            <TextInput type="number" min="1" {...field('installmentsCount')} error={errors.installmentsCount} disabled={isEdit} />
          </FormField>
          <FormField label="Remarks" error={errors.remarks} className="advance-form-col-span">
            <Textarea {...field('remarks')} error={errors.remarks} />
          </FormField>
        </FormSection>

        <div className="advance-form-actions-row">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </form>
    </div>
  );
}
