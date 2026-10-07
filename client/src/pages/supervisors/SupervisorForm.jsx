import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import BackButton from '../../components/BackButton';
import StepIndicator from '../../components/StepIndicator';
import FormSection from '../../components/FormSection';
import FormField, { TextInput, Select } from '../../components/FormField';
import NumericInput from '../../components/NumericInput';
import AlphabetInput from '../../components/AlphabetInput';
import EmailInput from '../../components/EmailInput';
import StateCityFields from '../../components/StateCityFields';
import Button from '../../components/Button';
import { AADHAAR_FILE_RULE, MIN_DOB, maxAdultDob, validateDob, validateEmailField, validateUploadFile } from '../../utils/validators';
import RegistrationSuccessModal from '../../components/RegistrationSuccessModal';
import { getSupervisor, createSupervisor, updateSupervisor } from '../../api/supervisors';
import { contractorDropdown } from '../../api/contractors';
import { toDateInputValue } from '../../utils/format';
import { toFormData } from '../../utils/toFormData';
import { generatePassword } from '../../utils/generatePassword';
import { getErrorMessage, getFieldErrors } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import './SupervisorForm.css';

const EMPTY_FORM = {
  fullName: '', gender: 'MALE', dob: '', contactNo: '', email: '', aadhaarNo: '',
  street: '', city: '', state: '', pincode: '', assignedContractorId: '', status: 'ACTIVE', password: '',
};

const STEP_LABELS = ['Personal Info', 'Address & Assignment'];

const STEP_FIELDS = [
  ['fullName', 'gender', 'dob', 'contactNo', 'email', 'aadhaarNo', 'aadhaarFrontUrl', 'aadhaarBackUrl', 'aadhaarFront', 'aadhaarBack'],
  ['street', 'city', 'state', 'pincode', 'assignedContractorId', 'status', 'password'],
];

const STEP_REQUIRED_FIELDS = [
  ['fullName', 'gender', 'dob', 'contactNo', 'email', 'aadhaarNo'],
  ['street', 'city', 'state', 'pincode'],
];

