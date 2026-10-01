import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import BackButton from '../../components/BackButton';
import Button from '../../components/Button';
import WorkerInfoCard from '../../components/WorkerInfoCard';
import ViewCard, { ViewField, ViewSection } from '../../components/ViewField';
import { getDamage } from '../../api/damages';
import { formatDate, formatCurrency } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import './DamageView.css';

export default function DamageView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [damage, setDamage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDamage(id)
      .then(setDamage)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="damage-view-message">Loading...</div>;
  if (!damage) return <div className="damage-view-message">Damage record not found.</div>;

  return (
    <div>
      <BackButton />

      <PageHeader
        title="Damage Record"
        description={`Damage on ${formatDate(damage.damageDate)}`}
        action={
          <Button icon={Pencil} onClick={() => navigate(`/damages/${id}/edit`)}>
            Edit
          </Button>
        }
      />

      <div className="damage-view-content">
        <WorkerInfoCard worker={damage.worker} />

        <ViewCard>
          <ViewSection title="Damage Details">
            <ViewField label="Damage Date" value={formatDate(damage.damageDate)} />
            <ViewField label="Name of Worksmen (if any)" value={damage.nameOfWorksmen} />
            <ViewField label="Witness Name" value={damage.witnessName} />
            <ViewField label="Particulars" value={damage.particulars} />
            <ViewField label="Whether Workman Showed Cause Against Deduction" value={damage.causeShown} />
          </ViewSection>

          <ViewSection title="Deduction & Photo">
            <ViewField label="Deduction Amount" value={formatCurrency(damage.deductionAmount)} />
            <ViewField label="Installments" value={damage.installments} />
            <ViewField
              label="Photo"
              value={damage.imageUrl ? <a href={damage.imageUrl} target="_blank" rel="noreferrer" className="damage-view-photo-link">View file</a> : '-'}
            />
            <ViewField label="Remarks" value={damage.remarks} />
          </ViewSection>
        </ViewCard>
      </div>
    </div>
  );
}
