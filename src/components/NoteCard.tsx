import React, { useState, useRef } from 'react';
import { 
  Pin, 
  Archive, 
  Trash2, 
  Lock, 
  Unlock, 
  Play, 
  Pause, 
  Clock, 
  CheckSquare, 
  Palette, 
  Tag, 
  MoreVertical, 
  Share2, 
  Copy, 
  Check, 
  RotateCcw,
  Sparkles,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Note, NoteColor, TodoItem } from '../types/note';
import { NOTE_COLORS, formatTimeAgo, triggerHaptic } from '../utils/theme';
import { MarkdownRenderer } from './MarkdownRenderer';

interface NoteCardProps {
  note: Note;
  onClick: () => void;
  onTogglePin: (id: string, e: React.MouseEvent) => void;
  onToggleArchive: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onRestore?: (id: string, e: React.MouseEvent) => void;
  onPermanentDelete?: (id: string, e: React.MouseEvent) => void;
  onChangeColor: (id: string, color: NoteColor, e: React.MouseEvent) => void;
  onToggleTodo: (noteId: string, todoId: string, e: React.MouseEvent) => void;
  onTagClick?: (tag: string) => void;
  isTrashView?: boolean;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onClick,
  onTogglePin,
  onToggleArchive,
  onDelete,
  onRestore,
  onPermanentDelete,
  onChangeColor,
  onToggleTodo,
  onTagClick,
  isTrashView = false,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const theme = NOTE_COLORS[note.color] || NOTE_COLORS.default;

  const totalTodos = note.todos?.length || 0;
  const completedTodos = note.todos?.filter((t) => t.completed).length || 0;
  const todoProgress = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

