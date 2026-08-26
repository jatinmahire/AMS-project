import { useState } from 'react';
import { Search, QrCode } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import { TextInput } from '../../components/FormField';
import { getIdCard, generateIdCard } from '../../api/reports';
import { formatDate } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';

export default function WorkerIdCard() {
  const [code, setCode] = useState('');
  const [worker, setWorker] = useState(null);
  const [idCard, setIdCard] = useState(null);
  const [validityMonths, setValidityMonths] = useState('12');
  const [searching, setSearching] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { showToast } = useToast();

  async function handleSearch(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setSearching(true);
    setWorker(null);
    setIdCard(null);
    try {
      const data = await getIdCard(code.trim());
      setWorker(data.worker);
      setIdCard(data.idCard);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSearching(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const card = await generateIdCard(worker.id, Number(validityMonths));
      setIdCard(card);
      showToast('ID card generated');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div>
      <PageHeader title="Worker ID Card" description="Look up a worker and view their ID card." />

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

      {worker && !idCard && (
        <div className="no-print mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end dark:border-slate-800 dark:bg-slate-900">
          <div className="w-full sm:w-40">
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Validity (months)</label>
            <TextInput type="number" min="1" value={validityMonths} onChange={(e) => setValidityMonths(e.target.value)} />
          </div>
          <Button onClick={handleGenerate} disabled={generating}>{generating ? 'Generating...' : 'Generate ID Card'}</Button>
        </div>
      )}

      {worker && idCard && (
        <div onContextMenu={(e) => e.preventDefault()} className="print-blocked mx-auto max-w-sm">
          <div className="rounded-xl border-2 border-slate-300 bg-white p-5 shadow-md dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Worker ID Card</p>
            </div>
            <div className="mb-4 flex justify-center">
              {worker.photoUrl ? (
                <img src={worker.photoUrl} alt="Worker" className="h-28 w-28 rounded-md border border-slate-200 object-cover dark:border-slate-700" />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-md border border-slate-200 bg-slate-100 text-xs text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
                  No Photo
                </div>
              )}
            </div>
            <div className="space-y-1 text-center">
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{worker.firstName} {worker.lastName}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{worker.workerCode}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{worker.contractor?.contractorName}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{worker.designation?.designationName}</p>
            </div>
            <div className="my-4 flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-md border border-dashed border-slate-300 text-slate-300 dark:border-slate-600 dark:text-slate-600">
                <QrCode size={48} />
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Issued: {formatDate(idCard.issueDate)}</span>
              <span>Valid Till: {formatDate(idCard.expiryDate)}</span>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">This card is view-only. Printing and right-click are disabled.</p>
        </div>
      )}
    </div>
  );
}
