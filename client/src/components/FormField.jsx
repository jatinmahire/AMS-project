import { useRef } from 'react';
import './FormField.css';

export default function FormField({ label, error, required, children, className = '' }) {
  return (
    <div className={className}>
      <label className="form-field-label">
        {label}
        {required && <span className="form-field-required-mark">*</span>}
      </label>
      {children}
      {error && <p className="form-field-error">{error}</p>}
    </div>
  );
}

const baseInputClass = 'form-field-input-base';

export function TextInput({ error, className = '', onWheel, onChange, ...props }) {
  // Scrolling the page over a focused number input silently changes its value — blur it instead.
  const handleWheel = props.type === 'number' ? (e) => { e.currentTarget.blur(); onWheel?.(e); } : onWheel;

  // Native date/month inputs let you keep typing digits into the year segment past 4 (e.g.
  // typing "2","0","2","6","0","0" shows "200600") — the HTML spec doesn't cap it, and once
  // it overflows, the browser's own composed value is no longer simply "the digits typed in
  // order" (slicing the first/last 4 characters of it can silently produce a wrong-but-valid-
  // looking year like "0002"). Reverting fully to the last known-good value is the only
  // outcome that's never silently wrong, everywhere a date or month input renders through
  // this component.
  const lastValidRef = useRef(props.value ?? '');
  const isDateLike = props.type === 'date' || props.type === 'month';
  const handleChange = isDateLike
    ? (e) => {
        const [year] = e.target.value.split('-');
        if (year && year.length > 4) {
          e.target.value = lastValidRef.current || '';
        } else {
          lastValidRef.current = e.target.value;
        }
        onChange?.(e);
      }
    : onChange;

  return (
    <input
      className={`${baseInputClass} ${error ? 'form-field-input-error' : ''} ${className}`}
      onWheel={handleWheel}
      onChange={handleChange}
      {...props}
    />
  );
}

export function Select({ error, className = '', children, ...props }) {
  return (
    <select className={`${baseInputClass} ${error ? 'form-field-input-error' : ''} ${className}`} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ error, className = '', ...props }) {
  return (
    <textarea
      className={`${baseInputClass} ${error ? 'form-field-input-error' : ''} ${className}`}
      rows={3}
      {...props}
    />
  );
}
