import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import { Select } from '../../components/FormField';
import ContractorMonthFilter from '../../components/ContractorMonthFilter';
import { getStatutoryRegister } from '../../api/reports';
import { formatDate, formatCurrency } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';

const REGISTER_TYPES = [
  {
    value: 'advance',
    label: 'Advance',
    dateField: 'advanceDate',
    columns: [
      { key: 'purpose', label: 'Purpose' },
      { key: 'amount', label: 'Amount', render: (r) => formatCurrency(r.amount) },
      { key: 'installmentsCount', label: 'Installments' },
    ],
  },
  {
    value: 'accident',
    label: 'Accident',
    dateField: 'accidentDate',
    columns: [
      { key: 'natureOfAccident', label: 'Nature of Accident' },
      { key: 'daysAbsent', label: 'Days Absent' },
    ],
  },
  {
    value: 'damage',
    label: 'Damage',
    dateField: 'damageDate',
    columns: [
      { key: 'particulars', label: 'Particulars' },
      { key: 'deductionAmount', label: 'Deduction', render: (r) => formatCurrency(r.deductionAmount) },
    ],
  },
  {
    value: 'fine',
    label: 'Fine',
    dateField: 'offenceDate',
    columns: [
      { key: 'offence', label: 'Offence' },
      { key: 'fineAmount', label: 'Fine Amount', render: (r) => formatCurrency(r.fineAmount) },
    ],
  },
  {
    value: 'overtime',
    label: 'Overtime',
    dateField: 'otDate',
    columns: [
      { key: 'hoursWorked', label: 'Hours' },
      { key: 'otEarnings', label: 'OT Earnings', render: (r) => formatCurrency(r.otEarnings) },
    ],
  },
];

export default function StatutoryRegisters() {
  const [type, setType] = useState('advance');
  const [contractorId, setContractorId] = useState('');
  const [month, setMonth] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const registerConfig = REGISTER_TYPES.find((t) => t.value === type);

  useEffect(() => {
    setLoading(true);
    getStatutoryRegister(type, { contractorId, month })
      .then(setRows)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [type, contractorId, month]);

  const columns = [
    { key: 'workerCode', label: 'Worker', render: (row) => `${row.worker.workerCode} — ${row.worker.firstName} ${row.worker.lastName}` },
    { key: 'contractor', label: 'Contractor', render: (row) => row.worker.contractor?.contractorName || '-' },
    { key: 'date', label: 'Date', render: (row) => formatDate(row[registerConfig.dateField]) },
    ...registerConfig.columns,
  ];

  return (
    <div>
      <PageHeader title="Statutory Registers" description="Filterable register of operational records by contractor and month." />

      <div className="mb-4 w-48">
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Register</label>
        <Select value={type} onChange={(e) => setType(e.target.value)}>
          {REGISTER_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </Select>
      </div>

      <ContractorMonthFilter contractorId={contractorId} onContractorChange={setContractorId} month={month} onMonthChange={setMonth} />

      <Table columns={columns} rows={rows} loading={loading} />
    </div>
  );
}
