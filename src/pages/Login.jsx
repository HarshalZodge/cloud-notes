import React, { useState } from 'react';
import { 
  Cloud, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  ExternalLink, 
  HelpCircle, 
  AlertCircle,
  Key,
  CheckCircle2,
  Lock,
  Layers,
  Terminal,
  Cpu,
  HardDrive,
  Check,
  Copy,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';

export function Login({ onOpenSetupGuide }) {
  const { signInWithGoogle, enterDemoMode, authError, clearAuthError, clientId, updateClientId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  const [customClientIdInput, setCustomClientIdInput] = useState(clientId || '');
  const [copiedOrigin, setCopiedOrigin] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

  const handleGoogleClick = () => {
    if (!clientId) {
      setShowConfigDrawer(true);
      return;
    }
    setIsSubmitting(true);
    signInWithGoogle();
    setTimeout(() => setIsSubmitting(false), 2000);
  };

  const handleSaveCustomClientId = (e) => {
    e.preventDefault();
    if (customClientIdInput.trim()) {
      updateClientId(customClientIdInput.trim());
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const handleCopyOrigin = () => {
    navigator.clipboard.writeText(currentOrigin);
    setCopiedOrigin(true);
    setTimeout(() => setCopiedOrigin(false), 2000);
  };

  return (
    <div className="commercial-login-viewport">
      {/* Top Commercial Header Bar */}
      <header className="commercial-topbar glass-panel-subtle">
        <div className="topbar-inner-container">
          <div className="topbar-brand-left">
            <div className="commercial-logo-badge">
              <svg viewBox="0 0 40 40" className="brand-svg-sm">
                <defs>
                  <linearGradient id="commGrad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#38BDF8"/>
                    <stop offset="100%" stopColor="#2563EB"/>
                  </linearGradient>
                </defs>
                <path d="M12 30H29C32.8 30 36 26.8 36 23C36 19.3 33.1 16.3 29.5 16C28.7 10.4 24 6.2 18.2 6.2C11.8 6.2 6.6 11.2 6.2 17.5C3.3 18.5 1.2 21.3 1.2 24.6C1.2 28.1 4.1 30 7.6 30H12Z" fill="url(#commGrad)"/>
                <rect x="15" y="14" width="14" height="17" rx="2.5" fill="#FFFFFF" fillOpacity="0.95"/>
                <line x1="18" y1="18" x2="25" y2="18" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round"/>
                <line x1="18" y1="22" x2="24" y2="22" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="commercial-brand-name">CloudNotes</span>
            <span className="commercial-version-badge">v2.4 Production</span>
          </div>

          <div className="topbar-controls-right">
            <div className="api-status-pill">
              <span className="live-status-dot" />
              <span>Google Drive API v3: <strong>Operational</strong></span>
            </div>

            <button 
              type="button" 
              className="topbar-nav-action-btn"
              onClick={onOpenSetupGuide}
            >
              <HelpCircle size={14} />
              <span>GCP Setup Docs</span>
            </button>

            <a 
              href="https://github.com/HarshalZodge/cloud-notes" 
              target="_blank" 
              rel="noopener noreferrer"
              className="topbar-github-link"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Commercial 2-Column Split Showcase */}
      <main className="commercial-main-wrapper">
        <div className="commercial-showcase-container">
          
          {/* Column 1: Product Showcase & Live Mock Window */}
          <section className="commercial-hero-col">
            <div className="eyebrow-pill">
              <Sparkles size={13} className="eyebrow-icon" />
              <span>DECENTRALIZED CLIENT STORAGE • ZERO DATABASE LOCK-IN</span>
            </div>

            <h1 className="commercial-hero-headline">
              Write at the speed of thought. <br />
              <span className="gradient-headline-accent">Stored natively in Google Drive.</span>
            </h1>

            <p className="commercial-hero-subheadline">
              A refined, privacy-first personal knowledge manager. Your notes live directly inside your private Google Drive as portable UTF-8 Markdown files—ensuring 100% data sovereignty with zero intermediary databases.
            </p>

            {/* Realistic Glassmorphic Product Preview Window */}
            <div className="commercial-mock-window glass-panel">
              <div className="mock-window-header">
                <div className="mock-window-controls">
                  <span className="window-dot red" />
                  <span className="window-dot yellow" />
                  <span className="window-dot green" />
                </div>
                <div className="mock-window-address">
                  <Lock size={11} className="lock-icon" />
                  <span>drive.google.com/CloudNotes/Distributed_Architecture.md</span>
                </div>
                <div className="mock-sync-badge">
                  <CheckCircle2 size={12} className="text-success" />
                  <span>Drive Synced</span>
                </div>
              </div>

              <div className="mock-window-body">
                <div className="mock-note-top">
                  <span className="mock-category-tag">Study • Cloud Computing</span>
                  <span className="mock-timestamp">Updated 2m ago</span>
                </div>

                <div className="mock-note-title">
                  # Distributed Storage & Zero-Vendor Lock-in
                </div>

                <div className="mock-note-content">
                  <p>
                    By eliminating central relational databases, <strong>CloudNotes</strong> leverages Google's OAuth 2.0 PKCE flow and Drive v3 REST API to provide seamless document sync.
                  </p>

                  <div className="mock-code-box">
                    <code>
                      GET /drive/v3/files?q='CloudNotes'+in+parents<br />
                      → Status: 200 OK (MIME: text/markdown; charset=UTF-8)
                    </code>
                  </div>

                  <div className="mock-checklist-row">
                    <span className="mock-checkbox checked">✓</span>
                    <span>Direct client-to-Drive multipart upload</span>
                  </div>
                  <div className="mock-checklist-row">
                    <span className="mock-checkbox checked">✓</span>
                    <span>Least privilege scope: <code>auth/drive.file</code></span>
                  </div>
                </div>

                <div className="mock-note-footer">
                  <div className="mock-telemetry">
                    <span>428 words</span>
                    <span>•</span>
                    <span>3 min read</span>
                    <span>•</span>
                    <span>UTF-8 Markdown</span>
                  </div>
                  <span className="mock-frontmatter-pill">YAML Frontmatter Valid</span>
                </div>
              </div>
            </div>

            {/* Enterprise Trust Grid */}
            <div className="commercial-trust-metrics">
              <div className="trust-metric-item">
                <div className="trust-metric-num">15 GB</div>
                <div className="trust-metric-desc">Free Google Drive Storage</div>
              </div>
              <div className="metric-divider" />
              <div className="trust-metric-item">
                <div className="trust-metric-num">0 ms</div>
                <div className="trust-metric-desc">Database Vendor Latency</div>
              </div>
              <div className="metric-divider" />
              <div className="trust-metric-item">
                <div className="trust-metric-num">100%</div>
                <div className="trust-metric-desc">Client-Side Data Privacy</div>
              </div>
            </div>
          </section>

          {/* Column 2: Commercial Authentication Console Card */}
          <section className="commercial-auth-col">
            <div className="commercial-auth-card glass-panel">
              
              <div className="auth-card-top-header">
                <div className="auth-brand-badge">
                  <HardDrive size={22} className="text-primary" />
                </div>
                <h2 className="auth-card-title">Sign In to Your Workspace</h2>
                <p className="auth-card-subtitle">
                  Connect your Google account to automatically synchronize your personal notes.
                </p>
              </div>

              {/* Error notification if OAuth failed */}
              {authError && (
                <div className="commercial-error-banner">
                  <AlertCircle size={16} />
                  <span className="error-message">{authError}</span>
                  <button className="error-dismiss-btn" onClick={clearAuthError}>×</button>
                </div>
              )}

              {/* Primary Action: Official Google Sign-In Button */}
              <div className="auth-actions-stack">
                <button 
                  type="button" 
                  className="commercial-google-btn"
                  onClick={handleGoogleClick}
                  disabled={isSubmitting}
                >
                  <svg className="google-icon-svg" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <div className="google-btn-text-group">
                    <span className="btn-main-text">
                      {isSubmitting ? 'Connecting...' : (clientId ? 'Continue with Google' : 'Setup Client ID & Sign In')}
                    </span>
                    <span className="btn-sub-text">Google OAuth 2.0 • Scoped to CloudNotes folder</span>
                  </div>
                  <ChevronRight size={16} className="btn-arrow" />
                </button>

                <div className="commercial-or-divider">
                  <span className="divider-line" />
                  <span className="divider-text">OR TEST THE PRODUCT</span>
                  <span className="divider-line" />
                </div>

                {/* Secondary Action: Interactive Demo Mode */}
                <button 
                  type="button" 
                  className="commercial-demo-btn glass-button"
                  onClick={enterDemoMode}
                >
                  <div className="demo-btn-left">
                    <div className="sparkle-circle-icon">
                      <Sparkles size={15} />
                    </div>
                    <div className="demo-btn-text">
                      <span className="demo-btn-title">Launch Interactive Demo Sandbox</span>
                      <span className="demo-btn-desc">Instant evaluation with 6 sample notes. No sign-in required.</span>
                    </div>
                  </div>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Google Client ID Assistant Banner */}
              <div className="auth-client-assistant glass-panel-subtle">
                <div className="assistant-header-row">
                  <div className="assistant-left">
                    <Key size={14} className={clientId ? 'text-primary' : 'text-warning'} />
                    <span className="assistant-status-title">
                      {clientId ? 'Google OAuth Client ID Active' : 'OAuth Client ID Required'}
                    </span>
                  </div>
                  <button 
                    type="button"
                    className="assistant-toggle-btn"
                    onClick={() => setShowConfigDrawer(!showConfigDrawer)}
                  >
                    {showConfigDrawer ? 'Hide Setup' : (clientId ? 'Change' : 'Configure')}
                  </button>
                </div>

                {showConfigDrawer && (
                  <form onSubmit={handleSaveCustomClientId} className="assistant-drawer-content">
                    <p className="assistant-drawer-desc">
                      Paste your Google Cloud Web Client ID below to connect your real Drive storage:
                    </p>
                    <div className="assistant-input-row">
                      <input 
                        type="text"
                        className="glass-input client-id-inline-input"
                        placeholder="your-id.apps.googleusercontent.com"
                        value={customClientIdInput}
                        onChange={(e) => setCustomClientIdInput(e.target.value)}
                      />
                      <button type="submit" className="glass-button glass-button-primary btn-sm">
                        {savedSuccess ? 'Saved!' : 'Save'}
                      </button>
                    </div>

                    <div className="assistant-origin-row">
                      <span className="origin-lbl">Whitelist origin in GCP:</span>
                      <code className="origin-val">{currentOrigin}</code>
                      <button type="button" className="copy-icon-btn" onClick={handleCopyOrigin} title="Copy Origin URL">
                        {copiedOrigin ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Enterprise Security & Privacy Guarantee */}
              <div className="commercial-security-guarantee">
                <ShieldCheck size={18} className="shield-icon" />
                <div className="security-text-wrap">
                  <strong>Enterprise Security Guarantee</strong>
                  <p>
                    CloudNotes runs entirely in your browser. We never see your password, and authorization tokens remain strictly in browser memory using least-privilege <code>drive.file</code> permissions.
                  </p>
                </div>
              </div>

              {/* 3 Pillars Summary */}
              <div className="auth-footer-features">
                <div className="mini-feature">
                  <CheckCircle2 size={13} className="text-primary" />
                  <span>100% Client-Side</span>
                </div>
                <div className="mini-feature">
                  <CheckCircle2 size={13} className="text-primary" />
                  <span>Zero Database Storage</span>
                </div>
                <div className="mini-feature">
                  <CheckCircle2 size={13} className="text-primary" />
                  <span>Open Markdown (.md)</span>
                </div>
              </div>

            </div>
          </section>

        </div>
      </main>

      {/* Commercial Footer */}
      <footer className="commercial-footer">
        <div className="footer-inner-container">
          <div className="footer-left">
            <span>© 2026 CloudNotes. Built with React 19, Vite & Google Drive API v3.</span>
          </div>

          <div className="footer-links-right">
            <button type="button" onClick={onOpenSetupGuide} className="footer-link-btn">
              Google Cloud Setup Guide
            </button>
            <span className="link-separator">•</span>
            <button type="button" onClick={enterDemoMode} className="footer-link-btn">
              Demo Sandbox
            </button>
            <span className="link-separator">•</span>
            <a 
              href="https://github.com/HarshalZodge/cloud-notes" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="footer-link-btn"
            >
              GitHub Source
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
