import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Check, 
  Pin, 
  Archive, 
  Trash2, 
  Lock, 
  Unlock, 
  Bold, 
  Italic, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Code, 
  Quote, 
  Highlighter, 
  Table, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Mic, 
  Palette, 
  Clock, 
  Tag, 
  Eye, 
  Edit3, 
  Columns, 
  Plus, 
  Share2, 
  Download,
  AlertCircle,
  HelpCircle,
  PenTool
} from 'lucide-react';
import { Note, NoteColor, TodoItem, AttachmentItem, VaultConfig } from '../types/note';
import { NOTE_COLORS, triggerHaptic } from '../utils/theme';
import { MarkdownRenderer } from './MarkdownRenderer';
import { VoiceRecorderModal } from './VoiceRecorderModal';
import { DrawingModal } from './DrawingModal';
import { encryptNoteContent, decryptNoteContent } from '../services/crypto';

interface NoteEditorModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Note) => void;
  onDelete: (id: string) => void;
  vaultConfig: VaultConfig;
  masterPassword?: string;
}

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  note,
  isOpen,
  onClose,
  onSave,
  onDelete,
  vaultConfig,
  masterPassword,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState<NoteColor>('default');
  const [isPinned, setIsPinned] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [audioData, setAudioData] = useState<string | undefined>(undefined);
  const [audioDuration, setAudioDuration] = useState<number | undefined>(undefined);
  const [audioTranscript, setAudioTranscript] = useState<string | undefined>(undefined);
  const [drawingData, setDrawingData] = useState<string | undefined>(undefined);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [reminder, setReminder] = useState<string | null>(null);

  const [editorMode, setEditorMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [activeTab, setActiveTab] = useState<'content' | 'todos' | 'media'>('content');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showDrawingModal, setShowDrawingModal] = useState(false);

  // Decryption state for locked note
  const [decryptPassword, setDecryptPassword] = useState(masterPassword || '');
  const [decryptError, setDecryptError] = useState('');
  const [isDecryptedForEditing, setIsDecryptedForEditing] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load note data on open
  useEffect(() => {
    if (note && isOpen) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setColor(note.color || 'default');
      setIsPinned(note.isPinned || false);
      setIsArchived(note.isArchived || false);
      setIsEncrypted(note.isEncrypted || false);
      setTags(note.tags || []);
      setTodos(note.todos || []);
      setAudioData(note.audioData);
      setAudioDuration(note.audioDuration);
      setAudioTranscript(note.audioTranscript);
      setDrawingData(note.drawingData);
      setAttachments(note.attachments || []);
      setReminder(note.reminder || null);

      if (note.isEncrypted) {
        setIsDecryptedForEditing(false);
        // Try auto-decrypt with masterPassword if available
        if (masterPassword && note.encryptedPayload) {
          decryptNoteContent(note, masterPassword)
            .then((decrypted) => {
              setTitle(decrypted.title);
              setContent(decrypted.content);
              setTodos(decrypted.todos);
              setDrawingData(decrypted.drawingData);
              setAttachments(decrypted.attachments);
              setIsDecryptedForEditing(true);
            })
            .catch(() => {
              // Master password did not match or not unlocked
            });
        }
      } else {
        setIsDecryptedForEditing(true);
      }
    } else if (isOpen) {
      // New note default
      setTitle('');
      setContent('');
      setColor('default');
      setIsPinned(false);
      setIsArchived(false);
      setIsEncrypted(false);
      setTags([]);
      setTodos([]);
      setAudioData(undefined);
      setAudioDuration(undefined);
      setAudioTranscript(undefined);
      setDrawingData(undefined);
      setAttachments([]);
      setReminder(null);
      setIsDecryptedForEditing(true);
    }
  }, [note, isOpen, masterPassword]);

  if (!isOpen) return null;

  const currentTheme = NOTE_COLORS[color] || NOTE_COLORS.default;

  // Insert markdown helper at cursor position
  const insertMarkdown = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    triggerHaptic('light');
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((prev) => `${prev}\n${prefix}${defaultPlaceholder}${suffix}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultPlaceholder;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  const handleManualDecrypt = async () => {
    if (!note || !note.encryptedPayload) return;
    try {
      setDecryptError('');
      const decrypted = await decryptNoteContent(note, decryptPassword);
      setTitle(decrypted.title);
      setContent(decrypted.content);
      setTodos(decrypted.todos);
      setDrawingData(decrypted.drawingData);
      setAttachments(decrypted.attachments);
      setIsDecryptedForEditing(true);
      triggerHaptic('medium');
    } catch {
      setDecryptError('Contraseña incorrecta.');
      triggerHaptic('heavy');
    }
  };

  const handleSaveNote = async () => {
    if (!title.trim() && !content.trim() && todos.length === 0 && !audioData && !drawingData) {
      onClose();
      return;
    }

    triggerHaptic('medium');

    const noteId = note?.id || `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    let targetNote: Note = {
      id: noteId,
      title: title.trim(),
      content: content.trim(),
      type: todos.length > 0 ? 'todo' : audioData ? 'voice' : drawingData ? 'drawing' : 'note',
      todos,
      tags,
      color,
      isPinned,
      isArchived,
      isTrash: false,
      isEncrypted: false,
      audioData,
      audioDuration,
      audioTranscript,
      drawingData,
      attachments,
      reminder,
      createdAt: note?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    if (isEncrypted) {
      const encryptionPass = masterPassword || decryptPassword;
      if (!encryptionPass) {
        alert('Para cifrar esta nota, debes ingresar una contraseña o desbloquear tu Bóveda.');
        return;
      }
      targetNote = await encryptNoteContent(targetNote, encryptionPass);
    }

    onSave(targetNote);
    onClose();
  };

  // Todo items management
  const handleAddTodo = () => {
    if (!newTodoText.trim()) return;
    triggerHaptic('light');
    const newTodo: TodoItem = {
      id: `todo-${Date.now()}`,
      text: newTodoText.trim(),
      completed: false,
    };
    setTodos([...todos, newTodo]);
    setNewTodoText('');
  };

  const handleToggleTodoItem = (todoId: string) => {
    triggerHaptic('light');
    setTodos(
      todos.map((t) => (t.id === todoId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleRemoveTodoItem = (todoId: string) => {
    triggerHaptic('light');
    setTodos(todos.filter((t) => t.id !== todoId));
  };

  // Tags management
  const handleAddTag = () => {
    const clean = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Image attachment upload
  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onloadend = () => {
        const item: AttachmentItem = {
          id: `att-${Date.now()}-${i}`,
          name: file.name,
          type: file.type,
          dataUrl: reader.result as string,
          size: file.size,
        };
        setAttachments((prev) => [...prev, item]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Word & character stats
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-4xl h-[94vh] rounded-3xl shadow-2xl border flex flex-col overflow-hidden text-stone-900 dark:text-stone-100 transition-colors duration-200 ${currentTheme.bgClass} ${currentTheme.borderClass}`}
      >
        {/* TOP BAR */}
        <div className="p-3.5 sm:px-6 flex items-center justify-between border-b border-black/5 dark:border-white/10 gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Pin Toggle */}
            <button
              onClick={() => {
                triggerHaptic('light');
                setIsPinned(!isPinned);
              }}
              className={`p-2 rounded-2xl transition ${
                isPinned
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              title={isPinned ? 'Fijada' : 'Fijar nota'}
            >
              <Pin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
            </button>

            {/* Encrypt Toggle */}
            <button
              onClick={() => {
                triggerHaptic('medium');
                setIsEncrypted(!isEncrypted);
              }}
              className={`p-2 rounded-2xl transition flex items-center gap-1 text-xs font-semibold ${
                isEncrypted
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-stone-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-zinc-800'
              }`}
              title="Cifrar nota con E2EE"
            >
              {isEncrypted ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              <span className="hidden sm:inline">
                {isEncrypted ? 'Cifrada E2EE' : 'Pública'}
              </span>
            </button>

            {/* Archive */}
            <button
              onClick={() => {
                triggerHaptic('light');
                setIsArchived(!isArchived);
              }}
              className={`p-2 rounded-2xl transition ${
                isArchived
                  ? 'bg-emerald-600 text-white'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              title={isArchived ? 'Archivada' : 'Archivar'}
            >
              <Archive className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switchers & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Markdown View Toggle (Edit / Split / Preview) */}
            <div className="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-black/5 dark:border-white/5">
              <button
                onClick={() => setEditorMode('edit')}
                className={`p-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                  editorMode === 'edit'
                    ? 'bg-white dark:bg-zinc-800 text-emerald-600 shadow-sm'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
                title="Modo Editor"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Editar</span>
              </button>

              <button
                onClick={() => setEditorMode('split')}
                className={`hidden md:flex p-1.5 rounded-xl text-xs font-semibold items-center gap-1 transition ${
                  editorMode === 'split'
                    ? 'bg-white dark:bg-zinc-800 text-emerald-600 shadow-sm'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
                title="Vista Dividida"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Dividido</span>
              </button>

              <button
                onClick={() => setEditorMode('preview')}
                className={`p-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                  editorMode === 'preview'
                    ? 'bg-white dark:bg-zinc-800 text-emerald-600 shadow-sm'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
                title="Vista Previa Markdown"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Previa</span>
              </button>
            </div>

            {/* Save & Close buttons */}
            <button
              onClick={handleSaveNote}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition"
            >
              <Check className="w-4 h-4" />
              <span>Guardar</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* LOCKED ENCRYPTED OVERLAY IF NOT DECRYPTED */}
        {note?.isEncrypted && !isDecryptedForEditing ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-lg">
              <Lock className="w-8 h-8" />
            </div>
            <div className="max-w-sm">
              <h3 className="text-lg font-bold">Nota Cifrada con AES-256</h3>
              <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1">
                Ingresa tu contraseña para descifrar y ver el contenido:
              </p>
            </div>

            <div className="w-full max-w-xs space-y-3">
              <input
                type="password"
                value={decryptPassword}
                onChange={(e) => setDecryptPassword(e.target.value)}
                placeholder="Contraseña de la nota"
                className="w-full px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {decryptError && (
                <p className="text-xs text-red-500 font-semibold">{decryptError}</p>
              )}
              <button
                onClick={handleManualDecrypt}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                Descifrar para Editar
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* SUB-NAV TABS: NOTA (MARKDOWN), CHECKLIST (TAREAS), MULTIMEDIA */}
            <div className="flex items-center px-4 sm:px-6 pt-2 border-b border-black/5 dark:border-white/5 gap-2 bg-black/[0.02] dark:bg-white/[0.02]">
              <button
                onClick={() => setActiveTab('content')}
                className={`pb-2 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'content'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                Nota & Markdown
              </button>

              <button
                onClick={() => setActiveTab('todos')}
                className={`pb-2 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'todos'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Lista de Tareas ({todos.length})
              </button>

              <button
                onClick={() => setActiveTab('media')}
                className={`pb-2 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'media'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                Voz & Dibujos
                {(audioData || drawingData || attachments.length > 0) && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>
            </div>

            {/* MARKDOWN FORMATTING TOOLBAR (Visible in Content tab when editing) */}
            {activeTab === 'content' && editorMode !== 'preview' && (
              <div className="p-2 sm:px-6 border-b border-black/5 dark:border-white/5 flex items-center gap-1 overflow-x-auto text-stone-600 dark:text-stone-300">
                <button
                  type="button"
                  onClick={() => insertMarkdown('# ', '', 'Título Principal')}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
                  title="Encabezado 1 (#)"
                >
                  <Heading1 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('## ', '', 'Subtítulo')}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
                  title="Encabezado 2 (##)"
                >
                  <Heading2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('### ', '', 'Sección')}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
                  title="Encabezado 3 (###)"
                >
                  <Heading3 className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-stone-300 dark:bg-zinc-700 mx-1" />

                <button
                  type="button"
                  onClick={() => insertMarkdown('**', '**', 'negrita')}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 font-bold transition"
                  title="Negrita (**)"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('*', '*', 'cursiva')}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 italic transition"
                  title="Cursiva (*)"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('~~', '~~', 'tachado')}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
                  title="Tachado (~~)"
                >
                  <Strikethrough className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('==', '==', 'resaltado')}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition text-amber-500"
                  title="Resaltado (==)"
                >
                  <Highlighter className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-stone-300 dark:bg-zinc-700 mx-1" />

                <button
                  type="button"
                  onClick={() => insertMarkdown('- [ ] ', '', 'Nueva tarea')}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
                  title="Casilla de verificación (- [ ])"
                >
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('- ', '', 'Elemento')}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
                  title="Lista con viñetas (-)"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('1. ', '', 'Primer punto')}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
                  title="Lista numerada (1.)"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('> ', '', 'Cita importante')}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
                  title="Cita (>)"
                >
                  <Quote className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-stone-300 dark:bg-zinc-700 mx-1" />

                <button
                  type="button"
                  onClick={() => insertMarkdown('`', '`', 'código')}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 font-mono transition"
                  title="Código en línea (`)"
                >
                  <Code className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('```\n', '\n```', '// Código')}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-xs font-mono transition"
                  title="Bloque de código (```)"
                >
                  {'```'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertMarkdown(
                      '\n| Columna 1 | Columna 2 |\n| --- | --- |\n| Dato 1 | Dato 2 |\n'
                    )
                  }
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
                  title="Insertar Tabla"
                >
                  <Table className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('[', '](https://ejemplo.com)', 'Texto del enlace')}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
                  title="Insertar enlace"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('#', '', 'etiqueta')}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition text-emerald-600"
                  title="Añadir Hashtag"
                >
                  <Tag className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col">
              {/* Note Title Input */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título de la nota..."
                className="w-full text-xl sm:text-2xl font-bold bg-transparent border-none focus:outline-none placeholder:text-stone-400 dark:placeholder:text-zinc-600 mb-3"
              />

              {/* TAB 1: MARKDOWN CONTENT */}
              {activeTab === 'content' && (
                <div className="flex-1 flex flex-col min-h-[300px]">
                  {editorMode === 'edit' && (
                    <textarea
                      ref={textareaRef}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Escribe en Markdown aquí... (usa **negrita**, - viñetas, ```código, #etiquetas)"
                      className="w-full flex-1 bg-transparent border-none focus:outline-none resize-none font-mono text-sm leading-relaxed placeholder:text-stone-400 dark:placeholder:text-zinc-600"
                    />
                  )}

                  {editorMode === 'preview' && (
                    <div className="flex-1 overflow-y-auto p-2 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                      <MarkdownRenderer
                        content={content}
                        interactiveTasks={true}
                        onTagClick={(tag) => {
                          if (!tags.includes(tag)) setTags([...tags, tag]);
                        }}
                      />
                    </div>
                  )}

                  {editorMode === 'split' && (
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Escribe en Markdown aquí..."
                        className="w-full h-full bg-transparent border-none focus:outline-none resize-none font-mono text-xs leading-relaxed"
                      />
                      <div className="h-full overflow-y-auto p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                        <MarkdownRenderer content={content} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: TODOS / CHECKLISTS */}
              {activeTab === 'todos' && (
                <div className="flex-1 flex flex-col space-y-4">
                  {/* Add todo input */}
                  <div className="flex items-center gap-2 p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                    <Plus className="w-5 h-5 text-emerald-600 ml-2" />
                    <input
                      type="text"
                      value={newTodoText}
                      onChange={(e) => setNewTodoText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTodo();
                        }
                      }}
                      placeholder="Agregar nuevo elemento a la lista de tareas..."
                      className="flex-1 bg-transparent border-none text-xs sm:text-sm focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddTodo}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                    >
                      Añadir
                    </button>
                  </div>

                  {/* Todo list items */}
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {todos.length === 0 ? (
                      <div className="text-center py-12 text-stone-400 dark:text-zinc-500 text-xs">
                        No hay tareas en esta nota aún. ¡Escribe arriba para añadir una!
                      </div>
                    ) : (
                      todos.map((todo) => (
                        <div
                          key={todo.id}
                          className="flex items-center justify-between p-2.5 bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl border border-black/5 dark:border-white/5 group hover:bg-black/[0.06] transition"
                        >
                          <div
                            onClick={() => handleToggleTodoItem(todo.id)}
                            className="flex items-center gap-3 flex-1 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={todo.completed}
                              onChange={() => {}}
                              className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                            <span
                              className={`text-xs sm:text-sm transition ${
                                todo.completed
                                  ? 'line-through text-stone-400 dark:text-zinc-500'
                                  : 'text-stone-800 dark:text-stone-200 font-medium'
                              }`}
                            >
                              {todo.text}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveTodoItem(todo.id)}
                            className="p-1 text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: MEDIA (VOZ, DIBUJOS, ADJUNTOS) */}
              {activeTab === 'media' && (
                <div className="flex-1 flex flex-col space-y-6">
                  {/* Action buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setShowVoiceRecorder(true)}
                      className="p-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 flex flex-col items-center justify-center gap-2 text-emerald-700 dark:text-emerald-300 transition"
                    >
                      <Mic className="w-6 h-6" />
                      <span className="text-xs font-bold">Grabar Nota de Voz</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowDrawingModal(true)}
                      className="p-4 rounded-2xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 flex flex-col items-center justify-center gap-2 text-violet-700 dark:text-violet-300 transition"
                    >
                      <PenTool className="w-6 h-6" />
                      <span className="text-xs font-bold">Lienzo de Dibujo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-4 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 flex flex-col items-center justify-center gap-2 text-sky-700 dark:text-sky-300 transition"
                    >
                      <ImageIcon className="w-6 h-6" />
                      <span className="text-xs font-bold">Adjuntar Imagen</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleAttachmentUpload}
                        className="hidden"
                      />
                    </button>
                  </div>

                  {/* Audio preview */}
                  {audioData && (
                    <div className="p-4 bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl border border-black/5 dark:border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold flex items-center gap-1.5 text-emerald-600">
                          <Mic className="w-4 h-4" />
                          Nota de voz adjunta ({audioDuration || 0}s)
                        </span>
                        <button
                          onClick={() => {
                            setAudioData(undefined);
                            setAudioDuration(undefined);
                            setAudioTranscript(undefined);
                          }}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Eliminar audio
                        </button>
                      </div>
                      <audio controls src={audioData} className="w-full h-9" />
                      {audioTranscript && (
                        <p className="text-xs text-stone-600 dark:text-stone-400 italic bg-white/50 dark:bg-zinc-800/50 p-2 rounded-xl">
                          "{audioTranscript}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Drawing preview */}
                  {drawingData && (
                    <div className="p-4 bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl border border-black/5 dark:border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold flex items-center gap-1.5 text-violet-600">
                          <PenTool className="w-4 h-4" />
                          Boceto / Dibujo a mano alzada
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setShowDrawingModal(true)}
                            className="text-xs text-violet-600 hover:underline"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setDrawingData(undefined)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-2 max-h-56 overflow-hidden flex items-center justify-center border">
                        <img src={drawingData} alt="Boceto" className="max-h-52 object-contain" />
                      </div>
                    </div>
                  )}

                  {/* Image attachments list */}
                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-stone-600 dark:text-stone-300">
                        Imágenes adjuntas ({attachments.length}):
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {attachments.map((att) => (
                          <div
                            key={att.id}
                            className="relative group rounded-2xl overflow-hidden border border-stone-200 dark:border-zinc-700 bg-white"
                          >
                            <img
                              src={att.dataUrl}
                              alt={att.name}
                              className="w-full h-28 object-cover"
                            />
                            <button
                              onClick={() =>
                                setAttachments(attachments.filter((a) => a.id !== att.id))
                              }
                              className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white rounded-full hover:bg-red-600 transition"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tags display & quick add pill row */}
              <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/5 dark:bg-white/10 text-stone-700 dark:text-stone-300"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="+ Etiqueta"
                    className="px-2 py-0.5 text-xs bg-transparent border border-dashed border-stone-300 dark:border-zinc-700 rounded-full focus:outline-none focus:border-emerald-500 w-24"
                  />
                  {tagInput.trim() && (
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="p-1 rounded-full bg-emerald-600 text-white text-[10px]"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* BOTTOM BAR: PALETTE, REMINDER, STATS */}
            <div className="p-3 sm:px-6 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs text-stone-500 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                {/* Color picker dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-1.5 transition"
                    title="Color de la tarjeta"
                  >
                    <Palette className="w-4 h-4 text-emerald-600" />
                    <span className="hidden sm:inline">Color</span>
                  </button>

                  {showColorPicker && (
                    <div className="absolute bottom-10 left-0 z-30 p-2.5 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl shadow-xl grid grid-cols-7 gap-1.5 animate-in zoom-in-95">
                      {(Object.keys(NOTE_COLORS) as NoteColor[]).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setColor(c);
                            setShowColorPicker(false);
                          }}
                          className={`w-6 h-6 rounded-full border border-stone-300 dark:border-zinc-700 transition ${
                            color === c ? 'ring-2 ring-emerald-500 scale-110' : ''
                          }`}
                          style={{ backgroundColor: NOTE_COLORS[c].dotColor }}
                          title={NOTE_COLORS[c].name}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Reminder button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowReminderPicker(!showReminderPicker)}
                    className={`p-2 rounded-xl flex items-center gap-1.5 transition ${
                      reminder
                        ? 'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 font-semibold'
                        : 'hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {reminder ? 'Recordatorio activo' : 'Recordatorio'}
                    </span>
                  </button>

                  {showReminderPicker && (
                    <div className="absolute bottom-10 left-0 z-30 p-3 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl shadow-xl w-64 space-y-2 text-xs animate-in zoom-in-95">
                      <p className="font-bold text-stone-800 dark:text-stone-200">
                        Configurar Recordatorio:
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const todayEvening = new Date();
                          todayEvening.setHours(18, 0, 0, 0);
                          setReminder(todayEvening.toISOString());
                          setShowReminderPicker(false);
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800"
                      >
                        Hoy más tarde (18:00)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          tomorrow.setHours(9, 0, 0, 0);
                          setReminder(tomorrow.toISOString());
                          setShowReminderPicker(false);
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800"
                      >
                        Mañana por la mañana (09:00)
                      </button>
                      <input
                        type="datetime-local"
                        value={reminder ? reminder.slice(0, 16) : ''}
                        onChange={(e) => setReminder(new Date(e.target.value).toISOString())}
                        className="w-full p-2 bg-stone-100 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 text-xs"
                      />
                      {reminder && (
                        <button
                          type="button"
                          onClick={() => {
                            setReminder(null);
                            setShowReminderPicker(false);
                          }}
                          className="w-full text-red-500 text-center py-1 hover:underline"
                        >
                          Quitar recordatorio
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Note stats */}
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span>{wordCount} palabras</span>
                <span>•</span>
                <span>{charCount} caracteres</span>
                <span>•</span>
                <span>~{readTimeMin} min</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Voice Recorder Modal Child */}
      <VoiceRecorderModal
        isOpen={showVoiceRecorder}
        onClose={() => setShowVoiceRecorder(false)}
        onSaveAudio={(audio, dur, transcript) => {
          setAudioData(audio);
          setAudioDuration(dur);
          setAudioTranscript(transcript);
          if (transcript) {
            setContent((prev) => `${prev}\n\n> 🎙️ **Transcripción de audio:**\n> ${transcript}\n`);
          }
        }}
      />

      {/* Drawing Modal Child */}
      <DrawingModal
        isOpen={showDrawingModal}
        initialDataUrl={drawingData}
        onClose={() => setShowDrawingModal(false)}
        onSaveDrawing={(dataUrl) => {
          setDrawingData(dataUrl);
        }}
      />
    </div>
  );
};
