import { useState } from 'react';
import { Search, Printer } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import { TextInput } from '../../components/FormField';
import { getNinetyDays } from '../../api/reports';
import { formatDate } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';

export default function NinetyDaysForm() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const { showToast } = useToast();

  async function handleSearch(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setSearching(true);
    setResult(null);
    try {
      const data = await getNinetyDays(code.trim());
      setResult(data);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSearching(false);
    }
  }

  return (
    <div>
      <PageHeader title="90-Days Form" description="Continuous present-day count certificate for a worker." />

      <form
        onSubmit={handleSearch}
        className="no-print mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Worker Code</label>
          <TextInput value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. WRK001" />
        </div>
        <Button type="submit" icon={Search} disabled={searching}>{searching ? 'Searching...' : 'Search'}</Button>
      </form>

      {result && (
        <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-1 text-center text-lg font-semibold text-slate-900 dark:text-slate-100">Continuous Employment Certificate</h2>
          <p className="mb-6 text-center text-sm text-slate-500 dark:text-slate-400">Generated on {formatDate(new Date())}</p>

          <div className="grid grid-cols-1 gap-4 border-b border-slate-200 pb-6 sm:grid-cols-2 dark:border-slate-800">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Worker Name</p>
              <p className="text-sm text-slate-800 dark:text-slate-200">{result.worker.firstName} {result.worker.lastName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Worker Code</p>
              <p className="text-sm text-slate-800 dark:text-slate-200">{result.worker.workerCode}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Contractor</p>
              <p className="text-sm text-slate-800 dark:text-slate-200">{result.worker.contractor?.contractorName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Designation</p>
              <p className="text-sm text-slate-800 dark:text-slate-200">{result.worker.designation?.designationName}</p>
            </div>
          </div>

          <div className="py-6 text-center">
            <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Continuous Present Days</p>
            <p className="mt-2 text-4xl font-semibold text-indigo-600 dark:text-indigo-400">{result.tracker.continuousDaysCount}</p>
          </div>

          <p className="text-center text-xs text-slate-400 dark:text-slate-500">
            Last calculated: {formatDate(result.tracker.lastCalculatedDate)}
          </p>

          <div className="no-print mt-6 flex justify-center">
            <Button variant="secondary" icon={Printer} onClick={() => window.print()}>Print Certificate</Button>
          </div>
        </div>
      )}
    </div>
  );
}
