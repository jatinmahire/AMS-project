import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import FormSection from '../../components/FormSection';
import FormField, { TextInput, Select } from '../../components/FormField';
import Button from '../../components/Button';
import { getContractor, createContractor, updateContractor } from '../../api/contractors';
import { toDateInputValue } from '../../utils/format';
import { getErrorMessage, getFieldErrors } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import ContractorDocuments from './ContractorDocuments';

const EMPTY_FORM = {
  contractorName: '', contactPerson: '', phone: '', email: '', email2: '', email3: '', email4: '',
  address: '', city: '', state: '', pincode: '', buildingName: '',
  aadhaarNo: '', panNo: '',
  wcPolicyNo: '', wcStartDate: '', wcExpiryDate: '',
  serviceType: '', serviceTaxNo: '',
  shopActLicenseNo: '', shopActExpiryDate: '',
  labourLicenseNo: '', labourLicenseStart: '', labourLicenseExpiry: '',
  bocwNo: '', bocwStartDate: '', bocwExpiryDate: '', rcCount: '',
  pfEstablishmentCode: '', esicEstablishmentCode: '', mlwfNo: '', ptecNo: '', ptrcNo: '',
  status: 'ACTIVE',
};

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

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      if (isEdit) {
        await updateContractor(id, form);
        showToast('Contractor updated');
      } else {
        const created = await createContractor(form);
        showToast('Contractor created');
        navigate(`/contractors/${created.id}/edit`, { replace: true });
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
      <button onClick={() => navigate('/contractors')} className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
        <ArrowLeft size={16} /> Back to Contractors
      </button>

      <PageHeader
        title={isEdit ? `Edit Contractor — ${contractor?.contractorCode}` : 'Add Contractor'}
        description="Fields marked with * are required."
      />

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <FormSection title="Basic Info">
          <FormField label="Contractor Name" required error={errors.contractorName}>
            <TextInput {...field('contractorName')} error={errors.contractorName} />
          </FormField>
          <FormField label="Contact Person" required error={errors.contactPerson}>
            <TextInput {...field('contactPerson')} error={errors.contactPerson} />
          </FormField>
          <FormField label="Phone" required error={errors.phone}>
            <TextInput {...field('phone')} error={errors.phone} />
          </FormField>
          <FormField label="Email" required error={errors.email}>
            <TextInput type="email" {...field('email')} error={errors.email} />
          </FormField>
          <FormField label="Email 2" error={errors.email2}>
            <TextInput type="email" {...field('email2')} error={errors.email2} />
          </FormField>
          <FormField label="Email 3" error={errors.email3}>
            <TextInput type="email" {...field('email3')} error={errors.email3} />
          </FormField>
          <FormField label="Email 4" error={errors.email4}>
            <TextInput type="email" {...field('email4')} error={errors.email4} />
          </FormField>
          <FormField label="Building Name" error={errors.buildingName}>
            <TextInput {...field('buildingName')} error={errors.buildingName} />
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
          <FormField label="Address" required error={errors.address} className="sm:col-span-2 lg:col-span-3">
            <TextInput {...field('address')} error={errors.address} />
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

        <FormSection title="Identity">
          <FormField label="Aadhaar No." required error={errors.aadhaarNo}>
            <TextInput {...field('aadhaarNo')} error={errors.aadhaarNo} maxLength={12} />
          </FormField>
          <FormField label="PAN No." required error={errors.panNo}>
            <TextInput {...field('panNo')} error={errors.panNo} maxLength={10} />
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
            <TextInput type="number" {...field('rcCount')} error={errors.rcCount} />
          </FormField>
          <FormField label="PF Establishment Code" error={errors.pfEstablishmentCode}>
            <TextInput {...field('pfEstablishmentCode')} error={errors.pfEstablishmentCode} />
          </FormField>
          <FormField label="ESIC Establishment Code" error={errors.esicEstablishmentCode}>
            <TextInput {...field('esicEstablishmentCode')} error={errors.esicEstablishmentCode} />
          </FormField>
          <FormField label="MLWF No." error={errors.mlwfNo}>
            <TextInput {...field('mlwfNo')} error={errors.mlwfNo} />
          </FormField>
          <FormField label="PTEC No." error={errors.ptecNo}>
            <TextInput {...field('ptecNo')} error={errors.ptecNo} />
          </FormField>
          <FormField label="PTRC No." error={errors.ptrcNo}>
            <TextInput {...field('ptrcNo')} error={errors.ptrcNo} />
          </FormField>
        </FormSection>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/contractors')} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Contractor'}
          </Button>
        </div>
      </form>

      {isEdit && <ContractorDocuments key={id} contractorId={id} documents={contractor?.documents || []} onChange={() => getContractor(id).then(setContractor)} />}
    </div>
  );
}
