import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Printer, Download } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import BackButton from '../../components/BackButton';
import Button from '../../components/Button';
import ViewCard, { ViewField, ViewSection } from '../../components/ViewField';
import StatusBadge from '../../components/StatusBadge';
import { getSupervisor } from '../../api/supervisors';
import { formatDate } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import { printNow, downloadElementAsPdf } from '../../utils/printExport';
import './SupervisorView.css';

export default function SupervisorView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [supervisor, setSupervisor] = useState(null);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef(null);

  useEffect(() => {
    getSupervisor(id)
      .then(setSupervisor)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="supervisor-view-message">Loading...</div>;
  if (!supervisor) return <div className="supervisor-view-message">Supervisor not found.</div>;

  return (
    <div>
      <BackButton />

      <PageHeader
        title={supervisor.fullName}
        description={`Supervisor Code: ${supervisor.supervisorCode}`}
        action={
          <div className="supervisor-view-actions">
            <Button variant="secondary" icon={Printer} onClick={printNow}>Print</Button>
            <Button variant="secondary" icon={Download} onClick={() => downloadElementAsPdf(cardRef.current, `supervisor-${supervisor.supervisorCode}.pdf`)}>
              Download PDF
            </Button>
            <Button icon={Pencil} onClick={() => navigate(`/supervisors/${id}/edit`)}>
              Edit
            </Button>
          </div>
        }
      />

      <ViewCard ref={cardRef}>
        <ViewSection title="Personal">
          <ViewField label="Login ID" value={supervisor.user?.loginId} />
          <ViewField label="Gender" value={supervisor.gender} />
          <ViewField label="Date of Birth" value={formatDate(supervisor.dob)} />
          <ViewField label="Contact No." value={supervisor.contactNo} />
          <ViewField label="Email" value={supervisor.email} />
          <ViewField label="Status" value={<StatusBadge status={supervisor.status} />} />
        </ViewSection>

        <ViewSection title="Address">
          <ViewField label="Street" value={supervisor.street} />
          <ViewField label="City" value={supervisor.city} />
          <ViewField label="State" value={supervisor.state} />
          <ViewField label="Pincode" value={supervisor.pincode} />
        </ViewSection>

        <ViewSection title="Identity Documents">
          <ViewField label="Aadhaar No." value={supervisor.aadhaarNo} />
        </ViewSection>

        <ViewSection title="Employment">
          <ViewField label="Assigned Contractor" value={supervisor.assignedContractor?.contractorName} />
        </ViewSection>
      </ViewCard>
    </div>
  );
}
