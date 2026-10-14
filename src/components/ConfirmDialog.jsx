import React, { useEffect } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

export function ConfirmDialog({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  onConfirm,
  onCancel
}) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div className="dialog-backdrop">
      <div className="dialog-modal glass-panel">
        <div className="dialog-header">
          <div className={`dialog-icon-wrap ${isDanger ? 'danger' : 'info'}`}>
            {isDanger ? <AlertTriangle size={20} /> : <Info size={20} />}
          </div>
          <h3 className="dialog-title">{title}</h3>
          <button 
            className="dialog-close-btn" 
            onClick={onCancel}
            title="Cancel"
          >
            <X size={16} />
          </button>
        </div>

        <div className="dialog-body">
          <p className="dialog-message">{message}</p>
        </div>

        <div className="dialog-footer">
          <button
            className="glass-button glass-button-secondary"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={`glass-button ${isDanger ? 'glass-button-danger' : 'glass-button-primary'}`}
            onClick={onConfirm}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
