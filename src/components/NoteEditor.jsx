import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  Save, 
  Star, 
  Eye, 
  Edit3, 
  Columns, 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Code, 
  Quote, 
  Link, 
  Minus, 
  Download,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useNotes } from '../hooks/useNotes.jsx';
import { getDocumentStats, markdownToHtml } from '../utils/markdown.js';
import { ConfirmDialog } from './ConfirmDialog.jsx';

export function NoteEditor() {
  const { 
    isEditorOpen, 
    editingNote, 
    closeEditor, 
    createNote, 
    updateNote, 
    allCategories,
    addCustomCategory 
  } = useNotes();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [content, setContent] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [tags, setTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState('');

  const [editorMode, setEditorMode] = useState('split'); // 'edit' | 'preview' | 'split'
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const textareaRef = useRef(null);

  // Initialize state when opening note
  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title || '');
      setCategory(editingNote.category || 'General');
      setContent(editingNote.content || '');
      setFavorite(Boolean(editingNote.favorite));
      setTags(editingNote.tags || []);
      setHasUnsavedChanges(false);
      setLastSavedTime(editingNote.updatedAt ? new Date(editingNote.updatedAt) : null);
    }
  }, [editingNote]);

  // Track unsaved modifications
  const handleContentChange = (e) => {
    setContent(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleFavoriteToggle = () => {
    setFavorite(prev => !prev);
    setHasUnsavedChanges(true);
  };

  // Save handler
  const handleSave = useCallback(async () => {
    if (!title.trim() && !content.trim()) return;
    setIsSaving(true);
    try {
      const noteData = {
        title: title.trim() || 'Untitled Note',
        category,
        content,
        favorite,
        tags
      };

      if (editingNote?.id) {
        await updateNote(editingNote.id, noteData);
      } else {
        const created = await createNote(noteData);
        if (created?.id && editingNote) {
          editingNote.id = created.id;
        }
      }

      setHasUnsavedChanges(false);
      setLastSavedTime(new Date());
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setIsSaving(false);
    }
  }, [title, category, content, favorite, tags, editingNote, updateNote, createNote]);

  // Keyboard shortcut Ctrl+S or Cmd+S
  useEffect(() => {
    if (!isEditorOpen) return;
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCloseRequest();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditorOpen, handleSave, hasUnsavedChanges]);

  const handleCloseRequest = () => {
    if (hasUnsavedChanges) {
      setShowExitConfirm(true);
    } else {
      closeEditor();
    }
  };

  // Toolbar action helpers
  const insertText = (before, after = '', defaultPlaceholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultPlaceholder;
    const replacement = before + selectedText + after;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    setHasUnsavedChanges(true);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const handleInsertHeading = (level) => {
    const hashes = '#'.repeat(level) + ' ';
    insertText(hashes, '', `Heading ${level}`);
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = newTagInput.trim().replace(/^#/, '');
      if (trimmed && !tags.includes(trimmed)) {
        setTags(prev => [...prev, trimmed]);
        setHasUnsavedChanges(true);
      }
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(prev => prev.filter(t => t !== tagToRemove));
    setHasUnsavedChanges(true);
  };

  const handleExportMarkdown = () => {
    const filename = `${(title.trim() || 'Untitled_Note').replace(/\s+/g, '_')}.md`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isEditorOpen) return null;

  const stats = getDocumentStats(content);
  const previewHtml = markdownToHtml(content);

  return (
    <div className="editor-overlay">
      <div className="editor-modal glass-panel">
        {/* Editor Top Bar */}
        <div className="editor-header">
          <input
            type="text"
            className="editor-title-input"
            placeholder="Note Title..."
            value={title}
            onChange={handleTitleChange}
            autoFocus
          />

          <div className="editor-header-actions">
            <button
              className={`favorite-btn ${favorite ? 'is-fav' : ''}`}
              onClick={handleFavoriteToggle}
              title={favorite ? 'Starred' : 'Star this note'}
            >
              <Star 
                size={18} 
                fill={favorite ? '#F59E0B' : 'transparent'} 
                stroke={favorite ? '#F59E0B' : '#64748B'} 
              />
            </button>

            <button
              className="glass-button glass-button-secondary"
              onClick={handleExportMarkdown}
              title="Download Markdown file"
            >
              <Download size={14} />
              <span>Export</span>
            </button>

            <button
              className="glass-button glass-button-primary"
              onClick={handleSave}
              disabled={isSaving}
              title="Save Note (Ctrl + S)"
            >
              <Save size={14} />
              <span>{isSaving ? 'Saving...' : 'Save Note'}</span>
            </button>

            <button 
              className="close-editor-btn"
              onClick={handleCloseRequest}
              title="Close editor"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Metadata Controls Bar */}
        <div className="editor-meta-bar">
          <div className="meta-item">
            <span className="meta-label">Category:</span>
            <select
              className="glass-input meta-category-select"
              value={category}
              onChange={handleCategoryChange}
            >
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="meta-item tags-wrap">
            <span className="meta-label">Tags:</span>
            <div className="tags-chips-list">
              {tags.map(tag => (
                <span key={tag} className="editor-tag-chip">
                  #{tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)}>×</button>
                </span>
              ))}
              <input
                type="text"
                placeholder="Add tag and press Enter..."
                className="meta-tag-input"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="editor-view-modes">
            <button
              className={`mode-btn ${editorMode === 'edit' ? 'active' : ''}`}
              onClick={() => setEditorMode('edit')}
              title="Write mode only"
            >
              <Edit3 size={14} />
              <span>Write</span>
            </button>
            <button
              className={`mode-btn ${editorMode === 'split' ? 'active' : ''}`}
              onClick={() => setEditorMode('split')}
              title="Split Write & Preview"
            >
              <Columns size={14} />
              <span>Split</span>
            </button>
            <button
              className={`mode-btn ${editorMode === 'preview' ? 'active' : ''}`}
              onClick={() => setEditorMode('preview')}
              title="Live Preview only"
            >
              <Eye size={14} />
              <span>Preview</span>
            </button>
          </div>
        </div>

        {/* Formatting Toolbar */}
        {(editorMode === 'edit' || editorMode === 'split') && (
          <div className="editor-toolbar">
            <button 
              type="button" 
              className="toolbar-btn" 
              onClick={() => insertText('**', '**', 'bold text')} 
              title="Bold"
            >
              <Bold size={15} />
            </button>
            <button 
              type="button" 
              className="toolbar-btn" 
              onClick={() => insertText('*', '*', 'italic text')} 
              title="Italic"
            >
              <Italic size={15} />
            </button>

            <div className="toolbar-divider" />

            <button 
              type="button" 
              className="toolbar-btn" 
              onClick={() => handleInsertHeading(1)} 
              title="Heading 1"
            >
              <Heading1 size={15} />
            </button>
            <button 
              type="button" 
              className="toolbar-btn" 
              onClick={() => handleInsertHeading(2)} 
              title="Heading 2"
            >
              <Heading2 size={15} />
            </button>
            <button 
              type="button" 
              className="toolbar-btn" 
              onClick={() => handleInsertHeading(3)} 
              title="Heading 3"
            >
              <Heading3 size={15} />
            </button>

            <div className="toolbar-divider" />

            <button 
              type="button" 
              className="toolbar-btn" 
              onClick={() => insertText('- ', '', 'List item')} 
              title="Bullet List"
            >
              <List size={15} />
            </button>
            <button 
              type="button" 
              className="toolbar-btn" 
              onClick={() => insertText('1. ', '', 'Numbered item')} 
              title="Numbered List"
            >
              <ListOrdered size={15} />
            </button>
            <button 
              type="button" 
              className="toolbar-btn" 
              onClick={() => insertText('- [ ] ', '', 'Task item')} 
              title="Checklist"
            >
              <CheckSquare size={15} />
            </button>

            <div className="toolbar-divider" />

            <button 
              type="button" 
              className="toolbar-btn" 
              onClick={() => insertText('> ', '', 'Quoted thought')} 
              title="Blockquote"
            >
              <Quote size={15} />
            </button>
            <button 
              type="button" 
              className="toolbar-btn" 
              onClick={() => insertText('```\n', '\n```', 'code here')} 
              title="Code Block"
            >
              <Code size={15} />
            </button>
            <button 
              type="button" 
              className="toolbar-btn" 
              onClick={() => insertText('[', '](https://example.com)', 'Link text')} 
              title="Insert Link"
            >
              <Link size={15} />
            </button>
            <button 
              type="button" 
              className="toolbar-btn" 
              onClick={() => insertText('\n---\n')} 
              title="Horizontal Divider"
            >
              <Minus size={15} />
            </button>
          </div>
        )}

        {/* Editor Body: Textarea & Preview */}
        <div className="editor-body-container">
          {(editorMode === 'edit' || editorMode === 'split') && (
            <textarea
              ref={textareaRef}
              className="editor-textarea"
              placeholder="Start writing in Markdown format..."
              value={content}
              onChange={handleContentChange}
            />
          )}

          {(editorMode === 'preview' || editorMode === 'split') && (
            <div className="editor-preview-container">
              {content.trim() ? (
                <div 
                  className="md-preview"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              ) : (
                <div className="empty-preview-placeholder">
                  Markdown preview will render live here...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Bar with telemetry & save status */}
        <div className="editor-footer">
          <div className="footer-stats-left">
            <span>{stats.words} words</span>
            <span>•</span>
            <span>{stats.characters} chars</span>
            <span>•</span>
            <span>{stats.readingTime} min read</span>
          </div>

          <div className="footer-status-right">
            {hasUnsavedChanges ? (
              <span className="status-unsaved">
                <AlertCircle size={13} />
                <span>Unsaved changes</span>
              </span>
            ) : (
              <span className="status-synced">
                <CheckCircle2 size={13} />
                <span>
                  {lastSavedTime ? `Saved (${lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : 'Saved to Drive'}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation modal for unsaved changes */}
      {showExitConfirm && (
        <ConfirmDialog
          title="Discard unsaved changes?"
          message="You have unsaved changes in this note. If you close without saving, these changes will be lost."
          confirmText="Discard Changes"
          cancelText="Keep Editing"
          isDanger={true}
          onConfirm={() => {
            setShowExitConfirm(false);
            closeEditor();
          }}
          onCancel={() => setShowExitConfirm(false)}
        />
      )}
    </div>
  );
}
