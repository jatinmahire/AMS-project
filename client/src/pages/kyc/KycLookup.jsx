import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import { TextInput, Select } from '../../components/FormField';
import { kycLookup } from '../../api/kyc';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import './KycLookup.css';

const ALL_TYPES = [
  { value: 'worker', label: 'Worker', route: 'workers' },
  { value: 'contractor', label: 'Contractor', route: 'contractors' },
  { value: 'supervisor', label: 'Supervisor', route: 'supervisors' },
];

export default function KycLookup() {
  const { user } = useAuth();
  const isWorkerOnly = user?.role === 'SUPERVISOR' || user?.role === 'CONTRACTOR';
  const TYPES = isWorkerOnly ? ALL_TYPES.filter((t) => t.value === 'worker') : ALL_TYPES;
  const [searchParams] = useSearchParams();
  const typeFromUrl = searchParams.get('type');
  const [type, setType] = useState(TYPES.some((t) => t.value === typeFromUrl) ? typeFromUrl : 'worker');
  const [code, setCode] = useState('');
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  async function handleSearch(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setSearching(true);
    try {
      const data = await kycLookup(type, code.trim());
      const route = TYPES.find((t) => t.value === type).route;
      navigate(`/${route}/${data.id}`);
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
        className="kyc-lookup-search-bar"
      >
        <div className="kyc-lookup-type-field">
          <label className="kyc-lookup-label">Type</label>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
        </div>
        <div className="kyc-lookup-code-field">
          <label className="kyc-lookup-label">Code</label>
          <TextInput value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. WRK001" />
        </div>
        <Button type="submit" icon={Search} disabled={searching}>
          {searching ? 'Searching...' : 'Search'}
        </Button>
      </form>
    </div>
  );
}
