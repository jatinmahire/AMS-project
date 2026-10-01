import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Button from '../../components/Button';
import ConfirmDialog from '../../components/ConfirmDialog';
import { listHolidays, deleteHoliday } from '../../api/holidays';
import { formatDate } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import './Holidays.css';

const TYPE_LABELS = { WEEKLY_OFF: 'Weekly Off', PAID_LEAVE: 'Paid Leave' };

export default function Holidays() {
  const [searchParams] = useSearchParams();
  const typeFilter = searchParams.get('type');
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  function load() {
    setLoading(true);
    listHolidays({})
      .then((res) => setHolidays(res.data))
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const visibleHolidays = typeFilter ? holidays.filter((h) => h.type === typeFilter) : holidays;

  async function handleDelete() {
    setSaving(true);
    try {
      await deleteHoliday(deleteTarget.id);
      showToast('Holiday deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: 'date', label: 'Date', render: (row) => formatDate(row.date) },
    { key: 'type', label: 'Type', render: (row) => row.type.replace('_', '') },
    { key: 'contractor', label: 'Applies To', render: (row) => row.contractor?.contractorName || 'All Contractors' },
    { key: 'notes', label: 'Notes', render: (row) => row.notes || '-' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="holidays-actions-cell">
          <button onClick={() => navigate(`/holidays/${row.id}`)} className="holidays-action-btn">
            <Eye size={16} />
          </button>
          <button onClick={() => navigate(`/holidays/${row.id}/edit`)} className="holidays-action-btn">
            <Pencil size={16} />
          </button>
          <button onClick={() => setDeleteTarget(row)} className="holidays-action-btn-danger">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="holidays-container">
      <PageHeader
        centered
        title={typeFilter ? TYPE_LABELS[typeFilter] || 'Holiday' : 'Holiday'}
        description="Weekly offs and paid leave, company-wide or per contractor."
        action={<Button icon={Plus} onClick={() => navigate('/holidays/new')}>Add Holiday</Button>}
      />

      <DataTable columns={columns} rows={visibleHolidays} loading={loading} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Holiday"
        message="Are you sure you want to delete this holiday? This cannot be undone."
        confirmLabel="Delete"
        danger
        loading={saving}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
