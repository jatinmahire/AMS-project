import { FileWarning } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function PfChalan() {
  return (
    <div>
      <PageHeader title="PF Chalan" description="Provident fund challan generation." />
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
        <FileWarning size={32} className="mb-3 text-slate-300 dark:text-slate-600" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Full wage calculation — Coming in Phase 2</p>
        <p className="mt-1 max-w-sm text-sm text-slate-400 dark:text-slate-500">
          PF Chalan depends on complete statutory wage-calculation rules that are being finalized for the next phase.
        </p>
      </div>
    </div>
  );
}
