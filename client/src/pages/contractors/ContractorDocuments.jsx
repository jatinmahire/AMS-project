import { useState } from 'react';
import { Upload, Trash2, FileText } from 'lucide-react';
import Button from '../../components/Button';
import FormField, { Select } from '../../components/FormField';
import { uploadContractorDocument, deleteContractorDocument } from '../../api/contractors';
import { toFormData } from '../../utils/toFormData';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';

const DOC_TYPES = ['SHOP_ACT', 'PF_CODE', 'ESIC_CODE', 'PTEC', 'PTRC', 'MLWF_CODE', 'BOCW_LICENSE', 'LABOUR_LICENSE', 'WC_POLICY'];

export default function ContractorDocuments({ contractorId, documents, onChange }) {
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) {
      showToast('Please choose a file first', 'error');
      return;
    }
    setUploading(true);
    try {
      await uploadContractorDocument(contractorId, toFormData({ docType, file }));
      showToast('Document uploaded');
      setFile(null);
      onChange();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(docId) {
    try {
      await deleteContractorDocument(docId);
      showToast('Document removed');
      onChange();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Documents</h3>

      <div className="mb-4 space-y-2">
        {documents.length === 0 && <p className="text-sm text-slate-400 dark:text-slate-500">No documents uploaded yet.</p>}
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700"
          >
            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
            >
              <FileText size={16} />
              {doc.docType.replace('_', ' ')}
            </a>
            <button
              onClick={() => handleDelete(doc.id)}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800 dark:hover:text-red-400"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleUpload} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <FormField label="Document Type" className="w-56">
          <Select value={docType} onChange={(e) => setDocType(e.target.value)}>
            {DOC_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.replace('_', ' ')}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="File" className="flex-1">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200 dark:text-slate-400 dark:file:bg-slate-700 dark:file:text-slate-200 dark:hover:file:bg-slate-600"
          />
        </FormField>
        <Button type="submit" icon={Upload} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </form>
    </div>
  );
}
