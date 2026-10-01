import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import BackButton from '../../components/BackButton';
import FormSection from '../../components/FormSection';
import FormField, { TextInput, Select, Textarea } from '../../components/FormField';
import Button from '../../components/Button';
import { getHoliday, createHoliday, updateHoliday } from '../../api/holidays';
import { contractorDropdown } from '../../api/contractors';
import { toDateInputValue } from '../../utils/format';
import { getErrorMessage, getFieldErrors } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import './HolidayForm.css';

const EMPTY_FORM = { type: 'WEEKLY_OFF', date: '', notes: '', contractorId: '' };

export default function HolidayForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [contractors, setContractors] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    contractorDropdown().then(setContractors).catch(() => setContractors([]));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    getHoliday(id)
      .then((data) => {
        setForm({
          type: data.type,
          date: toDateInputValue(data.date),
          notes: data.notes || '',
          contractorId: data.contractorId || '',
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
    setSaving(true);
    setErrors({});
    try {
      if (isEdit) {
        await updateHoliday(id, form);
        showToast('Holiday updated');
        navigate(`/holidays/${id}`, { replace: true });
      } else {
        const created = await createHoliday(form);
        showToast('Holiday created');
        navigate(`/holidays/${created.id}`, { replace: true });
      }
    } catch (err) {
      setErrors(getFieldErrors(err));
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="holiday-form-loading">Loading...</div>;

  return (
    <div>
      <BackButton to={isEdit ? `/holidays/${id}` : '/holidays'} />

      <PageHeader title={isEdit ? 'Edit Holiday' : 'Add Holiday'} description="Fields marked with * are required." />

      <form onSubmit={handleSubmit} className="holiday-form-card">
        <FormSection title="Holiday Details">
          <FormField label="Type" required error={errors.type}>
            <Select {...field('type')}>
              <option value="WEEKLY_OFF">Weekly Off</option>
              <option value="PAID_LEAVE">Paid Leave</option>
            </Select>
          </FormField>
          <FormField label="Date" required error={errors.date}>
            <TextInput type="date" {...field('date')} error={errors.date} />
          </FormField>
          <FormField label="Applies To" error={errors.contractorId}>
            <Select {...field('contractorId')}>
              <option value="">All Contractors</option>
              {contractors.map((c) => (
                <option key={c.id} value={c.id}>{c.contractorCode} — {c.contractorName}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Notes" error={errors.notes} className="holiday-form-col-span">
            <Textarea {...field('notes')} error={errors.notes} />
          </FormField>
        </FormSection>

        <div className="holiday-form-actions-row">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </form>
    </div>
  );
}
