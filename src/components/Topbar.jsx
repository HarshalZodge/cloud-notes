import React, { useRef, useEffect } from 'react';
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  RotateCw, 
  CheckCircle2, 
  CloudOff, 
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import { useNotes } from '../hooks/useNotes.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { formatRelativeTime } from '../utils/date.js';

export function Topbar({ onOpenSetupGuide }) {
  const { authStatus, isOnline } = useAuth();
  const {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    allCategories,
    viewMode,
    changeViewMode,
    sortBy,
    setSortBy,
    syncStatus,
    syncError,
    lastSyncedAt,
    refreshNotes
  } = useNotes();

  const searchInputRef = useRef(null);

  // Keyboard shortcut Ctrl+K or Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="topbar-header glass-panel">
      {/* Search Input Box */}
      <div className="search-box-wrapper">
        <Search size={16} className="search-icon" />
        <input
          ref={searchInputRef}
          type="text"
          className="search-input"
          placeholder="Search notes, categories, or keywords... (Ctrl + K)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            className="search-clear-btn" 
            onClick={() => setSearchQuery('')}
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="topbar-actions-group">
        {/* Category Filter */}
        <div className="select-wrapper">
          <SlidersHorizontal size={14} className="select-icon" />
          <select 
            className="topbar-select"
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            aria-label="Filter notes by category"
          >
            <option value="All">All Categories</option>
            {allCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Sort Selector */}
        <div className="select-wrapper">
          <select
            className="topbar-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort notes"
          >
            <option value="recent">Recently Modified</option>
            <option value="created">Date Created</option>
            <option value="alphabetical">Title (A-Z)</option>
          </select>
        </div>

        {/* Grid vs List View Toggle */}
        <div className="view-mode-toggle glass-panel-subtle">
          <button
            className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => changeViewMode('grid')}
            title="Grid view"
          >
            <LayoutGrid size={15} />
          </button>
          <button
            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => changeViewMode('list')}
            title="List view"
          >
            <List size={15} />
          </button>
        </div>

        {/* Live Sync Status Indicator Pill */}
        <div 
          className={`sync-status-indicator sync-${syncStatus}`}
          title={
            syncError || 
            (lastSyncedAt ? `Last synced ${formatRelativeTime(lastSyncedAt)}` : 'Google Drive Storage')
          }
        >
          {syncStatus === 'syncing' && (
            <>
              <RotateCw size={13} className="spin-animation" />
              <span>Syncing...</span>
            </>
          )}
          {syncStatus === 'saved' && (
            <>
              <CheckCircle2 size={13} className="text-success" />
              <span>Drive Synced</span>
            </>
          )}
          {syncStatus === 'idle' && (
            <>
              <CheckCircle2 size={13} className="text-muted" />
              <span>{authStatus === 'demo' ? 'Demo Synced' : 'Ready'}</span>
            </>
          )}
          {syncStatus === 'reconnecting' && (
            <>
              <RotateCw size={13} className="spin-animation text-warning" />
              <span>Reconnecting...</span>
            </>
          )}
          {syncStatus === 'offline' && (
            <>
              <CloudOff size={13} className="text-warning" />
              <span>Offline</span>
            </>
          )}
          {syncStatus === 'error' && (
            <>
              <AlertTriangle size={13} className="text-danger" />
              <span>Sync Error</span>
            </>
          )}
        </div>

        {/* Manual Refresh Button */}
        <button 
          className="topbar-icon-button"
          onClick={refreshNotes}
          title="Refresh notes from Google Drive"
        >
          <RotateCw size={16} className={syncStatus === 'syncing' ? 'spin-animation' : ''} />
        </button>

        {/* Setup Guide Button */}
        <button
          className="topbar-icon-button"
          onClick={onOpenSetupGuide}
          title="Google Cloud Setup Guide & Viva Documentation"
        >
          <HelpCircle size={16} />
        </button>
      </div>
    </header>
  );
}
