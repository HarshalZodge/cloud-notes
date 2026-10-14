import React from 'react';
import { 
  Plus, 
  Home, 
  FileText, 
  Star, 
  Folder, 
  Trash2, 
  HardDrive, 
  RefreshCw, 
  Settings, 
  LogOut, 
  Cloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useNotes } from '../hooks/useNotes.jsx';

export function Sidebar() {
  const { user, authStatus, signOut, reconnectGoogle } = useAuth();
  const { 
    activeTab, 
    setActiveTab, 
    openNewNote, 
    stats, 
    trashedNotes, 
    folderId,
    storageInfo,
    setActiveCategory
  } = useNotes();

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    if (tab === 'home' || tab === 'my-notes') {
      setActiveCategory('All');
    }
  };

  return (
    <aside className="sidebar-container glass-panel">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-logo-wrap">
          <svg className="brand-logo-svg" viewBox="0 0 40 40" fill="none">
            <defs>
              <linearGradient id="sbGrad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38BDF8"/>
                <stop offset="100%" stopColor="#2563EB"/>
              </linearGradient>
            </defs>
            <path d="M12 30H29C32.8 30 36 26.8 36 23C36 19.3 33.1 16.3 29.5 16C28.7 10.4 24 6.2 18.2 6.2C11.8 6.2 6.6 11.2 6.2 17.5C3.3 18.5 1.2 21.3 1.2 24.6C1.2 28.1 4.1 30 7.6 30H12Z" fill="url(#sbGrad)"/>
            <rect x="15" y="14" width="14" height="17" rx="2.5" fill="#FFFFFF" fillOpacity="0.95"/>
            <line x1="18" y1="18" x2="25" y2="18" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="18" y1="22" x2="24" y2="22" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="18" y1="26" x2="22" y2="26" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="brand-text-wrap">
          <div className="brand-title">CloudNotes</div>
          <div className="brand-tagline">Write. Sync. Anywhere.</div>
        </div>
      </div>

      {/* Primary Action: + New Note */}
      <div className="sidebar-action-wrap">
        <button 
          className="glass-button glass-button-primary new-note-btn"
          onClick={() => openNewNote('General')}
          title="Create a new note"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>New Note</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <button
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => handleNavClick('home')}
        >
          <Home size={18} />
          <span className="nav-label">Home</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'my-notes' ? 'active' : ''}`}
          onClick={() => handleNavClick('my-notes')}
        >
          <FileText size={18} />
          <span className="nav-label">My Notes</span>
          <span className="nav-badge">{stats.totalNotes}</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => handleNavClick('favorites')}
        >
          <Star size={18} />
          <span className="nav-label">Favorites</span>
          {stats.favoriteCount > 0 && (
            <span className="nav-badge accent">{stats.favoriteCount}</span>
          )}
        </button>

        <button
          className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => handleNavClick('categories')}
        >
          <Folder size={18} />
          <span className="nav-label">Categories</span>
          <span className="nav-badge">{stats.categoryCount}</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'trash' ? 'active' : ''}`}
          onClick={() => handleNavClick('trash')}
        >
          <Trash2 size={18} />
          <span className="nav-label">Trash</span>
          {trashedNotes.length > 0 && (
            <span className="nav-badge muted">{trashedNotes.length}</span>
          )}
        </button>
      </nav>

      <div className="sidebar-spacer" />

      {/* Google Drive Connection Card */}
      <div className="sidebar-drive-card glass-panel-subtle">
        <div className="drive-card-header">
          <div className="drive-logo-wrap">
            {/* Google Drive Official Colors SVG */}
            <svg viewBox="0 0 87.3 78" className="drive-svg-icon">
              <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
              <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
              <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
              <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
              <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
              <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
            </svg>
          </div>
          <div className="drive-status-info">
            <span className="drive-title">Google Drive</span>
            <div className="drive-state-row">
              {authStatus === 'authenticated' ? (
                <span className="drive-status-pill online">
                  <CheckCircle2 size={11} /> Connected
                </span>
              ) : authStatus === 'demo' ? (
                <span className="drive-status-pill demo">
                  Demo Active
                </span>
              ) : (
                <span className="drive-status-pill offline">
                  <AlertCircle size={11} /> Disconnected
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="drive-card-body">
          <div className="drive-email-text" title={user?.email || 'Not connected'}>
            {user?.email || 'No account connected'}
          </div>

          {storageInfo && (
            <div className="drive-storage-row">
              <div className="storage-label-row">
                <span>Storage</span>
                <span>{storageInfo.usageFormatted} / {storageInfo.limitFormatted}</span>
              </div>
              <div className="storage-progress-bar">
                <div 
                  className="storage-progress-fill" 
                  style={{ width: `${storageInfo.percentage}%` }}
                />
              </div>
            </div>
          )}

          {authStatus === 'authenticated' && folderId && (
            <a 
              href={`https://drive.google.com/drive/folders/${folderId}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="open-drive-folder-link"
              title="Open folder in Google Drive"
            >
              <span>Open Drive Folder</span>
              <ExternalLink size={12} />
            </a>
          )}

          {authStatus === 'authenticated' && (
            <button 
              className="reconnect-btn"
              onClick={reconnectGoogle}
              title="Renew Google Drive token authorization"
            >
              <RefreshCw size={12} /> Reconnect
            </button>
          )}
        </div>
      </div>

      {/* User Account Area */}
      <div className="sidebar-account-footer">
        <div className="user-profile-summary">
          {user?.picture ? (
            <img src={user.picture} alt={user.name || 'User'} className="user-avatar-img" />
          ) : (
            <div className="user-avatar-placeholder">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="user-text-summary">
            <span className="user-name">{user?.name || 'Guest User'}</span>
            <span className="user-role">{authStatus === 'demo' ? 'Interactive Demo' : 'Google Account'}</span>
          </div>
        </div>

        <div className="account-action-buttons">
          <button 
            className="icon-action-btn"
            onClick={() => setActiveTab('settings')}
            title="Settings"
          >
            <Settings size={16} />
          </button>
          <button 
            className="icon-action-btn danger"
            onClick={signOut}
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
