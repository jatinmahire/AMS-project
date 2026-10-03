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

  // Native date inputs let you keep typing digits into the year segment past 4 (e.g.
  // "26666-12-12") — the HTML spec doesn't cap it. Clamp the moment it overflows, everywhere
  // a date input is used, since every one of them renders through this component.
  const handleChange = props.type === 'date'
    ? (e) => {
        const [year, ...rest] = e.target.value.split('-');
        if (year && year.length > 4) {
          e.target.value = [year.slice(0, 4), ...rest].join('-');
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
