import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import BackButton from '../../components/BackButton';
import Button from '../../components/Button';
import WorkerInfoCard from '../../components/WorkerInfoCard';
import StatusBadge from '../../components/StatusBadge';
import ViewCard, { ViewField, ViewSection } from '../../components/ViewField';
import { getAttendance } from '../../api/attendance';
import { formatDate } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import './AttendanceView.css';

export default function AttendanceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAttendance(id)
      .then(setAttendance)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="attendance-view-message">Loading...</div>;
  if (!attendance) return <div className="attendance-view-message">Attendance record not found.</div>;

  return (
    <div>
      <BackButton />

      <PageHeader
        title="Attendance Record"
        description={`${formatDate(attendance.date)} — ${attendance.day}`}
        action={
          <Button icon={Pencil} onClick={() => navigate(`/attendance/${id}/edit`)}>
            Edit
          </Button>
        }
      />

      <div className="attendance-view-content">
        <WorkerInfoCard worker={attendance.worker} />

        <ViewCard>
          <ViewSection title="Attendance Details">
            <ViewField label="Date" value={formatDate(attendance.date)} />
            <ViewField label="Day" value={attendance.day} />
            <ViewField label="In Time" value={attendance.inTime} />
            <ViewField label="Out Time" value={attendance.outTime} />
            <ViewField label="Status" value={<StatusBadge status={attendance.status} />} />
            <ViewField label="Building Number" value={attendance.buildingNo} />
            <ViewField label="Source" value={attendance.source} />
          </ViewSection>
        </ViewCard>
      </div>
    </div>
  );
}
