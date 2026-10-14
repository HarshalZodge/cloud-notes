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
  Key
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';

export function Login({ onOpenSetupGuide }) {
  const { signInWithGoogle, enterDemoMode, authError, clearAuthError, clientId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleClick = () => {
    if (!clientId) {
      onOpenSetupGuide();
      return;
    }
    setIsSubmitting(true);
    signInWithGoogle();
    setTimeout(() => setIsSubmitting(false), 2000);
  };

  return (
    <div className="login-page-container">
      <div className="login-card-wrapper glass-panel">
        {/* Brand Logo & Heading */}
        <div className="login-brand-header">
          <div className="login-logo-orb">
            <svg viewBox="0 0 48 48" className="login-logo-svg">
              <defs>
                <linearGradient id="loginGrad" x1="6" y1="8" x2="42" y2="40" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#38BDF8"/>
                  <stop offset="100%" stopColor="#2563EB"/>
                </linearGradient>
              </defs>
              <path d="M14 36H35C39.4183 36 43 32.4183 43 28C43 23.8291 39.7997 20.4074 35.7061 20.0402C34.7212 13.7317 29.2882 9 22.7 9C15.4206 9 9.47953 14.6186 9.02534 21.7828C5.64157 22.8465 3.2 25.9868 3.2 29.7C3.2 33.7317 6.46832 36 10.5 36H14Z" fill="url(#loginGrad)"/>
              <rect x="18" y="17" width="16" height="20" rx="3" fill="#FFFFFF" fillOpacity="0.95"/>
              <line x1="22" y1="22" x2="30" y2="22" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
              <line x1="22" y1="26" x2="28" y2="26" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round"/>
              <line x1="22" y1="30" x2="26" y2="30" stroke="#64748B" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          
          <h1 className="login-title">CloudNotes</h1>
          <p className="login-tagline">Write. Sync. Anywhere.</p>
          <p className="login-description">
            Your personal knowledge base, synchronized directly to your Google Drive. No intermediary databases. 100% user data sovereignty.
          </p>
        </div>

        {/* Error notification if OAuth failed */}
        {authError && (
          <div className="login-error-banner">
            <AlertCircle size={16} />
            <span className="error-message">{authError}</span>
            <button className="error-dismiss-btn" onClick={clearAuthError}>×</button>
          </div>
        )}

        {/* Authentication Actions */}
        <div className="login-actions-group">
          {/* Official Google Branding Sign-In Button */}
          <button 
            type="button" 
            className="google-signin-button"
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
            <span className="google-btn-text">
              {clientId ? 'Continue with Google' : 'Setup Google Client ID & Sign In'}
            </span>
          </button>

          {/* Interactive Demo Mode Button */}
          <button 
            type="button" 
            className="demo-mode-button glass-button"
            onClick={enterDemoMode}
          >
            <Sparkles size={16} className="sparkle-icon-accent" />
            <span>Try Interactive Demo Mode</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="login-features-grid">
          <div className="feature-item">
            <div className="feature-icon-box">
              <Cloud size={16} />
            </div>
            <div className="feature-info">
              <h4>Direct Google Drive Storage</h4>
              <p>Notes live in your personal <code>CloudNotes/</code> folder as portable Markdown files.</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon-box">
              <ShieldCheck size={16} />
            </div>
            <div className="feature-info">
              <h4>Least-Privilege Security</h4>
              <p>Requests only <code>drive.file</code> scope. Cannot view or access other Drive files.</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon-box">
              <FileText size={16} />
            </div>
            <div className="feature-info">
              <h4>Standard Markdown (.md)</h4>
              <p>Rich editing with live preview, word count, YAML frontmatter, and instant export.</p>
            </div>
          </div>
        </div>

        {/* Setup guide footer link */}
        <div className="login-footer-row">
          <button 
            type="button" 
            className="guide-link-btn"
            onClick={onOpenSetupGuide}
          >
            <Key size={13} />
            <span>Configure Google Cloud OAuth Client ID</span>
          </button>
        </div>
      </div>
    </div>
  );
}
