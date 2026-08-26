export default function FormSection({ title, children }) {
  return (
    <div className="border-b border-slate-200 pb-6 last:border-b-0 last:pb-0 dark:border-slate-800">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  );
}
