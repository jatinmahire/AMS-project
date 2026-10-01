import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import BackButton from '../../components/BackButton';
import StepIndicator from '../../components/StepIndicator';
import FormSection from '../../components/FormSection';
import FormField, { TextInput, Select } from '../../components/FormField';
import NumericInput from '../../components/NumericInput';
import Button from '../../components/Button';
import { getWorker, createWorker, updateWorker } from '../../api/workers';
import { contractorDropdown } from '../../api/contractors';
import { listDesignations } from '../../api/designations';
import { listLabourCategories } from '../../api/labourCategories';
import { toDateInputValue } from '../../utils/format';
import { toFormData } from '../../utils/toFormData';
import { getErrorMessage, getFieldErrors } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import './WorkerForm.css';

const EMPTY_FORM = {
  firstName: '', middleName: '', lastName: '', dob: '', gender: 'MALE', maritalStatus: '', mobileNo: '',
  permanentAddress: '', currentAddress: '', village: '', taluka: '', city: '', district: '', state: '', pincode: '',
  contractorId: '', designationId: '', labourCategoryId: '',
  idType: 'AADHAAR', idNumber: '', policeVerified: false, joinDate: '', sector: '', status: 'ACTIVE',
  bocwRegistrationNo: '', bocwIssueDate: '', bocwValidDate: '',
  pfNumber: '', uanNumber: '', esicNumber: '', panNumber: '', ipNumber: '',
  bankName: '', bankBranch: '', accountNo: '', ifscCode: '',
  nomineeName: '', nomineeRelation: '', nomineeChildrenCount: '', nomineeQualification: '', nomineeMobile: '',
};

const FILE_FIELDS = [
  { key: 'photo', label: 'Photo', urlKey: 'photoUrl' },
  { key: 'idFront', label: 'ID Front', urlKey: 'idFrontUrl' },
  { key: 'idBack', label: 'ID Back', urlKey: 'idBackUrl' },
  { key: 'bankPassbook', label: 'Bank Passbook', urlKey: 'bankPassbookUrl' },
];

const STEP_LABELS = ['Personal Info', 'Address', 'Employment & Documents', 'Bank & Nominee'];

const STEP_FIELDS = [
  ['firstName', 'middleName', 'lastName', 'dob', 'gender', 'maritalStatus', 'mobileNo'],
  ['permanentAddress', 'currentAddress', 'village', 'taluka', 'city', 'district', 'state', 'pincode'],
  [
    'contractorId', 'designationId', 'labourCategoryId', 'idType', 'idNumber', 'policeVerified', 'joinDate',
    'bocwRegistrationNo', 'bocwIssueDate', 'bocwValidDate', 'pfNumber', 'uanNumber', 'esicNumber', 'panNumber', 'ipNumber',
  ],
  ['bankName', 'bankBranch', 'accountNo', 'ifscCode', 'nomineeName', 'nomineeRelation', 'nomineeChildrenCount', 'nomineeQualification', 'nomineeMobile', 'sector'],
];

const STEP_REQUIRED_FIELDS = [
  ['firstName', 'lastName', 'dob', 'gender', 'mobileNo'],
  ['permanentAddress'],
  ['contractorId', 'designationId', 'labourCategoryId', 'idType', 'idNumber', 'joinDate'],
  [],
];

const LAST_STEP = STEP_LABELS.length - 1;