const LAST_STEP = STEP_LABELS.length - 1;

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
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(isEdit ? [0, 1] : []);
  const [successInfo, setSuccessInfo] = useState(null);

  useEffect(() => {
    contractorDropdown().then(setContractors).catch((err) => showToast(getErrorMessage(err), 'error'));
  }, []);

  function handleAadhaarFile(key, setFile, e) {
    const file = e.target.files[0];
    const error = validateUploadFile(file, AADHAAR_FILE_RULE);
    setErrors((prev) => ({ ...prev, [key]: error }));
    if (error) e.target.value = '';
    setFile(error ? null : file);
  }

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

  function validateStep(stepIndex) {
    const stepErrors = {};
    for (const key of STEP_REQUIRED_FIELDS[stepIndex]) {
      if (!form[key]) stepErrors[key] = 'This field is required';
    }
    if (!isEdit && stepIndex === 1 && !form.password) {
      stepErrors.password = 'Password is required';
    }
    if (STEP_FIELDS[stepIndex].includes('email') && !stepErrors.email) {
      const emailErr = validateEmailField(form.email);
      if (emailErr) stepErrors.email = emailErr;
    }
    if (STEP_FIELDS[stepIndex].includes('dob') && !stepErrors.dob) {
      const dobError = validateDob(form.dob, 'Supervisor');
      if (dobError) stepErrors.dob = dobError;
    }
    if (STEP_FIELDS[stepIndex].includes('contactNo') && !stepErrors.contactNo && form.contactNo && !/^\d{10}$/.test(form.contactNo)) {
      stepErrors.contactNo = 'Enter a valid 10-digit contact number';
    }
    return stepErrors;
  }

  function findStepForFields(fieldErrors) {
    return STEP_FIELDS.findIndex((fields) => fields.some((f) => fieldErrors[f]));
  }

  function goNext(e) {
    e?.preventDefault();
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCompletedSteps((prev) => (prev.includes(currentStep) ? prev : [...prev, currentStep]));
    setCurrentStep((s) => Math.min(s + 1, LAST_STEP));
    e?.currentTarget?.blur();
  }

  function handleFormKeyDown(e) {
    if (e.key !== 'Enter' || e.target.tagName === 'TEXTAREA') return;
    e.preventDefault();
    if (currentStep < LAST_STEP) goNext();
  }

  function goBack(e) {
    e?.preventDefault();
    setErrors({});
    setCurrentStep((s) => Math.max(s - 1, 0));
  }

  function goToStep(index) {
    setErrors({});
    setCurrentStep(index);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    let allErrors = {};
    for (let i = 0; i < STEP_REQUIRED_FIELDS.length; i++) {
      allErrors = { ...allErrors, ...validateStep(i) };
    }
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      const stepWithError = findStepForFields(allErrors);
      if (stepWithError !== -1) setCurrentStep(stepWithError);
      return;
    }

    setSaving(true);
    setErrors({});
    try {
      // The password field only exists for setting the login at creation — it's never shown
      // on this step while editing, but form.password still sat at '' from the initial state
      // and got sent along regardless, failing the server's min-length check on an empty
      // (not just a missing) password.
      const { password, ...formWithoutPassword } = form;
      const payload = isEdit
        ? toFormData({ ...formWithoutPassword, aadhaarFront, aadhaarBack })
        : toFormData({ ...form, aadhaarFront, aadhaarBack });
      if (isEdit) {
        await updateSupervisor(id, payload);
        showToast('Supervisor updated');
        navigate(`/supervisors/${id}`, { replace: true });
        return;
      } else {
        const created = await createSupervisor(payload);
        setSuccessInfo({ id: created.id, code: created.supervisorCode, loginId: created.loginId, password: form.password });
        return;
      }
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      setErrors(fieldErrors);
      const stepWithError = findStepForFields(fieldErrors);
      if (stepWithError !== -1) setCurrentStep(stepWithError);
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="supervisor-form-loading">Loading...</div>;

  return (
    <div>
      <BackButton to={isEdit ? `/supervisors/${id}` : '/supervisors'} />

      <PageHeader
        title={isEdit ? `Edit Supervisor — ${supervisor?.supervisorCode}` : 'Add Supervisor'}
        description="Fields marked with * are required."
      />

      <StepIndicator steps={STEP_LABELS} currentStep={currentStep} completedSteps={completedSteps} onStepClick={goToStep} />

      <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="supervisor-form-card">
        {currentStep === 0 && (
          <FormSection title="Personal Info">
            <FormField label="Full Name" required error={errors.fullName}>
              <AlphabetInput {...field('fullName')} maxLength={30} error={errors.fullName} />
            </FormField>
            <FormField label="Gender" required error={errors.gender}>
              <Select {...field('gender')}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </Select>
            </FormField>
            <FormField label="Date of Birth" required error={errors.dob}>
              <TextInput type="date" {...field('dob')} min={MIN_DOB} max={maxAdultDob()} error={errors.dob} />
            </FormField>
            <FormField label="Contact No." required error={errors.contactNo}>
              <NumericInput {...field('contactNo')} error={errors.contactNo} exactLength={10} label="Contact number" />
            </FormField>
            <FormField label="Email" required error={errors.email}>
              <EmailInput {...field('email')} error={errors.email} onValidate={(msg) => setErrors((prev) => ({ ...prev, email: msg }))} />
            </FormField>
            <FormField label="Aadhaar No." required error={errors.aadhaarNo}>
              <NumericInput {...field('aadhaarNo')} error={errors.aadhaarNo} exactLength={12} label="Aadhaar number" />
            </FormField>
            <FormField label={`Aadhaar Front (${AADHAAR_FILE_RULE.typeLabel}, max ${AADHAAR_FILE_RULE.sizeLabel})`} required error={errors.aadhaarFront}>
              <input type="file" accept={AADHAAR_FILE_RULE.accept} onChange={(e) => handleAadhaarFile('aadhaarFront', setAadhaarFront, e)}
                className="supervisor-form-file-input" />
              {supervisor?.aadhaarFrontUrl && <a href={supervisor.aadhaarFrontUrl} target="_blank" rel="noreferrer" className="supervisor-form-current-file-link">View current file</a>}
            </FormField>
            <FormField label={`Aadhaar Back (${AADHAAR_FILE_RULE.typeLabel}, max ${AADHAAR_FILE_RULE.sizeLabel})`} required error={errors.aadhaarBack}>
              <input type="file" accept={AADHAAR_FILE_RULE.accept} onChange={(e) => handleAadhaarFile('aadhaarBack', setAadhaarBack, e)}
                className="supervisor-form-file-input" />
              {supervisor?.aadhaarBackUrl && <a href={supervisor.aadhaarBackUrl} target="_blank" rel="noreferrer" className="supervisor-form-current-file-link">View current file</a>}
            </FormField>
          </FormSection>
        )}

        {currentStep === 1 && (
          <>
            <FormSection title="Address">
              <FormField label="Street" required error={errors.street}>
                <TextInput {...field('street')} error={errors.street} />
              </FormField>
              <StateCityFields
                state={form.state}
                city={form.city}
                onChange={(changes) => setForm((prev) => ({ ...prev, ...changes }))}
                errors={errors}
                required
              />
              <FormField label="Pincode" required error={errors.pincode}>
                <NumericInput {...field('pincode')} error={errors.pincode} exactLength={6} label="Pincode" />
              </FormField>
            </FormSection>

            <FormSection title="Assignment">
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

            {!isEdit && (
              <FormSection title="Login Credentials">
                <FormField label="Password" required error={errors.password} className="supervisor-form-col-span-2">
                  <div className="supervisor-form-password-row">
                    <TextInput {...field('password')} error={errors.password} placeholder="Set a login password" />
                    <Button
                      type="button"
                      variant="secondary"
                      icon={RefreshCw}
                      onClick={() => setForm({ ...form, password: generatePassword() })}
                    >
                      Generate
                    </Button>
                  </div>
                </FormField>
              </FormSection>
            )}
          </>
        )}

        <div className="supervisor-form-actions-row">
          <div>
            {currentStep > 0 && (
              <Button type="button" variant="secondary" onClick={goBack} disabled={saving}>
                Back
              </Button>
            )}
          </div>
          <div className="supervisor-form-actions-right">
            <Button type="button" variant="secondary" onClick={() => navigate(isEdit ? `/supervisors/${id}` : '/supervisors')} disabled={saving}>
              Cancel
            </Button>
            {currentStep < LAST_STEP ? (
              <Button key="next" type="button" onClick={goNext}>
                Next
              </Button>
            ) : (
              <Button key="submit" type="submit" disabled={saving}>
                {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Supervisor'}
              </Button>
            )}
          </div>
        </div>
      </form>

      <RegistrationSuccessModal
        open={!!successInfo}
        roleLabel="Supervisor"
        code={successInfo?.code}
        loginId={successInfo?.loginId}
        password={successInfo?.password}
        onContinue={() => navigate(`/supervisors/${successInfo.id}`, { replace: true })}
      />
    </div>
  );
}
