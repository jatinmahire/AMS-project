import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import Pagination from '../../components/Pagination';
import { listNotifications, markNotificationAsRead } from '../../api/notifications';
import { formatDateTime } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import './Notifications.css';

const LIMIT = 20;

const TYPE_LABELS = {
  KYC_MISSING: 'KYC Missing',
  COMPLIANCE_90_DAY: '90-Day Compliance',
  GATE_MISMATCH: 'Gate Mismatch',
  LICENSE_EXPIRING: 'License Expiring',
};

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'false', label: 'Unread' },
  { value: 'true', label: 'Read' },
];

const FILTERS = [{ type: 'select', key: 'isRead', label: 'Status', options: STATUS_OPTIONS }];

export default function Notifications() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterValues = { isRead: searchParams.get('isRead') || '' };
  const page = Number(searchParams.get('page')) || 1;

  const [result, setResult] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  function load() {
    setLoading(true);
    listNotifications({ isRead: filterValues.isRead, page, limit: LIMIT })
      .then(setResult)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [filterValues.isRead, page]);

  function updateParams(next) {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      Object.entries(next).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      return params;
    });
  }

  async function handleMarkRead(id) {
    try {
      await markNotificationAsRead(id);
      load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  }

  const columns = [
    { key: 'type', label: 'Type', render: (row) => TYPE_LABELS[row.type] || row.type },
    { key: 'message', label: 'Message' },
    { key: 'contractor', label: 'Contractor', render: (row) => row.contractor?.contractorName || '-' },
    { key: 'createdAt', label: 'Raised', render: (row) => formatDateTime(row.createdAt) },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={row.isRead ? 'notifications-badge-read' : 'notifications-badge-unread'}>
          {row.isRead ? 'Read' : 'Unread'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) =>
        !row.isRead && (
          <button
            onClick={() => handleMarkRead(row.id)}
            className="notifications-mark-read-btn"
          >
            <Check size={16} /> Mark read
          </button>
        ),
    },
  ];

  return (
    <div>
      <PageHeader title="Notifications" description="Alerts raised by the daily compliance and gate-reconciliation checks." />

      <FilterBar filters={FILTERS} values={filterValues} onChange={(key, value) => updateParams({ [key]: value, page: null })} />

      <DataTable columns={columns} rows={result.data} loading={loading} emptyMessage="No notifications" />
      <Pagination page={page} limit={LIMIT} total={result.total} onPageChange={(p) => updateParams({ page: p })} />
    </div>
  );
}
