import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import BackButton from '../../components/BackButton';
import StepIndicator from '../../components/StepIndicator';
import FormSection from '../../components/FormSection';
import FormField, { TextInput, Select } from '../../components/FormField';
import NumericInput from '../../components/NumericInput';
import EmailInput from '../../components/EmailInput';
import Button from '../../components/Button';
import { validateEmailField } from '../../utils/validators';
import RegistrationSuccessModal from '../../components/RegistrationSuccessModal';
import { getContractor, createContractor, updateContractor } from '../../api/contractors';
import { toDateInputValue } from '../../utils/format';
import { generatePassword } from '../../utils/generatePassword';
import { getErrorMessage, getFieldErrors } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import ContractorDocuments from './ContractorDocuments';
import './ContractorForm.css';

const EMPTY_FORM = {
  contractorName: '', establishmentName: '', contactPerson: '', phone: '', email: '', email2: '', email3: '', email4: '',
  address: '', village: '', taluka: '', city: '', state: '', pincode: '', buildingName: '',
  aadhaarNo: '', panNo: '', rc: '', principalEmployerName: '', principalEmployerAddress: '',
  wcPolicyNo: '', wcStartDate: '', wcExpiryDate: '',
  serviceType: '', serviceTaxNo: '',
  shopActLicenseNo: '', shopActExpiryDate: '',
  labourLicenseNo: '', labourLicenseStart: '', labourLicenseExpiry: '',
  bocwNo: '', bocwStartDate: '', bocwExpiryDate: '', rcCount: '',
  pfEstablishmentCode: '', esicEstablishmentCode: '', mlwfNo: '', ptecNo: '', ptrcNo: '',
  status: 'ACTIVE', password: '',
};

const STEP_LABELS = ['Agency Info', 'Identity & Legal', 'Documents'];

const STEP_FIELDS = [
  ['contractorName', 'establishmentName', 'contactPerson', 'phone', 'email', 'email2', 'email3', 'email4', 'address', 'village', 'taluka', 'city', 'state', 'pincode'],
  [
    'aadhaarNo', 'panNo', 'rc', 'principalEmployerName', 'principalEmployerAddress', 'wcPolicyNo', 'wcStartDate', 'wcExpiryDate', 'serviceType', 'serviceTaxNo',
    'shopActLicenseNo', 'shopActExpiryDate', 'labourLicenseNo', 'labourLicenseStart', 'labourLicenseExpiry',
    'bocwNo', 'bocwStartDate', 'bocwExpiryDate', 'rcCount', 'pfEstablishmentCode', 'esicEstablishmentCode',
    'mlwfNo', 'ptecNo', 'ptrcNo', 'buildingName', 'password',
  ],
  [],
];

const STEP_REQUIRED_FIELDS = [
  ['contractorName', 'contactPerson', 'phone', 'email', 'address'],
  ['aadhaarNo', 'panNo'],
  [],
];

