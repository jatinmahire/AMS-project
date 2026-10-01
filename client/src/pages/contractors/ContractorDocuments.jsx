import { useState } from 'react';
import { Upload, Trash2, FileText } from 'lucide-react';
import Button from '../../components/Button';
import FormField, { Select } from '../../components/FormField';
import { uploadContractorDocument, deleteContractorDocument } from '../../api/contractors';
import { toFormData } from '../../utils/toFormData';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import './ContractorDocuments.css';

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
    <div className="contractor-documents-card">
      <h3 className="contractor-documents-title">Documents</h3>

      <div className="contractor-documents-list">
        {documents.length === 0 && <p className="contractor-documents-empty">No documents uploaded yet.</p>}
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="contractor-documents-row"
          >
            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="contractor-documents-link"
            >
              <FileText size={16} />
              {doc.docType.replace('_', '')}
            </a>
            <button
              onClick={() => handleDelete(doc.id)}
              className="contractor-documents-delete-btn"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleUpload} className="contractor-documents-form">
        <FormField label="Document Type" className="contractor-documents-type-field">
          <Select value={docType} onChange={(e) => setDocType(e.target.value)}>
            {DOC_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.replace('_', '')}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="File" className="contractor-documents-file-field">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFile(e.target.files[0])}
            className="contractor-documents-file-input"
          />
        </FormField>
        <Button type="submit" icon={Upload} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </form>
    </div>
  );
}
