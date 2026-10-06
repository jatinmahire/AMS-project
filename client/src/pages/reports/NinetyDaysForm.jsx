import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Search, Printer } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import { TextInput } from '../../components/FormField';
import FilterBar from '../../components/FilterBar';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import { getNinetyDays, getNinetyDaysHistory } from '../../api/reports';
import { formatDDMMYYYY, formatDate, formatDateTime, ageFromDob } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import { printNow } from '../../utils/printExport';
import { TITLE_BAR_TEXT, LEGAL_BOILERPLATE_MARATHI } from '../../constants/form90Marathi';
import { transliterateToDevanagari } from '../../utils/transliterate';
import { translateDesignation } from '../../utils/designationTranslations';
import { toDevanagariDigits } from '../../utils/devanagariDigits';
import './NinetyDaysForm.css';

// Must match the fields the certificate actually renders (see the prefilled mapping below) —
// "city" isn't used by the template for either record, so checking it here blocked printing
// over a field the form never asks for and can't be fixed. The Contractor record has no
// District column; the template uses its "state" for that slot, so that's what's checked.
const REQUIRED_PRINT_FIELDS = {
  Worker: [['taluka', 'Taluka'], ['district', 'District']],
  Contractor: [['taluka', 'Taluka'], ['state', 'District']],
};

function missingPrintFields(worker) {
  const records = { Worker: worker, Contractor: worker?.contractor };
  return Object.entries(REQUIRED_PRINT_FIELDS)
    .map(([recordLabel, fields]) => {
      const missing = fields.filter(([key]) => !records[recordLabel]?.[key]?.trim()).map(([, label]) => label);
      return missing.length ? `${recordLabel}: ${missing.join(', ')}` : null;
    })
    .filter(Boolean);
}

const HISTORY_LIMIT = 10;

const HISTORY_FILTERS = [
  { type: 'contractor', key: 'contractorId' },
  { type: 'dateRange', key: 'generatedDate' },
];

// Proper-noun/designation values are auto-converted to Devanagari at search
// time, but phonetic transliteration can't guarantee the traditionally
// correct spelling for every name — and only some of the rest of this data
// (wages, dates, reference numbers) is reliably derivable automatically —
// so every field on the certificate renders as an editable input, not
// locked read-only text, letting Admin correct anything before printing.
function InlineInput({ value, onChange, minWidth = 10 }) {
  return (
    <input
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="ninety-days-form-input"
      style={{ width: `${Math.max((value?.length || 0) + 2, minWidth)}ch` }}
    />
  );
}

function EditableField({ label, value, onChange }) {
  return (
    <span className="ninety-days-form-field">
      {label}: <InlineInput value={value} onChange={onChange} />
    </span>
  );
}

const EMPTY_EDITABLE = {
  referenceNo: '',
  referenceDate: '',
  employerName: '',
  establishmentName: '',
  bocwNo: '',
  labourOfficeName: 'Labour Office',
  employerAddress: '',
  employerVillage: '',
  employerTaluka: '',
  employerDistrict: '',
  contractorPincode: '',
  contractorPhone: '',
  workerName: '',
  workerAge: '',
  workerAddress: '',
  workerVillage: '',
  workerTaluka: '',
  workerDistrict: '',
  workerPincode: '',
  workerMobile: '',
  designation: '',
  periodFrom: '',
  periodTo: '',
  continuousDays: '',
  workLocation: '',
  appointmentDate: '',
  wagePerDay: '',
};

