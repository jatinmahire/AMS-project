import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import BackButton from '../../components/BackButton';
import FormSection from '../../components/FormSection';
import FormField, { TextInput, Select } from '../../components/FormField';
import Button from '../../components/Button';
import { getLabourCategory, createLabourCategory, updateLabourCategory } from '../../api/labourCategories';
import { getErrorMessage, getFieldErrors } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import './LabourCategoryForm.css';

const LABOUR_TYPES = ['SKILLED', 'SEMI_SKILLED', 'UNSKILLED', 'HIGH_SKILLED'];
const EMPTY_FORM = { categoryCode: '', categoryName: 'SKILLED', ratePerDay: '' };

export default function LabourCategoryForm() {
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
    getLabourCategory(id)
      .then((data) => {
        setForm({ categoryCode: data.categoryCode, categoryName: data.categoryName, ratePerDay: data.ratePerDay });
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
        await updateLabourCategory(id, form);
        showToast('Labour category updated');
        navigate(`/labour-categories/${id}`, { replace: true });
      } else {
        const created = await createLabourCategory(form);
        showToast('Labour category created');
        navigate(`/labour-categories/${created.id}`, { replace: true });
      }
    } catch (err) {
      setErrors(getFieldErrors(err));
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="labour-category-form-loading">Loading...</div>;

  return (
    <div>
      <BackButton to={isEdit ? `/labour-categories/${id}` : '/labour-categories'} />

      <PageHeader title={isEdit ? 'Edit Labour Category' : 'Add Labour Category'} description="Fields marked with * are required." />

      <form onSubmit={handleSubmit} className="labour-category-form-card">
        <FormSection title="Category Details">
          <FormField label="Category Code" required error={errors.categoryCode}>
            <TextInput {...field('categoryCode')} error={errors.categoryCode} />
          </FormField>
          <FormField label="Labour Type" required error={errors.categoryName}>
            <Select {...field('categoryName')}>
              {LABOUR_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replace('_', '')}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Rate Per Day" required error={errors.ratePerDay}>
            <TextInput type="number" step="0.01" min="0" {...field('ratePerDay')} error={errors.ratePerDay} />
          </FormField>
        </FormSection>

        <div className="labour-category-form-actions-row">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </form>
    </div>
  );
}
