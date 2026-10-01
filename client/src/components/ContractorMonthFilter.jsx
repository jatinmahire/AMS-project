import { useEffect, useState } from 'react';
import './ContractorMonthFilter.css';
import { Select, TextInput } from './FormField';
import { contractorDropdown } from '../api/contractors';

export default function ContractorMonthFilter({ contractorId, onContractorChange, month, onMonthChange }) {
  const [contractors, setContractors] = useState([]);

  useEffect(() => {
    contractorDropdown().then(setContractors).catch(() => setContractors([]));
  }, []);

  return (
    <div className="contractor-month-filter">
      <div className="contractor-month-filter-contractor-field">
        <label className="contractor-month-filter-label">Contractor</label>
        <Select value={contractorId} onChange={(e) => onContractorChange(e.target.value)}>
          <option value="">All contractors</option>
          {contractors.map((c) => (
            <option key={c.id} value={c.id}>{c.contractorCode} — {c.contractorName}</option>
          ))}
        </Select>
      </div>
      <div className="contractor-month-filter-month-field">
        <label className="contractor-month-filter-label">Month</label>
        <TextInput type="month" value={month} onChange={(e) => onMonthChange(e.target.value)} />
      </div>
    </div>
  );
}
