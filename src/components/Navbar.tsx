import React from 'react';
import { 
  Menu, 
  Search, 
  X, 
  LayoutGrid, 
  List, 
  Filter, 
  SlidersHorizontal, 
  Plus, 
  FolderLock, 
  ShieldCheck,
  Tag
} from 'lucide-react';
import { ViewFolder, ViewLayout } from '../types/note';
import { triggerHaptic } from '../utils/theme';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewLayout: ViewLayout;
  onToggleLayout: () => void;
  onOpenMobileMenu: () => void;
  currentFolder: ViewFolder;
  selectedTag: string | null;
  onClearTag: () => void;
  onOpenNewNote: () => void;
}

const FOLDER_TITLES: Record<ViewFolder, string> = {
  all: 'Notas',
  pinned: 'Notas Fijadas',
  todos: 'Listas de Tareas',
  voice: 'Notas de Voz Tech',
  drawings: 'Dibujos & Bocetos',
  reminders: 'Recordatorios',
  vault: 'Bóveda Cifrada E2EE',
  archived: 'Notas Archivadas',
  trash: 'Papelera de Reciclaje',
};

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  viewLayout,
  onToggleLayout,
  onOpenMobileMenu,
  currentFolder,
  selectedTag,
  onClearTag,
  onOpenNewNote,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-50/90 dark:bg-[#090D16]/90 backdrop-blur-md px-3 sm:px-6 py-2.5 border-b border-slate-200/60 dark:border-blue-950/60 select-none">
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Mobile Menu Hamburger & Title */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenMobileMenu();
            }}
            className="lg:hidden p-2 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
            title="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:block">
            <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>{FOLDER_TITLES[currentFolder]}</span>
              {selectedTag && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800/60">
                  <Tag className="w-3 h-3 text-blue-500" />
                  #{selectedTag}
                  <button onClick={onClearTag} className="hover:text-red-500 ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </h2>
          </div>
        </div>

        {/* SEARCH BAR (Google Keep Style Floating Tech Search Bar) */}
        <div className="flex-1 max-w-xl mx-1 sm:mx-4">
          <div className="relative flex items-center w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-blue-950/80 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition">
            <Search className="w-4 h-4 text-blue-500 ml-3.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar en Aihnoa Notes (#etiquetas, texto, código)..."
              className="w-full py-2 px-3 text-xs sm:text-sm bg-transparent border-none focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="p-1 mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* VIEW SWITCHER & NEW NOTE QUICK ACTION */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              triggerHaptic('light');
              onToggleLayout();
            }}
            className="p-2 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
            title={viewLayout === 'grid' ? 'Cambiar a lista' : 'Cambiar a cuadrícula'}
          >
            {viewLayout === 'grid' ? (
              <List className="w-4 h-4" />
            ) : (
              <LayoutGrid className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => {
              triggerHaptic('medium');
              onOpenNewNote();
            }}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 active:scale-95 text-white text-xs font-bold rounded-2xl shadow-md shadow-blue-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Nota</span>
          </button>
        </div>
      </div>
    </header>
  );
};
