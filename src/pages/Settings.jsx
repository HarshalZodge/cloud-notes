import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Key, 
  ExternalLink, 
  HardDrive, 
  User, 
  ShieldCheck, 
  RotateCw, 
  Check, 
  Info, 
  LogOut,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useNotes } from '../hooks/useNotes.jsx';
import { resetDemoNotes } from '../services/demoData.js';

export function Settings({ onOpenSetupGuide }) {
  const { 
    user, 
    authStatus, 
    signOut, 
    clientId, 
    updateClientId, 
    reconnectGoogle,
    enterDemoMode
  } = useAuth();
  const { folderId, storageInfo, refreshNotes, showToast } = useNotes();

  const [clientIdInput, setClientIdInput] = useState(clientId || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveClientId = (e) => {
    e.preventDefault();
    updateClientId(clientIdInput.trim());
    setSaveSuccess(true);
    showToast('Client ID updated successfully', 'success');
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleResetDemoData = () => {
    resetDemoNotes();
    refreshNotes();
    showToast('Demo notes reset to defaults', 'info');
  };

  return (
    <div className="settings-page-container">
      <div className="settings-header glass-panel">
        <h2 className="settings-title">
          <SettingsIcon size={20} className="text-primary" />
          <span>Application Settings</span>
        </h2>
        <span className="settings-subtitle">
          Manage your Google authentication, Drive folder connection, and application preferences.
        </span>
      </div>

      <div className="settings-sections-list">
        {/* Google Account Profile Section */}
        <div className="settings-card glass-panel">
          <div className="settings-card-header">
            <User size={18} className="text-primary" />
            <h3>Google Account & Authentication</h3>
          </div>
          <div className="settings-card-body">
            <div className="profile-detail-row">
              {user?.picture ? (
                <img src={user.picture} alt={user.name || 'User'} className="settings-avatar" />
              ) : (
                <div className="settings-avatar-placeholder">
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="profile-detail-text">
                <span className="profile-name">{user?.name || 'Guest User'}</span>
                <span className="profile-email">{user?.email || 'Not connected'}</span>
                <span className="profile-badge">
                  {authStatus === 'authenticated' ? 'Google Account Connected' : 'Interactive Demo Session'}
                </span>
              </div>
            </div>

            <div className="settings-actions-row">
              {authStatus === 'authenticated' && (
                <button 
                  className="glass-button glass-button-secondary"
                  onClick={reconnectGoogle}
                >
                  <RotateCw size={14} />
                  <span>Renew Authorization</span>
                </button>
              )}
              
              <button 
                className="glass-button glass-button-danger"
                onClick={signOut}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Google Drive Connection Section */}
        <div className="settings-card glass-panel">
          <div className="settings-card-header">
            <HardDrive size={18} className="text-primary" />
            <h3>Google Drive Storage Backend</h3>
          </div>
          <div className="settings-card-body">
            <div className="info-grid">
              <div className="info-tile">
                <span className="info-tile-label">Target Folder</span>
                <span className="info-tile-val"><code>CloudNotes/</code></span>
              </div>
              <div className="info-tile">
                <span className="info-tile-label">Drive Folder ID</span>
                <span className="info-tile-val">
                  {folderId ? <code>{folderId}</code> : 'Will create on first note'}
                </span>
              </div>
              <div className="info-tile">
                <span className="info-tile-label">Storage Quota</span>
                <span className="info-tile-val">
                  {storageInfo ? `${storageInfo.usageFormatted} / ${storageInfo.limitFormatted}` : '15 GB Free Tier'}
                </span>
              </div>
              <div className="info-tile">
                <span className="info-tile-label">OAuth Scope</span>
                <span className="info-tile-val"><code>drive.file</code> (Least privilege)</span>
              </div>
            </div>

            {folderId && (
              <div style={{ marginTop: '16px' }}>
                <a
                  href={`https://drive.google.com/drive/folders/${folderId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-button glass-button-secondary"
                >
                  <FolderOpen size={14} />
                  <span>Open CloudNotes Folder in Google Drive</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Google OAuth Client ID Configuration */}
        <div className="settings-card glass-panel">
          <div className="settings-card-header">
            <Key size={18} className="text-primary" />
            <h3>Google Cloud OAuth 2.0 Client ID</h3>
          </div>
          <div className="settings-card-body">
            <p className="settings-desc-text">
              The Google Client ID identifies this web application to Google's OAuth 2.0 service. A public browser client ID is safe to store in the frontend and is not a private secret.
            </p>

            <form onSubmit={handleSaveClientId} className="settings-form-row">
              <input
                type="text"
                className="glass-input settings-client-id-input"
                placeholder="Paste OAuth Client ID..."
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
              />
              <button type="submit" className="glass-button glass-button-primary">
                {saveSuccess ? <><Check size={14} /> Saved!</> : 'Save Client ID'}
              </button>
            </form>

            <div style={{ marginTop: '12px' }}>
              <button 
                type="button" 
                className="guide-link-btn"
                onClick={onOpenSetupGuide}
              >
                <Info size={14} />
                <span>View Google Cloud Console Setup Instructions & Whitelisting</span>
              </button>
            </div>
          </div>
        </div>

        {/* Demo Mode Management */}
        <div className="settings-card glass-panel">
          <div className="settings-card-header">
            <ShieldCheck size={18} className="text-primary" />
            <h3>Demo Environment & Sandbox</h3>
          </div>
          <div className="settings-card-body">
            <p className="settings-desc-text">
              Demo mode stores sample notes in a local sandbox to allow evaluating CloudNotes without needing a Google account. Demo notes are never uploaded to Google Drive.
            </p>
            <div className="settings-actions-row">
              <button 
                className="glass-button glass-button-secondary"
                onClick={handleResetDemoData}
              >
                Reset Demo Notes to Default
              </button>
              {authStatus !== 'demo' && (
                <button 
                  className="glass-button glass-button-secondary"
                  onClick={enterDemoMode}
                >
                  Switch to Demo Mode
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
