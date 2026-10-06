import React from 'react';
import { 
  FileText, 
  Pin, 
  CheckSquare, 
  Mic, 
  Palette, 
  Clock, 
  Lock, 
  Archive, 
  Trash2, 
  Tag, 
  ShieldCheck, 
  Download, 
  Settings, 
  Moon, 
  Sun, 
  FolderLock, 
  RefreshCw,
  PlusCircle,
  Cpu,
  X
} from 'lucide-react';
import { ViewFolder, VaultConfig, Note } from '../types/note';
import { triggerHaptic } from '../utils/theme';
import { PWAInstallButton } from './PWAInstallButton';

interface SidebarProps {
  currentFolder: ViewFolder;
  onSelectFolder: (folder: ViewFolder) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  allTags: string[];
  notes: Note[];
  vaultConfig: VaultConfig;
  onOpenVaultModal: () => void;
  onOpenSyncModal: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentFolder,
  onSelectFolder,
  selectedTag,
  onSelectTag,
  allTags,
  notes,
  vaultConfig,
  onOpenVaultModal,
  onOpenSyncModal,
  isDarkMode,
  onToggleDarkMode,
  isMobileOpen,
  onCloseMobile,
}) => {
  // Compute counts
  const activeNotes = notes.filter((n) => !n.isTrash && !n.isArchived);
  const pinnedCount = activeNotes.filter((n) => n.isPinned).length;
  const todosCount = activeNotes.filter((n) => n.todos && n.todos.length > 0).length;
  const voiceCount = activeNotes.filter((n) => !!n.audioData).length;
  const drawingsCount = activeNotes.filter((n) => !!n.drawingData).length;
  const remindersCount = activeNotes.filter((n) => !!n.reminder).length;
  const vaultCount = notes.filter((n) => n.isEncrypted).length;
  const archivedCount = notes.filter((n) => n.isArchived && !n.isTrash).length;
  const trashCount = notes.filter((n) => n.isTrash).length;

  const navItems = [
    { id: 'all' as ViewFolder, label: 'Todas las Notas', icon: FileText, count: activeNotes.length },
    { id: 'pinned' as ViewFolder, label: 'Fijadas', icon: Pin, count: pinnedCount },
    { id: 'todos' as ViewFolder, label: 'Listas de Tareas', icon: CheckSquare, count: todosCount },
    { id: 'voice' as ViewFolder, label: 'Notas de Voz', icon: Mic, count: voiceCount },
    { id: 'drawings' as ViewFolder, label: 'Dibujos & Bocetos', icon: Palette, count: drawingsCount },
    { id: 'reminders' as ViewFolder, label: 'Recordatorios', icon: Clock, count: remindersCount },
    { 
      id: 'vault' as ViewFolder, 
      label: 'Bóveda Cifrada', 
      icon: Lock, 
      count: vaultCount, 
      isVault: true 
    },
    { id: 'archived' as ViewFolder, label: 'Archivo', icon: Archive, count: archivedCount },
    { id: 'trash' as ViewFolder, label: 'Papelera', icon: Trash2, count: trashCount },
  ];

  const handleFolderClick = (folder: ViewFolder) => {
    triggerHaptic('light');
    onSelectFolder(folder);
    onSelectTag(null);
    onCloseMobile();
  };

  const handleTagClick = (tag: string) => {
    triggerHaptic('light');
    onSelectTag(selectedTag === tag ? null : tag);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-72 bg-white dark:bg-[#0B1120] border-r border-slate-200 dark:border-blue-950/60 flex flex-col justify-between transition-transform duration-300 ease-in-out select-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* TOP BRANDING & APP HEADER */}
        <div>
          <div className="p-5 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-blue-950/60">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1">
                  <span>Aihnoa</span>
                  <span className="text-blue-500">Notes</span>
                </h1>
                <p className="text-[10px] text-blue-500 dark:text-cyan-400 font-bold tracking-wider uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  Tech • E2EE Cifrado
                </p>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* MAIN NAVIGATION LIST */}
          <div className="px-3 py-3 space-y-0.5 overflow-y-auto max-h-[calc(100vh-280px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentFolder === item.id && !selectedTag;

              return (
                <button
                  key={item.id}
                  onClick={() => handleFolderClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 shadow-sm border border-blue-200/60 dark:border-blue-800/60'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? 'text-blue-600 dark:text-cyan-400'
                          : item.isVault
                          ? 'text-amber-500'
                          : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.count > 0 && (
                    <span
                      className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}

            {/* TAGS SECTION */}
            {allTags.length > 0 && (
              <div className="pt-4 pb-2">
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
                  <span>Etiquetas Tech</span>
                  <Tag className="w-3 h-3 text-blue-500" />
                </div>
                <div className="space-y-0.5 mt-1">
                  {allTags.map((t) => {
                    const isTagActive = selectedTag === t;
                    const tagCount = activeNotes.filter((n) => n.tags?.includes(t)).length;
                    return (
                      <button
                        key={t}
                        onClick={() => handleTagClick(t)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-medium transition ${
                          isTagActive
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="text-cyan-400 font-bold">#</span>
                          <span className="truncate">{t}</span>
                        </div>
                        <span className="text-[10px] opacity-70">{tagCount}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM UTILITY BAR (VAULT STATUS, SYNC, THEME, PWA INSTALL) */}
        <div className="p-3 border-t border-slate-100 dark:border-blue-950/60 bg-slate-50/60 dark:bg-[#080C16] space-y-2">
          {/* Vault Security Status Pill */}
          <button
            onClick={() => {
              triggerHaptic('medium');
              onOpenVaultModal();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-blue-900/50 text-xs hover:border-blue-500 transition shadow-sm"
          >
            <div className="flex items-center gap-2">
              <FolderLock className="w-4 h-4 text-blue-500" />
              <div className="text-left">
                <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                  Bóveda E2EE
                </p>
                <p className="text-[10px] text-slate-400">
                  {vaultConfig.isUnlocked ? 'Desbloqueada' : 'Bloqueada'}
                </p>
              </div>
            </div>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                vaultConfig.isUnlocked ? 'bg-cyan-400 shadow-sm shadow-cyan-400 animate-pulse' : 'bg-amber-500'
              }`}
            />
          </button>

          {/* Sync & Backup Button */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenSyncModal();
            }}
            className="w-full flex items-center gap-2.5 p-2 rounded-2xl hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
          >
            <RefreshCw className="w-4 h-4 text-blue-500" />
            <span>Sincronizar & Respaldos</span>
          </button>

          {/* Dark mode & PWA row */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => {
                triggerHaptic('light');
                onToggleDarkMode();
              }}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
              title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
            </button>

            <PWAInstallButton variant="button" />
          </div>
        </div>
      </aside>
    </>
  );
};
