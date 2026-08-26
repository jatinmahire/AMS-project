import { useEffect, useState } from 'react';
import { Select, TextInput } from './FormField';
import { contractorDropdown } from '../api/contractors';

export default function ContractorMonthFilter({ contractorId, onContractorChange, month, onMonthChange }) {
  const [contractors, setContractors] = useState([]);

  useEffect(() => {
    contractorDropdown().then(setContractors).catch(() => setContractors([]));
  }, []);

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="w-full sm:w-64">
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Contractor</label>
        <Select value={contractorId} onChange={(e) => onContractorChange(e.target.value)}>
          <option value="">All contractors</option>
          {contractors.map((c) => (
            <option key={c.id} value={c.id}>{c.contractorCode} — {c.contractorName}</option>
          ))}
        </Select>
      </div>
      <div className="w-full sm:w-48">
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Month</label>
        <TextInput type="month" value={month} onChange={(e) => onMonthChange(e.target.value)} />
      </div>
    </div>
  );
}
