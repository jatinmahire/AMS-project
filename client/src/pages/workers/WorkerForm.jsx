import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import BackButton from '../../components/BackButton';
import StepIndicator from '../../components/StepIndicator';
import FormSection from '../../components/FormSection';
import FormField, { TextInput, Select } from '../../components/FormField';
import NumericInput from '../../components/NumericInput';
import AlphabetInput from '../../components/AlphabetInput';
import StateCityFields from '../../components/StateCityFields';
import WorkerQrCard from '../../components/WorkerQrCard';
import Button from '../../components/Button';
import { getWorker, createWorker, updateWorker } from '../../api/workers';
import { contractorDropdown } from '../../api/contractors';
import { listDesignations } from '../../api/designations';
import { listLabourCategories } from '../../api/labourCategories';
import { toDateInputValue } from '../../utils/format';
import { toFormData } from '../../utils/toFormData';
import { getErrorMessage, getFieldErrors } from '../../utils/errorMessage';
import {
  AADHAAR_FILE_RULE, DOCUMENT_FILE_RULE, IFSC_REGEX, MIN_DOB, PAN_REGEX, maxAdultDob, validateDob, validatePattern, validateUploadFile,
} from '../../utils/validators';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import './WorkerForm.css';

const EMPTY_FORM = {
  firstName: '', middleName: '', lastName: '', dob: '', gender: 'MALE', maritalStatus: '', mobileNo: '',
  permanentAddress: '', currentAddress: '', village: '', taluka: '', city: '', district: '', state: '', pincode: '',
  contractorId: '', designationId: '', labourCategoryId: '',
  idType: 'AADHAAR', idNumber: '', joinDate: '', sector: '', status: 'ACTIVE',
  bocwRegistrationNo: '', bocwIssueDate: '', bocwValidDate: '',
  pfNumber: '', uanNumber: '', esicNumber: '', panNumber: '', ipNumber: '',
  bankName: '', bankBranch: '', accountNo: '', ifscCode: '',
  nomineeName: '', nomineeRelation: '', nomineeChildrenCount: '', nomineeQualification: '', nomineeMobile: '',
};

const FILE_FIELDS = [
  { key: 'photo', label: 'Photo', urlKey: 'photoUrl', rule: DOCUMENT_FILE_RULE },
  { key: 'idFront', label: 'ID Front', urlKey: 'idFrontUrl', rule: AADHAAR_FILE_RULE },
  { key: 'idBack', label: 'ID Back', urlKey: 'idBackUrl', rule: AADHAAR_FILE_RULE },
  { key: 'bankPassbook', label: 'Bank Passbook', urlKey: 'bankPassbookUrl', rule: DOCUMENT_FILE_RULE },
];

const MOBILE_REGEX = /^[6-9]\d{9}$/;

const PATTERN_FIELDS = {
  panNumber: { regex: PAN_REGEX, label: 'PAN number', example: 'ABCDE1234F' },
  ifscCode: { regex: IFSC_REGEX, label: 'IFSC code', example: 'HDFC0001234' },
};

const ID_NUMBER_RULES = {
  AADHAAR: { regex: /^\d{12}$/, message: 'Enter a valid 12-digit Aadhaar number' },
  PAN: { regex: PAN_REGEX, message: 'Enter a valid PAN, e.g. ABCDE1234F' },
  VOTER_ID: { regex: /^[A-Z]{3}[0-9]{7}$/, message: 'Enter a valid Voter ID, e.g. ABC1234567' },
};

const STEP_LABELS = ['Personal Info', 'Address', 'Employment & Documents', 'Bank & Nominee'];

const STEP_FIELDS = [
  ['firstName', 'middleName', 'lastName', 'dob', 'gender', 'maritalStatus', 'mobileNo'],
  ['permanentAddress', 'currentAddress', 'village', 'taluka', 'city', 'district', 'state', 'pincode'],
  [
    'contractorId', 'designationId', 'labourCategoryId', 'idType', 'idNumber', 'joinDate',
    'photo', 'idFront', 'idBack', 'bankPassbook', 'bocwRegistrationNo', 'bocwIssueDate', 'bocwValidDate', 'pfNumber', 'uanNumber', 'esicNumber', 'panNumber', 'ipNumber',
  ],
  ['bankName', 'bankBranch', 'accountNo', 'ifscCode', 'nomineeName', 'nomineeRelation', 'nomineeChildrenCount', 'nomineeQualification', 'nomineeMobile', 'sector'],
];

