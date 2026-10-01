import './FormSection.css';

export default function FormSection({ title, children }) {
  return (
    <div className="form-section">
      <h3 className="form-section-title">{title}</h3>
      <div className="form-section-grid">{children}</div>
    </div>
  );
}
