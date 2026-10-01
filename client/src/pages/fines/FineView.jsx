import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import BackButton from '../../components/BackButton';
import Button from '../../components/Button';
import WorkerInfoCard from '../../components/WorkerInfoCard';
import ViewCard, { ViewField, ViewSection } from '../../components/ViewField';
import { getFine } from '../../api/fines';
import { formatDate, formatCurrency } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import './FineView.css';

export default function FineView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [fine, setFine] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFine(id)
      .then(setFine)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="fine-view-message">Loading...</div>;
  if (!fine) return <div className="fine-view-message">Fine record not found.</div>;

  return (
    <div>
      <BackButton />

      <PageHeader
        title="Fine Record"
        description={`Offence on ${formatDate(fine.offenceDate)}`}
        action={
          <Button icon={Pencil} onClick={() => navigate(`/fines/${id}/edit`)}>
            Edit
          </Button>
        }
      />

      <div className="fine-view-content">
        <WorkerInfoCard worker={fine.worker} />

        <ViewCard>
          <ViewSection title="Offence Details">
            <ViewField label="Offence Date" value={formatDate(fine.offenceDate)} />
            <ViewField label="Witness Name" value={fine.witnessName} />
            <ViewField label="Offence" value={fine.offence} />
            <ViewField label="Whether Workman Showed Cause Against Fine" value={fine.causeShown} />
          </ViewSection>

          <ViewSection title="Wages & Fine">
            <ViewField label="Wage Period" value={fine.wagePeriod} />
            <ViewField label="Wages Payable" value={fine.wagesPayable ? formatCurrency(fine.wagesPayable) : '-'} />
            <ViewField label="Fine Amount" value={formatCurrency(fine.fineAmount)} />
            <ViewField label="Date Realised" value={formatDate(fine.dateRealised)} />
            <ViewField label="Remarks" value={fine.remarks} />
          </ViewSection>
        </ViewCard>
      </div>
    </div>
  );
}
