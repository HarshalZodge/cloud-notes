import React from 'react';
import { 
  Plus, 
  FileText, 
  Search, 
  Sparkles, 
  Layers, 
  Clock, 
  Filter 
} from 'lucide-react';
import { HeroSection } from '../components/HeroSection.jsx';
import { StatCardGrid } from '../components/StatCard.jsx';
import { NoteCard } from '../components/NoteCard.jsx';
import { RightPanel } from '../components/RightPanel.jsx';
import { useNotes } from '../hooks/useNotes.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

export function Dashboard({ onOpenCategoryModal, onOpenSettings }) {
  const { 
    filteredNotes, 
    isLoading, 
    activeTab, 
    searchQuery, 
    activeCategory, 
    openNewNote, 
    viewMode,
    notes
  } = useNotes();
  const { authStatus } = useAuth();

  const getSectionTitle = () => {
    if (searchQuery.trim()) {
      return `Search Results for "${searchQuery}"`;
    }
    if (activeTab === 'favorites') {
      return 'Favorite Notes';
    }
    if (activeCategory !== 'All') {
      return `${activeCategory} Notes`;
    }
    return 'Recent Notes';
  };

  return (
    <div className="dashboard-grid-layout">
      {/* Main Column */}
      <main className="dashboard-main-column">
        {/* Hero Section */}
        <HeroSection />

        {/* 4 Summary Stat Cards */}
        <StatCardGrid />

        {/* Notes Grid Section */}
        <section className="notes-list-section">
          <div className="notes-section-header">
            <div className="section-title-wrap">
              <h2 className="section-heading">{getSectionTitle()}</h2>
              <span className="section-count-badge">
                {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
              </span>
            </div>

            <div className="section-header-actions">
              <button
                className="glass-button glass-button-secondary create-shortcut-btn"
                onClick={() => openNewNote(activeCategory !== 'All' ? activeCategory : 'General')}
              >
                <Plus size={14} />
                <span>New Note</span>
              </button>
            </div>
          </div>

          {/* Loading Skeletons */}
          {isLoading ? (
            <div className={`notes-container ${viewMode === 'list' ? 'notes-container-list' : 'notes-container-grid'}`}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="note-card-skeleton glass-card">
                  <div className="skeleton-line skeleton-badge" />
                  <div className="skeleton-line skeleton-title" />
                  <div className="skeleton-line skeleton-p1" />
                  <div className="skeleton-line skeleton-p2" />
                  <div className="skeleton-line skeleton-footer" />
                </div>
              ))}
            </div>
          ) : filteredNotes.length > 0 ? (
            <div className={`notes-container ${viewMode === 'list' ? 'notes-container-list' : 'notes-container-grid'}`}>
              {filteredNotes.map((note) => (
                <NoteCard key={note.id} note={note} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="empty-state-card glass-panel">
              <div className="empty-state-icon-wrap">
                {searchQuery ? <Search size={32} /> : <FileText size={32} />}
              </div>

              <h3 className="empty-state-title">
                {searchQuery ? 'No matching notes found' : 'No notes yet.'}
              </h3>

              <p className="empty-state-message">
                {searchQuery 
                  ? `We couldn't find any notes matching "${searchQuery}". Try searching for another keyword or clear your filter.`
                  : 'Create your first note and keep your ideas organized in the cloud.'}
              </p>

              <button
                className="glass-button glass-button-primary empty-cta-btn"
                onClick={() => openNewNote(activeCategory !== 'All' ? activeCategory : 'General')}
              >
                <Plus size={16} />
                <span>Create Note</span>
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Right Column / Sidebar */}
      <RightPanel 
        onOpenCategoryModal={onOpenCategoryModal} 
        onOpenSettings={onOpenSettings} 
      />
    </div>
  );
}
