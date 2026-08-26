import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import FormSection from '../../components/FormSection';
import FormField, { TextInput, Select } from '../../components/FormField';
import Button from '../../components/Button';
import { getSupervisor, createSupervisor, updateSupervisor } from '../../api/supervisors';
import { contractorDropdown } from '../../api/contractors';
import { toDateInputValue } from '../../utils/format';
import { toFormData } from '../../utils/toFormData';
import { getErrorMessage, getFieldErrors } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';

const EMPTY_FORM = {
  fullName: '', gender: 'MALE', dob: '', contactNo: '', email: '', aadhaarNo: '',
  street: '', city: '', state: '', pincode: '', assignedContractorId: '', status: 'ACTIVE',
};

export default function SupervisorForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [contractors, setContractors] = useState([]);
  const [supervisor, setSupervisor] = useState(null);
  const [aadhaarFront, setAadhaarFront] = useState(null);
  const [aadhaarBack, setAadhaarBack] = useState(null);

  useEffect(() => {
    contractorDropdown().then(setContractors).catch((err) => showToast(getErrorMessage(err), 'error'));
  }, []);

  useEffect(() => {
    setAadhaarFront(null);
    setAadhaarBack(null);
    if (!isEdit) return;
    getSupervisor(id)
      .then((data) => {
        setSupervisor(data);
        setForm({
          ...EMPTY_FORM,
          ...data,
          dob: toDateInputValue(data.dob),
          assignedContractorId: data.assignedContractorId || '',
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
      const payload = toFormData({ ...form, aadhaarFront, aadhaarBack });
      if (isEdit) {
        await updateSupervisor(id, payload);
        showToast('Supervisor updated');
      } else {
        const created = await createSupervisor(payload);
        showToast('Supervisor created');
        navigate(`/supervisors/${created.id}/edit`, { replace: true });
        return;
      }
    } catch (err) {
      setErrors(getFieldErrors(err));
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-slate-500 dark:text-slate-400">Loading...</div>;

  return (
    <div>
      <button onClick={() => navigate('/supervisors')} className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
        <ArrowLeft size={16} /> Back to Supervisors
      </button>

      <PageHeader
        title={isEdit ? `Edit Supervisor — ${supervisor?.supervisorCode}` : 'Add Supervisor'}
        description="Fields marked with * are required."
      />

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <FormSection title="Personal Info">
          <FormField label="Full Name" required error={errors.fullName}>
            <TextInput {...field('fullName')} error={errors.fullName} />
          </FormField>
          <FormField label="Gender" required error={errors.gender}>
            <Select {...field('gender')}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </Select>
          </FormField>
          <FormField label="Date of Birth" required error={errors.dob}>
            <TextInput type="date" {...field('dob')} error={errors.dob} />
          </FormField>
          <FormField label="Contact No." required error={errors.contactNo}>
            <TextInput {...field('contactNo')} error={errors.contactNo} />
          </FormField>
          <FormField label="Email" required error={errors.email}>
            <TextInput type="email" {...field('email')} error={errors.email} />
          </FormField>
          <FormField label="Assigned Contractor" error={errors.assignedContractorId}>
            <Select {...field('assignedContractorId')}>
              <option value="">Unassigned</option>
              {contractors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.contractorCode} — {c.contractorName}
                </option>
              ))}
            </Select>
          </FormField>
          {isEdit && (
            <FormField label="Status">
              <Select {...field('status')}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="BLACKLISTED">Blacklisted</option>
              </Select>
            </FormField>
          )}
        </FormSection>

        <FormSection title="Address">
          <FormField label="Street" error={errors.street}>
            <TextInput {...field('street')} error={errors.street} />
          </FormField>
          <FormField label="City" error={errors.city}>
            <TextInput {...field('city')} error={errors.city} />
          </FormField>
          <FormField label="State" error={errors.state}>
            <TextInput {...field('state')} error={errors.state} />
          </FormField>
          <FormField label="Pincode" error={errors.pincode}>
            <TextInput {...field('pincode')} error={errors.pincode} />
          </FormField>
        </FormSection>

        <FormSection title="Identity Documents">
          <FormField label="Aadhaar No." required error={errors.aadhaarNo}>
            <TextInput {...field('aadhaarNo')} error={errors.aadhaarNo} maxLength={12} />
          </FormField>
          <FormField label="Aadhaar Front">
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setAadhaarFront(e.target.files[0])}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200 dark:text-slate-400 dark:file:bg-slate-700 dark:file:text-slate-200 dark:hover:file:bg-slate-600" />
            {supervisor?.aadhaarFrontUrl && <a href={supervisor.aadhaarFrontUrl} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-indigo-600 hover:underline dark:text-indigo-400">View current file</a>}
          </FormField>
          <FormField label="Aadhaar Back">
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setAadhaarBack(e.target.files[0])}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200 dark:text-slate-400 dark:file:bg-slate-700 dark:file:text-slate-200 dark:hover:file:bg-slate-600" />
            {supervisor?.aadhaarBackUrl && <a href={supervisor.aadhaarBackUrl} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-indigo-600 hover:underline dark:text-indigo-400">View current file</a>}
          </FormField>
        </FormSection>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/supervisors')} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Supervisor'}
          </Button>
        </div>
      </form>
    </div>
  );
}
