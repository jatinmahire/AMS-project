import { useEffect, useRef, useState } from 'react';
import './ContractorMonthFilter.css';
import { Select, TextInput } from './FormField';
import { contractorDropdown } from '../api/contractors';

export default function ContractorMonthFilter({ contractorId, onContractorChange, month, onMonthChange }) {
  const [contractors, setContractors] = useState([]);
  const clearTimerRef = useRef(null);

  useEffect(() => {
    contractorDropdown().then(setContractors).catch(() => setContractors([]));
  }, []);

  useEffect(() => () => clearTimeout(clearTimerRef.current), []);

  // See FilterBar's emitDateChange — a month input reports an empty, unreadable value for as
  // long as its year segment has overflowed past 4 digits, indistinguishable from a real clear.
  function handleMonthChange(value) {
    clearTimeout(clearTimerRef.current);
    if (value) {
      onMonthChange(value);
      return;
    }
    clearTimerRef.current = setTimeout(() => onMonthChange(value), 700);
  }

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
        <TextInput type="month" name="contractor-month-filter" autoComplete="off" value={month} onChange={(e) => handleMonthChange(e.target.value)} />
      </div>
    </div>
  );
}
