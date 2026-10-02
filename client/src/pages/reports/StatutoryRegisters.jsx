import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Printer, FileSpreadsheet, Plus } from 'lucide-react';
import DataTable from '../../components/DataTable';
import Button from '../../components/Button';
import ContractorMonthFilter from '../../components/ContractorMonthFilter';
import { getStatutoryRegister } from '../../api/reports';
import { getContractor } from '../../api/contractors';
import { formatDate, formatCurrency } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import { printNow } from '../../utils/printExport';
import { exportToCsv } from '../../utils/exportCsv';
import './StatutoryRegisters.css';

function workerName(row) {
  return `${row.worker.firstName} ${row.worker.lastName}`;
}

function repaymentLine(r) {
  return `${formatDate(r.paidDate || r.dueDate)} / ${formatCurrency(r.amount)}`;
}

// Flat text for CSV export — the on-screen cell stacks these as separate lines instead.
function repaymentsSummary(row) {
  if (!row.repayments?.length) return '-';
  return row.repayments.map(repaymentLine).join('; ');
}

function repaymentsCell(row) {
  if (!row.repayments?.length) return '-';
  return row.repayments.map((r, i) => <div key={r.id ?? i}>{repaymentLine(r)}</div>);
}

function lastRepaymentDate(row) {
  if (!row.repayments?.length) return '-';
  const last = row.repayments[row.repayments.length - 1];
  return last.paidStatus === 'PAID' ? formatDate(last.paidDate || last.dueDate) : '-';
}

