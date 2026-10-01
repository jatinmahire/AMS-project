import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import Pagination from '../../components/Pagination';
import { listActivity } from '../../api/dashboard';
import { formatDateTime } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import { ACTION_LABELS, activityIcon, activityRoute } from '../../utils/activityMeta';
import './ActivityLog.css';

const LIMIT = 20;

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  ...Object.entries(ACTION_LABELS).map(([value, label]) => ({ value, label })),
];

const FILTERS = [
  { type: 'select', key: 'action', label: 'Action', options: ACTION_OPTIONS },
  { type: 'dateRange', key: 'date', label: 'Date' },
];

export default function ActivityLog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterValues = {
    action: searchParams.get('action') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
  };
  const page = Number(searchParams.get('page')) || 1;

  const [result, setResult] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  function load() {
    setLoading(true);
    listActivity({ action: filterValues.action, from: filterValues.dateFrom, to: filterValues.dateTo, page, limit: LIMIT })
      .then(setResult)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [filterValues.action, filterValues.dateFrom, filterValues.dateTo, page]);

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

  const columns = [
    {
      key: 'action',
      label: 'Type',
      render: (row) => {
        const Icon = activityIcon(row.action);
        return (
          <span className="activity-log-type-cell">
            <Icon size={14} className="activity-log-type-icon" />
            {ACTION_LABELS[row.action] || row.action}
          </span>
        );
      },
    },
    { key: 'message', label: 'Details' },
    { key: 'actor', label: 'By' },
    { key: 'timestamp', label: 'When', render: (row) => formatDateTime(row.timestamp) },
  ];

  return (
    <div>
      <PageHeader title="Activity Log" description="A full history of actions taken on the system." />

      <FilterBar
        filters={FILTERS}
        values={filterValues}
        onChange={(key, value) => updateParams({ [key]: value, page: null })}
      />

      <DataTable
        columns={columns}
        rows={result.data}
        loading={loading}
        emptyMessage="No activity found"
        fullWidth
        onRowClick={(row) => {
          const route = activityRoute(row);
          if (route) navigate(route);
        }}
      />
      <Pagination page={page} limit={LIMIT} total={result.total} onPageChange={(p) => updateParams({ page: p })} />
    </div>
  );
}
