export type NoteType = 'note' | 'todo' | 'voice' | 'drawing' | 'rich';

export type NoteColor =
  | 'default'
  | 'red'
  | 'coral'
  | 'amber'
  | 'yellow'
  | 'emerald'
  | 'teal'
  | 'sky'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'pink'
  | 'sand'
  | 'charcoal';

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface AttachmentItem {
  id: string;
  name: string;
  type: string; // 'image/png', 'audio/webm', 'application/pdf', etc.
  dataUrl: string;
  size?: number;
}

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  salt: string;
  version: number;
}

export interface Note {
  id: string;
  title: string;
  content: string; // Markdown formatted content
  type: NoteType;
  todos: TodoItem[];
  tags: string[];
  color: NoteColor;
  isPinned: boolean;
  isArchived: boolean;
  isTrash: boolean;
  isEncrypted: boolean;
  encryptedPayload?: EncryptedData; // Encrypted title, content, todos, etc.
  
  // Rich media attachments
  audioData?: string; // base64 / dataUrl
  audioDuration?: number; // in seconds
  audioTranscript?: string;
  drawingData?: string; // base64 / dataUrl
  attachments: AttachmentItem[];
  
  // Reminders & metadata
  reminder?: string | null; // ISO string
  reminderCompleted?: boolean;
  createdAt: number;
  updatedAt: number;
}

export type ViewFolder =
  | 'all'
  | 'pinned'
  | 'todos'
  | 'voice'
  | 'drawings'
  | 'reminders'
  | 'vault'
  | 'archived'
  | 'trash';

export type ViewLayout = 'grid' | 'list' | 'compact';

export interface VaultConfig {
  isVaultSetup: boolean;
  isUnlocked: boolean;
  passwordHash?: string;
  salt?: string;
  autoLockMinutes: number;
  lastUnlockedAt?: number;
}

export interface SyncPacket {
  version: number;
  app: string;
  exportedAt: number;
  notesCount: number;
  isEncrypted: boolean;
  checksum: string;
  payload: string; // JSON string or AES-GCM ciphertext
  salt?: string;
  iv?: string;
}
