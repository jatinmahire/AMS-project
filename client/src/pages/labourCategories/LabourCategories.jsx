import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2, FileSpreadsheet } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Button from '../../components/Button';
import ConfirmDialog from '../../components/ConfirmDialog';
import { listLabourCategories, deleteLabourCategory } from '../../api/labourCategories';
import { formatCurrency } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import { exportToCsv } from '../../utils/exportCsv';
import './LabourCategories.css';

export default function LabourCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  function load() {
    setLoading(true);
    listLabourCategories()
      .then(setCategories)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete() {
    setSaving(true);
    try {
      await deleteLabourCategory(deleteTarget.id);
      showToast('Labour category deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: 'categoryCode', label: 'Code' },
    { key: 'categoryName', label: 'Type', render: (row) => row.categoryName.replace('_', '') },
    { key: 'ratePerDay', label: 'Rate / Day', render: (row) => formatCurrency(row.ratePerDay) },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="labour-categories-actions-cell">
          <button onClick={() => navigate(`/labour-categories/${row.id}`)} className="labour-categories-action-btn">
            <Eye size={16} />
          </button>
          <button onClick={() => navigate(`/labour-categories/${row.id}/edit`)} className="labour-categories-action-btn">
            <Pencil size={16} />
          </button>
          <button onClick={() => setDeleteTarget(row)} className="labour-categories-action-btn-danger">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  function handleExport() {
    exportToCsv(
      'labour-categories.csv',
      ['Code', 'Type', 'Rate / Day'],
      categories.map((c) => [c.categoryCode, c.categoryName.replace('_', ''), c.ratePerDay])
    );
  }

  return (
    <div className="labour-categories-container">
      <PageHeader
        centered
        title="Labour Categories"
        description="Skill categories and their daily wage rate."
        action={
          <div className="labour-categories-header-actions">
            <Button variant="secondary" icon={FileSpreadsheet} onClick={handleExport} disabled={categories.length === 0}>
              Export to Excel
            </Button>
            <Button icon={Plus} onClick={() => navigate('/labour-categories/new')}>Add Category</Button>
          </div>
        }
      />

      <DataTable columns={columns} rows={categories} loading={loading} scrollable maxHeight="500px" fullWidth />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Labour Category"
        message={`Are you sure you want to delete "${deleteTarget?.categoryCode}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={saving}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
