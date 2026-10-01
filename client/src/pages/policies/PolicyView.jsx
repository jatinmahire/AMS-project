import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, FileText } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import BackButton from '../../components/BackButton';
import Button from '../../components/Button';
import ViewCard, { ViewField, ViewSection } from '../../components/ViewField';
import { getPolicy } from '../../api/policies';
import { formatDate, formatCurrency } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import './PolicyView.css';

export default function PolicyView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPolicy(id)
      .then(setPolicy)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="policy-view-message">Loading...</div>;
  if (!policy) return <div className="policy-view-message">Policy not found.</div>;

  return (
    <div>
      <BackButton />

      <PageHeader
        title={policy.policyName}
        description={`Policy Number ${policy.policyNumber}`}
        action={
          <Button icon={Pencil} onClick={() => navigate(`/policies/${id}/edit`)}>
            Edit
          </Button>
        }
      />

      <ViewCard>
        <ViewSection title="Contractor">
          <ViewField label="Contractor" value={policy.contractor?.contractorName} />
        </ViewSection>

        <ViewSection title="Policy Details">
          <ViewField label="Policy Name" value={policy.policyName} />
          <ViewField label="Policy Number" value={policy.policyNumber} />
          <ViewField label="Insurance Company" value={policy.insuranceCompany} />
          <ViewField label="Project Name" value={policy.projectName} />
          <ViewField label="Policy Date" value={formatDate(policy.policyDate)} />
          <ViewField label="Valid Date" value={formatDate(policy.validDate)} />
        </ViewSection>

        <ViewSection title="Coverage">
          <ViewField label="Worker Count" value={policy.workerCount} />
          <ViewField label="Project Value" value={policy.projectValue ? formatCurrency(policy.projectValue) : '-'} />
          <ViewField label="Person Value" value={policy.personValue ? formatCurrency(policy.personValue) : '-'} />
          <ViewField label="Remarks" value={policy.remarks} />
        </ViewSection>

        <ViewSection title="Policy Document">
          <ViewField
            label="Document"
            value={
              policy.fileUrl ? (
                <a href={policy.fileUrl} target="_blank" rel="noreferrer" className="policy-view-doc-link">
                  <FileText size={14} /> View Document
                </a>
              ) : '-'
            }
          />
        </ViewSection>
      </ViewCard>
    </div>
  );
}
