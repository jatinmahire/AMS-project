const VARIANTS = {
  primary: 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-300 dark:disabled:bg-indigo-900 dark:disabled:text-indigo-400',
  secondary:
    'bg-white text-slate-700 border border-slate-300 shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-500 disabled:bg-red-300 dark:disabled:bg-red-900 dark:disabled:text-red-400',
  ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
};

export default function Button({ variant = 'primary', className = '', children, icon: Icon, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}
