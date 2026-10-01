import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import './ToastContext.css';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'success') => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-context-stack">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-context-item ${
              toast.type === 'error'
                ? 'toast-context-item-error'
                : 'toast-context-item-success'
            }`}
          >
            {toast.type === 'error' ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{toast.message}</span>
            <button onClick={() => dismiss(toast.id)} className="toast-context-dismiss">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
