export function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function toDateInputValue(value) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function dayNameOf(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  return DAY_NAMES[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
}

export function formatCurrency(value) {
  if (value === null || value === undefined) return '-';
  return `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function statusColor(status) {
  switch (status) {
    case 'ACTIVE':
    case 'PRESENT':
    case 'PAID':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
    case 'INACTIVE':
    case 'HALF_DAY':
    case 'PENDING':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
    case 'BLACKLISTED':
    case 'ABSENT':
      return 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400';
  }
}
