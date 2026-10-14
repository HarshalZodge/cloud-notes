import React from 'react';
import { Plus, Check, RefreshCw, AlertCircle, CloudOff, Sparkles } from 'lucide-react';
import { useNotes } from '../hooks/useNotes.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

export function HeroSection() {
  const { syncStatus, openNewNote } = useNotes();
  const { authStatus } = useAuth();

  const getStatusDisplay = () => {
    switch (syncStatus) {
      case 'syncing':
        return { label: 'Syncing', icon: <RefreshCw size={12} className="spin-animation" />, class: 'status-syncing' };
      case 'saved':
        return { label: 'Saved', icon: <Check size={12} />, class: 'status-saved' };
      case 'reconnecting':
        return { label: 'Reconnecting', icon: <RefreshCw size={12} className="spin-animation" />, class: 'status-reconnecting' };
      case 'offline':
        return { label: 'Offline', icon: <CloudOff size={12} />, class: 'status-offline' };
      case 'error':
        return { label: 'Error', icon: <AlertCircle size={12} />, class: 'status-error' };
      default:
        return { 
          label: authStatus === 'demo' ? 'Demo Mode' : 'Connected', 
          icon: <Check size={12} />, 
          class: 'status-connected' 
        };
    }
  };

  const status = getStatusDisplay();

  return (
    <section className="hero-section glass-panel">
      <div className="hero-content">
        <div className="hero-badge-row">
          <span className="hero-workspace-tag">
            <Sparkles size={11} className="sparkle-icon" />
            YOUR PERSONAL WORKSPACE
          </span>

          <span className={`hero-sync-pill ${status.class}`}>
            <span className="sync-pulse-dot" />
            {status.icon}
            <span>{status.label}</span>
          </span>
        </div>

        <h1 className="hero-title">
          Capture Ideas, Keep Them for Tomorrow.
        </h1>

        <p className="hero-subtitle">
          Your notes, organized and securely stored in Google Drive.
        </p>
      </div>

      <div className="hero-actions">
        <button 
          className="glass-button glass-button-primary hero-cta-btn"
          onClick={() => openNewNote('General')}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Create Note</span>
        </button>
      </div>
    </section>
  );
}
