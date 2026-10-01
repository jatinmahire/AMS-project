import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2, FileSpreadsheet } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Button from '../../components/Button';
import ConfirmDialog from '../../components/ConfirmDialog';
import { listDesignations, deleteDesignation } from '../../api/designations';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import { exportToCsv } from '../../utils/exportCsv';
import './Designations.css';

export default function Designations() {
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  function load() {
    setLoading(true);
    listDesignations()
      .then(setDesignations)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete() {
    setSaving(true);
    try {
      await deleteDesignation(deleteTarget.id);
      showToast('Designation deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: 'designationCode', label: 'Code' },
    { key: 'designationName', label: 'Name' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="designations-actions-cell">
          <button onClick={() => navigate(`/designations/${row.id}`)} className="designations-action-btn">
            <Eye size={16} />
          </button>
          <button onClick={() => navigate(`/designations/${row.id}/edit`)} className="designations-action-btn">
            <Pencil size={16} />
          </button>
          <button onClick={() => setDeleteTarget(row)} className="designations-action-btn-danger">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  function handleExport() {
    exportToCsv(
      'designations.csv',
      ['Code', 'Name'],
      designations.map((d) => [d.designationCode, d.designationName])
    );
  }

  return (
    <div className="designations-container">
      <PageHeader
        centered
        title="Designations"
        description="Job designations used across worker registration."
        action={
          <div className="designations-header-actions">
            <Button variant="secondary" icon={FileSpreadsheet} onClick={handleExport} disabled={designations.length === 0}>
              Export to Excel
            </Button>
            <Button icon={Plus} onClick={() => navigate('/designations/new')}>Add Designation</Button>
          </div>
        }
      />

      <DataTable columns={columns} rows={designations} loading={loading} scrollable maxHeight="500px" />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Designation"
        message={`Are you sure you want to delete "${deleteTarget?.designationName}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={saving}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
