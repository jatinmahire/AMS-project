import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import BackButton from '../../components/BackButton';
import Button from '../../components/Button';
import WorkerInfoCard from '../../components/WorkerInfoCard';
import ViewCard, { ViewField, ViewSection } from '../../components/ViewField';
import { getOvertime } from '../../api/overtimes';
import { formatDate, formatCurrency } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import './OvertimeView.css';

export default function OvertimeView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [overtime, setOvertime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOvertime(id)
      .then(setOvertime)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="overtime-view-message">Loading...</div>;
  if (!overtime) return <div className="overtime-view-message">Overtime record not found.</div>;

  return (
    <div>
      <BackButton />

      <PageHeader
        title="Overtime Record"
        description={`Overtime on ${formatDate(overtime.otDate)}`}
        action={
          <Button icon={Pencil} onClick={() => navigate(`/overtimes/${id}/edit`)}>
            Edit
          </Button>
        }
      />

      <div className="overtime-view-content">
        <WorkerInfoCard worker={overtime.worker} />

        <ViewCard>
          <ViewSection title="Overtime Details">
            <ViewField label="Overtime Date" value={formatDate(overtime.otDate)} />
            <ViewField label="Hours Worked" value={overtime.hoursWorked} />
            <ViewField label="Normal Wage Rate" value={formatCurrency(overtime.normalWageRate)} />
            <ViewField label="OT Wage Rate" value={formatCurrency(overtime.otWageRate)} />
            <ViewField label="OT Earnings" value={formatCurrency(overtime.otEarnings)} />
            <ViewField label="Remarks" value={overtime.remarks} />
          </ViewSection>
        </ViewCard>
      </div>
    </div>
  );
}
