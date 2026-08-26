import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import FormSection from '../../components/FormSection';
import FormField, { TextInput, Select } from '../../components/FormField';
import Button from '../../components/Button';
import { getWorker, createWorker, updateWorker } from '../../api/workers';
import { contractorDropdown } from '../../api/contractors';
import { listDesignations } from '../../api/designations';
import { listLabourCategories } from '../../api/labourCategories';
import { toDateInputValue } from '../../utils/format';
import { toFormData } from '../../utils/toFormData';
import { getErrorMessage, getFieldErrors } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';

const EMPTY_FORM = {
  firstName: '', middleName: '', lastName: '', dob: '', gender: 'MALE', maritalStatus: '', mobileNo: '',
  permanentAddress: '', currentAddress: '', city: '', district: '', state: '', pincode: '',
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

export default function WorkerForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [contractors, setContractors] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [labourCategories, setLabourCategories] = useState([]);
  const [worker, setWorker] = useState(null);
  const [files, setFiles] = useState({});

  useEffect(() => {
    Promise.all([contractorDropdown(), listDesignations(), listLabourCategories()])
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

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const payload = toFormData({ ...form, ...files });
      if (isEdit) {
        await updateWorker(id, payload);
        showToast('Worker updated');
      } else {
        const created = await createWorker(payload);
        showToast('Worker created');
        navigate(`/workers/${created.id}/edit`, { replace: true });
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
      <button onClick={() => navigate('/workers')} className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
        <ArrowLeft size={16} /> Back to Workers
      </button>

      <PageHeader
        title={isEdit ? `Edit Worker — ${worker?.workerCode}` : 'Add Worker'}
        description="Fields marked with * are required."
      />

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
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
            <TextInput {...field('maritalStatus')} error={errors.maritalStatus} />
          </FormField>
          <FormField label="Mobile No." required error={errors.mobileNo}>
            <TextInput {...field('mobileNo')} error={errors.mobileNo} />
          </FormField>
        </FormSection>

        <FormSection title="Address">
          <FormField label="Permanent Address" required error={errors.permanentAddress} className="sm:col-span-2 lg:col-span-3">
            <TextInput {...field('permanentAddress')} error={errors.permanentAddress} />
          </FormField>
          <FormField label="Current Address" error={errors.currentAddress} className="sm:col-span-2 lg:col-span-3">
            <TextInput {...field('currentAddress')} error={errors.currentAddress} />
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
            <TextInput {...field('pincode')} error={errors.pincode} />
          </FormField>
        </FormSection>

        <FormSection title="Employment">
          <FormField label="Contractor" required error={errors.contractorId}>
            <Select {...field('contractorId')}>
              <option value="">Select contractor</option>
              {contractors.map((c) => (
                <option key={c.id} value={c.id}>{c.contractorCode} — {c.contractorName}</option>
              ))}
            </Select>
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
                <option key={l.id} value={l.id}>{l.categoryCode} — {l.categoryName.replace('_', ' ')}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Join Date" required error={errors.joinDate}>
            <TextInput type="date" {...field('joinDate')} error={errors.joinDate} />
          </FormField>
          <FormField label="Sector" error={errors.sector}>
            <TextInput {...field('sector')} error={errors.sector} />
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
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200 dark:text-slate-400 dark:file:bg-slate-700 dark:file:text-slate-200 dark:hover:file:bg-slate-600"
              />
              {worker?.[f.urlKey] && <a href={worker[f.urlKey]} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-indigo-600 hover:underline dark:text-indigo-400">View current file</a>}
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
            <TextInput {...field('pfNumber')} error={errors.pfNumber} />
          </FormField>
          <FormField label="UAN Number" error={errors.uanNumber}>
            <TextInput {...field('uanNumber')} error={errors.uanNumber} />
          </FormField>
          <FormField label="ESIC Number" error={errors.esicNumber}>
            <TextInput {...field('esicNumber')} error={errors.esicNumber} />
          </FormField>
          <FormField label="PAN Number" error={errors.panNumber}>
            <TextInput {...field('panNumber')} error={errors.panNumber} />
          </FormField>
          <FormField label="IP Number" error={errors.ipNumber}>
            <TextInput {...field('ipNumber')} error={errors.ipNumber} />
          </FormField>
        </FormSection>

        <FormSection title="Bank Details">
          <FormField label="Bank Name" error={errors.bankName}>
            <TextInput {...field('bankName')} error={errors.bankName} />
          </FormField>
          <FormField label="Bank Branch" error={errors.bankBranch}>
            <TextInput {...field('bankBranch')} error={errors.bankBranch} />
          </FormField>
          <FormField label="Account No." error={errors.accountNo}>
            <TextInput {...field('accountNo')} error={errors.accountNo} />
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
            <TextInput {...field('nomineeMobile')} error={errors.nomineeMobile} />
          </FormField>
        </FormSection>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/workers')} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Worker'}
          </Button>
        </div>
      </form>
    </div>
  );
}
