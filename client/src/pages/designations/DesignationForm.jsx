import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import BackButton from '../../components/BackButton';
import FormSection from '../../components/FormSection';
import FormField, { TextInput } from '../../components/FormField';
import Button from '../../components/Button';
import { getDesignation, createDesignation, updateDesignation } from '../../api/designations';
import { getErrorMessage, getFieldErrors } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import './DesignationForm.css';

const EMPTY_FORM = { designationCode: '', designationName: '' };

export default function DesignationForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    getDesignation(id)
      .then((data) => {
        setForm({ designationCode: data.designationCode, designationName: data.designationName });
      })
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  function field(name) {
    return { value: form[name] ?? '', onChange: (e) => setForm({ ...form, [name]: e.target.value }) };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      if (isEdit) {
        await updateDesignation(id, form);
        showToast('Designation updated');
        navigate(`/designations/${id}`, { replace: true });
      } else {
        const created = await createDesignation(form);
        showToast('Designation created');
        navigate(`/designations/${created.id}`, { replace: true });
      }
    } catch (err) {
      setErrors(getFieldErrors(err));
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="designation-form-loading">Loading...</div>;

  return (
    <div>
      <BackButton to={isEdit ? `/designations/${id}` : '/designations'} />

      <PageHeader title={isEdit ? 'Edit Designation' : 'Add Designation'} description="Fields marked with * are required." />

      <form onSubmit={handleSubmit} className="designation-form-card">
        <FormSection title="Designation Details">
          <FormField label="Designation Code" required error={errors.designationCode}>
            <TextInput {...field('designationCode')} error={errors.designationCode} />
          </FormField>
          <FormField label="Designation Name" required error={errors.designationName}>
            <TextInput {...field('designationName')} error={errors.designationName} />
          </FormField>
        </FormSection>

        <div className="designation-form-actions-row">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </form>
    </div>
  );
}
