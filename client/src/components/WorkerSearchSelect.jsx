import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { searchWorkers } from '../api/workers';

export default function WorkerSearchSelect({ value, onSelect, error, placeholder = 'Search by worker code or name' }) {
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
      searchWorkers(query).then(setResults).catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  function handleSelect(worker) {
    onSelect(worker);
    setQuery(`${worker.workerCode} — ${worker.firstName} ${worker.lastName}`);
    setResults([]);
    setOpen(false);
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
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
          className={`w-full rounded-md border bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 ${error ? 'border-red-400 dark:border-red-500' : 'border-slate-300 dark:border-slate-700'}`}
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg animate-[fadeIn_150ms_ease-out] dark:border-slate-700 dark:bg-slate-800">
          {results.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => handleSelect(w)}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <span className="font-medium text-slate-800 dark:text-slate-100">{w.workerCode}</span>
              <span className="text-slate-600 dark:text-slate-300"> — {w.firstName} {w.lastName}</span>
              <span className="block text-xs text-slate-400 dark:text-slate-500">{w.contractor?.contractorName} · {w.designation?.designationName}</span>
            </button>
          ))}
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
