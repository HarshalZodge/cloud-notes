import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import { NotesProvider, useNotes } from './hooks/useNotes.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { Topbar } from './components/Topbar.jsx';
import { NoteEditor } from './components/NoteEditor.jsx';
import { CategoryModal } from './components/CategoryModal.jsx';
import { GoogleSetupGuideModal } from './components/GoogleSetupGuideModal.jsx';
import { ToastContainer } from './components/ToastContainer.jsx';
import { InitialLoader } from './components/InitialLoader.jsx';
import { Login } from './pages/Login.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Settings } from './pages/Settings.jsx';
import { TrashView } from './pages/TrashView.jsx';

import './styles/global.css';
import './styles/components.css';
import './styles/editor.css';

function MainAppShell() {
  const { authStatus } = useAuth();
  const { activeTab, setActiveTab } = useNotes();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState(false);

  // If user is unauthenticated, show the Login page
  if (authStatus === 'unauthenticated') {
    return (
      <div className="login-view-wrapper">
        <Login onOpenSetupGuide={() => setIsSetupGuideOpen(true)} />
        <GoogleSetupGuideModal
          isOpen={isSetupGuideOpen}
          onClose={() => setIsSetupGuideOpen(false)}
        />
        <ToastContainer />
      </div>
    );
  }

  // Render the authenticated or demo workspace
  return (
    <div className="app-container">
      {/* Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <Topbar onOpenSetupGuide={() => setIsSetupGuideOpen(true)} />

        {activeTab === 'settings' ? (
          <Settings onOpenSetupGuide={() => setIsSetupGuideOpen(true)} />
        ) : activeTab === 'trash' ? (
          <TrashView />
        ) : (
          <Dashboard 
            onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
            onOpenSettings={() => setActiveTab('settings')}
          />
        )}
      </div>

      {/* Note Editor Overlay Modal */}
      <NoteEditor />

      {/* Category Creation Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      {/* Google Setup Guide & Client ID Configuration */}
      <GoogleSetupGuideModal
        isOpen={isSetupGuideOpen}
        onClose={() => setIsSetupGuideOpen(false)}
      />

      {/* Floating Toast Notification Stack */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  const [showInitialSplash, setShowInitialSplash] = useState(true);

  return (
    <AuthProvider>
      <NotesProvider>
        {/* Ambient atmospheric background layers */}
        <div className="app-background">
          <div className="bg-glow-orb" />
        </div>

        {/* First-load Splash Animation */}
        {showInitialSplash && (
          <InitialLoader onComplete={() => setShowInitialSplash(false)} />
        )}

        <MainAppShell />
      </NotesProvider>
    </AuthProvider>
  );
}
