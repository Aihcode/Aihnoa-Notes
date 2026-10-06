import { Note, VaultConfig } from '../types/note';

const DB_NAME = 'aihnoa_notes_db';
const DB_VERSION = 1;
const STORE_NOTES = 'notes';
const STORE_CONFIG = 'config';

const LOCAL_STORAGE_NOTES_KEY = 'aihnoa_notes_data';
const LOCAL_STORAGE_VAULT_KEY = 'aihnoa_vault_config';

const INITIAL_NOTES: Note[] = [
  {
    id: 'welcome-intro-note',
    title: '⚡ Bienvenido a Aihnoa Notes',
    content: `# Tu libreta tecnológica segura estilo Keep + Evernote 🚀

**Aihnoa Notes** está diseñada con arquitectura **100% Local-First**, rápida, minimalista y con **Cifrado de Extremo a Extremo (E2EE)**.

### 🌟 Funcionalidades Principales:
- ✍️ **Markdown Completo**: encabezados, listas, tablas, citas y bloques de código con copia rápida.
- 🔒 **Cifrado AES-256 de Grado Militar**: bloquea notas individuales o tu **Bóveda Secreta**.
- 📋 **Listas de Tareas Interactivas**: marca ítems directamente desde las tarjetas sin abrirlas.
- 🎙️ **Notas de Voz**: graba audio con transcripción de voz a texto en tiempo real.
- 🎨 **Lienzo de Dibujo**: haz bocetos a mano alzada o con stylus en tu pantalla.
- 📱 **PWA Instalable para Android**: instálala en tu pantalla de inicio y úsala sin conexión a internet.
- 🔄 **Sincronización E2EE P2P**: exporta e importa respaldos cifrados por código o archivo seguro.

> *Tus datos nunca salen de tu dispositivo sin que tú los cifres con tu propia clave maestra.*`,
    type: 'rich',
    todos: [],
    tags: ['tecnología', 'guía', 'aihnoa'],
    color: 'blue',
    isPinned: true,
    isArchived: false,
    isTrash: false,
    isEncrypted: false,
    attachments: [],
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: 'todo-checklist-sample',
    title: '✅ Sprint de Tareas & Desarrollo Tech',
    content: `Organización de proyectos, entregas y metas de tecnología.`,
    type: 'todo',
    todos: [
      { id: 't1', text: 'Instalar Aihnoa Notes en mi Android como PWA', completed: true },
      { id: 't2', text: 'Configurar contraseña maestra para la Bóveda E2EE', completed: true },
      { id: 't3', text: 'Probar notas de voz con transcripción automática', completed: false },
      { id: 't4', text: 'Exportar respaldo cifrado .aihnoa para la nube', completed: false },
      { id: 't5', text: 'Organizar etiquetas #tecnología y #proyectos', completed: false },
    ],
    tags: ['tareas', 'tech', 'productividad'],
    color: 'sky',
    isPinned: true,
    isArchived: false,
    isTrash: false,
    isEncrypted: false,
    attachments: [],
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
    updatedAt: Date.now() - 1000 * 60 * 30,
  },
  {
    id: 'markdown-cheatsheet-note',
    title: '📝 Sintaxis Markdown & Código Fuente',
    content: `## Guía de Formato Tecnológico

Puedes formatear texto con la barra de herramientas o escribiendo sintaxis Markdown:

### 1. Formatos de Texto
- **Texto en Negrita** con \`**palabra**\`
- *Texto en Cursiva* con \`*palabra*\`
- ~~Texto Tachado~~ con \`~~palabra~~\`
- ==Texto Resaltado== con \`==palabra==\`
- \`Código en línea\` con backticks

### 2. Bloques de Código
\`\`\`typescript
// Algoritmo de cifrado AES-256-GCM
async function encryptWithAihnoa(payload: string, key: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  return await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(payload));
}
\`\`\`

### 3. Comparativa Tech
| Característica | Google Keep | Evernote | Aihnoa Notes |
| :--- | :---: | :---: | :---: |
| Markdown | ❌ | Parcial | ✅ Completo |
| E2EE Local | ❌ | Solo de pago | ✅ Gratuito y Libre |
| Sin Conexión | ✅ | Parcial | ✅ 100% Offline |
| Tema Azul Tech | ❌ | ❌ | ✅ Moderno & Fluido |
`,
    type: 'note',
    todos: [],
    tags: ['markdown', 'código', 'referencia'],
    color: 'indigo',
    isPinned: false,
    isArchived: false,
    isTrash: false,
    isEncrypted: false,
    attachments: [],
    createdAt: Date.now() - 1000 * 60 * 60 * 8,
    updatedAt: Date.now() - 1000 * 60 * 60 * 8,
  },
  {
    id: 'voice-note-demo',
    title: '🎙️ Nota de Audio: Arquitectura E2EE',
    content: `*Grabación de nota de voz con transcripción automática:*

"Aihnoa Notes utiliza el algoritmo AES-256-GCM del navegador y derivación PBKDF2 para garantizar privacidad total sin servidores."`,
    type: 'voice',
    todos: [],
    tags: ['audio', 'seguridad'],
    color: 'teal',
    isPinned: false,
    isArchived: false,
    isTrash: false,
    isEncrypted: false,
    audioDuration: 12,
    audioTranscript: 'Aihnoa Notes utiliza el algoritmo AES-256-GCM del navegador y derivación PBKDF2 para garantizar privacidad total sin servidores.',
    attachments: [],
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    updatedAt: Date.now() - 1000 * 60 * 60 * 12,
  },
  {
    id: 'encrypted-vault-sample',
    title: '🔒 Bóveda de Claves y Accesos de Servidores',
    content: `### Información Confidencial Protegida

Esta nota contiene datos cifrados con AES-GCM de 256 bits.

- 🔑 **Llave SSH Cluster**: \`ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIG...\`
- 🌐 **Endpoint API Privada**: \`https://api.internal.aihnoa.cloud/v1\`
- 🛡️ **Tokens de Infraestructura**: \`aihnoa-e2ee-vault-secure-local\`

*Solo se descifra en memoria local al desbloquear tu bóveda.*`,
    type: 'rich',
    todos: [],
    tags: ['seguridad', 'privado', 'tech'],
    color: 'charcoal',
    isPinned: false,
    isArchived: false,
    isTrash: false,
    isEncrypted: false,
    attachments: [],
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
  }
];

