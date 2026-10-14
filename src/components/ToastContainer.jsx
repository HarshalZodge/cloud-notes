import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useNotes } from '../hooks/useNotes.jsx';

export function ToastContainer() {
  const { toast, dismissToast } = useNotes();

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={16} className="text-success" />;
      case 'error':
        return <AlertTriangle size={16} className="text-danger" />;
      default:
        return <Info size={16} className="text-primary" />;
    }
  };

  return (
    <div className="toast-portal-wrapper">
      <div className={`toast-notification glass-panel toast-${toast.type}`}>
        <div className="toast-icon-wrap">
          {getIcon()}
        </div>
        <div className="toast-content">
          <span className="toast-message">{toast.message}</span>
        </div>
        <button 
          className="toast-close-btn" 
          onClick={dismissToast}
          title="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