const STEP_REQUIRED_FIELDS = [
  ['firstName', 'lastName', 'dob', 'gender', 'maritalStatus', 'mobileNo'],
  ['permanentAddress', 'taluka', 'state', 'city', 'district', 'pincode'],
  ['contractorId', 'designationId', 'labourCategoryId', 'idType', 'idNumber', 'joinDate', 'panNumber'],
  [
    'bankName', 'bankBranch', 'accountNo', 'ifscCode',
    'nomineeName', 'nomineeRelation', 'nomineeChildrenCount', 'nomineeQualification', 'nomineeMobile',
  ],
];

// Alpha-only input: blocks digit keystrokes and shows a brief red flash message,
// matching the NumericInput flash pattern exactly (same CSS classes).
function AlphaInput({ value, onChange, error, className = '', ...props }) {
  const [flash, setFlash] = useState('');
  const [flashVisible, setFlashVisible] = useState(false);
  const hideRef = useRef(null);
  const clearRef = useRef(null);
  useEffect(() => () => { clearTimeout(hideRef.current); clearTimeout(clearRef.current); }, []);

  function showFlash(msg) {
    clearTimeout(hideRef.current); clearTimeout(clearRef.current);
    setFlash(msg); setFlashVisible(true);
    hideRef.current = setTimeout(() => setFlashVisible(false), 2000);
    clearRef.current = setTimeout(() => setFlash(''), 2300);
  }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && ['a','c','v','x'].includes(e.key.toLowerCase())) return;
    const CTRL = new Set(['Backspace','Delete','Tab','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','Enter','Escape']);
    if (CTRL.has(e.key)) return;
    if (e.key.length === 1 && /[0-9]/.test(e.key)) {
      e.preventDefault();
      showFlash('Only letters are allowed');
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const lettersOnly = pasted.replace(/[0-9]/g, '');
    if (lettersOnly.length < pasted.length) showFlash('Only letters are allowed');
    const input = e.target;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const next = input.value.slice(0, start) + lettersOnly + input.value.slice(end);
    onChange({ target: { value: next, name: props.name } });
  }

  return (
    <div className="numeric-input-wrapper">
      <TextInput value={value} onChange={onChange} onKeyDown={handleKeyDown} onPaste={handlePaste} error={error} className={className} {...props} />
      {flash && <p className={`numeric-input-flash ${flashVisible ? '' : 'numeric-input-flash-hidden'}`}>{flash}</p>}
    </div>
  );
}

function isBlank(value) {
  return value === '' || value === null || value === undefined;
}

const LAST_STEP = STEP_LABELS.length - 1;

