import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth.jsx';
import { 
  listDriveNotes, 
  createDriveNote, 
  updateDriveNote, 
  trashDriveNote, 
  restoreDriveNote, 
  permanentlyDeleteDriveNote,
  getOrCreateNotesFolder,
  getDriveStorageInfo 
} from '../services/googleDrive.js';
import { 
  getDemoNotes, 
  saveDemoNotes 
} from '../services/demoData.js';

const NotesContext = createContext(null);

const DEFAULT_CATEGORIES = ['Study', 'Work', 'Personal', 'Ideas', 'Projects', 'Travel'];

export function NotesProvider({ children }) {
  const { authStatus, accessToken, isOnline, isTokenExpired } = useAuth();
  
  const [notes, setNotes] = useState([]);
  const [trashedNotes, setTrashedNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'saved' | 'reconnecting' | 'offline' | 'error'
  const [syncError, setSyncError] = useState(null);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [folderId, setFolderId] = useState(null);
  const [storageInfo, setStorageInfo] = useState(null);

  // Navigation & Filtering State
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'my-notes' | 'favorites' | 'categories' | 'trash' | 'settings'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('cloudnotes_view_mode') || 'grid');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'alphabetical' | 'created'

  // Custom user categories added in session
  const [customCategories, setCustomCategories] = useState(() => {
    try {
      const stored = localStorage.getItem('cloudnotes_custom_categories');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Editor Modal / Drawer State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  // Toast Notification Trigger
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    setToast({ message, type, id: Date.now() });
    if (type !== 'error') {
      setTimeout(() => {
        setToast((current) => (current && current.id === toast?.id ? null : current));
      }, duration);
    }
  }, [toast]);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  // Update sync status on offline
  useEffect(() => {
    if (!isOnline) {
      setSyncStatus('offline');
    } else if (syncStatus === 'offline') {
      setSyncStatus('idle');
    }
  }, [isOnline, syncStatus]);

  // Load notes when auth status changes
  const fetchNotes = useCallback(async () => {
    if (!isOnline) {
      setSyncStatus('offline');
      setIsLoading(false);
      return;
    }

    if (authStatus === 'demo') {
      setIsLoading(true);
      setSyncStatus('syncing');
      setTimeout(() => {
        const demoList = getDemoNotes();
        setNotes(demoList.filter(n => !n.trashed));
        setTrashedNotes(demoList.filter(n => n.trashed));
        setIsLoading(false);
        setSyncStatus('saved');
        setLastSyncedAt(new Date());
        setStorageInfo({
          usageFormatted: '184 KB',
          limitFormatted: 'Demo Storage (Local)',
          percentage: 2
        });
      }, 400);
      return;
    }

    if (authStatus === 'authenticated' && accessToken) {
      if (isTokenExpired) {
        setSyncStatus('reconnecting');
        return;
      }

      setIsLoading(true);
      setSyncStatus('syncing');
      setSyncError(null);

      try {
        const folder = await getOrCreateNotesFolder(accessToken);
        setFolderId(folder);

        const fetched = await listDriveNotes(accessToken, false);
        setNotes(fetched);

        // Also fetch storage info if permitted
        const quota = await getDriveStorageInfo(accessToken);
        if (quota) {
          setStorageInfo(quota);
        }

        setSyncStatus('saved');
        setLastSyncedAt(new Date());
      } catch (err) {
        console.error('Failed to load notes from Google Drive:', err);
        setSyncStatus('error');
        setSyncError(err.message || 'Failed to load notes from Google Drive.');
        showToast('Drive sync failed: ' + (err.message || 'Check connection'), 'error');
      } finally {
        setIsLoading(false);
      }
    } else {
      setNotes([]);
      setTrashedNotes([]);
      setIsLoading(false);
      setSyncStatus('idle');
    }
  }, [authStatus, accessToken, isOnline, isTokenExpired, showToast]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // View mode persistence
  const changeViewMode = useCallback((mode) => {
    setViewMode(mode);
    localStorage.setItem('cloudnotes_view_mode', mode);
  }, []);

  // Category Management
  const addCustomCategory = useCallback((categoryName) => {
    const trimmed = categoryName.trim();
    if (!trimmed) return;
    setCustomCategories(prev => {
      if (prev.includes(trimmed)) return prev;
      const updated = [...prev, trimmed];
      localStorage.setItem('cloudnotes_custom_categories', JSON.stringify(updated));
      return updated;
    });
    showToast(`Category "${trimmed}" added`, 'success');
  }, [showToast]);

  const allCategories = useMemo(() => {
    const set = new Set([...DEFAULT_CATEGORIES, ...customCategories]);
    notes.forEach(n => {
      if (n.category) set.add(n.category);
    });
    return Array.from(set);
  }, [customCategories, notes]);

  // Note CRUD Operations
  const createNote = useCallback(async (noteData) => {
    setSyncStatus('syncing');
    try {
      if (authStatus === 'demo') {
        const newDemo = {
          id: 'demo_' + Date.now(),
          title: noteData.title || 'Untitled Note',
          category: noteData.category || 'General',
          favorite: Boolean(noteData.favorite),
          trashed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          content: noteData.content || '',
          tags: noteData.tags || []
        };
        const updated = [newDemo, ...notes];
        setNotes(updated);
        saveDemoNotes([...updated, ...trashedNotes]);
        setSyncStatus('saved');
        setLastSyncedAt(new Date());
        showToast('Note created successfully', 'success');
        return newDemo;
      }

      if (authStatus === 'authenticated' && accessToken) {
        const created = await createDriveNote(accessToken, noteData);
        setNotes(prev => [created, ...prev]);
        setSyncStatus('saved');
        setLastSyncedAt(new Date());
        showToast('Saved to Google Drive', 'success');
        return created;
      }
    } catch (err) {
      console.error('Create note failed:', err);
      setSyncStatus('error');
      setSyncError(err.message);
      showToast('Error creating note: ' + err.message, 'error');
      throw err;
    }
  }, [authStatus, accessToken, notes, trashedNotes, showToast]);

  const updateNote = useCallback(async (id, noteData) => {
    setSyncStatus('syncing');
    try {
      if (authStatus === 'demo') {
        const updated = notes.map(n => {
          if (n.id === id) {
            return {
              ...n,
              ...noteData,
              updatedAt: new Date().toISOString()
            };
          }
          return n;
        });
        setNotes(updated);
        saveDemoNotes([...updated, ...trashedNotes]);
        setSyncStatus('saved');
        setLastSyncedAt(new Date());
        showToast('Note updated', 'success');
        return;
      }

      if (authStatus === 'authenticated' && accessToken) {
        const updated = await updateDriveNote(accessToken, id, noteData);
        setNotes(prev => prev.map(n => n.id === id ? updated : n));
        setSyncStatus('saved');
        setLastSyncedAt(new Date());
        showToast('Changes saved to Drive', 'success');
        return updated;
      }
    } catch (err) {
      console.error('Update note failed:', err);
      setSyncStatus('error');
      setSyncError(err.message);
      showToast('Error saving note to Drive: ' + err.message, 'error');
      throw err;
    }
  }, [authStatus, accessToken, notes, trashedNotes, showToast]);

  const toggleFavorite = useCallback(async (id) => {
    const target = notes.find(n => n.id === id);
    if (!target) return;
    const newFav = !target.favorite;
    
    // Optimistic UI update
    setNotes(prev => prev.map(n => n.id === id ? { ...n, favorite: newFav } : n));

    try {
      if (authStatus === 'demo') {
        const updated = notes.map(n => n.id === id ? { ...n, favorite: newFav } : n);
        saveDemoNotes([...updated, ...trashedNotes]);
        showToast(newFav ? 'Added to Favorites' : 'Removed from Favorites', 'info');
        return;
      }

      if (authStatus === 'authenticated' && accessToken) {
        await updateDriveNote(accessToken, id, {
          title: target.title,
          category: target.category,
          content: target.content,
          favorite: newFav,
          createdAt: target.createdAt,
          tags: target.tags
        });
        showToast(newFav ? 'Added to Favorites in Drive' : 'Removed from Favorites in Drive', 'info');
      }
    } catch (err) {
      // Revert on failure
      setNotes(prev => prev.map(n => n.id === id ? { ...n, favorite: !newFav } : n));
      showToast('Failed to update favorite status: ' + err.message, 'error');
    }
  }, [authStatus, accessToken, notes, trashedNotes, showToast]);

  const trashNote = useCallback(async (id) => {
    const target = notes.find(n => n.id === id);
    if (!target) return;

    // Optimistic remove from active notes
    setNotes(prev => prev.filter(n => n.id !== id));
    setTrashedNotes(prev => [{ ...target, trashed: true }, ...prev]);

    try {
      if (authStatus === 'demo') {
        const all = getDemoNotes().map(n => n.id === id ? { ...n, trashed: true } : n);
        saveDemoNotes(all);
        showToast(`Moved "${target.title}" to Trash`, 'info');
        return;
      }

      if (authStatus === 'authenticated' && accessToken) {
        await trashDriveNote(accessToken, id);
        showToast(`Moved "${target.title}" to Drive Trash`, 'info');
      }
    } catch (err) {
      // Revert on failure
      setNotes(prev => [target, ...prev]);
      setTrashedNotes(prev => prev.filter(n => n.id !== id));
      showToast('Failed to trash note: ' + err.message, 'error');
    }
  }, [authStatus, accessToken, notes, showToast]);

  const restoreNote = useCallback(async (id) => {
    const target = trashedNotes.find(n => n.id === id);
    if (!target) return;

    setTrashedNotes(prev => prev.filter(n => n.id !== id));
    setNotes(prev => [{ ...target, trashed: false }, ...prev]);

    try {
      if (authStatus === 'demo') {
        const all = getDemoNotes().map(n => n.id === id ? { ...n, trashed: false } : n);
        saveDemoNotes(all);
        showToast(`Restored "${target.title}"`, 'success');
        return;
      }

      if (authStatus === 'authenticated' && accessToken) {
        await restoreDriveNote(accessToken, id);
        showToast(`Restored "${target.title}" from Drive Trash`, 'success');
      }
    } catch (err) {
      setTrashedNotes(prev => [target, ...prev]);
      setNotes(prev => prev.filter(n => n.id !== id));
      showToast('Failed to restore note: ' + err.message, 'error');
    }
  }, [authStatus, accessToken, trashedNotes, showToast]);

  const deletePermanently = useCallback(async (id) => {
    const target = trashedNotes.find(n => n.id === id) || notes.find(n => n.id === id);
    setTrashedNotes(prev => prev.filter(n => n.id !== id));
    setNotes(prev => prev.filter(n => n.id !== id));

    try {
      if (authStatus === 'demo') {
        const all = getDemoNotes().filter(n => n.id !== id);
        saveDemoNotes(all);
        showToast('Permanently deleted', 'info');
        return;
      }

      if (authStatus === 'authenticated' && accessToken) {
        await permanentlyDeleteDriveNote(accessToken, id);
        showToast('Permanently deleted from Google Drive', 'info');
      }
    } catch (err) {
      showToast('Failed to delete note: ' + err.message, 'error');
    }
  }, [authStatus, accessToken, trashedNotes, notes, showToast]);

  // Filtered & Sorted Notes computation
  const filteredNotes = useMemo(() => {
    let result = [...notes];

    // Tab filter
    if (activeTab === 'favorites') {
      result = result.filter(n => n.favorite);
    } else if (activeTab === 'categories' && activeCategory !== 'All') {
      result = result.filter(n => n.category?.toLowerCase() === activeCategory.toLowerCase());
    }

    // Category filter dropdown/chips
    if (activeCategory !== 'All') {
      result = result.filter(n => n.category?.toLowerCase() === activeCategory.toLowerCase());
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(n => 
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.content && n.content.toLowerCase().includes(q)) ||
        (n.category && n.category.toLowerCase().includes(q)) ||
        (n.tags && n.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      }
      if (sortBy === 'created') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === 'alphabetical') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });

    return result;
  }, [notes, activeTab, activeCategory, searchQuery, sortBy]);

  // Statistics derivation
  const stats = useMemo(() => {
    const totalNotes = notes.length;
    const favoriteCount = notes.filter(n => n.favorite).length;
    const categoryCount = allCategories.length;
    return {
      totalNotes,
      favoriteCount,
      categoryCount,
      driveStatus: authStatus === 'authenticated' ? 'Connected' : (authStatus === 'demo' ? 'Demo Mode' : 'Not Connected')
    };
  }, [notes, allCategories, authStatus]);

  // Editor helpers
  const openNewNote = useCallback((initialCategory = 'General') => {
    setEditingNote({
      id: null,
      title: '',
      category: initialCategory !== 'All' ? initialCategory : 'General',
      content: '',
      favorite: false,
      tags: []
    });
    setIsEditorOpen(true);
  }, []);

  const openEditNote = useCallback((note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    setIsEditorOpen(false);
    setEditingNote(null);
  }, []);

  return (
    <NotesContext.Provider
      value={{
        notes,
        trashedNotes,
        filteredNotes,
        isLoading,
        syncStatus,
        syncError,
        lastSyncedAt,
        folderId,
        storageInfo,
        stats,
        // Navigation & Filters
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        activeCategory,
        setActiveCategory,
        allCategories,
        addCustomCategory,
        viewMode,
        changeViewMode,
        sortBy,
        setSortBy,
        // CRUD
        createNote,
        updateNote,
        trashNote,
        restoreNote,
        deletePermanently,
        toggleFavorite,
        refreshNotes: fetchNotes,
        // Editor
        isEditorOpen,
        editingNote,
        openNewNote,
        openEditNote,
        closeEditor,
        // Toast
        toast,
        showToast,
        dismissToast
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}
