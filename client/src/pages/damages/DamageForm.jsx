import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import BackButton from '../../components/BackButton';
import FormSection from '../../components/FormSection';
import FormField, { TextInput, Textarea } from '../../components/FormField';
import Button from '../../components/Button';
import AlphabetInput from '../../components/AlphabetInput';
import WorkerSearchSelect from '../../components/WorkerSearchSelect';
import WorkerInfoCard from '../../components/WorkerInfoCard';
import { getDamage, createDamage, updateDamage } from '../../api/damages';
import { toDateInputValue } from '../../utils/format';
import { toFormData } from '../../utils/toFormData';
import { getErrorMessage, getFieldErrors } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import './DamageForm.css';

const EMPTY_FORM = { damageDate: '', particulars: '', causeShown: '', nameOfWorksmen: '', witnessName: '', deductionAmount: '', installments: '1', remarks: '' };

export default function DamageForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [worker, setWorker] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [image, setImage] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    getDamage(id)
      .then((data) => {
        setWorker(data.worker);
        setForm({
          damageDate: toDateInputValue(data.damageDate),
          particulars: data.particulars,
          causeShown: data.causeShown || '',
          nameOfWorksmen: data.nameOfWorksmen || '',
          witnessName: data.witnessName || '',
          deductionAmount: data.deductionAmount,
          installments: data.installments,
          remarks: data.remarks || '',
        });
        setCurrentImageUrl(data.imageUrl);
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
    const payload = toFormData({ ...form, image, workerId: worker.id });
    try {
      if (isEdit) {
        await updateDamage(id, payload);
        showToast('Damage record updated');
        navigate(`/damages/${id}`, { replace: true });
      } else {
        const created = await createDamage(payload);
        showToast('Damage record created');
        navigate(`/damages/${created.id}`, { replace: true });
      }
    } catch (err) {
      setErrors(getFieldErrors(err));
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="damage-form-loading">Loading...</div>;

  return (
    <div>
      <BackButton to={isEdit ? `/damages/${id}` : '/damages'} />

      <PageHeader title={isEdit ? 'Edit Damage Record' : 'Add Damage Record'} description="Fields marked with * are required." />

      <form onSubmit={handleSubmit} className="damage-form-card">
        <FormSection title="Worker">
          <div className="damage-form-col-span">
            {isEdit ? <WorkerInfoCard worker={worker} /> : <WorkerSearchSelect value={worker} onSelect={setWorker} error={errors.workerId} />}
          </div>
        </FormSection>

        <FormSection title="Damage Details">
          <FormField label="Damage Date" required error={errors.damageDate}>
            <TextInput type="date" {...field('damageDate')} error={errors.damageDate} />
          </FormField>
          <FormField label="Name of Worksmen (if any)" error={errors.nameOfWorksmen}>
            <AlphabetInput {...field('nameOfWorksmen')} maxLength={30} error={errors.nameOfWorksmen} />
          </FormField>
          <FormField label="Witness Name" error={errors.witnessName}>
            <AlphabetInput {...field('witnessName')} maxLength={30} error={errors.witnessName} />
          </FormField>
          <FormField label="Particulars" required error={errors.particulars} className="damage-form-col-span">
            <Textarea {...field('particulars')} error={errors.particulars} />
          </FormField>
          <FormField label="Whether Workman Showed Cause Against Deduction" error={errors.causeShown} className="damage-form-col-span">
            <Textarea {...field('causeShown')} error={errors.causeShown} />
          </FormField>
        </FormSection>

        <FormSection title="Deduction & Photo">
          <FormField label="Deduction Amount" required error={errors.deductionAmount}>
            <TextInput type="number" step="0.01" min="0" {...field('deductionAmount')} error={errors.deductionAmount} />
          </FormField>
          <FormField label="Installments" required error={errors.installments}>
            <TextInput type="number" min="1" {...field('installments')} error={errors.installments} />
          </FormField>
          <FormField label="Photo" error={errors.imageUrl}>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setImage(e.target.files[0])}
              className="damage-form-file-input" />
            {currentImageUrl && <a href={currentImageUrl} target="_blank" rel="noreferrer" className="damage-form-current-file-link">View current file</a>}
          </FormField>
          <FormField label="Remarks" error={errors.remarks} className="damage-form-col-span">
            <Textarea {...field('remarks')} error={errors.remarks} />
          </FormField>
        </FormSection>

        <div className="damage-form-actions-row">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </form>
    </div>
  );
}
