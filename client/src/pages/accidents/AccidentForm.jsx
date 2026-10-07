import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import BackButton from '../../components/BackButton';
import FormSection from '../../components/FormSection';
import FormField, { TextInput, Textarea } from '../../components/FormField';
import Button from '../../components/Button';
import WorkerSearchSelect from '../../components/WorkerSearchSelect';
import WorkerInfoCard from '../../components/WorkerInfoCard';
import { getAccident, createAccident, updateAccident } from '../../api/accidents';
import { toDateInputValue } from '../../utils/format';
import { toFormData } from '../../utils/toFormData';
import { getErrorMessage, getFieldErrors } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import './AccidentForm.css';

const EMPTY_FORM = { accidentDate: '', form24ReportDate: '', natureOfAccident: '', dateReturnToWork: '', daysAbsent: '0' };

export default function AccidentForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [worker, setWorker] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [photo, setPhoto] = useState(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    getAccident(id)
      .then((data) => {
        setWorker(data.worker);
        setForm({
          accidentDate: toDateInputValue(data.accidentDate),
          form24ReportDate: toDateInputValue(data.form24ReportDate),
          natureOfAccident: data.natureOfAccident,
          dateReturnToWork: toDateInputValue(data.dateReturnToWork),
          daysAbsent: data.daysAbsent,
        });
        setCurrentPhotoUrl(data.photoUrl);
      })
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  function field(name) {
    return { value: form[name] ?? '', onChange: (e) => setForm({ ...form, [name]: e.target.value }) };
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const maxSize = 700 * 1024; // 700 KB
    if (file.size > maxSize) {
      setErrors((prev) => ({ ...prev, photoSize: 'File size must not exceed 700 KB (PDF or JPEG/PNG).' }));
      setPhoto(null);
      e.target.value = '';
      return;
    }
    setErrors((prev) => { const next = { ...prev }; delete next.photoSize; return next; });
    setPhoto(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!worker) {
      setErrors({ workerId: 'Select a worker' });
      return;
    }
    setSaving(true);
    setErrors({});
    const payload = toFormData({ ...form, photo, workerId: worker.id });
    try {
      if (isEdit) {
        await updateAccident(id, payload);
        showToast('Accident record updated');
        navigate(`/accidents/${id}`, { replace: true });
      } else {
        const created = await createAccident(payload);
        showToast('Accident record created');
        navigate(`/accidents/${created.id}`, { replace: true });
      }
    } catch (err) {
      setErrors(getFieldErrors(err));
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="accident-form-loading">Loading...</div>;

  return (
    <div>
      <BackButton to={isEdit ? `/accidents/${id}` : '/accidents'} />

      <PageHeader title={isEdit ? 'Edit Accident Record' : 'Add Accident Record'} description="Fields marked with * are required." />

      <form onSubmit={handleSubmit} className="accident-form-card">
        <FormSection title="Worker">
          <div className="accident-form-col-span">
            {isEdit ? <WorkerInfoCard worker={worker} /> : <WorkerSearchSelect value={worker} onSelect={setWorker} error={errors.workerId} />}
          </div>
        </FormSection>

        <FormSection title="Accident Details">
          <FormField label="Accident Date" required error={errors.accidentDate}>
            <TextInput type="date" {...field('accidentDate')} error={errors.accidentDate} />
          </FormField>
          <FormField label="Form 24 hours Report Date" error={errors.form24ReportDate}>
            <TextInput type="date" {...field('form24ReportDate')} error={errors.form24ReportDate} />
          </FormField>
          <FormField label="Date Return to Work" error={errors.dateReturnToWork}>
            <TextInput type="date" {...field('dateReturnToWork')} error={errors.dateReturnToWork} />
          </FormField>
          <FormField label="Days Absent" required error={errors.daysAbsent}>
            <TextInput type="number" min="0" {...field('daysAbsent')} error={errors.daysAbsent} />
          </FormField>
          <FormField label="Nature of Accident" required error={errors.natureOfAccident} className="accident-form-col-span">
            <Textarea {...field('natureOfAccident')} error={errors.natureOfAccident} />
          </FormField>
          <FormField label="Photo (PDF or JPEG, max 700KB)" required error={errors.photoUrl || errors.photoSize}>
            <input type="file" accept=".pdf,.jpg,.jpeg" onChange={handlePhotoChange}
              className="accident-form-file-input" />
            {currentPhotoUrl && <a href={currentPhotoUrl} target="_blank" rel="noreferrer" className="accident-form-current-file-link">View current file</a>}
          </FormField>
        </FormSection>

        <div className="accident-form-actions-row">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </form>
    </div>
  );
}
