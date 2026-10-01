import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import './WorkerSearchSelect.css';
import { searchWorkers } from '../api/workers';

export default function WorkerSearchSelect({ value, onSelect, error, contractorId, placeholder ='Search by worker code or name' }) {
  const [query, setQuery] = useState(value ? `${value.workerCode} — ${value.firstName} ${value.lastName}` : '');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (value) {
      setQuery(`${value.workerCode} — ${value.firstName} ${value.lastName}`);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2 || (value && query === `${value.workerCode} — ${value.firstName} ${value.lastName}`)) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      searchWorkers(query, contractorId).then(setResults).catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(timeout);
  }, [query, contractorId]);

  function handleSelect(worker) {
    onSelect(worker);
    setQuery(`${worker.workerCode} — ${worker.firstName} ${worker.lastName}`);
    setResults([]);
    setOpen(false);
  }

  return (
    <div className="worker-search-select" ref={containerRef}>
      <div className="worker-search-select-input-wrapper">
        <Search size={16} className="worker-search-select-icon" />
        <input
          type="text"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            onSelect(null);
            setOpen(true);
          }}
          placeholder={placeholder}
          className={`worker-search-select-field ${error ? 'worker-search-select-field-error' : ''}`}
        />
      </div>
      {open && results.length > 0 && (
        <div className="worker-search-select-dropdown">
          {results.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => handleSelect(w)}
              className="worker-search-select-option"
            >
              <span className="worker-search-select-option-code">{w.workerCode}</span>
              <span className="worker-search-select-option-name"> — {w.firstName} {w.lastName}</span>
              <span className="worker-search-select-option-meta">{w.contractor?.contractorName} · {w.designation?.designationName}</span>
            </button>
          ))}
        </div>
      )}
      {error && <p className="worker-search-select-error-text">{error}</p>}
    </div>
  );
}
