import './StatCard.css';

export default function StatCard({ label, value, icon: Icon, onClick }) {
  const interactive = typeof onClick === 'function';
  return (
    <div
      onClick={onClick}
      className={`group stat-card ${
        interactive ? 'stat-card-interactive' : ''
      }`}
    >
      <div className="stat-card-top-bar" />
      <div className="stat-card-row">
        <div className="stat-card-icon-wrapper">
          <div className="stat-card-icon-backdrop" />
          <div className="stat-card-icon-badge">
            <Icon size={22} className="stat-card-icon" />
          </div>
        </div>
        <p className="stat-card-value">{value}</p>
      </div>
      <p className="stat-card-label">{label}</p>
    </div>
  );
}