  const handleAudioToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!note.audioData) return;

    if (!audioRef.current) {
      const audio = new Audio(note.audioData);
      audioRef.current = audio;
      audio.onended = () => setIsPlayingAudio(false);
    }

    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const fullText = `# ${note.title}\n\n${note.content}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    triggerHaptic('light');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTodoCheck = (todo: TodoItem, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    onToggleTodo(note.id, todo.id, e);

    if (!todo.completed && completedTodos + 1 === totalTodos && totalTodos > 1) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
  };

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-3xl p-4 border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-lg hover:shadow-blue-950/10 active:scale-[0.99] flex flex-col justify-between select-none ${theme.bgClass} ${theme.borderClass}`}
      style={{
        minHeight: '130px',
      }}
    >
      {/* Top Section: Title & Pin / Lock */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            {note.title ? (
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 line-clamp-2 tracking-tight">
                {note.title}
              </h3>
            ) : (
              <h3 className="text-sm italic text-slate-400 dark:text-slate-500">
                Sin título
              </h3>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {note.isEncrypted && (
              <span
                className="p-1.5 rounded-full bg-amber-500/10 text-amber-500"
                title="Nota protegida con E2EE"
              >
                <Lock className="w-3.5 h-3.5" />
              </span>
            )}

            {!isTrashView && (
              <button
                type="button"
                onClick={(e) => {
                  triggerHaptic('light');
                  onTogglePin(note.id, e);
                }}
                className={`p-1.5 rounded-full transition ${
                  note.isPinned
                    ? 'text-blue-600 dark:text-cyan-400 bg-blue-100/70 dark:bg-blue-950/80 shadow-sm'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 focus:opacity-100'
                }`}
                title={note.isPinned ? 'Desfijar' : 'Fijar arriba'}
              >
                <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Content Preview / Markdown */}
        {note.content && !note.isEncrypted && (
          <div className="mb-3 max-h-36 overflow-hidden relative text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            <MarkdownRenderer
              content={note.content}
              compact
              onTagClick={onTagClick}
              interactiveTasks={false}
            />
          </div>
        )}

        {note.isEncrypted && (
          <div className="p-3 my-2 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Contenido protegido con cifrado E2EE</span>
          </div>
        )}

        {/* Interactive Checklist Preview */}
        {totalTodos > 0 && !note.isEncrypted && (
          <div className="my-2.5 space-y-1.5">
            {/* Progress bar */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-cyan-400">
                <CheckSquare className="w-3 h-3" />
                Tareas ({completedTodos}/{totalTodos})
              </span>
              <span className="font-mono text-[10px] text-slate-400">{Math.round(todoProgress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300 rounded-full shadow-sm"
                style={{ width: `${todoProgress}%` }}
              />
            </div>

            {/* First 4 tasks rendered interactively */}
            <div className="space-y-1 pt-1">
              {note.todos.slice(0, 4).map((todo) => (
                <div
                  key={todo.id}
                  onClick={(e) => handleTodoCheck(todo, e)}
                  className="flex items-start gap-2 py-0.5 px-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => {}}
                    className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span
                    className={`text-xs flex-1 line-clamp-1 transition ${
                      todo.completed
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-800 dark:text-slate-200 font-medium'
                    }`}
                  >
                    {todo.text}
                  </span>
                </div>
              ))}
              {totalTodos > 4 && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 pl-2">
                  +{totalTodos - 4} tareas más...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Audio Note Widget Preview */}
        {note.audioData && (
          <div
            onClick={handleAudioToggle}
            className="my-2 p-2.5 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 flex items-center justify-between gap-2 text-xs text-blue-800 dark:text-cyan-300 transition"
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-1.5 bg-blue-600 text-white rounded-full shadow-sm hover:scale-105 transition"
              >
                {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>
              <span className="font-semibold text-[11px]">
                {isPlayingAudio ? 'Reproduciendo audio...' : 'Nota de Voz'}
              </span>
            </div>
            <span className="font-mono text-[10px] opacity-80">
              {note.audioDuration ? `${note.audioDuration}s` : 'Audio'}
            </span>
          </div>
        )}

        {/* Drawing Preview */}
        {note.drawingData && (
          <div className="my-2 rounded-2xl overflow-hidden border border-slate-200 dark:border-blue-950 max-h-28 bg-white flex items-center justify-center">
            <img
              src={note.drawingData}
              alt="Boceto"
              className="w-full h-auto object-contain max-h-28"
              loading="lazy"
            />
          </div>
        )}

        {/* Attachment Images */}
        {note.attachments && note.attachments.length > 0 && (
          <div className="my-2 flex gap-1.5 overflow-x-auto py-1">
            {note.attachments.map((att) => (
              <div
                key={att.id}
                className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100"
              >
                {att.type.startsWith('image/') ? (
                  <img src={att.dataUrl} alt={att.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-500">
                    {att.name.slice(-3).toUpperCase()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tags Chips */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {note.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(tag);
                }}
                className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100/70 dark:bg-blue-950/70 text-blue-700 dark:text-cyan-300 hover:bg-blue-600 hover:text-white transition border border-blue-200/50 dark:border-blue-800/40"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Reminder Badge */}
        {note.reminder && (
          <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-cyan-300 border border-sky-200 dark:border-sky-800/50">
            <Clock className="w-3 h-3 text-cyan-500" />
            <span>
              {new Intl.DateTimeFormat('es', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }).format(new Date(note.reminder))}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Row: Timestamp & Quick Action Toolbar */}
      <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
        <span className="text-[10px]">{formatTimeAgo(note.updatedAt || note.createdAt)}</span>

        <div className="flex items-center gap-0.5 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          {isTrashView ? (
            <>
              <button
                type="button"
                onClick={(e) => onRestore?.(note.id, e)}
                className="p-1 hover:text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 transition"
                title="Restaurar nota"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => onPermanentDelete?.(note.id, e)}
                className="p-1 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-slate-800 transition"
                title="Eliminar definitivamente"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              {/* Color Picker Toggle */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowColorPicker(!showColorPicker);
                  }}
                  className="p-1 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
                  title="Cambiar color tech"
                >
                  <Palette className="w-3.5 h-3.5" />
                </button>

                {showColorPicker && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-8 right-0 z-30 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-blue-900 rounded-2xl shadow-xl flex items-center gap-1 animate-in zoom-in-95 duration-150"
                  >
                    {(Object.keys(NOTE_COLORS) as NoteColor[]).slice(0, 7).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={(e) => {
                          onChangeColor(note.id, c, e);
                          setShowColorPicker(false);
                        }}
                        className={`w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 transition ${
                          note.color === c ? 'ring-2 ring-blue-500 scale-110' : ''
                        }`}
                        style={{ backgroundColor: NOTE_COLORS[c].dotColor }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Copy Markdown */}
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
                title="Copiar contenido Markdown"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              {/* Archive */}
              <button
                type="button"
                onClick={(e) => onToggleArchive(note.id, e)}
                className={`p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition ${
                  note.isArchived ? 'text-blue-500' : 'hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title={note.isArchived ? 'Desarchivar' : 'Archivar'}
              >
                <Archive className="w-3.5 h-3.5" />
              </button>

              {/* Trash */}
              <button
                type="button"
                onClick={(e) => onDelete(note.id, e)}
                className="p-1 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                title="Enviar a la papelera"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
