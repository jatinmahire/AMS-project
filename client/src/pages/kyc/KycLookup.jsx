import { useState } from 'react';
import { Search } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import { TextInput, Select } from '../../components/FormField';
import { kycLookup } from '../../api/kyc';
import { formatDate } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';

const TYPES = [
  { value: 'worker', label: 'Worker' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'supervisor', label: 'Supervisor' },
];

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm text-slate-800 dark:text-slate-200">{value ?? '-'}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="border-b border-slate-200 pb-5 last:border-b-0 last:pb-0 dark:border-slate-800">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{children}</div>
    </div>
  );
}

function WorkerResult({ data }) {
  return (
    <div className="space-y-5">
      <Section title="Personal">
        <Field label="Worker Code" value={data.workerCode} />
        <Field label="Name" value={`${data.firstName} ${data.middleName || ''} ${data.lastName}`} />
        <Field label="Gender" value={data.gender} />
        <Field label="Date of Birth" value={formatDate(data.dob)} />
        <Field label="Mobile" value={data.mobileNo} />
        <Field label="Status" value={data.status} />
      </Section>
      <Section title="Address">
        <Field label="Permanent Address" value={data.permanentAddress} />
        <Field label="City" value={data.city} />
        <Field label="District" value={data.district} />
        <Field label="State" value={data.state} />
        <Field label="Pincode" value={data.pincode} />
      </Section>
      <Section title="Employment">
        <Field label="Contractor" value={data.contractor?.contractorName} />
        <Field label="Designation" value={data.designation?.designationName} />
        <Field label="Labour Category" value={data.labourCategory?.categoryName} />
        <Field label="Join Date" value={formatDate(data.joinDate)} />
      </Section>
      <Section title="Identity & Statutory">
        <Field label="ID Type" value={data.idType} />
        <Field label="ID Number" value={data.idNumber} />
        <Field label="Police Verified" value={data.policeVerified ? 'Yes' : 'No'} />
        <Field label="PF Number" value={data.pfNumber} />
        <Field label="UAN Number" value={data.uanNumber} />
        <Field label="ESIC Number" value={data.esicNumber} />
      </Section>
    </div>
  );
}

function ContractorResult({ data }) {
  return (
    <div className="space-y-5">
      <Section title="Personal">
        <Field label="Contractor Code" value={data.contractorCode} />
        <Field label="Name" value={data.contractorName} />
        <Field label="Contact Person" value={data.contactPerson} />
        <Field label="Phone" value={data.phone} />
        <Field label="Email" value={data.email} />
        <Field label="Status" value={data.status} />
      </Section>
      <Section title="Address">
        <Field label="Address" value={data.address} />
        <Field label="City" value={data.city} />
        <Field label="State" value={data.state} />
        <Field label="Pincode" value={data.pincode} />
      </Section>
      <Section title="Identity Documents">
        <Field label="Aadhaar No." value={data.aadhaarNo} />
        <Field label="PAN No." value={data.panNo} />
      </Section>
      <Section title="Employment/Statutory">
        <Field label="WC Policy No." value={data.wcPolicyNo} />
        <Field label="BOCW No." value={data.bocwNo} />
        <Field label="PF Establishment Code" value={data.pfEstablishmentCode} />
        <Field label="ESIC Establishment Code" value={data.esicEstablishmentCode} />
      </Section>
    </div>
  );
}

function SupervisorResult({ data }) {
  return (
    <div className="space-y-5">
      <Section title="Personal">
        <Field label="Supervisor Code" value={data.supervisorCode} />
        <Field label="Name" value={data.fullName} />
        <Field label="Gender" value={data.gender} />
        <Field label="Date of Birth" value={formatDate(data.dob)} />
        <Field label="Contact No." value={data.contactNo} />
        <Field label="Status" value={data.status} />
      </Section>
      <Section title="Address">
        <Field label="Street" value={data.street} />
        <Field label="City" value={data.city} />
        <Field label="State" value={data.state} />
        <Field label="Pincode" value={data.pincode} />
      </Section>
      <Section title="Identity Documents">
        <Field label="Aadhaar No." value={data.aadhaarNo} />
      </Section>
      <Section title="Employment/Statutory">
        <Field label="Assigned Contractor" value={data.assignedContractor?.contractorName} />
      </Section>
    </div>
  );
}

export default function KycLookup() {
  const [type, setType] = useState('worker');
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const { showToast } = useToast();

  async function handleSearch(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setSearching(true);
    setResult(null);
    try {
      const data = await kycLookup(type, code.trim());
      setResult(data);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSearching(false);
    }
  }

  return (
    <div>
      <PageHeader title="KYC Lookup" description="Look up the full profile for a Worker, Contractor, or Supervisor by code." />

      <form
        onSubmit={handleSearch}
        className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="w-full sm:w-40">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Code</label>
          <TextInput value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. WRK001" />
        </div>
        <Button type="submit" icon={Search} disabled={searching}>
          {searching ? 'Searching...' : 'Search'}
        </Button>
      </form>

      {result && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {type === 'worker' && <WorkerResult data={result} />}
          {type === 'contractor' && <ContractorResult data={result} />}
          {type === 'supervisor' && <SupervisorResult data={result} />}
        </div>
      )}
    </div>
  );
}
