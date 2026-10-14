import React, { useState } from 'react';
import { Trash2, RotateCcw, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useNotes } from '../hooks/useNotes.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { formatRelativeTime } from '../utils/date.js';

export function TrashView() {
  const { trashedNotes, restoreNote, deletePermanently } = useNotes();
  const [noteToDelete, setNoteToDelete] = useState(null);

  return (
    <div className="trash-view-container">
      <div className="trash-header-bar glass-panel">
        <div className="trash-header-info">
          <h2 className="trash-title">
            <Trash2 size={20} className="text-muted" />
            <span>Trash</span>
          </h2>
          <span className="trash-subtitle">
            Items in trash can be restored back to your CloudNotes workspace or permanently removed.
          </span>
        </div>
      </div>

      {trashedNotes.length === 0 ? (
        <div className="empty-state-card glass-panel">
          <div className="empty-state-icon-wrap">
            <Trash2 size={32} className="text-muted" />
          </div>
          <h3 className="empty-state-title">Trash is Empty</h3>
          <p className="empty-state-message">
            Notes you delete will appear here before being permanently removed from Google Drive.
          </p>
        </div>
      ) : (
        <div className="trash-items-list">
          {trashedNotes.map((note) => (
            <div key={note.id} className="trash-item-row glass-card">
              <div className="trash-item-content">
                <span className="trash-item-badge">{note.category || 'General'}</span>
                <h4 className="trash-item-title">{note.title || 'Untitled Note'}</h4>
                <span className="trash-item-date">
                  Modified {formatRelativeTime(note.updatedAt || note.createdAt)}
                </span>
              </div>

              <div className="trash-item-actions">
                <button
                  className="glass-button glass-button-secondary restore-btn"
                  onClick={() => restoreNote(note.id)}
                  title="Restore note to active list"
                >
                  <RotateCcw size={14} />
                  <span>Restore</span>
                </button>

                <button
                  className="glass-button glass-button-danger delete-perm-btn"
                  onClick={() => setNoteToDelete(note)}
                  title="Permanently delete from Google Drive"
                >
                  <Trash2 size={14} />
                  <span>Delete Forever</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog for Permanent Delete */}
      {noteToDelete && (
        <ConfirmDialog
          title="Permanently delete note?"
          message={`Are you sure you want to permanently delete "${noteToDelete.title}"? This file will be completely removed and cannot be recovered.`}
          confirmText="Delete Permanently"
          cancelText="Cancel"
          isDanger={true}
          onConfirm={() => {
            deletePermanently(noteToDelete.id);
            setNoteToDelete(null);
          }}
          onCancel={() => setNoteToDelete(null)}
        />
      )}
    </div>
  );
}