export default function WorkerForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  // Supervisors and Contractors can only register under their own contractor — the field is
  // pre-filled and locked here, and the server overrides it from the session regardless.
  const isScopedRole = user?.role === 'SUPERVISOR' || user?.role === 'CONTRACTOR';

  const [form, setForm] = useState(() =>
    isScopedRole ? { ...EMPTY_FORM, contractorId: user.assignedContractorId || '' } : EMPTY_FORM
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
  const [registeredWorker, setRegisteredWorker] = useState(null);

  useEffect(() => {
    Promise.all([isScopedRole ? Promise.resolve([]) : contractorDropdown(), listDesignations(), listLabourCategories()])
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

  function patternField(name) {
    const { regex, label, example } = PATTERN_FIELDS[name];
    return {
      value: form[name] ?? '',
      onChange: (e) => setForm({ ...form, [name]: e.target.value.toUpperCase().replace(/\s/g, '') }),
      onBlur: (e) => setErrors((prev) => ({ ...prev, [name]: validatePattern(e.target.value, regex, label, example) })),
    };
  }

  function handleFileChange(fileField, e) {
    const file = e.target.files[0];
    const error = fileField.rule ? validateUploadFile(file, fileField.rule) : undefined;
    setErrors((prev) => ({ ...prev, [fileField.key]: error }));
    if (error) {
      e.target.value = '';
      setFiles((prev) => ({ ...prev, [fileField.key]: undefined }));
      return;
    }
    setFiles((prev) => ({ ...prev, [fileField.key]: file }));
  }

  function validateStep(stepIndex) {
    const stepErrors = {};
    for (const key of STEP_REQUIRED_FIELDS[stepIndex]) {
      if (isBlank(form[key])) stepErrors[key] = 'This field is required';
    }
    if (STEP_FIELDS[stepIndex].includes('dob') && !stepErrors.dob) {
      const dobError = validateDob(form.dob, 'Worker');
      if (dobError) stepErrors.dob = dobError;
    }
    for (const [key, { regex, label, example }] of Object.entries(PATTERN_FIELDS)) {
      if (STEP_FIELDS[stepIndex].includes(key) && !stepErrors[key]) {
        const patternError = validatePattern(form[key], regex, label, example);
        if (patternError) stepErrors[key] = patternError;
      }
    }
    for (const key of ['mobileNo', 'nomineeMobile']) {
      if (STEP_FIELDS[stepIndex].includes(key) && !stepErrors[key] && form[key] && !MOBILE_REGEX.test(form[key])) {
        stepErrors[key] = 'Enter a valid 10-digit mobile number';
      }
    }
    if (STEP_FIELDS[stepIndex].includes('idNumber') && !stepErrors.idNumber && form.idNumber) {
      const rule = ID_NUMBER_RULES[form.idType];
      if (rule && !rule.regex.test(form.idNumber)) stepErrors.idNumber = rule.message;
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
        setRegisteredWorker(created);
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

  if (registeredWorker) {
    return (
      <div>
        <div className="no-print">
          <PageHeader
            title="Worker Registered"
            description={`${registeredWorker.firstName} ${registeredWorker.lastName} (${registeredWorker.workerCode}) has been added.`}
          />
        </div>
        <WorkerQrCard worker={registeredWorker} />
        <div className="no-print worker-form-success-actions">
          <Button
            variant="secondary"
            onClick={() => {
              setRegisteredWorker(null);
              setForm(isScopedRole ? { ...EMPTY_FORM, contractorId: user.assignedContractorId || '' } : EMPTY_FORM);
              setFiles({});
              setCurrentStep(0);
              setCompletedSteps([]);
            }}
          >
            Register Another Worker
          </Button>
          <Button onClick={() => navigate('/workers')}>Go to Worker List</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {isEdit && <BackButton to={`/workers/${id}`} />}

      <PageHeader
        title={isEdit ? `Edit Worker — ${worker?.workerCode}` : 'Add Worker'}
        description="Fields marked with * are required."
      />

      <StepIndicator steps={STEP_LABELS} currentStep={currentStep} completedSteps={completedSteps} onStepClick={goToStep} />

      <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="worker-form-card">
        {currentStep === 0 && (
          <FormSection title="Personal Info">
            <FormField label="First Name" required error={errors.firstName}>
              <AlphabetInput {...field('firstName')} maxLength={30} error={errors.firstName} />
            </FormField>
            <FormField label="Middle Name" error={errors.middleName}>
              <AlphabetInput {...field('middleName')} maxLength={30} error={errors.middleName} />
            </FormField>
            <FormField label="Last Name" required error={errors.lastName}>
              <AlphabetInput {...field('lastName')} maxLength={30} error={errors.lastName} />
            </FormField>
            <FormField label="Date of Birth" required error={errors.dob}>
              <TextInput type="date" {...field('dob')} min={MIN_DOB} max={maxAdultDob()} error={errors.dob} />
            </FormField>
            <FormField label="Gender" required error={errors.gender}>
              <Select {...field('gender')}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </Select>
            </FormField>
            <FormField label="Marital Status" required error={errors.maritalStatus}>
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
              <AlphaInput {...field('village')} error={errors.village} />
            </FormField>
            <FormField label="Taluka" required error={errors.taluka}>
              <AlphaInput {...field('taluka')} error={errors.taluka} />
            </FormField>
            <StateCityFields
              state={form.state}
              city={form.city}
              onChange={(changes) => setForm((prev) => ({ ...prev, ...changes }))}
              errors={errors}
              required
            />
            <FormField label="District" required error={errors.district}>
              <TextInput {...field('district')} error={errors.district} />
            </FormField>
            <FormField label="Pincode" required error={errors.pincode}>
              <NumericInput {...field('pincode')} error={errors.pincode} exactLength={6} label="Pincode" />
            </FormField>
          </FormSection>
        )}

        {currentStep === 2 && (
          <>
            <FormSection title="Employment">
              <FormField label="Contractor" required error={errors.contractorId}>
                {isScopedRole ? (
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
                <Select
                  value={form.idType}
                  onChange={(e) => {
                    setForm({ ...form, idType: e.target.value, idNumber: '' });
                    setErrors((prev) => ({ ...prev, idNumber: undefined }));
                  }}
                >
                  <option value="AADHAAR">Aadhaar</option>
                  <option value="PAN">PAN</option>
                  <option value="VOTER_ID">Voter ID</option>
                </Select>
              </FormField>
              <FormField label="ID Number" required error={errors.idNumber}>
                {form.idType === 'AADHAAR' ? (
                  <NumericInput {...field('idNumber')} error={errors.idNumber} exactLength={12} label="Aadhaar number" />
                ) : (
                  <TextInput
                    value={form.idNumber ?? ''}
                    onChange={(e) => setForm({ ...form, idNumber: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
                    maxLength={10}
                    error={errors.idNumber}
                  />
                )}
              </FormField>
              {FILE_FIELDS.map((f) => (
                <FormField label={f.rule ? `${f.label} (${f.rule.typeLabel}, max ${f.rule.sizeLabel})` : f.label} key={f.key} required error={errors[f.key]}>
                  <input
                    type="file"
                    accept={f.rule?.accept || '.pdf,.jpg,.jpeg'}
                    onChange={(e) => handleFileChange(f, e)}
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
              <FormField label="PAN Number" required error={errors.panNumber}>
                <TextInput {...patternField('panNumber')} maxLength={10} placeholder="ABCDE1234F" error={errors.panNumber} />
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
              <FormField label="Bank Name" required error={errors.bankName}>
                <TextInput {...field('bankName')} maxLength={30} error={errors.bankName} />
              </FormField>
              <FormField label="Bank Branch" required error={errors.bankBranch}>
                <TextInput {...field('bankBranch')} error={errors.bankBranch} />
              </FormField>
              <FormField label="Account No." required error={errors.accountNo}>
                <NumericInput {...field('accountNo')} error={errors.accountNo} maxLength={18} label="Account number" />
              </FormField>
              <FormField label="IFSC Code" required error={errors.ifscCode}>
                <TextInput {...patternField('ifscCode')} maxLength={11} placeholder="HDFC0001234" error={errors.ifscCode} />
              </FormField>
            </FormSection>

            <FormSection title="Nominee Details">
              <FormField label="Nominee Name" required error={errors.nomineeName}>
                <AlphabetInput {...field('nomineeName')} maxLength={30} error={errors.nomineeName} />
              </FormField>
              <FormField label="Relation" required error={errors.nomineeRelation}>
                <AlphabetInput {...field('nomineeRelation')} maxLength={30} error={errors.nomineeRelation} />
              </FormField>
              <FormField label="Children Count" required error={errors.nomineeChildrenCount}>
                <TextInput type="number" min={0} {...field('nomineeChildrenCount')} error={errors.nomineeChildrenCount} />
              </FormField>
              <FormField label="Qualification" required error={errors.nomineeQualification}>
                <TextInput {...field('nomineeQualification')} error={errors.nomineeQualification} />
              </FormField>
              <FormField label="Nominee Mobile" required error={errors.nomineeMobile}>
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
