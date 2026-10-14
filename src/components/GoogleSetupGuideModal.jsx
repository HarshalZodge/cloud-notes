import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Key, 
  Check, 
  ShieldCheck, 
  Layers, 
  Terminal, 
  BookOpen, 
  Copy 
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';

export function GoogleSetupGuideModal({ isOpen, onClose }) {
  const { clientId, updateClientId, enterDemoMode } = useAuth();
  const [inputVal, setInputVal] = useState(clientId || '');
  const [copiedOrigin, setCopiedOrigin] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

  const handleCopyOrigin = () => {
    navigator.clipboard.writeText(currentOrigin);
    setCopiedOrigin(true);
    setTimeout(() => setCopiedOrigin(false), 2000);
  };

  const handleSaveClientId = (e) => {
    e.preventDefault();
    updateClientId(inputVal.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="dialog-backdrop">
      <div className="dialog-modal guide-modal glass-panel">
        <div className="dialog-header">
          <div className="dialog-icon-wrap info">
            <Key size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 className="dialog-title">Google Cloud & Drive Setup Guide</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Step-by-step instructions for OAuth 2.0 and Google Drive API v3
            </span>
          </div>
          <button className="dialog-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="dialog-body guide-body">
          {/* Active Client ID Box */}
          <div className="guide-box highlight-box">
            <h4 className="guide-box-title">
              <Key size={15} /> Your Google OAuth 2.0 Client ID
            </h4>
            <p className="guide-box-desc">
              Paste your Web Client ID below to connect your real Google Drive account. You can also specify it in <code>.env</code> as <code>VITE_GOOGLE_CLIENT_ID</code>.
            </p>

            <form onSubmit={handleSaveClientId} className="client-id-form">
              <input
                type="text"
                className="glass-input client-id-input"
                placeholder="e.g. 123456789-abcdef.apps.googleusercontent.com"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
              />
              <button type="submit" className="glass-button glass-button-primary">
                {saveSuccess ? <><Check size={14} /> Saved!</> : 'Save Client ID'}
              </button>
            </form>

            <div className="origin-copy-row">
              <span className="origin-label">Authorized JavaScript Origin to whitelist:</span>
              <code className="origin-code">{currentOrigin}</code>
              <button 
                type="button" 
                className="copy-btn" 
                onClick={handleCopyOrigin}
                title="Copy origin URL"
              >
                {copiedOrigin ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                <span>{copiedOrigin ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Quick Demo Option */}
          <div className="guide-box demo-highlight-box">
            <div className="demo-box-content">
              <strong>Need to evaluate or demonstrate right now without GCP credentials?</strong>
              <p>You can run in full <strong>Interactive Demo Mode</strong>. It provides complete mock storage with realistic notes for all categories.</p>
            </div>
            <button 
              className="glass-button glass-button-secondary"
              onClick={() => { enterDemoMode(); onClose(); }}
            >
              Launch Demo Mode
            </button>
          </div>

          {/* Step by step checklist */}
          <h4 className="guide-section-heading">Detailed GCP Setup Steps:</h4>
          
          <div className="steps-list">
            <div className="step-item">
              <div className="step-num">1</div>
              <div className="step-content">
                <strong>Create a Google Cloud Project</strong>
                <p>Go to the <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="md-link">Google Cloud Console <ExternalLink size={11} /></a> and create a new project (e.g. <code>CloudNotes-App</code>).</p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-num">2</div>
              <div className="step-content">
                <strong>Enable Google Drive API v3</strong>
                <p>Navigate to <em>APIs & Services &gt; Library</em>. Search for <strong>Google Drive API</strong> and click <strong>Enable</strong>.</p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-num">3</div>
              <div className="step-content">
                <strong>Configure OAuth Consent Screen</strong>
                <p>Navigate to <em>OAuth consent screen</em>. Select User Type <strong>External</strong>. Enter App Name (<code>CloudNotes</code>) and your developer email.</p>
                <p style={{ marginTop: '4px' }}>
                  Under <strong>Scopes</strong>, add: <code>https://www.googleapis.com/auth/drive.file</code>. (This is least-privilege: only files created by CloudNotes are accessed).
                </p>
                <p style={{ marginTop: '4px' }}>
                  Under <strong>Test users</strong>, add your personal Gmail address so you can sign in during development.
                </p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-num">4</div>
              <div className="step-content">
                <strong>Create OAuth 2.0 Client ID</strong>
                <p>Navigate to <em>APIs & Services &gt; Credentials &gt; Create Credentials &gt; OAuth client ID</em>.</p>
                <p>Application type: <strong>Web application</strong>.</p>
                <p>Authorized JavaScript origins: Add <code>{currentOrigin}</code> and your production URL (e.g., GitHub Pages).</p>
                <p>Click <strong>Create</strong> and copy the generated Client ID.</p>
              </div>
            </div>
          </div>

          {/* Viva & Architecture Quick Reference */}
          <div className="guide-box info-box">
            <h4 className="guide-box-title">
              <BookOpen size={15} /> Academic & Viva Knowledge Points
            </h4>
            <ul className="viva-bullets">
              <li><strong>SaaS vs Cloud Storage:</strong> CloudNotes is a decentralized static web application that leverages Google Drive as an external object storage backend.</li>
              <li><strong>OAuth 2.0 Token Flow:</strong> The browser obtains a short-lived Bearer access token using Google Identity Services (GIS). Secrets are never exposed in client code.</li>
              <li><strong>Least Privilege:</strong> Using <code>drive.file</code> scope guarantees that CloudNotes cannot view, modify, or delete any of your other private Drive documents.</li>
            </ul>
          </div>
        </div>

        <div className="dialog-footer">
          <button className="glass-button glass-button-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
