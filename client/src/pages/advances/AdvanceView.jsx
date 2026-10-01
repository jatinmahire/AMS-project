import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import BackButton from '../../components/BackButton';
import Button from '../../components/Button';
import WorkerInfoCard from '../../components/WorkerInfoCard';
import ViewCard, { ViewField, ViewSection } from '../../components/ViewField';
import StatusBadge from '../../components/StatusBadge';
import { getAdvance } from '../../api/advances';
import { formatDate, formatCurrency } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../context/ToastContext';
import './AdvanceView.css';

export default function AdvanceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [advance, setAdvance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdvance(id)
      .then(setAdvance)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="advance-view-message">Loading...</div>;
  if (!advance) return <div className="advance-view-message">Advance not found.</div>;

  return (
    <div>
      <BackButton />

      <PageHeader
        title="Advance"
        description={`Advance on ${formatDate(advance.advanceDate)}`}
        action={
          <Button icon={Pencil} onClick={() => navigate(`/advances/${id}/edit`)}>
            Edit
          </Button>
        }
      />

      <div className="advance-view-content">
        <WorkerInfoCard worker={advance.worker} />

        <ViewCard>
          <ViewSection title="Advance Details">
            <ViewField label="Advance Date" value={formatDate(advance.advanceDate)} />
            <ViewField label="Wages Period" value={advance.wagesPeriod} />
            <ViewField label="Wages Payable" value={advance.wagesPayable ? formatCurrency(advance.wagesPayable) : '-'} />
            <ViewField label="Purpose" value={advance.purpose} />
          </ViewSection>

          <ViewSection title="Amount & Installments">
            <ViewField label="Amount" value={formatCurrency(advance.amount)} />
            <ViewField label="Installments" value={advance.installmentsCount} />
            <ViewField label="Remarks" value={advance.remarks} />
          </ViewSection>
        </ViewCard>

        {advance.repayments?.length > 0 && (
          <div className="advance-view-repayment-card">
            <p className="advance-view-repayment-title">Repayment Schedule</p>
            <div className="advance-view-table-wrapper">
              <table className="advance-view-table">
                <thead className="advance-view-table-head">
                  <tr>
                    <th className="advance-view-th">#</th>
                    <th className="advance-view-th">Due Date</th>
                    <th className="advance-view-th">Amount</th>
                    <th className="advance-view-th">Status</th>
                  </tr>
                </thead>
                <tbody className="advance-view-table-body">
                  {advance.repayments.map((r) => (
                    <tr key={r.id}>
                      <td className="advance-view-td">{r.installmentNo}</td>
                      <td className="advance-view-td">{formatDate(r.dueDate)}</td>
                      <td className="advance-view-td">{formatCurrency(r.amount)}</td>
                      <td className="advance-view-td-status"><StatusBadge status={r.paidStatus} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
