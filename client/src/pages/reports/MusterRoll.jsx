import { useEffect, useState } from 'react';
import { Printer, FileSpreadsheet } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Button from '../../components/Button';
import FilterBar from '../../components/FilterBar';
import { getMusterRoll } from '../../api/reports';
import { formatDate, formatCurrency } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import { printNow } from '../../utils/printExport';
import { exportToCsv } from '../../utils/exportCsv';
import './MusterRoll.css';

const FILTERS = [
  { type: 'contractor', key: 'contractorId' },
  { type: 'month', key: 'month' },
];

function PendingOrValue({ value, pending, render }) {
  if (pending) return <span className="muster-roll-pending">Pending</span>;
  return render ? render(value) : value;
}

export default function MusterRoll() {
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
    getMusterRoll(filterValues)
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
    { key: 'uanNumber', label: 'UAN No', render: (r) => r.uanNumber || '-' },
    { key: 'fullName', label: 'Full Name' },
    { key: 'fatherOrHusbandName', label: "Father's Name", render: (r) => r.fatherOrHusbandName || '-' },
    { key: 'gender', label: 'Gender' },
    { key: 'dob', label: 'DOB', render: (r) => formatDate(r.dob) },
    { key: 'doj', label: 'DOJ', render: (r) => formatDate(r.doj) },
    { key: 'designation', label: 'Designation' },
    { key: 'workingHours', label: 'Working Hours', render: (r) => `${r.workingHoursFrom} - ${r.workingHoursTo}` },
    { key: 'interval', label: 'Interval', render: (r) => `${r.intervalFrom} - ${r.intervalTo}` },
    { key: 'attendanceCount', label: 'Attendance' },
    { key: 'totalDaysWorked', label: 'Total Days Worked', render: (r) => <PendingOrValue value={r.totalDaysWorked} pending={r.totalDaysWorkedPending} /> },
    { key: 'weeklyOff', label: 'Weekly Off' },
    { key: 'absentDays', label: 'Absent Days' },
    { key: 'paidHolidays', label: 'Paid Holidays' },
    { key: 'ratePerDay', label: 'Rate/Day', render: (r) => formatCurrency(r.ratePerDay) },
    { key: 'otEarnings', label: 'OT Earnings', render: (r) => formatCurrency(r.otEarnings) },
    { key: 'advanceDeduction', label: 'Advance', render: (r) => formatCurrency(r.advanceDeduction) },
    { key: 'fineAmount', label: 'Fine', render: (r) => formatCurrency(r.fineAmount) },
    { key: 'damageAmount', label: 'Damage', render: (r) => formatCurrency(r.damageAmount) },
    { key: 'netPay', label: 'Net Pay', render: (r) => <PendingOrValue value={r.netPay} pending={r.totalDaysWorkedPending} render={formatCurrency} /> },
  ];

  function handleExport() {
    const headers = columns.map((c) => c.label);
    const dataRows = rows.map((row) =>
      columns.map((c) => {
        if (c.key === 'totalDaysWorked') return row.totalDaysWorkedPending ? 'Pending' : row.totalDaysWorked;
        if (c.key === 'netPay') return row.totalDaysWorkedPending ? 'Pending' : row.netPay;
        return c.render ? row[c.key] : row[c.key];
      })
    );
    exportToCsv('muster-roll.csv', headers, dataRows);
  }

  return (
    <div>
      <PageHeader
        title="Muster Roll"
        description="Statutory wage register with full pay calculation for the selected contractor and month."
        action={
          <div className="no-print muster-roll-actions">
            <Button variant="secondary" icon={Printer} onClick={printNow}>Print</Button>
            <Button variant="secondary" icon={FileSpreadsheet} onClick={handleExport} disabled={rows.length === 0}>
              Export to Excel
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
        emptyMessage={ready ? 'No records found' : 'Select a contractor and month to generate the muster roll'}
      />
    </div>
  );
}
