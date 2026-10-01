import './PageHeader.css';

export default function PageHeader({ title, description, action, centered = false }) {
  if (centered) {
    return (
      <div className="page-header-centered">
        <h1 className="page-header-title">{title}</h1>
        {description && <p className="page-header-description">{description}</p>}
        {action && <div>{action}</div>}
      </div>
    );
  }

  return (
    <div className="page-header">
      <div className="page-header-titles">
        <h1 className="page-header-title">{title}</h1>
        {description && <p className="page-header-description">{description}</p>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </div>
  );
}
