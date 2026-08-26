export default function FormField({ label, error, required, children, className = '' }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="text-red-500 dark:text-red-400"> *</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

const baseInputClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 dark:disabled:bg-slate-800/50 dark:disabled:text-slate-500';

export function TextInput({ error, className = '', ...props }) {
  return (
    <input
      className={`${baseInputClass} ${error ? 'border-red-400 dark:border-red-500' : ''} ${className}`}
      {...props}
    />
  );
}

export function Select({ error, className = '', children, ...props }) {
  return (
    <select className={`${baseInputClass} ${error ? 'border-red-400 dark:border-red-500' : ''} ${className}`} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ error, className = '', ...props }) {
  return (
    <textarea
      className={`${baseInputClass} ${error ? 'border-red-400 dark:border-red-500' : ''} ${className}`}
      rows={3}
      {...props}
    />
  );
}
