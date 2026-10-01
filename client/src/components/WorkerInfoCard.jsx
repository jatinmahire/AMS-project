import './WorkerInfoCard.css';

export default function WorkerInfoCard({ worker }) {
  if (!worker) return null;

  return (
    <div className="worker-info-card">
      <div>
        <p className="worker-info-card-label">Name</p>
        <p className="worker-info-card-value">{worker.firstName} {worker.lastName}</p>
      </div>
      <div>
        <p className="worker-info-card-label">Contractor</p>
        <p className="worker-info-card-value">{worker.contractor?.contractorName || '-'}</p>
      </div>
      <div>
        <p className="worker-info-card-label">Designation</p>
        <p className="worker-info-card-value">{worker.designation?.designationName || '-'}</p>
      </div>
    </div>
  );
}
