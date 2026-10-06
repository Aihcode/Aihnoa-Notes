/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Tag, 
  Pin, 
  FolderLock, 
  Sparkles, 
  FileText, 
  CheckSquare, 
  Mic, 
  Palette, 
  Archive, 
  Trash2, 
  ShieldAlert, 
  RotateCcw,
  Layers,
  Inbox,
  Lock,
  Download,
  AlertTriangle
} from 'lucide-react';
import { Note, ViewFolder, ViewLayout, VaultConfig, NoteColor } from './types/note';
import { 
  loadNotes, 
  saveNote, 
  saveAllNotes, 
  deleteNotePermanent, 
  loadVaultConfig, 
  saveVaultConfig 
} from './services/storage';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { NoteCard } from './components/NoteCard';
import { NoteEditorModal } from './components/NoteEditorModal';
import { VaultManagerModal } from './components/VaultManagerModal';
import { SyncBackupModal } from './components/SyncBackupModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { triggerHaptic } from './utils/theme';

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentFolder, setCurrentFolder] = useState<ViewFolder>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewLayout, setViewLayout] = useState<ViewLayout>('grid');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Modals state
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Vault state
  const [vaultConfig, setVaultConfig] = useState<VaultConfig>({
    isVaultSetup: false,
    isUnlocked: false,
    autoLockMinutes: 5,
  });
  const [masterPassword, setMasterPassword] = useState<string>('');

  // Initial load
  useEffect(() => {
    loadNotes().then((loadedNotes) => {
      setNotes(loadedNotes);
    });

    const vConfig = loadVaultConfig();
    setVaultConfig(vConfig);

    // Dark mode class on body
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Auto-lock vault timer
  useEffect(() => {
    if (!vaultConfig.isUnlocked || vaultConfig.autoLockMinutes === 0) return;

    const timeout = setTimeout(() => {
      setVaultConfig((prev) => {
        const updated = { ...prev, isUnlocked: false };
        saveVaultConfig(updated);
        return updated;
      });
      setMasterPassword('');
    }, vaultConfig.autoLockMinutes * 60 * 1000);

    return () => clearTimeout(timeout);
  }, [vaultConfig.isUnlocked, vaultConfig.autoLockMinutes, vaultConfig.lastUnlockedAt]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes
      .filter((n) => !n.isTrash)
      .forEach((n) => {
        n.tags?.forEach((t) => tagSet.add(t));
      });
    return Array.from(tagSet).sort();
  }, [notes]);

  // Filter and search notes
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      // 1. Folder filter
      if (currentFolder === 'all') {
        if (note.isTrash || note.isArchived) return false;
      } else if (currentFolder === 'pinned') {
        if (note.isTrash || note.isArchived || !note.isPinned) return false;
      } else if (currentFolder === 'todos') {
        if (note.isTrash || note.isArchived || (!note.todos || note.todos.length === 0))
          return false;
      } else if (currentFolder === 'voice') {
        if (note.isTrash || note.isArchived || !note.audioData) return false;
      } else if (currentFolder === 'drawings') {
        if (note.isTrash || note.isArchived || !note.drawingData) return false;
      } else if (currentFolder === 'reminders') {
        if (note.isTrash || note.isArchived || !note.reminder) return false;
      } else if (currentFolder === 'vault') {
        if (note.isTrash || !note.isEncrypted) return false;
      } else if (currentFolder === 'archived') {
        if (note.isTrash || !note.isArchived) return false;
      } else if (currentFolder === 'trash') {
        if (!note.isTrash) return false;
      }

      // 2. Tag filter
      if (selectedTag && (!note.tags || !note.tags.includes(selectedTag))) {
        return false;
      }

      // 3. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = note.title?.toLowerCase().includes(q);
        const inContent = note.content?.toLowerCase().includes(q);
        const inTags = note.tags?.some((t) => t.toLowerCase().includes(q));
        const inTodos = note.todos?.some((t) => t.text.toLowerCase().includes(q));
        const inTranscript = note.audioTranscript?.toLowerCase().includes(q);
        if (!inTitle && !inContent && !inTags && !inTodos && !inTranscript) {
          return false;
        }
      }

      return true;
    });
  }, [notes, currentFolder, selectedTag, searchQuery]);

  // Pinned vs Regular separation for 'all' view
  const pinnedNotes = useMemo(() => {
    if (currentFolder !== 'all') return [];
    return filteredNotes.filter((n) => n.isPinned);
  }, [filteredNotes, currentFolder]);

  const otherNotes = useMemo(() => {
    if (currentFolder !== 'all') return filteredNotes;
    return filteredNotes.filter((n) => !n.isPinned);
  }, [filteredNotes, currentFolder]);

  // Note actions
  const handleSaveNote = useCallback(
    async (updatedNote: Note) => {
      const index = notes.findIndex((n) => n.id === updatedNote.id);
      let newNotes: Note[];
      if (index >= 0) {
        newNotes = [...notes];
        newNotes[index] = updatedNote;
      } else {
        newNotes = [updatedNote, ...notes];
      }
      setNotes(newNotes);
      await saveNote(updatedNote);
    },
    [notes]
  );

  const handleTogglePin = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const target = notes.find((n) => n.id === id);
      if (!target) return;
      const updated = { ...target, isPinned: !target.isPinned, updatedAt: Date.now() };
      handleSaveNote(updated);
    },
    [notes, handleSaveNote]
  );

  const handleToggleArchive = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const target = notes.find((n) => n.id === id);
      if (!target) return;
      const updated = { ...target, isArchived: !target.isArchived, updatedAt: Date.now() };
      handleSaveNote(updated);
    },
    [notes, handleSaveNote]
  );

  const handleDeleteToTrash = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      triggerHaptic('medium');
      const target = notes.find((n) => n.id === id);
      if (!target) return;
      const updated = { ...target, isTrash: true, updatedAt: Date.now() };
      handleSaveNote(updated);
    },
    [notes, handleSaveNote]
  );

  const handleRestoreFromTrash = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      triggerHaptic('light');
      const target = notes.find((n) => n.id === id);
      if (!target) return;
      const updated = { ...target, isTrash: false, updatedAt: Date.now() };
      handleSaveNote(updated);
    },
    [notes, handleSaveNote]
  );

  const handlePermanentDelete = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      triggerHaptic('heavy');
      if (confirm('¿Deseas eliminar permanentemente esta nota? Esta acción no se puede deshacer.')) {
        const filtered = notes.filter((n) => n.id !== id);
        setNotes(filtered);
        await deleteNotePermanent(id);
      }
    },
    [notes]
  );

  const handleEmptyTrash = async () => {
    triggerHaptic('heavy');
    if (confirm('¿Vaciar toda la papelera permanentemente?')) {
      const kept = notes.filter((n) => !n.isTrash);
      setNotes(kept);
      await saveAllNotes(kept);
    }
  };

  const handleChangeColor = useCallback(
    async (id: string, color: NoteColor, e: React.MouseEvent) => {
      e.stopPropagation();
      const target = notes.find((n) => n.id === id);
      if (!target) return;
      const updated = { ...target, color, updatedAt: Date.now() };
      handleSaveNote(updated);
    },
    [notes, handleSaveNote]
  );

  const handleToggleTodo = useCallback(
    async (noteId: string, todoId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const target = notes.find((n) => n.id === noteId);
      if (!target || !target.todos) return;

      const updatedTodos = target.todos.map((t) =>
        t.id === todoId ? { ...t, completed: !t.completed } : t
      );
      const updated = { ...target, todos: updatedTodos, updatedAt: Date.now() };
      handleSaveNote(updated);
    },
    [notes, handleSaveNote]
  );

  // Quick Creator Handlers
  const handleOpenNewNote = (type: 'note' | 'todo' | 'voice' | 'drawing' | 'encrypted' = 'note') => {
    triggerHaptic('light');
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: '',
      content: '',
      type: type === 'encrypted' ? 'rich' : type,
      todos: type === 'todo' ? [{ id: 't1', text: '', completed: false }] : [],
      tags: selectedTag ? [selectedTag] : [],
      color: 'default',
      isPinned: false,
      isArchived: false,
      isTrash: false,
      isEncrypted: type === 'encrypted' || currentFolder === 'vault',
      attachments: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setEditingNote(newNote);
    setIsEditorOpen(true);
  };

  // Import notes merge / replace handler
  const handleImportNotes = async (newNotes: Note[], mergeMode: 'merge' | 'replace') => {
    let finalNotes: Note[];
    if (mergeMode === 'replace') {
      finalNotes = newNotes;
    } else {
      const existingIds = new Set(notes.map((n) => n.id));
      const filteredIncoming = newNotes.filter((n) => !existingIds.has(n.id));
      finalNotes = [...filteredIncoming, ...notes];
    }
    setNotes(finalNotes);
    await saveAllNotes(finalNotes);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-blue-600 selection:text-white">
      {/* SIDEBAR NAVIGATION */}
      <Sidebar
        currentFolder={currentFolder}
        onSelectFolder={setCurrentFolder}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
        allTags={allTags}
        notes={notes}
        vaultConfig={vaultConfig}
        onOpenVaultModal={() => setIsVaultModalOpen(true)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* MAIN APP CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen pb-24 lg:pb-12">
        {/* TOP NAVBAR */}
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewLayout={viewLayout}
          onToggleLayout={() => setViewLayout(viewLayout === 'grid' ? 'list' : 'grid')}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          currentFolder={currentFolder}
          selectedTag={selectedTag}
          onClearTag={() => setSelectedTag(null)}
          onOpenNewNote={() => handleOpenNewNote('note')}
        />

        {/* PWA INSTALL BANNER ON MOBILE */}
        <div className="pt-2">
          <PWAInstallButton variant="banner" />
        </div>

        {/* NOTES CONTENT FEED */}
        <div className="flex-1 px-3 sm:px-6 py-4 max-w-7xl w-full mx-auto">
          {/* Trash banner with Empty Trash button */}
          {currentFolder === 'trash' && notes.some((n) => n.isTrash) && (
            <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-center justify-between text-xs text-red-800 dark:text-red-300">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span>Las notas en la papelera se conservan localmente.</span>
              </div>
              <button
                onClick={handleEmptyTrash}
                className="px-3 py-1.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition"
              >
                Vaciar Papelera
              </button>
            </div>
          )}

          {/* EMPTY STATE */}
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-blue-950/80 flex items-center justify-center text-slate-400 dark:text-slate-600 mb-4 shadow-sm">
                <Inbox className="w-10 h-10 text-blue-500/60" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
                {searchQuery
                  ? 'No se encontraron notas con esa búsqueda'
                  : currentFolder === 'pinned'
                  ? 'No tienes notas fijadas'
                  : currentFolder === 'todos'
                  ? 'No tienes listas de tareas'
                  : currentFolder === 'voice'
                  ? 'No tienes notas de voz'
                  : currentFolder === 'drawings'
                  ? 'No tienes dibujos ni bocetos'
                  : currentFolder === 'vault'
                  ? 'Tu Bóveda Cifrada de Aihnoa Notes está vacía'
                  : currentFolder === 'trash'
                  ? 'La papelera está vacía'
                  : 'No hay notas aquí todavía'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                {searchQuery
                  ? 'Intenta buscar con otros términos o limpia el filtro.'
                  : 'Empieza creando una nota con Markdown, listas de tareas, audios o diagramas.'}
              </p>

              {currentFolder !== 'trash' && (
                <button
                  onClick={() => handleOpenNewNote('note')}
                  className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-blue-600/30 transition active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Primera Nota</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* PINNED SECTION */}
              {pinnedNotes.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-blue-500 dark:text-cyan-400">
                    <Pin className="w-3 h-3 text-blue-500" />
                    <span>Fijadas ({pinnedNotes.length})</span>
                  </div>

                  <div
                    className={
                      viewLayout === 'grid'
                        ? 'note-masonry-grid'
                        : 'flex flex-col space-y-2.5'
                    }
                  >
                    {pinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onClick={() => {
                          setEditingNote(note);
                          setIsEditorOpen(true);
                        }}
                        onTogglePin={handleTogglePin}
                        onToggleArchive={handleToggleArchive}
                        onDelete={handleDeleteToTrash}
                        onRestore={handleRestoreFromTrash}
                        onPermanentDelete={handlePermanentDelete}
                        onChangeColor={handleChangeColor}
                        onToggleTodo={handleToggleTodo}
                        onTagClick={setSelectedTag}
                        isTrashView={currentFolder === 'trash'}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* OTHER / ALL NOTES SECTION */}
              <div>
                {pinnedNotes.length > 0 && otherNotes.length > 0 && (
                  <div className="flex items-center gap-1.5 mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <Layers className="w-3 h-3 text-blue-500" />
                    <span>Otras Notas ({otherNotes.length})</span>
                  </div>
                )}

                <div
                  className={
                    viewLayout === 'grid'
                      ? 'note-masonry-grid'
                      : 'flex flex-col space-y-2.5'
                  }
                >
                  {otherNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onClick={() => {
                        setEditingNote(note);
                        setIsEditorOpen(true);
                      }}
                      onTogglePin={handleTogglePin}
                      onToggleArchive={handleToggleArchive}
                      onDelete={handleDeleteToTrash}
                      onRestore={handleRestoreFromTrash}
                      onPermanentDelete={handlePermanentDelete}
                      onChangeColor={handleChangeColor}
                      onToggleTodo={handleToggleTodo}
                      onTagClick={setSelectedTag}
                      isTrashView={currentFolder === 'trash'}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* FLOATING QUICK ACTION BAR (Android / Mobile) */}
      <BottomNav
        onNewTextNote={() => handleOpenNewNote('note')}
        onNewTodoNote={() => handleOpenNewNote('todo')}
        onNewVoiceNote={() => handleOpenNewNote('voice')}
        onNewDrawingNote={() => handleOpenNewNote('drawing')}
        onNewEncryptedNote={() => handleOpenNewNote('encrypted')}
      />

      {/* NOTE EDITOR MODAL */}
      <NoteEditorModal
        note={editingNote}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        onDelete={(id) => {
          handleDeleteToTrash(id, { stopPropagation: () => {} } as any);
          setIsEditorOpen(false);
          setEditingNote(null);
        }}
        vaultConfig={vaultConfig}
        masterPassword={masterPassword}
      />

      {/* VAULT MANAGER MODAL */}
      <VaultManagerModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        vaultConfig={vaultConfig}
        onUpdateConfig={(newConfig) => {
          setVaultConfig(newConfig);
          saveVaultConfig(newConfig);
        }}
        onUnlockSuccess={(pass) => {
          setMasterPassword(pass);
          setVaultConfig((prev) => ({
            ...prev,
            isUnlocked: true,
            lastUnlockedAt: Date.now(),
          }));
        }}
        encryptedNotesCount={notes.filter((n) => n.isEncrypted).length}
      />

      {/* SYNC & BACKUP MODAL */}
      <SyncBackupModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        notes={notes}
        onImportNotes={handleImportNotes}
        masterPassword={masterPassword}
      />
    </div>
  );
}
