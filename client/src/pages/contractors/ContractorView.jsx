import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, FileText, Printer, Download } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import BackButton from '../../components/BackButton';
import Button from '../../components/Button';
import ViewCard, { ViewField, ViewSection } from '../../components/ViewField';
import StatusBadge from '../../components/StatusBadge';
import { getContractor } from '../../api/contractors';
import { formatDate } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import { printNow, downloadElementAsPdf } from '../../utils/printExport';
import './ContractorView.css';

export default function ContractorView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [contractor, setContractor] = useState(null);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef(null);

  useEffect(() => {
    getContractor(id)
      .then(setContractor)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="contractor-view-message">Loading...</div>;
  if (!contractor) return <div className="contractor-view-message">Contractor not found.</div>;

  return (
    <div>
      <BackButton />

      <PageHeader
        title={contractor.contractorName}
        description={`Contractor Code: ${contractor.contractorCode}`}
        action={
          <div className="contractor-view-actions no-print">
            <Button variant="secondary" icon={Printer} onClick={printNow}>Print</Button>
            <Button variant="secondary" icon={Download} onClick={() => downloadElementAsPdf(cardRef.current, `contractor-${contractor.contractorCode}.pdf`)}>
              Download PDF
            </Button>
            <Button icon={Pencil} onClick={() => navigate(`/contractors/${id}/edit`)}>
              Edit
            </Button>
          </div>
        }
      />

      <ViewCard ref={cardRef}>
        <ViewSection title="Basic Info">
          <ViewField label="Login ID" value={contractor.user?.loginId} />
          <ViewField label="Establishment Name" value={contractor.establishmentName} />
          <ViewField label="Contact Person" value={contractor.contactPerson} />
          <ViewField label="Phone" value={contractor.phone} />
          <ViewField label="Email" value={contractor.email} />
          <ViewField label="Status" value={<StatusBadge status={contractor.status} />} />
        </ViewSection>

        <ViewSection title="Location / Site">
          <ViewField label="Building Name" value={contractor.buildingName} />
          <ViewField label="Address" value={contractor.address} />
          <ViewField label="Village" value={contractor.village} />
          <ViewField label="Taluka" value={contractor.taluka} />
          <ViewField label="City" value={contractor.city} />
          <ViewField label="State" value={contractor.state} />
          <ViewField label="Pincode" value={contractor.pincode} />
        </ViewSection>

        <ViewSection title="Identity">
          <ViewField label="Aadhaar No." value={contractor.aadhaarNo} />
          <ViewField label="PAN No." value={contractor.panNo} />
          <ViewField label="RC" value={contractor.rc} />
        </ViewSection>

        <ViewSection title="Principal Employer">
          <ViewField label="Name" value={contractor.principalEmployerName} />
          <ViewField label="Address" value={contractor.principalEmployerAddress} />
        </ViewSection>

        <ViewSection title="Insurance & Licenses">
          <ViewField label="WC Policy No." value={contractor.wcPolicyNo} />
          <ViewField label="WC Expiry Date" value={formatDate(contractor.wcExpiryDate)} />
          <ViewField label="Shop Act License No." value={contractor.shopActLicenseNo} />
          <ViewField label="Shop Act Expiry" value={formatDate(contractor.shopActExpiryDate)} />
          <ViewField label="Labour License No." value={contractor.labourLicenseNo} />
          <ViewField label="Labour License Expiry" value={formatDate(contractor.labourLicenseExpiry)} />
          <ViewField label="BOCW No." value={contractor.bocwNo} />
          <ViewField label="BOCW Expiry" value={formatDate(contractor.bocwExpiryDate)} />
        </ViewSection>

        <ViewSection title="Statutory Codes">
          <ViewField label="PF Establishment Code" value={contractor.pfEstablishmentCode} />
          <ViewField label="ESIC Establishment Code" value={contractor.esicEstablishmentCode} />
          <ViewField label="MLWF No." value={contractor.mlwfNo} />
          <ViewField label="PTEC No." value={contractor.ptecNo} />
          <ViewField label="PTRC No." value={contractor.ptrcNo} />
        </ViewSection>

        {contractor.documents?.length > 0 && (
          <ViewSection title="Documents">
            {contractor.documents.map((doc) => (
              <a
                key={doc.id}
                href={doc.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="contractor-view-doc-link"
              >
                <FileText size={14} /> {doc.docType.replace(/_/g, ' ')}
              </a>
            ))}
          </ViewSection>
        )}
      </ViewCard>
    </div>
  );
}
