import { useEffect, useState } from 'react';
import { Printer, Download } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Button from '../../components/Button';
import FilterBar from '../../components/FilterBar';
import { getPfChalan } from '../../api/reports';
import { formatCurrency } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import { printNow } from '../../utils/printExport';
import { exportToCsv } from '../../utils/exportCsv';
import './PfChalan.css';

const FILTERS = [
  { type: 'contractor', key: 'contractorId' },
  { type: 'month', key: 'month' },
];

function PendingOrCurrency({ value, pending }) {
  if (pending) return <span className="pf-chalan-pending">Pending</span>;
  return formatCurrency(value);
}

export default function PfChalan() {
  const [filterValues, setFilterValues] = useState({ contractorId: '', month: '' });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const ready = filterValues.contractorId && filterValues.month;

  useEffect(() => {
    if (!ready) {
      setRows([]);
      return;
    }
    setLoading(true);
    getPfChalan(filterValues)
      .then(setRows)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [filterValues.contractorId, filterValues.month]);

  function handleFilterChange(key, value) {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  }

  const columns = [
    { key: 'srNo', label: 'Sr.No' },
    { key: 'workerCode', label: 'Worker ID' },
    { key: 'fullName', label: 'Full Name' },
    { key: 'uanNumber', label: 'UAN No', render: (r) => r.uanNumber || '-' },
    { key: 'pfNumber', label: 'PF Number', render: (r) => r.pfNumber || '-' },
    { key: 'basicWage', label: 'Basic Wage', render: (r) => <PendingOrCurrency value={r.basicWage} pending={r.pending} /> },
    { key: 'pfWages', label: 'PF Wages', render: (r) => <PendingOrCurrency value={r.pfWages} pending={r.pending} /> },
    { key: 'employeeContribution', label: 'Employee Contribution', render: (r) => <PendingOrCurrency value={r.employeeContribution} pending={r.pending} /> },
    { key: 'employerContribution', label: 'Employer Contribution', render: (r) => <PendingOrCurrency value={r.employerContribution} pending={r.pending} /> },
    { key: 'totalContribution', label: 'Total Contribution', render: (r) => <PendingOrCurrency value={r.totalContribution} pending={r.pending} /> },
  ];

  function handleDownload() {
    const headers = columns.map((c) => c.label);
    const dataRows = rows.map((row) =>
      columns.map((c) => {
        if (row.pending && ['basicWage', 'pfWages', 'employeeContribution', 'employerContribution', 'totalContribution'].includes(c.key)) {
          return 'Pending';
        }
        return row[c.key] ?? '-';
      })
    );
    exportToCsv('pf-chalan.csv', headers, dataRows);
  }

  return (
    <div>
      <PageHeader
        title="PF Chalan"
        description="Provident fund contribution challan for the selected contractor and month."
        action={
          <div className="no-print pf-chalan-actions">
            <Button variant="secondary" icon={Printer} onClick={printNow}>Print</Button>
            <Button variant="secondary" icon={Download} onClick={handleDownload} disabled={rows.length === 0}>
              Download
            </Button>
          </div>
        }
      />

      <div className="no-print">
        <FilterBar filters={FILTERS} values={filterValues} onChange={handleFilterChange} />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        scrollable
        fullWidth
        maxHeight="600px"
        emptyMessage={ready ? 'No records found' : 'Select a contractor and month to generate the PF chalan'}
      />
    </div>
  );
}