export default function WorkerForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const isSupervisor = user?.role === 'SUPERVISOR';

  const [form, setForm] = useState(() =>
    isSupervisor ? { ...EMPTY_FORM, contractorId: user.assignedContractorId || '' } : EMPTY_FORM
  );
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [contractors, setContractors] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [labourCategories, setLabourCategories] = useState([]);
  const [worker, setWorker] = useState(null);
  const [files, setFiles] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(isEdit ? [0, 1, 2, 3] : []);

  useEffect(() => {
    Promise.all([isSupervisor ? Promise.resolve([]) : contractorDropdown(), listDesignations(), listLabourCategories()])
      .then(([c, d, l]) => {
        setContractors(c);
        setDesignations(d);
        setLabourCategories(l);
      })
      .catch((err) => showToast(getErrorMessage(err), 'error'));
  }, []);

  useEffect(() => {
    setFiles({});
    if (!isEdit) return;
    getWorker(id)
      .then((data) => {
        setWorker(data);
        setForm({
          ...EMPTY_FORM,
          ...data,
          dob: toDateInputValue(data.dob),
          joinDate: toDateInputValue(data.joinDate),
          bocwIssueDate: toDateInputValue(data.bocwIssueDate),
          bocwValidDate: toDateInputValue(data.bocwValidDate),
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
      const payload = toFormData({ ...form, ...files });
      if (isEdit) {
        await updateWorker(id, payload);
        showToast('Worker updated');
        navigate(`/workers/${id}`, { replace: true });
        return;
      } else {
        const created = await createWorker(payload);
        showToast('Worker created');
        navigate(`/workers/${created.id}`, { replace: true });
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

  if (loading) return <div className="worker-form-loading">Loading...</div>;

  return (
    <div>
      <BackButton to={isEdit ? `/workers/${id}` : '/workers'} />

      <PageHeader
        title={isEdit ? `Edit Worker — ${worker?.workerCode}` : 'Add Worker'}
        description="Fields marked with * are required."
      />

      <StepIndicator steps={STEP_LABELS} currentStep={currentStep} completedSteps={completedSteps} onStepClick={goToStep} />

      <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="worker-form-card">
        {currentStep === 0 && (
          <FormSection title="Personal Info">
            <FormField label="First Name" required error={errors.firstName}>
              <TextInput {...field('firstName')} error={errors.firstName} />
            </FormField>
            <FormField label="Middle Name" error={errors.middleName}>
              <TextInput {...field('middleName')} error={errors.middleName} />
            </FormField>
            <FormField label="Last Name" required error={errors.lastName}>
              <TextInput {...field('lastName')} error={errors.lastName} />
            </FormField>
            <FormField label="Date of Birth" required error={errors.dob}>
              <TextInput type="date" {...field('dob')} error={errors.dob} />
            </FormField>
            <FormField label="Gender" required error={errors.gender}>
              <Select {...field('gender')}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </Select>
            </FormField>
            <FormField label="Marital Status" error={errors.maritalStatus}>
              <Select {...field('maritalStatus')} error={errors.maritalStatus}>
                <option value="">Select</option>
                <option value="MARRIED">Married</option>
                <option value="UNMARRIED">Unmarried</option>
              </Select>
            </FormField>
            <FormField label="Mobile No." required error={errors.mobileNo}>
              <NumericInput {...field('mobileNo')} error={errors.mobileNo} exactLength={10} label="Mobile number" />
            </FormField>
          </FormSection>
        )}

        {currentStep === 1 && (
          <FormSection title="Address">
            <FormField label="Permanent Address" required error={errors.permanentAddress} className="worker-form-col-span">
              <TextInput {...field('permanentAddress')} error={errors.permanentAddress} />
            </FormField>
            <FormField label="Current Address" error={errors.currentAddress} className="worker-form-col-span">
              <TextInput {...field('currentAddress')} error={errors.currentAddress} />
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
            <FormField label="District" error={errors.district}>
              <TextInput {...field('district')} error={errors.district} />
            </FormField>
            <FormField label="State" error={errors.state}>
              <TextInput {...field('state')} error={errors.state} />
            </FormField>
            <FormField label="Pincode" error={errors.pincode}>
              <NumericInput {...field('pincode')} error={errors.pincode} exactLength={6} label="Pincode" />
            </FormField>
          </FormSection>
        )}

        {currentStep === 2 && (
          <>
            <FormSection title="Employment">
              <FormField label="Contractor" required error={errors.contractorId}>
                {isSupervisor ? (
                  <TextInput value={user.assignedContractorName || 'No contractor assigned'} disabled />
                ) : (
                  <Select {...field('contractorId')}>
                    <option value="">Select contractor</option>
                    {contractors.map((c) => (
                      <option key={c.id} value={c.id}>{c.contractorCode} — {c.contractorName}</option>
                    ))}
                  </Select>
                )}
              </FormField>
              <FormField label="Designation" required error={errors.designationId}>
                <Select {...field('designationId')}>
                  <option value="">Select designation</option>
                  {designations.map((d) => (
                    <option key={d.id} value={d.id}>{d.designationName}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Labour Category" required error={errors.labourCategoryId}>
                <Select {...field('labourCategoryId')}>
                  <option value="">Select category</option>
                  {labourCategories.map((l) => (
                    <option key={l.id} value={l.id}>{l.categoryCode} — {l.categoryName.replace('_', '')}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Join Date" required error={errors.joinDate}>
                <TextInput type="date" {...field('joinDate')} error={errors.joinDate} />
              </FormField>
            </FormSection>

            <FormSection title="Identity Documents">
              <FormField label="ID Type" required error={errors.idType}>
                <Select {...field('idType')}>
                  <option value="AADHAAR">Aadhaar</option>
                  <option value="PAN">PAN</option>
                  <option value="VOTER_ID">Voter ID</option>
                </Select>
              </FormField>
              <FormField label="ID Number" required error={errors.idNumber}>
                <TextInput {...field('idNumber')} error={errors.idNumber} />
              </FormField>
              <FormField label="Police Verified">
                <Select
                  value={form.policeVerified ? 'true' : 'false'}
                  onChange={(e) => setForm({ ...form, policeVerified: e.target.value === 'true' })}
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </Select>
              </FormField>
              {FILE_FIELDS.map((f) => (
                <FormField label={f.label} key={f.key}>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setFiles({ ...files, [f.key]: e.target.files[0] })}
                    className="worker-form-file-input"
                  />
                  {worker?.[f.urlKey] && <a href={worker[f.urlKey]} target="_blank" rel="noreferrer" className="worker-form-current-file-link">View current file</a>}
                </FormField>
              ))}
            </FormSection>

            <FormSection title="Statutory Details">
              <FormField label="BOCW Registration No." error={errors.bocwRegistrationNo}>
                <TextInput {...field('bocwRegistrationNo')} error={errors.bocwRegistrationNo} />
              </FormField>
              <FormField label="BOCW Issue Date" error={errors.bocwIssueDate}>
                <TextInput type="date" {...field('bocwIssueDate')} error={errors.bocwIssueDate} />
              </FormField>
              <FormField label="BOCW Valid Date" error={errors.bocwValidDate}>
                <TextInput type="date" {...field('bocwValidDate')} error={errors.bocwValidDate} />
              </FormField>
              <FormField label="PF Number" error={errors.pfNumber}>
                <NumericInput {...field('pfNumber')} error={errors.pfNumber} maxLength={20} label="PF number" />
              </FormField>
              <FormField label="UAN Number" error={errors.uanNumber}>
                <NumericInput {...field('uanNumber')} error={errors.uanNumber} exactLength={12} label="UAN number" />
              </FormField>
              <FormField label="ESIC Number" error={errors.esicNumber}>
                <NumericInput {...field('esicNumber')} error={errors.esicNumber} maxLength={17} label="ESIC number" />
              </FormField>
              <FormField label="PAN Number" error={errors.panNumber}>
                <TextInput {...field('panNumber')} error={errors.panNumber} />
              </FormField>
              <FormField label="IP Number" error={errors.ipNumber}>
                <NumericInput {...field('ipNumber')} error={errors.ipNumber} maxLength={10} label="IP number" />
              </FormField>
            </FormSection>
          </>
        )}

        {currentStep === 3 && (
          <>
            <FormSection title="Bank Details">
              <FormField label="Bank Name" error={errors.bankName}>
                <TextInput {...field('bankName')} error={errors.bankName} />
              </FormField>
              <FormField label="Bank Branch" error={errors.bankBranch}>
                <TextInput {...field('bankBranch')} error={errors.bankBranch} />
              </FormField>
              <FormField label="Account No." error={errors.accountNo}>
                <NumericInput {...field('accountNo')} error={errors.accountNo} maxLength={18} label="Account number" />
              </FormField>
              <FormField label="IFSC Code" error={errors.ifscCode}>
                <TextInput {...field('ifscCode')} error={errors.ifscCode} />
              </FormField>
            </FormSection>

            <FormSection title="Nominee Details">
              <FormField label="Nominee Name" error={errors.nomineeName}>
                <TextInput {...field('nomineeName')} error={errors.nomineeName} />
              </FormField>
              <FormField label="Relation" error={errors.nomineeRelation}>
                <TextInput {...field('nomineeRelation')} error={errors.nomineeRelation} />
              </FormField>
              <FormField label="Children Count" error={errors.nomineeChildrenCount}>
                <TextInput type="number" {...field('nomineeChildrenCount')} error={errors.nomineeChildrenCount} />
              </FormField>
              <FormField label="Qualification" error={errors.nomineeQualification}>
                <TextInput {...field('nomineeQualification')} error={errors.nomineeQualification} />
              </FormField>
              <FormField label="Nominee Mobile" error={errors.nomineeMobile}>
                <NumericInput {...field('nomineeMobile')} error={errors.nomineeMobile} exactLength={10} label="Nominee mobile number" />
              </FormField>
              <FormField label="Sector" error={errors.sector}>
                <TextInput {...field('sector')} error={errors.sector} />
              </FormField>
            </FormSection>
          </>
        )}

        <div className="worker-form-actions-row">
          <div>
            {currentStep > 0 && (
              <Button type="button" variant="secondary" onClick={goBack} disabled={saving}>
                Back
              </Button>
            )}
          </div>
          <div className="worker-form-actions-right">
            <Button type="button" variant="secondary" onClick={() => navigate(isEdit ? `/workers/${id}` : '/workers')} disabled={saving}>
              Cancel
            </Button>
            {currentStep < LAST_STEP ? (
              <Button key="next" type="button" onClick={goNext}>
                Next
              </Button>
            ) : (
              <Button key="submit" type="submit" disabled={saving}>
                {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Save Worker'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
