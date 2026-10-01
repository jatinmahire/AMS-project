import { useEffect, useState } from 'react';
import { QrCode } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import { Select } from '../../components/FormField';
import WorkerSearchSelect from '../../components/WorkerSearchSelect';
import { getIdCard, generateIdCard } from '../../api/reports';
import { contractorDropdown } from '../../api/contractors';
import { formatDate } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import './WorkerIdCard.css';

const VALIDITY_OPTIONS = ['3', '6', '12'];

export default function WorkerIdCard() {
  const [contractorId, setContractorId] = useState('');
  const [contractors, setContractors] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [worker, setWorker] = useState(null);
  const [idCard, setIdCard] = useState(null);
  const [validityMonths, setValidityMonths] = useState('12');
  const [searching, setSearching] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    contractorDropdown().then(setContractors).catch(() => setContractors([]));
  }, []);

  async function handleSelectWorker(w) {
    setSelectedWorker(w);
    setWorker(null);
    setIdCard(null);
    if (!w) return;
    setSearching(true);
    try {
      const data = await getIdCard(w.workerCode);
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

      <div className="no-print worker-id-card-search-bar">
        <div className="worker-id-card-contractor-field">
          <label className="worker-id-card-field-label">Contractor</label>
          <Select
            value={contractorId}
            onChange={(e) => {
              setContractorId(e.target.value);
              handleSelectWorker(null);
            }}
          >
            <option value="">All Contractors</option>
            {contractors.map((c) => (
              <option key={c.id} value={c.id}>{c.contractorCode} — {c.contractorName}</option>
            ))}
          </Select>
        </div>
        <div className="worker-id-card-worker-field">
          <label className="worker-id-card-field-label">Worker</label>
          <WorkerSearchSelect value={selectedWorker} onSelect={handleSelectWorker} contractorId={contractorId} placeholder="Search by worker code or name" />
        </div>
        {searching && <p className="worker-id-card-searching">Searching...</p>}
      </div>

      {worker && !idCard && (
        <div className="no-print worker-id-card-search-bar">
          <div className="worker-id-card-validity-field">
            <label className="worker-id-card-field-label">Validity</label>
            <Select value={validityMonths} onChange={(e) => setValidityMonths(e.target.value)}>
              {VALIDITY_OPTIONS.map((m) => (
                <option key={m} value={m}>{m} Months</option>
              ))}
            </Select>
          </div>
          <Button onClick={handleGenerate} disabled={generating}>{generating ? 'Generating...' : 'Generate ID Card'}</Button>
        </div>
      )}

      {worker && idCard && (
        <div onContextMenu={(e) => e.preventDefault()} className="print-blocked worker-id-card-wrapper">
          <div className="worker-id-card-card">
            <div className="worker-id-card-title-wrap">
              <p className="worker-id-card-title">Worker ID Card</p>
            </div>
            <div className="worker-id-card-photo-wrap">
              {worker.photoUrl ? (
                <img src={worker.photoUrl} alt="Worker" className="worker-id-card-photo" />
              ) : (
                <div className="worker-id-card-photo-placeholder">
                  No Photo
                </div>
              )}
            </div>
            <div className="worker-id-card-details">
              <p className="worker-id-card-name">{worker.firstName} {worker.lastName}</p>
              <p className="worker-id-card-code">{worker.workerCode}</p>
              <p className="worker-id-card-meta">{worker.designation.designationName}</p>
              <p className="worker-id-card-meta">{worker.contractor.contractorName}</p>
            </div>
            <div className="worker-id-card-qr-wrap">
              <div className="worker-id-card-qr-box">
                <QrCode size={48} />
              </div>
            </div>
            <div className="worker-id-card-dates">
              <span>Issued: {formatDate(idCard.issueDate)}</span>
              <span>Valid Till: {formatDate(idCard.expiryDate)}</span>
            </div>
          </div>
          <p className="worker-id-card-footnote">This card is view-only. Printing and right-click are disabled.</p>
        </div>
      )}
    </div>
  );
}
