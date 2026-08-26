export default function WorkerInfoCard({ worker }) {
  if (!worker) return null;

  return (
    <div className="grid grid-cols-1 gap-4 rounded-md bg-slate-50 px-4 py-3 text-sm sm:grid-cols-3 dark:bg-slate-800/60">
      <div>
        <p className="text-xs text-slate-400 dark:text-slate-500">Name</p>
        <p className="text-slate-800 dark:text-slate-200">{worker.firstName} {worker.lastName}</p>
      </div>
      <div>
        <p className="text-xs text-slate-400 dark:text-slate-500">Contractor</p>
        <p className="text-slate-800 dark:text-slate-200">{worker.contractor?.contractorName || '-'}</p>
      </div>
      <div>
        <p className="text-xs text-slate-400 dark:text-slate-500">Designation</p>
        <p className="text-slate-800 dark:text-slate-200">{worker.designation?.designationName || '-'}</p>
      </div>
    </div>
  );
}
