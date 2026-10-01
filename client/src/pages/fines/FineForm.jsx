import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import BackButton from '../../components/BackButton';
import FormSection from '../../components/FormSection';
import FormField, { TextInput, Textarea } from '../../components/FormField';
import Button from '../../components/Button';
import WorkerSearchSelect from '../../components/WorkerSearchSelect';
import WorkerInfoCard from '../../components/WorkerInfoCard';
import { getFine, createFine, updateFine } from '../../api/fines';
import { toDateInputValue } from '../../utils/format';
import { getErrorMessage, getFieldErrors } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import './FineForm.css';

const EMPTY_FORM = { offenceDate: '', offence: '', causeShown: '', witnessName: '', wagePeriod: '', wagesPayable: '', fineAmount: '', dateRealised: '', remarks: '' };

export default function FineForm() {
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
    getFine(id)
      .then((data) => {
        setWorker(data.worker);
        setForm({
          offenceDate: toDateInputValue(data.offenceDate),
          offence: data.offence,
          causeShown: data.causeShown || '',
          witnessName: data.witnessName || '',
          wagePeriod: data.wagePeriod || '',
          wagesPayable: data.wagesPayable || '',
          fineAmount: data.fineAmount,
          dateRealised: toDateInputValue(data.dateRealised),
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
        await updateFine(id, payload);
        showToast('Fine record updated');
        navigate(`/fines/${id}`, { replace: true });
      } else {
        const created = await createFine(payload);
        showToast('Fine record created');
        navigate(`/fines/${created.id}`, { replace: true });
      }
    } catch (err) {
      setErrors(getFieldErrors(err));
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="fine-form-loading">Loading...</div>;

  return (
    <div>
      <BackButton to={isEdit ? `/fines/${id}` : '/fines'} />

      <PageHeader title={isEdit ? 'Edit Fine Record' : 'Add Fine Record'} description="Fields marked with * are required." />

      <form onSubmit={handleSubmit} className="fine-form-card">
        <FormSection title="Worker">
          <div className="fine-form-col-span">
            {isEdit ? <WorkerInfoCard worker={worker} /> : <WorkerSearchSelect value={worker} onSelect={setWorker} error={errors.workerId} />}
          </div>
        </FormSection>

        <FormSection title="Offence Details">
          <FormField label="Offence Date" required error={errors.offenceDate}>
            <TextInput type="date" {...field('offenceDate')} error={errors.offenceDate} />
          </FormField>
          <FormField label="Offence" required error={errors.offence} className="fine-form-col-span">
            <Textarea {...field('offence')} error={errors.offence} />
          </FormField>
          <FormField label="Whether Workman Showed Cause Against Fine" error={errors.causeShown} className="fine-form-col-span">
            <Textarea {...field('causeShown')} error={errors.causeShown} />
          </FormField>
          <FormField label="Witness Name" error={errors.witnessName}>
            <TextInput {...field('witnessName')} error={errors.witnessName} />
          </FormField>
        </FormSection>

        <FormSection title="Wages & Fine">
          <FormField label="Wage Period" error={errors.wagePeriod}>
            <TextInput {...field('wagePeriod')} error={errors.wagePeriod} />
          </FormField>
          <FormField label="Wages Payable" error={errors.wagesPayable}>
            <TextInput type="number" step="0.01" {...field('wagesPayable')} error={errors.wagesPayable} />
          </FormField>
          <FormField label="Fine Amount" required error={errors.fineAmount}>
            <TextInput type="number" step="0.01" {...field('fineAmount')} error={errors.fineAmount} />
          </FormField>
          <FormField label="Date Realised" error={errors.dateRealised}>
            <TextInput type="date" {...field('dateRealised')} error={errors.dateRealised} />
          </FormField>
          <FormField label="Remarks" error={errors.remarks} className="fine-form-col-span">
            <Textarea {...field('remarks')} error={errors.remarks} />
          </FormField>
        </FormSection>

        <div className="fine-form-actions-row">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </form>
    </div>
  );
}
