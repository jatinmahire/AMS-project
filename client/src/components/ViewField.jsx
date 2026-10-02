import './ViewField.css';

export function ViewField({ label, value }) {
  return (
    <div className="view-field">
      <span className="view-field-label">{label}</span>
      <span className="view-field-separator">:</span>
      <span className="view-field-value">{value ?? '-'}</span>
    </div>
  );
}

export function ViewSection({ title, children }) {
  return (
    <div className="view-section">
      <h3 className="view-section-title">{title}</h3>
      <div className="view-section-grid">{children}</div>
    </div>
  );
}

export default function ViewCard({ children, ref }) {
  return <div ref={ref} className="view-card">{children}</div>;
}