export default function ContractorForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [contractor, setContractor] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(isEdit ? [0, 1, 2] : []);
  const [successInfo, setSuccessInfo] = useState(null);

  const LAST_STEP = isEdit ? STEP_LABELS.length - 1 : STEP_LABELS.length - 2;

  useEffect(() => {
    if (!isEdit) return;
    getContractor(id)
      .then((data) => {
        setContractor(data);
        setForm({
          ...EMPTY_FORM,
          ...data,
          wcStartDate: toDateInputValue(data.wcStartDate),
          wcExpiryDate: toDateInputValue(data.wcExpiryDate),
          shopActExpiryDate: toDateInputValue(data.shopActExpiryDate),
          labourLicenseStart: toDateInputValue(data.labourLicenseStart),
          labourLicenseExpiry: toDateInputValue(data.labourLicenseExpiry),
          bocwStartDate: toDateInputValue(data.bocwStartDate),
          bocwExpiryDate: toDateInputValue(data.bocwExpiryDate),
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
    if (!isEdit && stepIndex === LAST_STEP && !form.password) {
      stepErrors.password = 'Password is required';
    }
    for (const key of ['email', 'email2', 'email3', 'email4']) {
      if (!STEP_FIELDS[stepIndex].includes(key)) continue;
      if (!stepErrors[key]) {
        const emailErr = validateEmailField(form[key]);
        if (emailErr) stepErrors[key] = emailErr;
      }
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
    for (let i = 0; i <= LAST_STEP; i++) {
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
      if (isEdit) {
        await updateContractor(id, form);
        showToast('Contractor updated');
        navigate(`/contractors/${id}`, { replace: true });
        return;
      } else {
        const created = await createContractor(form);
        setSuccessInfo({ id: created.id, code: created.contractorCode, loginId: created.loginId, password: form.password });
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

  if (loading) return <div className="contractor-form-loading">Loading...</div>;

  return (
    <div>
      <BackButton to={isEdit ? `/contractors/${id}` : '/contractors'} />

      <PageHeader
        title={isEdit ? `Edit Contractor — ${contractor?.contractorCode}` : 'Add Contractor'}
        description="Fields marked with * are required."
      />

      <StepIndicator steps={isEdit ? STEP_LABELS : STEP_LABELS.slice(0, 2)} currentStep={currentStep} completedSteps={completedSteps} onStepClick={goToStep} />

      <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="contractor-form-card">
        {currentStep === 0 && (
          <>
            <FormSection title="Basic Info">
              <FormField label="Contractor Name" required error={errors.contractorName}>
                <TextInput {...field('contractorName')} error={errors.contractorName} />
              </FormField>
              <FormField label="Establishment Name" error={errors.establishmentName}>
                <TextInput {...field('establishmentName')} error={errors.establishmentName} />
              </FormField>
              <FormField label="Contact Person" required error={errors.contactPerson}>
                <TextInput {...field('contactPerson')} error={errors.contactPerson} />
              </FormField>
              <FormField label="Phone" required error={errors.phone}>
                <NumericInput {...field('phone')} error={errors.phone} exactLength={10} label="Phone number" />
              </FormField>
              <FormField label="Email" required error={errors.email}>
                <EmailInput {...field('email')} error={errors.email} onValidate={(msg) => setErrors((prev) => ({ ...prev, email: msg }))} />
              </FormField>
              <FormField label="Email 2" error={errors.email2}>
                <EmailInput {...field('email2')} error={errors.email2} onValidate={(msg) => setErrors((prev) => ({ ...prev, email2: msg }))} />
              </FormField>
              <FormField label="Email 3" error={errors.email3}>
                <EmailInput {...field('email3')} error={errors.email3} onValidate={(msg) => setErrors((prev) => ({ ...prev, email3: msg }))} />
              </FormField>
              <FormField label="Email 4" error={errors.email4}>
                <EmailInput {...field('email4')} error={errors.email4} onValidate={(msg) => setErrors((prev) => ({ ...prev, email4: msg }))} />
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
              <FormField label="Address" required error={errors.address} className="contractor-form-col-span">
                <TextInput {...field('address')} error={errors.address} />
              </FormField>
              <FormField label="Village" error={errors.village}>
                <TextInput {...field('village')} error={errors.village} />
              </FormField>
              <FormField label="Taluka" error={errors.taluka}>
                <TextInput {...field('taluka')} error={errors.taluka} />
              </FormField>
              <FormField label="City" error={errors.city}>
                <TextInput {...field('city')} error={errors.city} />
              </FormField>
              <FormField label="State" error={errors.state}>
                <TextInput {...field('state')} error={errors.state} />
              </FormField>
              <FormField label="Pincode" error={errors.pincode}>
                <NumericInput {...field('pincode')} error={errors.pincode} exactLength={6} label="Pincode" />
              </FormField>
            </FormSection>
          </>
        )}

        {currentStep === 1 && (
          <>
            <FormSection title="Identity">
              <FormField label="Aadhaar No." required error={errors.aadhaarNo}>
                <NumericInput {...field('aadhaarNo')} error={errors.aadhaarNo} exactLength={12} label="Aadhaar number" />
              </FormField>
              <FormField label="PAN No." required error={errors.panNo}>
                <TextInput {...field('panNo')} error={errors.panNo} maxLength={10} />
              </FormField>
              <FormField label="RC" error={errors.rc}>
                <TextInput {...field('rc')} error={errors.rc} />
              </FormField>
            </FormSection>

            <FormSection title="Principal Employer">
              <FormField label="Principal Employer Name" error={errors.principalEmployerName}>
                <TextInput {...field('principalEmployerName')} error={errors.principalEmployerName} />
              </FormField>
              <FormField label="Principal Employer Address" error={errors.principalEmployerAddress} className="contractor-form-col-span">
                <TextInput {...field('principalEmployerAddress')} error={errors.principalEmployerAddress} />
              </FormField>
            </FormSection>

            <FormSection title="Insurance (WC Policy)">
              <FormField label="WC Policy No." error={errors.wcPolicyNo}>
                <TextInput {...field('wcPolicyNo')} error={errors.wcPolicyNo} />
              </FormField>
              <FormField label="WC Start Date" error={errors.wcStartDate}>
                <TextInput type="date" {...field('wcStartDate')} error={errors.wcStartDate} />
              </FormField>
              <FormField label="WC Expiry Date" error={errors.wcExpiryDate}>
                <TextInput type="date" {...field('wcExpiryDate')} error={errors.wcExpiryDate} />
              </FormField>
            </FormSection>

            <FormSection title="Licenses & Statutory Codes">
              <FormField label="Service Type" error={errors.serviceType}>
                <TextInput {...field('serviceType')} error={errors.serviceType} />
              </FormField>
              <FormField label="Service Tax No." error={errors.serviceTaxNo}>
                <TextInput {...field('serviceTaxNo')} error={errors.serviceTaxNo} />
              </FormField>
              <FormField label="Shop Act License No." error={errors.shopActLicenseNo}>
                <TextInput {...field('shopActLicenseNo')} error={errors.shopActLicenseNo} />
              </FormField>
              <FormField label="Shop Act Expiry Date" error={errors.shopActExpiryDate}>
                <TextInput type="date" {...field('shopActExpiryDate')} error={errors.shopActExpiryDate} />
              </FormField>
              <FormField label="Labour License No." error={errors.labourLicenseNo}>
                <TextInput {...field('labourLicenseNo')} error={errors.labourLicenseNo} />
              </FormField>
              <FormField label="Labour License Start" error={errors.labourLicenseStart}>
                <TextInput type="date" {...field('labourLicenseStart')} error={errors.labourLicenseStart} />
              </FormField>
              <FormField label="Labour License Expiry" error={errors.labourLicenseExpiry}>
                <TextInput type="date" {...field('labourLicenseExpiry')} error={errors.labourLicenseExpiry} />
              </FormField>
              <FormField label="BOCW No." error={errors.bocwNo}>
                <TextInput {...field('bocwNo')} error={errors.bocwNo} />
              </FormField>
              <FormField label="BOCW Start Date" error={errors.bocwStartDate}>
                <TextInput type="date" {...field('bocwStartDate')} error={errors.bocwStartDate} />
              </FormField>
              <FormField label="BOCW Expiry Date" error={errors.bocwExpiryDate}>
                <TextInput type="date" {...field('bocwExpiryDate')} error={errors.bocwExpiryDate} />
              </FormField>
              <FormField label="RC Count" error={errors.rcCount}>
                <NumericInput {...field('rcCount')} error={errors.rcCount} maxLength={5} label="RC count" />
              </FormField>
              <FormField label="PF Establishment Code" error={errors.pfEstablishmentCode}>
                <NumericInput {...field('pfEstablishmentCode')} error={errors.pfEstablishmentCode} maxLength={20} label="PF establishment code" />
              </FormField>
              <FormField label="ESIC Establishment Code" error={errors.esicEstablishmentCode}>
                <NumericInput {...field('esicEstablishmentCode')} error={errors.esicEstablishmentCode} maxLength={20} label="ESIC establishment code" />
              </FormField>
              <FormField label="MLWF No." error={errors.mlwfNo}>
                <NumericInput {...field('mlwfNo')} error={errors.mlwfNo} maxLength={20} label="MLWF number" />
              </FormField>
              <FormField label="PTEC No." error={errors.ptecNo}>
                <NumericInput {...field('ptecNo')} error={errors.ptecNo} maxLength={20} label="PTEC number" />
              </FormField>
              <FormField label="PTRC No." error={errors.ptrcNo}>
                <NumericInput {...field('ptrcNo')} error={errors.ptrcNo} maxLength={20} label="PTRC number" />
              </FormField>
              <FormField label="Building Name" error={errors.buildingName}>
                <TextInput {...field('buildingName')} error={errors.buildingName} />
              </FormField>
            </FormSection>

            {!isEdit && (
              <FormSection title="Login Credentials">
                <FormField label="Password" required error={errors.password} className="contractor-form-col-span-2">
                  <div className="contractor-form-password-row">
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

        {currentStep === 2 && isEdit && (
          <ContractorDocuments key={id} contractorId={id} documents={contractor?.documents || []} onChange={() => getContractor(id).then(setContractor)} />
        )}

        <div className="contractor-form-actions-row">
          <div>
            {currentStep > 0 && (
              <Button type="button" variant="secondary" onClick={goBack} disabled={saving}>
                Back
              </Button>
            )}
          </div>
          <div className="contractor-form-actions-right">
            <Button type="button" variant="secondary" onClick={() => navigate(isEdit ? `/contractors/${id}` : '/contractors')} disabled={saving}>
              Cancel
            </Button>
            {currentStep < LAST_STEP ? (
              <Button key="next" type="button" onClick={goNext}>
                Next
              </Button>
            ) : (
              <Button key="submit" type="submit" disabled={saving}>
                {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Contractor'}
              </Button>
            )}
          </div>
        </div>
      </form>

      <RegistrationSuccessModal
        open={!!successInfo}
        roleLabel="Contractor"
        code={successInfo?.code}
        loginId={successInfo?.loginId}
        password={successInfo?.password}
        onContinue={() => navigate(`/contractors/${successInfo.id}`, { replace: true })}
      />
    </div>
  );
}
