import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Printer, Download, FileText } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import BackButton from '../../components/BackButton';
import Button from '../../components/Button';
import ViewCard, { ViewField, ViewSection } from '../../components/ViewField';
import StatusBadge from '../../components/StatusBadge';
import { getWorker } from '../../api/workers';
import { formatDate } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { printNow, downloadElementAsPdf } from '../../utils/printExport';
import './WorkerView.css';

export default function WorkerView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN';
  const canView90Days = user?.role === 'ADMIN' || user?.role === 'SUPERVISOR';
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef(null);

  useEffect(() => {
    getWorker(id)
      .then(setWorker)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="worker-view-message">Loading...</div>;
  if (!worker) return <div className="worker-view-message">Worker not found.</div>;

  return (
    <div>
      <BackButton />

      <PageHeader
        title={`${worker.firstName} ${worker.lastName}`}
        description={`Worker Code: ${worker.workerCode}`}
        action={
          <div className="worker-view-actions">
            <Button variant="secondary" icon={Printer} onClick={printNow}>Print</Button>
            <Button variant="secondary" icon={Download} onClick={() => downloadElementAsPdf(cardRef.current, `worker-${worker.workerCode}.pdf`)}>
              Download PDF
            </Button>
            {canView90Days && (
              <Button variant="secondary" icon={FileText} onClick={() => navigate(`/reports/90-days/${worker.workerCode}`)}>
                90 Days Form
              </Button>
            )}
            {canEdit && (
              <Button icon={Pencil} onClick={() => navigate(`/workers/${id}/edit`)}>
                Edit
              </Button>
            )}
          </div>
        }
      />

      <ViewCard ref={cardRef}>
        <ViewSection title="Personal">
          <ViewField label="Worker Code" value={worker.workerCode} />
          <ViewField label="Name" value={`${worker.firstName} ${worker.middleName || ''} ${worker.lastName}`} />
          <ViewField label="Father/Husband Name" value={worker.fatherOrHusbandName} />
          <ViewField label="Gender" value={worker.gender} />
          <ViewField label="Date of Birth" value={formatDate(worker.dob)} />
          <ViewField label="Mobile" value={worker.mobileNo} />
          <ViewField label="Status" value={<StatusBadge status={worker.status} />} />
        </ViewSection>

        <ViewSection title="Address">
          <ViewField label="Permanent Address" value={worker.permanentAddress} />
          <ViewField label="Current Address" value={worker.currentAddress} />
          <ViewField label="Village" value={worker.village} />
          <ViewField label="Taluka" value={worker.taluka} />
          <ViewField label="City" value={worker.city} />
          <ViewField label="District" value={worker.district} />
          <ViewField label="State" value={worker.state} />
          <ViewField label="Pincode" value={worker.pincode} />
        </ViewSection>

        <ViewSection title="Employment">
          <ViewField label="Contractor" value={worker.contractor?.contractorName} />
          <ViewField label="Designation" value={worker.designation?.designationName} />
          <ViewField label="Labour Category" value={worker.labourCategory?.categoryName} />
          <ViewField label="Join Date" value={formatDate(worker.joinDate)} />
          <ViewField label="Sector" value={worker.sector} />
        </ViewSection>

        <ViewSection title="Identity & Statutory">
          <ViewField label="ID Type" value={worker.idType} />
          <ViewField label="ID Number" value={worker.idNumber} />
          <ViewField label="Police Verified" value={worker.policeVerified ? 'Yes' : 'No'} />
          <ViewField label="BOCW Registration No." value={worker.bocwRegistrationNo} />
          <ViewField label="PF Number" value={worker.pfNumber} />
          <ViewField label="UAN Number" value={worker.uanNumber} />
          <ViewField label="ESIC Number" value={worker.esicNumber} />
          <ViewField label="PAN Number" value={worker.panNumber} />
        </ViewSection>

        <ViewSection title="Bank Details">
          <ViewField label="Bank Name" value={worker.bankName} />
          <ViewField label="Branch" value={worker.bankBranch} />
          <ViewField label="Account No." value={worker.accountNo} />
          <ViewField label="IFSC Code" value={worker.ifscCode} />
        </ViewSection>

        <ViewSection title="Nominee">
          <ViewField label="Name" value={worker.nomineeName} />
          <ViewField label="Relation" value={worker.nomineeRelation} />
          <ViewField label="Mobile" value={worker.nomineeMobile} />
        </ViewSection>
      </ViewCard>
    </div>
  );
}
