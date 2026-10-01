import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import BackButton from '../../components/BackButton';
import Button from '../../components/Button';
import ViewCard, { ViewField, ViewSection } from '../../components/ViewField';
import { getHoliday } from '../../api/holidays';
import { contractorDropdown } from '../../api/contractors';
import { formatDate } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import './HolidayView.css';

export default function HolidayView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [holiday, setHoliday] = useState(null);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHoliday(id)
      .then(setHoliday)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    contractorDropdown().then(setContractors).catch(() => setContractors([]));
  }, []);

  if (loading) return <div className="holiday-view-message">Loading...</div>;
  if (!holiday) return <div className="holiday-view-message">Holiday not found.</div>;

  const contractor = contractors.find((c) => c.id === holiday.contractorId);

  return (
    <div>
      <BackButton />

      <PageHeader
        title="Holiday"
        description={`${holiday.type.replace('_', '')} on ${formatDate(holiday.date)}`}
        action={
          <Button icon={Pencil} onClick={() => navigate(`/holidays/${id}/edit`)}>
            Edit
          </Button>
        }
      />

      <ViewCard>
        <ViewSection title="Holiday Details">
          <ViewField label="Type" value={holiday.type.replace('_', '')} />
          <ViewField label="Date" value={formatDate(holiday.date)} />
          <ViewField label="Applies To" value={holiday.contractorId ? contractor?.contractorName : 'All Contractors'} />
          <ViewField label="Notes" value={holiday.notes} />
        </ViewSection>
      </ViewCard>
    </div>
  );
}