const REGISTER_TYPES = [
  {
    value: 'advance',
    label: 'Advance',
    addLabel: 'Advance',
    addRoute: '/advances/new',
    dateField: 'advanceDate',
    form: 'FORM XX',
    rule: '[See rule 78 (i) (A) (ii)]',
    title: 'Register of Advances',
    columns: [
      { key: 'srNo', label: 'Sr. No.', render: (r, i) => i + 1 },
      { key: 'name', label: 'Name of the Workmen', render: workerName },
      { key: 'advanceDate', label: 'Date of Advance', render: (r) => formatDate(r.advanceDate) },
      { key: 'sex', label: 'Sex', render: (r) => r.worker.gender || '-' },
      { key: 'designation', label: 'Nature of Employment / Designation', render: (r) => r.worker.designation?.designationName || '-' },
      { key: 'wagePeriod', label: 'Wage Period & Wages Payable', render: (r) => `${r.wagesPeriod || '-'} / ${r.wagesPayable ? formatCurrency(r.wagesPayable) : '-'}` },
      { key: 'amount', label: 'Amount of Advance Made', render: (r) => formatCurrency(r.amount) },
      { key: 'purpose', label: 'Purpose(s) for which Advance Made' },
      { key: 'installmentsCount', label: 'No. of Instalments' },
      { key: 'repayments', label: 'Date & Amount of Each Instalment Repaid', render: repaymentsCell, exportValue: repaymentsSummary },
      { key: 'lastRepaid', label: 'Date on Which Last Instalment was Repaid', render: lastRepaymentDate },
      { key: 'remarks', label: 'Remark', render: (r) => r.remarks || '-' },
    ],
  },
  {
    value: 'accident',
    label: 'Accident',
    addLabel: 'Accident',
    addRoute: '/accidents/new',
    dateField: 'accidentDate',
    form: 'FORM XX',
    rule: '[See rule 78 (i) (A) (ii)]',
    title: 'Register of Accident and Dangerous Occurrence',
    columns: [
      { key: 'srNo', label: 'Sr. No.', render: (r, i) => i + 1 },
      { key: 'name', label: 'Name of Injured Person', render: workerName },
      { key: 'accidentDate', label: 'Date of Accident or Dangerous Occurrence', render: (r) => formatDate(r.accidentDate) },
      { key: 'form24ReportDate', label: 'Date of Report (Form 24) to Inspector', render: (r) => (r.form24ReportDate ? formatDate(r.form24ReportDate) : '-') },
      { key: 'natureOfAccident', label: 'Nature of Accident or Dangerous Occurrence' },
      { key: 'dateReturnToWork', label: 'Date of Return of Injured Person to Work', render: (r) => (r.dateReturnToWork ? formatDate(r.dateReturnToWork) : '-') },
      { key: 'daysAbsent', label: 'Number of Days Injured Person was Absent from Work' },
    ],
  },
  {
    value: 'damage',
    label: 'Damage',
    addLabel: 'Damage/Loss',
    addRoute: '/damages/new',
    dateField: 'damageDate',
    form: 'FORM XX',
    rule: '78 (i) (A) (ii)',
    title: 'Register of Deductions for Damage or Loss',
    columns: [
      { key: 'srNo', label: 'Sr. No.', render: (r, i) => i + 1 },
      { key: 'name', label: 'Name of Workmen', render: workerName },
      { key: 'designation', label: 'Designation / Nature of Employment', render: (r) => r.worker.designation?.designationName || '-' },
      { key: 'particulars', label: 'Particulars of Damage or Loss' },
      { key: 'damageDate', label: 'Date of Damage or Loss', render: (r) => formatDate(r.damageDate) },
      { key: 'causeShown', label: 'Whether Workman Showed Cause Against Deduction', render: (r) => r.causeShown || '-' },
      { key: 'witnessName', label: "Name of Person in Whose Presence Explanation was Heard", render: (r) => r.witnessName || '-' },
      { key: 'deductionAmount', label: 'Amount of Deduction Imposed', render: (r) => formatCurrency(r.deductionAmount) },
      { key: 'installments', label: 'No. of Instalments' },
      { key: 'remarks', label: 'Remarks', render: (r) => r.remarks || '-' },
    ],
  },
  {
    value: 'fine',
    label: 'Fine',
    addLabel: 'Fine',
    addRoute: '/fines/new',
    dateField: 'offenceDate',
    form: 'FORM XXI',
    rule: '[See rule 78 (1) (A) (ii)]',
    title: 'Register of Fines',
    columns: [
      { key: 'srNo', label: 'Sr. No.', render: (r, i) => i + 1 },
      { key: 'workerId', label: 'Worker Id', render: (r) => r.worker.workerCode },
      { key: 'name', label: 'Name of the Workmen', render: workerName },
      { key: 'designation', label: 'Designation / Nature of Employment', render: (r) => r.worker.designation?.designationName || '-' },
      { key: 'offence', label: 'Act/Omission for which Fine Imposed' },
      { key: 'offenceDate', label: 'Date of Offence', render: (r) => formatDate(r.offenceDate) },
      { key: 'causeShown', label: 'Whether Workmen Showed Cause Against Fine', render: (r) => r.causeShown || '-' },
      { key: 'witnessName', label: 'Name of Person in Whose Presence Explanation was Heard', render: (r) => r.witnessName || '-' },
      { key: 'wagePeriod', label: 'Wage Periods & Wages Payable', render: (r) => `${r.wagePeriod || '-'} / ${r.wagesPayable ? formatCurrency(r.wagesPayable) : '-'}` },
      { key: 'fineAmount', label: 'Amount of Fine Imposed', render: (r) => formatCurrency(r.fineAmount) },
      { key: 'dateRealised', label: 'Date on Which Fine Realised', render: (r) => (r.dateRealised ? formatDate(r.dateRealised) : '-') },
      { key: 'remarks', label: 'Remarks', render: (r) => r.remarks || '-' },
    ],
  },
  {
    value: 'overtime',
    label: 'Overtime',
    addLabel: 'Overtime',
    addRoute: '/overtimes/new',
    dateField: 'otDate',
    form: 'FORM XXIII',
    rule: '[See Rule 78(1)(a)(iii)]',
    title: 'Register of Overtime',
    columns: [
      { key: 'srNo', label: 'Sr. No.', render: (r, i) => i + 1 },
      { key: 'name', label: 'Name of Workman', render: workerName },
      { key: 'otDate', label: 'Date on which Overtime Worked', render: (r) => formatDate(r.otDate) },
      { key: 'sex', label: 'Sex', render: (r) => r.worker.gender || '-' },
      { key: 'designation', label: 'Designation / Nature of Employment', render: (r) => r.worker.designation?.designationName || '-' },
      { key: 'hoursWorked', label: 'Total Overtime Worked' },
      { key: 'normalWageRate', label: 'Normal Rate of Wages', render: (r) => formatCurrency(r.normalWageRate) },
      { key: 'otWageRate', label: 'Overtime Rate of Wages', render: (r) => formatCurrency(r.otWageRate) },
      { key: 'otEarnings', label: 'Overtime Earnings', render: (r) => formatCurrency(r.otEarnings) },
      { key: 'datePaid', label: 'Date on which Overtime Wages Paid', render: (r) => (r.datePaid ? formatDate(r.datePaid) : '-') },
      { key: 'remarks', label: 'Remarks', render: (r) => r.remarks || '-' },
    ],
  },
];

