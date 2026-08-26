import { useEffect, useState } from 'react';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import FormField, { TextInput, Select } from '../../components/FormField';
import { createPolicy, updatePolicy } from '../../api/policies';
import { contractorDropdown } from '../../api/contractors';
import { toDateInputValue } from '../../utils/format';
import { toFormData } from '../../utils/toFormData';
import { getErrorMessage, getFieldErrors } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';

function buildEmptyForm() {
  return {
    contractorId: '', policyName: '', policyNumber: '', insuranceCompany: '', projectName: '',
    policyDate: '', validDate: '', workerCount: '', projectValue: '', personValue: '',
  };
}

export default function PolicyFormModal({ open, onClose, onSaved, editing }) {
  const [form, setForm] = useState(buildEmptyForm());
  const [file, setFile] = useState(null);
  const [contractors, setContractors] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    contractorDropdown().then(setContractors).catch(() => setContractors([]));
  }, []);

  useEffect(() => {
    if (editing) {
      setForm({
        contractorId: editing.contractorId,
        policyName: editing.policyName,
        policyNumber: editing.policyNumber,
        insuranceCompany: editing.insuranceCompany,
        projectName: editing.projectName || '',
        policyDate: toDateInputValue(editing.policyDate),
        validDate: toDateInputValue(editing.validDate),
        workerCount: editing.workerCount,
        projectValue: editing.projectValue || '',
        personValue: editing.personValue || '',
      });
    } else {
      setForm(buildEmptyForm());
    }
    setFile(null);
    setErrors({});
  }, [editing, open]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file && !editing) {
      setErrors({ fileUrl: 'Policy file is required' });
      return;
    }
    setSaving(true);
    setErrors({});
    const payload = toFormData({ ...form, file });
    try {
      if (editing) {
        await updatePolicy(editing.id, payload);
        showToast('Policy updated');
      } else {
        await createPolicy(payload);
        showToast('Policy created');
      }
      onSaved();
    } catch (err) {
      setErrors(getFieldErrors(err));
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Policy' : 'Add Policy'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Contractor" required error={errors.contractorId}>
          <Select value={form.contractorId} onChange={(e) => setForm({ ...form, contractorId: e.target.value })}>
            <option value="">Select contractor</option>
            {contractors.map((c) => (
              <option key={c.id} value={c.id}>{c.contractorCode} — {c.contractorName}</option>
            ))}
          </Select>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Policy Name" required error={errors.policyName}>
            <TextInput value={form.policyName} onChange={(e) => setForm({ ...form, policyName: e.target.value })} error={errors.policyName} />
          </FormField>
          <FormField label="Policy Number" required error={errors.policyNumber}>
            <TextInput value={form.policyNumber} onChange={(e) => setForm({ ...form, policyNumber: e.target.value })} error={errors.policyNumber} />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Insurance Company" required error={errors.insuranceCompany}>
            <TextInput value={form.insuranceCompany} onChange={(e) => setForm({ ...form, insuranceCompany: e.target.value })} error={errors.insuranceCompany} />
          </FormField>
          <FormField label="Project Name" error={errors.projectName}>
            <TextInput value={form.projectName} onChange={(e) => setForm({ ...form, projectName: e.target.value })} error={errors.projectName} />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Policy Date" required error={errors.policyDate}>
            <TextInput type="date" value={form.policyDate} onChange={(e) => setForm({ ...form, policyDate: e.target.value })} error={errors.policyDate} />
          </FormField>
          <FormField label="Valid Date" required error={errors.validDate}>
            <TextInput type="date" value={form.validDate} onChange={(e) => setForm({ ...form, validDate: e.target.value })} error={errors.validDate} />
          </FormField>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Worker Count" required error={errors.workerCount}>
            <TextInput type="number" min="0" value={form.workerCount} onChange={(e) => setForm({ ...form, workerCount: e.target.value })} error={errors.workerCount} />
          </FormField>
          <FormField label="Project Value" error={errors.projectValue}>
            <TextInput type="number" step="0.01" value={form.projectValue} onChange={(e) => setForm({ ...form, projectValue: e.target.value })} error={errors.projectValue} />
          </FormField>
          <FormField label="Person Value" error={errors.personValue}>
            <TextInput type="number" step="0.01" value={form.personValue} onChange={(e) => setForm({ ...form, personValue: e.target.value })} error={errors.personValue} />
          </FormField>
        </div>

        <FormField label="Policy File" required={!editing} error={errors.fileUrl}>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files[0])}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200 dark:text-slate-400 dark:file:bg-slate-700 dark:file:text-slate-200 dark:hover:file:bg-slate-600" />
          {editing?.fileUrl && <a href={editing.fileUrl} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-indigo-600 hover:underline dark:text-indigo-400">View current file</a>}
        </FormField>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </form>
    </Modal>
  );
}
