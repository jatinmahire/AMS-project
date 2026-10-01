import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import BackButton from '../../components/BackButton';
import Button from '../../components/Button';
import ViewCard, { ViewField, ViewSection } from '../../components/ViewField';
import { getDesignation } from '../../api/designations';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import './DesignationView.css';

export default function DesignationView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [designation, setDesignation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDesignation(id)
      .then(setDesignation)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="designation-view-message">Loading...</div>;
  if (!designation) return <div className="designation-view-message">Designation not found.</div>;

  return (
    <div>
      <BackButton />

      <PageHeader
        title="Designation"
        description={designation.designationName}
        action={
          <Button icon={Pencil} onClick={() => navigate(`/designations/${id}/edit`)}>
            Edit
          </Button>
        }
      />

      <ViewCard>
        <ViewSection title="Designation Details">
          <ViewField label="Designation Code" value={designation.designationCode} />
          <ViewField label="Designation Name" value={designation.designationName} />
        </ViewSection>
      </ViewCard>
    </div>
  );
}
