import React, { useState } from 'react';
import { FolderPlus, X } from 'lucide-react';
import { useNotes } from '../hooks/useNotes.jsx';

export function CategoryModal({ isOpen, onClose }) {
  const { addCustomCategory, allCategories } = useNotes();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Category name cannot be empty');
      return;
    }
    if (allCategories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      setError('A category with this name already exists');
      return;
    }

    addCustomCategory(trimmed);
    setName('');
    setError('');
    onClose();
  };

  return (
    <div className="dialog-backdrop">
      <div className="dialog-modal glass-panel">
        <div className="dialog-header">
          <div className="dialog-icon-wrap info">
            <FolderPlus size={20} />
          </div>
          <h3 className="dialog-title">New Category</h3>
          <button className="dialog-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="dialog-body">
            <p className="dialog-message">
              Categories help organize your notes. Notes in this category will keep their categorization in Google Drive metadata.
            </p>
            <div className="input-group-field" style={{ marginTop: '16px' }}>
              <input
                type="text"
                className="glass-input"
                style={{ width: '100%' }}
                placeholder="Category name (e.g. Research, Finance, CS301)..."
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                autoFocus
              />
              {error && <span className="field-error-text" style={{ color: 'var(--status-error)', fontSize: '0.8rem', display: 'block', marginTop: '6px' }}>{error}</span>}
            </div>
          </div>

          <div className="dialog-footer">
            <button
              type="button"
              className="glass-button glass-button-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="glass-button glass-button-primary"
            >
              Add Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