// Open IndexedDB database safely
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB no está soportado'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NOTES)) {
        const notesStore = db.createObjectStore(STORE_NOTES, { keyPath: 'id' });
        notesStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        notesStore.createIndex('isPinned', 'isPinned', { unique: false });
        notesStore.createIndex('isTrash', 'isTrash', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_CONFIG)) {
        db.createObjectStore(STORE_CONFIG, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Load all notes from IndexedDB with fallback to localStorage
 */
export async function loadNotes(): Promise<Note[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NOTES], 'readonly');
      const store = transaction.objectStore(STORE_NOTES);
      const request = store.getAll();

      request.onsuccess = () => {
        const results: Note[] = request.result || [];
        if (results.length === 0) {
          // Check localStorage or load initial starter notes
          const localStr = localStorage.getItem(LOCAL_STORAGE_NOTES_KEY);
          if (localStr) {
            try {
              const parsed = JSON.parse(localStr);
              if (Array.isArray(parsed) && parsed.length > 0) {
                saveAllNotes(parsed);
                resolve(parsed);
                return;
              }
            } catch {
              // ignore
            }
          }
          // Seed with initial notes
          saveAllNotes(INITIAL_NOTES);
          resolve(INITIAL_NOTES);
        } else {
          // Sort by updatedAt descending
          results.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
          resolve(results);
        }
      };

      request.onerror = () => {
        resolve(loadNotesFromLocalStorage());
      };
    });
  } catch {
    return loadNotesFromLocalStorage();
  }
}

function loadNotesFromLocalStorage(): Note[] {
  try {
    const localStr = localStorage.getItem(LOCAL_STORAGE_NOTES_KEY);
    if (localStr) {
      return JSON.parse(localStr);
    }
  } catch {
    // ignore
  }
  return INITIAL_NOTES;
}

/**
 * Save or update a single note
 */
export async function saveNote(note: Note): Promise<void> {
  const updatedNote: Note = {
    ...note,
    updatedAt: Date.now(),
  };

  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NOTES], 'readwrite');
    const store = transaction.objectStore(STORE_NOTES);
    store.put(updatedNote);
  } catch {
    // fallback
  }

  // Update in localStorage as mirror backup
  try {
    const existing = loadNotesFromLocalStorage();
    const index = existing.findIndex((n) => n.id === note.id);
    if (index >= 0) {
      existing[index] = updatedNote;
    } else {
      existing.unshift(updatedNote);
    }
    localStorage.setItem(LOCAL_STORAGE_NOTES_KEY, JSON.stringify(existing));
  } catch {
    // ignore quota errors
  }
}

/**
 * Save full array of notes
 */
export async function saveAllNotes(notes: Note[]): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NOTES], 'readwrite');
    const store = transaction.objectStore(STORE_NOTES);
    
    // Clear and re-populate
    store.clear();
    for (const note of notes) {
      store.put(note);
    }
  } catch {
    // fallback
  }

  try {
    localStorage.setItem(LOCAL_STORAGE_NOTES_KEY, JSON.stringify(notes));
  } catch {
    // ignore
  }
}

/**
 * Delete a note permanently
 */
export async function deleteNotePermanent(noteId: string): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NOTES], 'readwrite');
    const store = transaction.objectStore(STORE_NOTES);
    store.delete(noteId);
  } catch {
    // fallback
  }

  try {
    const existing = loadNotesFromLocalStorage();
    const filtered = existing.filter((n) => n.id !== noteId);
    localStorage.setItem(LOCAL_STORAGE_NOTES_KEY, JSON.stringify(filtered));
  } catch {
    // ignore
  }
}

/**
 * Load Vault configuration
 */
export function loadVaultConfig(): VaultConfig {
  try {
    const val = localStorage.getItem(LOCAL_STORAGE_VAULT_KEY);
    if (val) {
      return JSON.parse(val);
    }
  } catch {
    // ignore
  }
  return {
    isVaultSetup: false,
    isUnlocked: false,
    autoLockMinutes: 5,
  };
}

/**
 * Save Vault configuration
 */
export function saveVaultConfig(config: VaultConfig): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_VAULT_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
}
