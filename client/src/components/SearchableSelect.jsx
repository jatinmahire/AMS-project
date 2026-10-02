import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './SearchableSelect.css';

const MAX_VISIBLE = 200;

export default function SearchableSelect({ value, onChange, options, placeholder = 'Select', disabled, loading, error, emptyText = 'No matches' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const wrapperRef = useRef(null);
  const listRef = useRef(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q ? options.filter((o) => o.toLowerCase().includes(q)) : options;
    return matches.slice(0, MAX_VISIBLE);
  }, [options, query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    listRef.current?.children[highlight]?.scrollIntoView({ block: 'nearest' });
  }, [highlight]);

  function openList() {
    if (disabled) return;
    setQuery('');
    setHighlight(0);
    setOpen(true);
  }

  function select(option) {
    onChange(option);
    setOpen(false);
  }

  function handleKeyDown(e) {
    if (!open) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      // Keep Enter from bubbling to the wizard form, which treats it as "Next".
      e.preventDefault();
      e.stopPropagation();
      if (filtered[highlight]) select(filtered[highlight]);
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setOpen(false);
    }
  }

  return (
    <div className="searchable-select" ref={wrapperRef}>
      <input
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        className={`form-field-input-base searchable-select-input ${error ? 'form-field-input-error' : ''}`}
        value={open ? query : value || ''}
        placeholder={loading ? 'Loading...' : value || placeholder}
        disabled={disabled}
        onFocus={openList}
        onClick={() => !open && openList()}
        onChange={(e) => {
          setQuery(e.target.value);
          setHighlight(0);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
      />
      <ChevronDown size={16} className="searchable-select-chevron" />

      {open && (
        <ul role="listbox" ref={listRef} className="searchable-select-list">
          {filtered.length === 0 ? (
            <li className="searchable-select-empty">{loading ? 'Loading...' : emptyText}</li>
          ) : (
            filtered.map((option, i) => (
              <li
                key={option}
                role="option"
                aria-selected={option === value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  select(option);
                }}
                onMouseEnter={() => setHighlight(i)}
                className={`searchable-select-option ${i === highlight ? 'searchable-select-option-active' : ''} ${option === value ? 'searchable-select-option-selected' : ''}`}
              >
                {option}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
