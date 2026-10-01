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

export function TextInput({ error, className = '', ...props }) {
  return (
    <input
      className={`${baseInputClass} ${error ? 'form-field-input-error' : ''} ${className}`}
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
