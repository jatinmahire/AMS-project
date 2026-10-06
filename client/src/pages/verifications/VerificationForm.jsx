import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BackButton from '../../components/BackButton';
import PageHeader from '../../components/PageHeader';
import FormSection from '../../components/FormSection';
import FormField, { Select, TextInput, Textarea } from '../../components/FormField';
import Button from '../../components/Button';
import { getVerification, saveVerification } from '../../api/verifications';
import { VERIFICATION_TYPES } from '../../constants/verificationTypes';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { displayName, formatDate } from '../../utils/format';
import { getErrorMessage, getFieldErrors } from '../../utils/errorMessage';
import { toFormData } from '../../utils/toFormData';
import './VerificationForm.css';

const DECIDED = ['VERIFIED', 'REJECTED'];

export default function VerificationForm() {
  const { type: typeParam, workerId } = useParams();
  const type = typeParam.toUpperCase();
  const config = VERIFICATION_TYPES[type];
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [worker, setWorker] = useState(null);
  const [record, setRecord] = useState(null);
  const [form, setForm] = useState({ status: 'PENDING', referenceNo: '', remarks: '' });
  const [document, setDocument] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    getVerification(typeParam.toLowerCase(), workerId)
      .then((data) => {
        setWorker(data.worker);
        setRecord(data.verification);
        setForm({
          status: data.verification.status || 'PENDING',
          referenceNo: data.verification.referenceNo || '',
          remarks: data.verification.remarks || '',
        });
      })
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [typeParam, workerId]);

  if (loading) return <div className="verification-form-loading">Loading...</div>;
  if (!worker || !config) return <div className="verification-form-loading">Not found.</div>;

  // Unchanged decided status keeps its recorded date; switching to a newly decided one previews today.
  const verificationDate = !DECIDED.includes(form.status)
    ? '-'
    : form.status === record.status && record.verifiedAt
      ? formatDate(record.verifiedAt)
      : formatDate(new Date());

  async function handleSubmit(e) {
    e.preventDefault();
    if (!document && !record?.documentUrl) {
      setErrors({ document: 'Upload a supporting document' });
      return;
    }
    setSaving(true);
    setErrors({});
    try {
      await saveVerification(typeParam.toLowerCase(), workerId, toFormData({ ...form, document }));
      showToast(`${config.label} saved`);
      navigate(`/verifications/${typeParam}`);
    } catch (err) {
      setErrors(getFieldErrors(err));
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <BackButton to={`/verifications/${typeParam}`} />

      <PageHeader title={config.label} description={`Worker Code: ${worker.workerCode}`} />

      <form onSubmit={handleSubmit} className="verification-form-card">
        <FormSection title="Worker">
          <FormField label="Worker Code"><TextInput value={worker.workerCode} disabled /></FormField>
          <FormField label="Name"><TextInput value={`${worker.firstName} ${worker.lastName}`} disabled /></FormField>
          <FormField label="Contractor"><TextInput value={worker.contractor?.contractorName || '-'} disabled /></FormField>
        </FormSection>

        <FormSection title="Verification">
          <FormField label="Status" required error={errors.status}>
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {config.statuses.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </FormField>

          {config.hasReferenceNo && (
            <FormField label="Reference No." error={errors.referenceNo}>
              <TextInput
                value={form.referenceNo}
                onChange={(e) => setForm({ ...form, referenceNo: e.target.value })}
                maxLength={100}
                placeholder="Police verification certificate number"
              />
            </FormField>
          )}

          <FormField label="Verified By"><TextInput value={displayName(user)} disabled /></FormField>
          <FormField label="Verification Date"><TextInput value={verificationDate} disabled /></FormField>

          <FormField label="Remarks" className="verification-form-col-span" error={errors.remarks}>
            <Textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} maxLength={500} />
          </FormField>

          <FormField label="Supporting Document" required className="verification-form-col-span" error={errors.document}>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setDocument(e.target.files[0] || null)}
              className="verification-form-file-input"
            />
            {record?.documentUrl && (
              <a href={record.documentUrl} target="_blank" rel="noopener noreferrer" className="verification-form-file-link">
                View current document
              </a>
            )}
          </FormField>
        </FormSection>

        <div className="verification-form-actions-row">
          <Button type="button" variant="secondary" onClick={() => navigate(`/verifications/${typeParam}`)} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </form>
    </div>
  );
}
