import { X } from 'lucide-react';
import { useEffect } from 'react';
import './Modal.css';

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: 'modal-panel-sm', md: 'modal-panel-md', lg: 'modal-panel-lg' };

  return (
    <div className="modal-overlay">
      <div className={`modal-panel ${widths[size]}`}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button
            onClick={onClose}
            className="modal-close-button"
          >
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
