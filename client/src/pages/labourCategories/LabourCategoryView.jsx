import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import BackButton from '../../components/BackButton';
import Button from '../../components/Button';
import ViewCard, { ViewField, ViewSection } from '../../components/ViewField';
import { getLabourCategory } from '../../api/labourCategories';
import { formatCurrency } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import './LabourCategoryView.css';

export default function LabourCategoryView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLabourCategory(id)
      .then(setCategory)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="labour-category-view-message">Loading...</div>;
  if (!category) return <div className="labour-category-view-message">Labour category not found.</div>;

  return (
    <div>
      <BackButton />

      <PageHeader
        title="Labour Category"
        description={category.categoryCode}
        action={
          <Button icon={Pencil} onClick={() => navigate(`/labour-categories/${id}/edit`)}>
            Edit
          </Button>
        }
      />

      <ViewCard>
        <ViewSection title="Category Details">
          <ViewField label="Category Code" value={category.categoryCode} />
          <ViewField label="Labour Type" value={category.categoryName.replace('_', '')} />
          <ViewField label="Rate Per Day" value={formatCurrency(category.ratePerDay)} />
        </ViewSection>
      </ViewCard>
    </div>
  );
}