export default function StatutoryRegisters() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeFromUrl = searchParams.get('type');
  const type = REGISTER_TYPES.some((t) => t.value === typeFromUrl) ? typeFromUrl : 'advance';
  const [contractorId, setContractorId] = useState('');
  const [month, setMonth] = useState('');
  const [rows, setRows] = useState([]);
  const [contractor, setContractor] = useState(null);
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

  useEffect(() => {
    if (!contractorId) {
      setContractor(null);
      return;
    }
    getContractor(contractorId).then(setContractor).catch(() => setContractor(null));
  }, [contractorId]);

  function handleExport() {
    const headers = registerConfig.columns.map((c) => c.label);
    const dataRows = rows.map((row, i) => registerConfig.columns.map((c) => (c.exportValue || c.render)(row, i)));
    exportToCsv(`${registerConfig.value}-register.csv`, headers, dataRows);
  }

  return (
    <div>
      <div className="statutory-registers-header">
        <p className="statutory-registers-header-form">{registerConfig.form}</p>
        <p className="statutory-registers-header-rule">{registerConfig.rule}</p>
        <h1 className="statutory-registers-header-title">{registerConfig.title}</h1>
      </div>

      <div className="no-print statutory-registers-toolbar">
        <ContractorMonthFilter contractorId={contractorId} onContractorChange={setContractorId} month={month} onMonthChange={setMonth} />
        <div className="statutory-registers-toolbar-actions">
          <Button icon={Plus} onClick={() => navigate(registerConfig.addRoute)}>Add {registerConfig.addLabel}</Button>
          <Button variant="secondary" icon={Printer} onClick={printNow}>Print</Button>
          <Button variant="secondary" icon={FileSpreadsheet} onClick={handleExport} disabled={rows.length === 0}>
            Export to Excel
          </Button>
        </div>
      </div>

      {contractor && (
        <div className="statutory-registers-contractor-info">
          <div>
            <h3 className="statutory-registers-info-label">Contractor Name</h3>
            <p className="statutory-registers-info-name">{contractor.contractorName}</p>
            <p className="statutory-registers-info-address">{contractor.address}</p>
          </div>
          <div>
            <h3 className="statutory-registers-info-label">Principal Employer</h3>
            <p className="statutory-registers-info-name">{contractor.principalEmployerName || '-'}</p>
            <p className="statutory-registers-info-address">{contractor.principalEmployerAddress || '-'}</p>
          </div>
        </div>
      )}

      <DataTable columns={registerConfig.columns} rows={rows} loading={loading} scrollable fullWidth maxHeight="600px" />
    </div>
  );
}
