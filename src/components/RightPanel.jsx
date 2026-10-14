import React, { useState } from 'react';
import { 
  FolderPlus, 
  ExternalLink, 
  Plus, 
  Folder, 
  Check, 
  Settings, 
  ShieldCheck, 
  Cloud 
} from 'lucide-react';
import { useNotes } from '../hooks/useNotes.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

export function RightPanel({ onOpenCategoryModal, onOpenSettings }) {
  const { authStatus } = useAuth();
  const { 
    notes, 
    allCategories, 
    activeCategory, 
    setActiveCategory, 
    folderId, 
    openNewNote 
  } = useNotes();

  // Compute live count per category
  const categoryCounts = allCategories.reduce((acc, cat) => {
    acc[cat] = notes.filter(n => n.category?.toLowerCase() === cat.toLowerCase()).length;
    return acc;
  }, {});

  const totalNotesCount = notes.length;

  return (
    <aside className="right-panel-container">
      {/* Google Drive Connection Panel */}
      <div className="right-panel-card glass-panel">
        <div className="card-top-row">
          <div className="drive-mini-logo">
            <svg viewBox="0 0 87.3 78" className="drive-svg-icon-sm">
              <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
              <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
              <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
              <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
              <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
              <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
            </svg>
          </div>
          <div className="drive-info-title-wrap">
            <span className="drive-main-title">Your Notes in Google Drive</span>
            <span className="drive-badge-status">
              {authStatus === 'authenticated' ? 'Cloud Sync Active' : 'Demo Mode Active'}
            </span>
          </div>
        </div>

        <p className="drive-explainer-text">
          CloudNotes syncs each note as a UTF-8 Markdown (<code>.md</code>) file directly into your private Google Drive storage. No intermediate database or third-party server has access to your content.
        </p>

        {folderId ? (
          <a
            href={`https://drive.google.com/drive/folders/${folderId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-button glass-button-secondary drive-action-btn"
          >
            <ExternalLink size={14} />
            <span>Open Drive Folder</span>
          </a>
        ) : (
          <div className="folder-status-note">
            <ShieldCheck size={14} />
            <span>Folder <strong>CloudNotes</strong> will be verified upon Drive connection.</span>
          </div>
        )}
      </div>

      {/* Categories Panel */}
      <div className="right-panel-card glass-panel">
        <div className="panel-header-row">
          <div className="panel-title-group">
            <Folder size={16} className="text-primary" />
            <span className="panel-title">Categories</span>
          </div>
          <button 
            className="category-add-icon-btn"
            onClick={onOpenCategoryModal}
            title="Create new category"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="category-list">
          <button
            className={`category-item-btn ${activeCategory === 'All' ? 'active' : ''}`}
            onClick={() => setActiveCategory('All')}
          >
            <span className="category-name">All Notes</span>
            <span className="category-count">{totalNotesCount}</span>
          </button>

          {allCategories.map(cat => (
            <button
              key={cat}
              className={`category-item-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              <span className="category-name">{cat}</span>
              <span className="category-count">{categoryCounts[cat] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="right-panel-card glass-panel">
        <div className="panel-header-row">
          <span className="panel-title">Quick Actions</span>
        </div>

        <div className="quick-actions-grid">
          <button 
            className="quick-action-item"
            onClick={() => openNewNote('General')}
          >
            <Plus size={15} />
            <span>New Note</span>
          </button>

          <button 
            className="quick-action-item"
            onClick={onOpenCategoryModal}
          >
            <FolderPlus size={15} />
            <span>New Category</span>
          </button>

          {folderId && (
            <a 
              href={`https://drive.google.com/drive/folders/${folderId}`}
              target="_blank" 
              rel="noopener noreferrer" 
              className="quick-action-item"
            >
              <ExternalLink size={15} />
              <span>Drive Folder</span>
            </a>
          )}

          <button 
            className="quick-action-item"
            onClick={onOpenSettings}
          >
            <Settings size={15} />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
