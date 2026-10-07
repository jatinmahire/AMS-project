import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import BackButton from '../../components/BackButton';
import FormSection from '../../components/FormSection';
import FormField, { TextInput, Select, Textarea } from '../../components/FormField';
import NumericInput from '../../components/NumericInput';
import AlphabetInput from '../../components/AlphabetInput';
import Button from '../../components/Button';
import { getPolicy, createPolicy, updatePolicy } from '../../api/policies';
import { contractorDropdown } from '../../api/contractors';
import { toDateInputValue } from '../../utils/format';
import { toFormData } from '../../utils/toFormData';
import { getErrorMessage, getFieldErrors } from '../../utils/errorMessage';
import { DOCUMENT_FILE_RULE, validateUploadFile } from '../../utils/validators';
import { useToast } from '../../context/ToastContext';
import './PolicyForm.css';

function buildEmptyForm() {
  return {
    contractorId: '', policyName: '', policyNumber: '', insuranceCompany: '', projectName: '',
    policyDate: '', validDate: '', workerCount: '', projectValue: '', personValue: '', remarks: '',
  };
}

export default function PolicyForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [contractors, setContractors] = useState([]);
  const [form, setForm] = useState(buildEmptyForm());
  const [file, setFile] = useState(null);
  const [existingFileUrl, setExistingFileUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    contractorDropdown().then(setContractors).catch(() => setContractors([]));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    getPolicy(id)
      .then((data) => {
        setForm({
          contractorId: data.contractorId,
          policyName: data.policyName,
          policyNumber: data.policyNumber,
          insuranceCompany: data.insuranceCompany,
          projectName: data.projectName || '',
          policyDate: toDateInputValue(data.policyDate),
          validDate: toDateInputValue(data.validDate),
          workerCount: data.workerCount,
          projectValue: data.projectValue || '',
          personValue: data.personValue || '',
          remarks: data.remarks || '',
        });
        setExistingFileUrl(data.fileUrl || '');
      })
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  function field(name) {
    return { value: form[name] ?? '', onChange: (e) => setForm({ ...form, [name]: e.target.value }) };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file && !isEdit) {
      setErrors({ fileUrl: 'Policy file is required' });
      return;
    }
    setSaving(true);
    setErrors({});
    const payload = toFormData({ ...form, file });
    try {
      if (isEdit) {
        await updatePolicy(id, payload);
        showToast('Policy updated');
        navigate(`/policies/${id}`, { replace: true });
      } else {
        const created = await createPolicy(payload);
        showToast('Policy created');
        navigate(`/policies/${created.id}`, { replace: true });
      }
    } catch (err) {
      setErrors(getFieldErrors(err));
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="policy-form-loading">Loading...</div>;

  return (
    <div>
      <BackButton to={isEdit ? `/policies/${id}` : '/policies'} />

      <PageHeader title={isEdit ? 'Edit Policy' : 'Add Policy'} description="Fields marked with * are required." />

      <form onSubmit={handleSubmit} className="policy-form-card">
        <FormSection title="Contractor">
          <FormField label="Contractor" required error={errors.contractorId}>
            <Select {...field('contractorId')}>
              <option value="">Select contractor</option>
              {contractors.map((c) => (
                <option key={c.id} value={c.id}>{c.contractorCode} — {c.contractorName}</option>
              ))}
            </Select>
          </FormField>
        </FormSection>

        <FormSection title="Policy Details">
          <FormField label="Policy Name" required error={errors.policyName}>
            <AlphabetInput {...field('policyName')} error={errors.policyName} />
          </FormField>
          <FormField label="Policy Number" required error={errors.policyNumber}>
            <NumericInput {...field('policyNumber')} error={errors.policyNumber} maxLength={13} label="Policy number" />
          </FormField>
          <FormField label="Insurance Company" required error={errors.insuranceCompany}>
            <AlphabetInput {...field('insuranceCompany')} error={errors.insuranceCompany} />
          </FormField>
          <FormField label="Project Name" error={errors.projectName}>
            <AlphabetInput {...field('projectName')} error={errors.projectName} />
          </FormField>
          <FormField label="Policy Date" required error={errors.policyDate}>
            <TextInput type="date" {...field('policyDate')} error={errors.policyDate} />
          </FormField>
          <FormField label="Valid Date" required error={errors.validDate}>
            <TextInput type="date" {...field('validDate')} error={errors.validDate} />
          </FormField>
        </FormSection>

        <FormSection title="Coverage">
          <FormField label="Worker Count" required error={errors.workerCount}>
            <NumericInput {...field('workerCount')} error={errors.workerCount} label="Worker count" />
          </FormField>
          <FormField label="Project Value" error={errors.projectValue}>
            <NumericInput {...field('projectValue')} error={errors.projectValue} label="Project value" />
          </FormField>
          <FormField label="Person Value" error={errors.personValue}>
            <NumericInput {...field('personValue')} error={errors.personValue} label="Person value" />
          </FormField>
          <FormField label="Remarks" error={errors.remarks} className="policy-form-col-span">
            <Textarea {...field('remarks')} error={errors.remarks} />
          </FormField>
        </FormSection>

        <FormSection title="Policy Document">
          <FormField label={`Policy File (${DOCUMENT_FILE_RULE.typeLabel}, max ${DOCUMENT_FILE_RULE.sizeLabel})`} required={!isEdit} error={errors.fileUrl} className="policy-form-col-span">
            <input type="file" accept={DOCUMENT_FILE_RULE.accept} onChange={(e) => {
              const file = e.target.files[0] || null;
              const error = file ? validateUploadFile(file, DOCUMENT_FILE_RULE) : undefined;
              setErrors((prev) => ({ ...prev, fileUrl: error }));
              if (error) { e.target.value = ''; setFile(null); return; }
              setFile(file);
            }}
              className="policy-form-file-input" />
            {existingFileUrl && <a href={existingFileUrl} target="_blank" rel="noreferrer" className="policy-form-current-file-link">View current file</a>}
          </FormField>
        </FormSection>

        <div className="policy-form-actions-row">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </form>
    </div>
  );
}
