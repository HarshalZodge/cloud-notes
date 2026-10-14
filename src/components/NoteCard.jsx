import React, { useState, useRef, useEffect } from 'react';
import { 
  Star, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Download, 
  Clock, 
  Tag
} from 'lucide-react';
import { formatRelativeTime } from '../utils/date.js';
import { extractExcerpt } from '../utils/markdown.js';
import { useNotes } from '../hooks/useNotes.jsx';

// Restrained category theme color accents
const CATEGORY_COLORS = {
  Study: { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
  Work: { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
  Personal: { bg: '#F8FAFC', text: '#475569', border: '#CBD5E1' },
  Ideas: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
  Projects: { bg: '#F0F9FF', text: '#0284C7', border: '#BAE6FD' },
  Travel: { bg: '#F1F5F9', text: '#0F766E', border: '#99F6E4' },
  General: { bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0' }
};

export function NoteCard({ note, viewMode = 'grid' }) {
  const { openEditNote, toggleFavorite, trashNote } = useNotes();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const excerpt = extractExcerpt(note.content, viewMode === 'list' ? 180 : 130);
  const catStyle = CATEGORY_COLORS[note.category] || CATEGORY_COLORS.General;

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleDownload = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    const blob = new Blob([note.rawMarkdown || note.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = note.filename || `${note.title || 'Note'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCardClick = () => {
    openEditNote(note);
  };

  return (
    <div 
      className={`note-card glass-card ${viewMode === 'list' ? 'note-card-list' : ''}`}
      onClick={handleCardClick}
    >
      <div className="note-card-header">
        {/* Category Pill */}
        <span 
          className="note-category-pill"
          style={{ 
            backgroundColor: catStyle.bg, 
            color: catStyle.text,
            borderColor: catStyle.border 
          }}
        >
          <Tag size={10} />
          {note.category || 'General'}
        </span>

        {/* Favorite & Overflow Menu */}
        <div className="note-card-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className={`favorite-btn ${note.favorite ? 'is-fav' : ''}`}
            onClick={() => toggleFavorite(note.id)}
            title={note.favorite ? 'Remove from favorites' : 'Mark as favorite'}
          >
            <Star 
              size={16} 
              fill={note.favorite ? '#F59E0B' : 'transparent'} 
              stroke={note.favorite ? '#F59E0B' : '#94A3B8'} 
            />
          </button>

          <div className="overflow-menu-wrapper" ref={menuRef}>
            <button
              className="overflow-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              title="More actions"
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <div className="overflow-dropdown glass-panel">
                <button 
                  className="dropdown-item"
                  onClick={() => { setMenuOpen(false); openEditNote(note); }}
                >
                  <Edit3 size={14} />
                  <span>Edit Note</span>
                </button>

                <button 
                  className="dropdown-item"
                  onClick={handleDownload}
                >
                  <Download size={14} />
                  <span>Download .md</span>
                </button>

                {note.webViewLink && (
                  <a 
                    href={note.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dropdown-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    <ExternalLink size={14} />
                    <span>View in Drive</span>
                  </a>
                )}

                <div className="dropdown-divider" />

                <button 
                  className="dropdown-item text-danger"
                  onClick={() => { setMenuOpen(false); trashNote(note.id); }}
                >
                  <Trash2 size={14} />
                  <span>Move to Trash</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Note Title */}
      <h3 className="note-card-title">
        {note.title || 'Untitled Note'}
      </h3>

      {/* Excerpt Body */}
      <p className="note-card-excerpt">
        {excerpt}
      </p>

      {/* Note Footer */}
      <div className="note-card-footer">
        <div className="note-date-indicator">
          <Clock size={12} />
          <span>{formatRelativeTime(note.updatedAt || note.createdAt)}</span>
        </div>

        {note.tags && note.tags.length > 0 && (
          <div className="note-tags-inline">
            {note.tags.slice(0, 2).map((t, idx) => (
              <span key={idx} className="note-tag-chip">#{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
