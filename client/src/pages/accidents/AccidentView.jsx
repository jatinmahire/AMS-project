import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import BackButton from '../../components/BackButton';
import Button from '../../components/Button';
import WorkerInfoCard from '../../components/WorkerInfoCard';
import ViewCard, { ViewField, ViewSection } from '../../components/ViewField';
import { getAccident } from '../../api/accidents';
import { formatDate } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import './AccidentView.css';

export default function AccidentView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [accident, setAccident] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAccident(id)
      .then(setAccident)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="accident-view-message">Loading...</div>;
  if (!accident) return <div className="accident-view-message">Accident record not found.</div>;

  return (
    <div>
      <BackButton />

      <PageHeader
        title="Accident Record"
        description={`Accident on ${formatDate(accident.accidentDate)}`}
        action={
          <Button icon={Pencil} onClick={() => navigate(`/accidents/${id}/edit`)}>
            Edit
          </Button>
        }
      />

      <div className="accident-view-content">
        <WorkerInfoCard worker={accident.worker} />

        <ViewCard>
          <ViewSection title="Accident Details">
            <ViewField label="Accident Date" value={formatDate(accident.accidentDate)} />
            <ViewField label="Form 24 Report Date" value={accident.form24ReportDate ? formatDate(accident.form24ReportDate) : '-'} />
            <ViewField label="Date Return to Work" value={accident.dateReturnToWork ? formatDate(accident.dateReturnToWork) : '-'} />
            <ViewField label="Days Absent" value={accident.daysAbsent} />
            <ViewField label="Nature of Accident" value={accident.natureOfAccident} />
            <ViewField
              label="Photo"
              value={accident.photoUrl ? <a href={accident.photoUrl} target="_blank" rel="noreferrer" className="accident-view-photo-link">View file</a> : '-'}
            />
          </ViewSection>
        </ViewCard>
      </div>
    </div>
  );
}