export default function NinetyDaysForm() {
  const { workerCode: workerCodeFromUrl } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [code, setCode] = useState(workerCodeFromUrl || '');
  const [result, setResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [editable, setEditable] = useState(EMPTY_EDITABLE);

  const historyFilterValues = {
    contractorId: searchParams.get('contractorId') || '',
    generatedDateFrom: searchParams.get('generatedDateFrom') || '',
    generatedDateTo: searchParams.get('generatedDateTo') || '',
  };
  const historyPage = Number(searchParams.get('page')) || 1;
  const [history, setHistory] = useState({ data: [], total: 0 });
  const [historyLoading, setHistoryLoading] = useState(true);

  function loadHistory() {
    setHistoryLoading(true);
    getNinetyDaysHistory({
      contractorId: historyFilterValues.contractorId,
      from: historyFilterValues.generatedDateFrom,
      to: historyFilterValues.generatedDateTo,
      page: historyPage,
      limit: HISTORY_LIMIT,
    })
      .then(setHistory)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setHistoryLoading(false));
  }

  useEffect(loadHistory, [
    historyFilterValues.contractorId,
    historyFilterValues.generatedDateFrom,
    historyFilterValues.generatedDateTo,
    historyPage,
  ]);

  function updateHistoryParams(next) {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      Object.entries(next).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      return params;
    });
  }

  async function runSearch(workerCode) {
    if (!workerCode.trim()) return;
    setSearching(true);
    setResult(null);
    try {
      const data = await getNinetyDays(workerCode.trim());
      setResult(data);

      const w = data.worker;
      const c = w?.contractor;
      const t = data.tracker;
      const prefilled = {
        referenceNo: t?.form90ReferenceNo || '',
        referenceDate: t?.form90ReferenceDate ? formatDDMMYYYY(t.form90ReferenceDate) : '',
        employerName: transliterateToDevanagari(c?.principalEmployerName),
        establishmentName: transliterateToDevanagari(c?.establishmentName),
        bocwNo: c?.bocwNo || '',
        labourOfficeName: 'Labour Office',
        employerAddress: transliterateToDevanagari(c?.principalEmployerAddress),
        employerVillage: transliterateToDevanagari(c?.village),
        employerTaluka: transliterateToDevanagari(c?.taluka),
        employerDistrict: transliterateToDevanagari(c?.state),
        contractorPincode: c?.pincode || '',
        contractorPhone: c?.phone || '',
        workerName: transliterateToDevanagari(w ? `${w.firstName} ${w.lastName}` : ''),
        workerAge: w ? `${ageFromDob(w.dob) ?? '-'} वर्ष` : '',
        workerAddress: transliterateToDevanagari(w?.permanentAddress),
        workerVillage: transliterateToDevanagari(w?.village),
        workerTaluka: transliterateToDevanagari(w?.taluka),
        workerDistrict: transliterateToDevanagari(w?.district),
        workerPincode: w?.pincode || '',
        workerMobile: w?.mobileNo || '',
        designation: translateDesignation(w?.designation?.designationName),
        periodFrom: w ? formatDDMMYYYY(w.joinDate) : '',
        periodTo: w ? formatDDMMYYYY(new Date()) : '',
        continuousDays: t ? String(t.continuousDaysCount) : '',
        workLocation: transliterateToDevanagari(c ? `${c.buildingName || ''} ${c.address}`.trim() : ''),
        appointmentDate: w ? formatDDMMYYYY(w.joinDate) : '',
        wagePerDay: w ? String(w.labourCategory.ratePerDay) : '',
      };
      // Every value — including transliterated addresses that may carry house numbers — gets
      // Devanagari numerals, so the certificate is fully Marathi.
      setEditable(Object.fromEntries(Object.entries(prefilled).map(([key, value]) => [key, toDevanagariDigits(value)])));

      loadHistory();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSearching(false);
    }
  }

  useEffect(() => {
    if (workerCodeFromUrl) {
      setCode(workerCodeFromUrl);
      runSearch(workerCodeFromUrl);
    }
  }, [workerCodeFromUrl]);

  function handleSearch(e) {
    e.preventDefault();
    runSearch(code);
  }

  function updateEditable(key) {
    return (value) => setEditable((prev) => ({ ...prev, [key]: toDevanagariDigits(value) }));
  }

  function handlePrint() {
    if (!result) {
      showToast('Search for a worker before printing the certificate', 'error');
      return;
    }
    const missing = missingPrintFields(result.worker);
    if (missing.length) {
      showToast(`Cannot print — fill in the missing details first. ${missing.join('; ')}`, 'error');
      return;
    }
    printNow();
  }

  function viewCertificate(workerCode) {
    // Keep the history filters (contractor/date range/page) in the URL so viewing a
    // certificate and going back doesn't reset the filter the user had just set.
    const query = searchParams.toString();
    navigate(`/reports/90-days/${workerCode}${query ? `?${query}` : ''}`);
  }

  const historyColumns = [
    { key: 'srNo', label: 'Sr. No.', render: (r, i) => (historyPage - 1) * HISTORY_LIMIT + i + 1 },
    { key: 'workerCode', label: 'Worker Code', render: (r) => r.worker.workerCode },
    { key: 'workerName', label: 'Worker Name', render: (r) => `${r.worker.firstName} ${r.worker.lastName}` },
    { key: 'contractor', label: 'Contractor', render: (r) => r.contractor?.contractorName || '-' },
    { key: 'referenceNo', label: 'Reference No.', render: (r) => r.form90ReferenceNo || '-' },
    { key: 'referenceDate', label: 'Reference Date', render: (r) => (r.form90ReferenceDate ? formatDate(r.form90ReferenceDate) : '-') },
    { key: 'generatedOn', label: 'Generated On', render: (r) => (r.form90GeneratedAt ? formatDateTime(r.form90GeneratedAt) : '-') },
    { key: 'continuousDays', label: 'Continuous Days', render: (r) => r.continuousDaysCount },
    {
      key: 'actions',
      label: 'Action',
      render: (r) => (
        <Button variant="secondary" onClick={() => viewCertificate(r.worker.workerCode)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="no-print">
        <PageHeader title="90-Days Form" description="Continuous employment certificate under the BOCW Act." />
      </div>

      <div className="ninety-days-form-align-group">
      <div className="no-print">
        <form
          onSubmit={handleSearch}
          className="ninety-days-form-search-bar"
        >
          <div className="ninety-days-form-search-field">
            <label className="ninety-days-form-label">Worker Code</label>
            <TextInput value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. WRK001" />
          </div>
          <Button type="submit" icon={Search} disabled={searching}>{searching ? 'Searching...' : 'Search'}</Button>
          <Button type="button" variant="secondary" icon={Printer} onClick={handlePrint}>Print</Button>
        </form>
      </div>

      {result && (
        <div id="form90-certificate" className="ninety-days-form-certificate">
          <div className="ninety-days-form-title-bar print-color-exact">
            {toDevanagariDigits(TITLE_BAR_TEXT)}
          </div>

          <div className="ninety-days-form-ref-row">
            <EditableField label="जावक क्रमांक" value={editable.referenceNo} onChange={updateEditable('referenceNo')} />
            <EditableField label="जावक दिनांक" value={editable.referenceDate} onChange={updateEditable('referenceDate')} />
          </div>

          <div className="ninety-days-form-photo-wrap">
            <div className="ninety-days-form-photo-box" />
          </div>

          <h3 className="ninety-days-form-section-title">नियोक्त्याचा/ठेकेदाराचा/विकासकाचा तपशील</h3>
          <div className="ninety-days-form-row">
            <EditableField label="नियोक्त्याचे/ठेकेदाराचे/विकासकाचे नाव" value={editable.employerName} onChange={updateEditable('employerName')} />
          </div>
          <div className="ninety-days-form-row">
            <EditableField label="नियोक्त्याच्या/ठेकेदाराच्या/विकासकाच्या आस्थापनेचे नाव" value={editable.establishmentName} onChange={updateEditable('establishmentName')} />
          </div>
          <div className="ninety-days-form-row">
            <EditableField label="नियोक्त्याचा/ठेकेदाराचा/विकासकाचा नोंदणी क्रमांक" value={editable.bocwNo} onChange={updateEditable('bocwNo')} />
          </div>
          <div className="ninety-days-form-row">
            <EditableField
              label="ज्या विभागामार्फत नोंदणी प्रमाणपत्र जारी करण्यात आलेले आहे त्या विभागाचे नाव"
              value={editable.labourOfficeName}
              onChange={updateEditable('labourOfficeName')}
            />
          </div>
          <div className="ninety-days-form-row">
            <EditableField label="नियोक्त्याचा/ठेकेदाराचा/विकासकाचा पत्ता" value={editable.employerAddress} onChange={updateEditable('employerAddress')} />
          </div>
          <div className="ninety-days-form-row-lg">
            <EditableField label="गाव" value={editable.employerVillage} onChange={updateEditable('employerVillage')} />
            <EditableField label="तालुका" value={editable.employerTaluka} onChange={updateEditable('employerTaluka')} />
            <EditableField label="जिल्हा" value={editable.employerDistrict} onChange={updateEditable('employerDistrict')} />
            <EditableField label="पिन कोड" value={editable.contractorPincode} onChange={updateEditable('contractorPincode')} />
            <EditableField label="संपर्क क्रमांक" value={editable.contractorPhone} onChange={updateEditable('contractorPhone')} />
          </div>

          <p className="ninety-days-form-legal-text" lang="mr">
            {toDevanagariDigits(LEGAL_BOILERPLATE_MARATHI)}
          </p>

          <h3 className="ninety-days-form-section-title">बांधकाम कामगाराचा तपशील</h3>
          <div className="ninety-days-form-row">
            <EditableField label="कामगाराचे नाव" value={editable.workerName} onChange={updateEditable('workerName')} />
            <EditableField label="वय" value={editable.workerAge} onChange={updateEditable('workerAge')} />
          </div>
          <div className="ninety-days-form-row">
            <EditableField label="कामगाराचा पत्ता" value={editable.workerAddress} onChange={updateEditable('workerAddress')} />
          </div>
          <div className="ninety-days-form-row">
            <EditableField label="गाव" value={editable.workerVillage} onChange={updateEditable('workerVillage')} />
            <EditableField label="तालुका" value={editable.workerTaluka} onChange={updateEditable('workerTaluka')} />
            <EditableField label="जिल्हा" value={editable.workerDistrict} onChange={updateEditable('workerDistrict')} />
            <EditableField label="पिन कोड" value={editable.workerPincode} onChange={updateEditable('workerPincode')} />
            <EditableField label="संपर्क क्रमांक" value={editable.workerMobile} onChange={updateEditable('workerMobile')} />
          </div>
          <div className="ninety-days-form-row">
            <EditableField label="कामाचा प्रकार/स्वरूप" value={editable.designation} onChange={updateEditable('designation')} />
          </div>
          <div className="ninety-days-form-row-lg">
            कामाचा कालावधी: दि <InlineInput value={editable.periodFrom} onChange={updateEditable('periodFrom')} /> पासून
            दि. <InlineInput value={editable.periodTo} onChange={updateEditable('periodTo')} /> पर्यंत
            एकूण दिवस: <InlineInput value={editable.continuousDays} onChange={updateEditable('continuousDays')} minWidth={6} />
          </div>

          <hr className="ninety-days-form-divider" />

          <div className="ninety-days-form-row">
            <EditableField label="कामगाराच्या सध्याच्या कामाचे ठिकाण व पत्ता" value={editable.workLocation} onChange={updateEditable('workLocation')} />
          </div>
          <div className="ninety-days-form-row">
            <EditableField label="गाव" value={editable.employerVillage} onChange={updateEditable('employerVillage')} />
            <EditableField label="तालुका" value={editable.employerTaluka} onChange={updateEditable('employerTaluka')} />
            <EditableField label="जिल्हा" value={editable.employerDistrict} onChange={updateEditable('employerDistrict')} />
            <EditableField label="पिन कोड" value={editable.contractorPincode} onChange={updateEditable('contractorPincode')} />
            <EditableField label="संपर्क क्रमांक" value={editable.contractorPhone} onChange={updateEditable('contractorPhone')} />
          </div>
          <div className="ninety-days-form-row">
            <EditableField label="नमूद बांधकाम कामगाराची नियुक्ती दि." value={editable.appointmentDate} onChange={updateEditable('appointmentDate')} />
          </div>
          <div className="ninety-days-form-row-xl">
            <EditableField label="दिवसाचे वेतन" value={editable.wagePerDay} onChange={updateEditable('wagePerDay')} />
          </div>

          <div className="ninety-days-form-signature-row">
            <div className="ninety-days-form-signature-block">
              <p>नियोजक/ठेकेदार/विकासकाचे सही व शिक्का:</p>
              <div className="ninety-days-form-signature-line" />
            </div>
          </div>
        </div>
      )}

      <div className="no-print">
        <h2 className="ninety-days-form-history-title">Recently Generated Certificates</h2>
        <FilterBar filters={HISTORY_FILTERS} values={historyFilterValues} onChange={(key, value) => updateHistoryParams({ [key]: value, page: null })} />
        <DataTable columns={historyColumns} rows={history.data} loading={historyLoading} emptyMessage="No 90-Days certificates generated yet" />
        <Pagination page={historyPage} limit={HISTORY_LIMIT} total={history.total} onPageChange={(p) => updateHistoryParams({ page: p })} />
      </div>
      </div>
    </div>
  );
}
