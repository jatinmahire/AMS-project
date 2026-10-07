import { useEffect, useRef, useState } from 'react';
import './FilterBar.css';
import SearchInput from './SearchInput';
import { Select, TextInput } from './FormField';
import { contractorDropdown } from '../api/contractors';

export default function FilterBar({ filters, values, onChange }) {
  const [contractors, setContractors] = useState([]);
  const clearTimersRef = useRef({});

  useEffect(() => {
    if (filters.some((f) => f.type === 'contractor')) {
      contractorDropdown().then(setContractors).catch(() => setContractors([]));
    }
  }, []);

  useEffect(() => () => Object.values(clearTimersRef.current).forEach(clearTimeout), []);

  // A native date/month input reports an empty, unreadable value for as long as its year
  // segment has overflowed past 4 digits — even mid-typing, before the user has touched the
  // other segments — with no way to tell that apart from the user genuinely clearing the
  // field. Committing an empty value immediately reloaded the list and visibly "reset" the
  // filter on every such keystroke. Delaying only the empty case gives a momentary glitch a
  // chance to resolve itself (the user fixing the segment) before it's treated as a real clear.
  function emitDateChange(key, value) {
    clearTimeout(clearTimersRef.current[key]);
    if (value) {
      onChange(key, value);
      return;
    }
    clearTimersRef.current[key] = setTimeout(() => onChange(key, value), 700);
  }

  return (
    <div className="filter-bar">
      {filters.map((filter) => {
        if (filter.type === 'search') {
          return (
            <div key={filter.key} className="filter-bar-search-field">
              <label className="filter-bar-label">{filter.label || 'Search'}</label>
              <SearchInput
                value={values[filter.key] || ''}
                onChange={(v) => onChange(filter.key, v)}
                placeholder={filter.placeholder}
              />
            </div>
          );
        }

        if (filter.type === 'contractor') {
          return (
            <div key={filter.key} className="filter-bar-field">
              <label className="filter-bar-label">Contractor</label>
              <Select value={values[filter.key] || ''} onChange={(e) => onChange(filter.key, e.target.value)}>
                <option value="">All Contractors</option>
                {contractors.map((c) => (
                  <option key={c.id} value={c.id}>{c.contractorCode} — {c.contractorName}</option>
                ))}
              </Select>
            </div>
          );
        }

        if (filter.type === 'select') {
          return (
            <div key={filter.key} className="filter-bar-field">
              <label className="filter-bar-label">{filter.label}</label>
              <Select value={values[filter.key] ?? ''} onChange={(e) => onChange(filter.key, e.target.value)}>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            </div>
          );
        }

        if (filter.type === 'date') {
          return (
            <div key={filter.key} className="filter-bar-field">
              <label className="filter-bar-label">{filter.label || 'Date'}</label>
              <TextInput
                type="date"
                name={`filter-${filter.key}`}
                autoComplete="off"
                value={values[filter.key] || ''}
                onChange={(e) => emitDateChange(filter.key, e.target.value)}
              />
            </div>
          );
        }

        if (filter.type === 'month') {
          return (
            <div key={filter.key} className="filter-bar-field">
              <label className="filter-bar-label">{filter.label || 'Month'}</label>
              <TextInput
                type="month"
                name={`filter-${filter.key}`}
                autoComplete="off"
                value={values[filter.key] || ''}
                onChange={(e) => emitDateChange(filter.key, e.target.value)}
              />
            </div>
          );
        }

        if (filter.type === 'dateRange') {
          return (
            <div key={filter.key} className="filter-bar-date-range">
              <div className="filter-bar-field">
                <label className="filter-bar-label">From</label>
                <TextInput
                  type="date"
                  name={`filter-${filter.key}-from`}
                  autoComplete="off"
                  value={values[`${filter.key}From`] || ''}
                  onChange={(e) => emitDateChange(`${filter.key}From`, e.target.value)}
                />
              </div>
              <div className="filter-bar-field">
                <label className="filter-bar-label">To</label>
                <TextInput
                  type="date"
                  name={`filter-${filter.key}-to`}
                  autoComplete="off"
                  value={values[`${filter.key}To`] || ''}
                  onChange={(e) => emitDateChange(`${filter.key}To`, e.target.value)}
                />
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
