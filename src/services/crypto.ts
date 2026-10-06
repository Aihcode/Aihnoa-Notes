/**
 * End-to-End Encryption (E2EE) Module using standard Web Crypto API.
 * Uses AES-256-GCM authenticated encryption and PBKDF2 key derivation.
 */

import { EncryptedData, Note, SyncPacket } from '../types/note';

const PBKDF2_ITERATIONS = 100_000;
const KEY_LENGTH = 256;
const SALT_BYTE_LENGTH = 16;
const IV_BYTE_LENGTH = 12;

function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derives an AES-GCM 256 key from a passphrase and a salt using PBKDF2.
 */
export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const saltBuffer = new Uint8Array(salt).buffer as ArrayBuffer;

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generates a SHA-256 hash string for password verification.
 */
export async function hashPassword(password: string, saltHex: string): Promise<string> {
  const encoder = new TextEncoder();
  const combined = encoder.encode(password + '::' + saltHex);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', combined);
  return arrayBufferToBase64(hashBuffer);
}

/**
 * Computes SHA-256 checksum of a string.
 */
export async function computeChecksum(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = await window.crypto.subtle.digest('SHA-256', encoder.encode(content));
  return arrayBufferToBase64(buffer);
}

/**
 * Encrypts a plaintext string with a password using AES-256-GCM.
 */
export async function encryptText(
  plainText: string,
  password: string
): Promise<EncryptedData> {
  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_BYTE_LENGTH));
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_BYTE_LENGTH));
  const key = await deriveKey(password, salt);

  const encoder = new TextEncoder();
  const encodedData = encoder.encode(plainText);

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encodedData
  );

  return {
    ciphertext: arrayBufferToBase64(encryptedBuffer),
    iv: arrayBufferToBase64(iv),
    salt: arrayBufferToBase64(salt),
    version: 1,
  };
}

/**
 * Decrypts an encrypted payload with a password.
 */
export async function decryptText(
  encrypted: EncryptedData,
  password: string
): Promise<string> {
  try {
    const salt = base64ToArrayBuffer(encrypted.salt);
    const iv = base64ToArrayBuffer(encrypted.iv);
    const ciphertext = base64ToArrayBuffer(encrypted.ciphertext);

    const key = await deriveKey(password, salt);

    const ivBuffer = new Uint8Array(iv).buffer as ArrayBuffer;
    const ciphertextBuffer = new Uint8Array(ciphertext).buffer as ArrayBuffer;

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBuffer,
      },
      key,
      ciphertextBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch {
    throw new Error('Contraseña incorrecta o datos dañados.');
  }
}

/**
 * Encrypts sensitive note payload (title, content, todos, transcript, attachments).
 */
export async function encryptNoteContent(
  note: Note,
  password: string
): Promise<Note> {
  const sensitivePayload = {
    title: note.title,
    content: note.content,
    todos: note.todos,
    audioTranscript: note.audioTranscript,
    drawingData: note.drawingData,
    attachments: note.attachments,
  };

  const encryptedPayload = await encryptText(
    JSON.stringify(sensitivePayload),
    password
  );

  return {
    ...note,
    title: '🔒 Nota Cifrada',
    content: '*(Esta nota está protegida con cifrado de extremo a extremo AES-256)*',
    todos: [],
    audioTranscript: undefined,
    drawingData: undefined,
    attachments: [],
    isEncrypted: true,
    encryptedPayload,
  };
}

/**
 * Decrypts a protected note with the password.
 */
export async function decryptNoteContent(
  note: Note,
  password: string
): Promise<Note> {
  if (!note.isEncrypted || !note.encryptedPayload) {
    return note;
  }

  const decryptedJson = await decryptText(note.encryptedPayload, password);
  const data = JSON.parse(decryptedJson);

  return {
    ...note,
    title: data.title,
    content: data.content,
    todos: data.todos || [],
    audioTranscript: data.audioTranscript,
    drawingData: data.drawingData,
    attachments: data.attachments || [],
    isEncrypted: false,
    encryptedPayload: undefined,
  };
}

/**
 * Generates an encrypted Sync Packet / Vault backup file (.krypta).
 */
export async function createEncryptedSyncPacket(
  notes: Note[],
  password?: string
): Promise<SyncPacket> {
  const jsonString = JSON.stringify(notes);
  const checksum = await computeChecksum(jsonString);

  if (!password || password.trim() === '') {
    return {
      version: 1,
      app: 'AihnoaNotes',
      exportedAt: Date.now(),
      notesCount: notes.length,
      isEncrypted: false,
      checksum,
      payload: jsonString,
    };
  }

  const encrypted = await encryptText(jsonString, password);
  return {
    version: 1,
    app: 'AihnoaNotes',
    exportedAt: Date.now(),
    notesCount: notes.length,
    isEncrypted: true,
    checksum,
    payload: encrypted.ciphertext,
    salt: encrypted.salt,
    iv: encrypted.iv,
  };
}

/**
 * Unpacks an encrypted Sync Packet / Vault backup file.
 */
export async function parseSyncPacket(
  packet: SyncPacket,
  password?: string
): Promise<{ notes: Note[]; isValid: boolean }> {
  if (!packet.isEncrypted) {
    const notes = JSON.parse(packet.payload) as Note[];
    const check = await computeChecksum(packet.payload);
    return {
      notes,
      isValid: check === packet.checksum,
    };
  }

  if (!password) {
    throw new Error('Se requiere contraseña para descifrar este paquete de sincronización.');
  }

  if (!packet.salt || !packet.iv) {
    throw new Error('Formato de paquete de sincronización inválido.');
  }

  const decryptedJson = await decryptText(
    {
      ciphertext: packet.payload,
      salt: packet.salt,
      iv: packet.iv,
      version: packet.version,
    },
    password
  );

  const check = await computeChecksum(decryptedJson);
  const notes = JSON.parse(decryptedJson) as Note[];

  return {
    notes,
    isValid: check === packet.checksum,
  };
}
