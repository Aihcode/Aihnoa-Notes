import React from 'react';
import { 
  Plus, 
  CheckSquare, 
  Mic, 
  Palette, 
  Lock, 
  Image as ImageIcon,
  Edit3
} from 'lucide-react';
import { triggerHaptic } from '../utils/theme';

interface BottomNavProps {
  onNewTextNote: () => void;
  onNewTodoNote: () => void;
  onNewVoiceNote: () => void;
  onNewDrawingNote: () => void;
  onNewEncryptedNote: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  onNewTextNote,
  onNewTodoNote,
  onNewVoiceNote,
  onNewDrawingNote,
  onNewEncryptedNote,
}) => {
  return (
    <div className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:right-6 z-30 flex items-center justify-center sm:justify-end pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-xl border border-slate-200/80 dark:border-blue-900/60 rounded-full shadow-2xl shadow-blue-950/20">
        {/* Quick Checkbox Note */}
        <button
          onClick={() => {
            triggerHaptic('light');
            onNewTodoNote();
          }}
          className="p-3 text-slate-600 dark:text-slate-300 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full active:scale-90 transition"
          title="Nueva Lista de Tareas"
        >
          <CheckSquare className="w-5 h-5 text-blue-500" />
        </button>

        {/* Quick Voice Note */}
        <button
          onClick={() => {
            triggerHaptic('medium');
            onNewVoiceNote();
          }}
          className="p-3 text-slate-600 dark:text-slate-300 hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full active:scale-90 transition"
          title="Grabar Nota de Voz"
        >
          <Mic className="w-5 h-5 text-cyan-400" />
        </button>

        {/* Quick Drawing Note */}
        <button
          onClick={() => {
            triggerHaptic('light');
            onNewDrawingNote();
          }}
          className="p-3 text-slate-600 dark:text-slate-300 hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full active:scale-90 transition"
          title="Hacer Dibujo / Boceto"
        >
          <Palette className="w-5 h-5 text-indigo-400" />
        </button>

        {/* Quick Encrypted Note */}
        <button
          onClick={() => {
            triggerHaptic('medium');
            onNewEncryptedNote();
          }}
          className="p-3 text-slate-600 dark:text-slate-300 hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full active:scale-90 transition"
          title="Nueva Nota Cifrada E2EE"
        >
          <Lock className="w-5 h-5 text-amber-400" />
        </button>

        {/* Primary Big FAB Create Button */}
        <button
          onClick={() => {
            triggerHaptic('heavy');
            onNewTextNote();
          }}
          className="ml-1 px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-full flex items-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 transition"
          title="Crear Nota"
        >
          <Plus className="w-5 h-5" />
          <span className="text-xs font-bold tracking-tight pr-1">Nota</span>
        </button>
      </div>
    </div>
  );
};
