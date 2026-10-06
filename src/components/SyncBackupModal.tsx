import React, { useState } from 'react';
import { 
  RefreshCw, 
  Download, 
  Upload, 
  QrCode, 
  ShieldCheck, 
  FileText, 
  Copy, 
  Check, 
  X, 
  Lock, 
  FileCode, 
  Smartphone, 
  Layers, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Note } from '../types/note';
import { createEncryptedSyncPacket, parseSyncPacket } from '../services/crypto';
import { triggerHaptic } from '../utils/theme';

interface SyncBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  onImportNotes: (newNotes: Note[], mergeMode: 'merge' | 'replace') => void;
  masterPassword?: string;
}

export const SyncBackupModal: React.FC<SyncBackupModalProps> = ({
  isOpen,
  onClose,
  notes,
  onImportNotes,
  masterPassword,
}) => {
  const [tab, setTab] = useState<'export' | 'import' | 'syncToken' | 'markdown'>('export');
  const [encryptExport, setEncryptExport] = useState(true);
  const [exportPassword, setExportPassword] = useState(masterPassword || '');
  const [importPassword, setImportPassword] = useState('');
  const [syncTokenString, setSyncTokenString] = useState('');
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [importMergeMode, setImportMergeMode] = useState<'merge' | 'replace'>('merge');

  if (!isOpen) return null;

  const handleExportVaultFile = async () => {
    try {
      triggerHaptic('medium');
      const packet = await createEncryptedSyncPacket(
        notes,
        encryptExport ? exportPassword : undefined
      );
      const blob = new Blob([JSON.stringify(packet, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Intl.DateTimeFormat('sv-SE')
        .format(new Date())
        .replace(/:/g, '-');
      a.href = url;
      a.download = `krypta-notes-${encryptExport ? 'e2ee-vault' : 'plain'}-${dateStr}.krypta.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Error al exportar respaldo: ' + err.message);
    }
  };

  const handleGenerateSyncToken = async () => {
    try {
      const packet = await createEncryptedSyncPacket(
        notes,
        encryptExport ? exportPassword : undefined
      );
      const raw = JSON.stringify(packet);
      // Compact string
      setSyncTokenString(btoa(unescape(encodeURIComponent(raw))));
    } catch (err: any) {
      alert('Error al generar token de sincronización: ' + err.message);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const packet = JSON.parse(text);
      const { notes: importedNotes, isValid } = await parseSyncPacket(
        packet,
        importPassword || masterPassword
      );

      if (!isValid) {
        setImportStatus({
          success: false,
          message: 'Error de integridad: el archivo parece estar alterado o incompleto.',
        });
        return;
      }

      onImportNotes(importedNotes, importMergeMode);
      triggerHaptic('heavy');
      setImportStatus({
        success: true,
        message: `¡Éxito! Se importaron ${importedNotes.length} notas correctamente.`,
      });
    } catch (err: any) {
      triggerHaptic('heavy');
      setImportStatus({
        success: false,
        message: err.message || 'Error al procesar el archivo. Verifica tu contraseña.',
      });
    }
  };

  const handleImportSyncToken = async () => {
    if (!syncTokenString.trim()) return;

    try {
      const raw = decodeURIComponent(escape(atob(syncTokenString.trim())));
      const packet = JSON.parse(raw);
      const { notes: importedNotes, isValid } = await parseSyncPacket(
        packet,
        importPassword || masterPassword
      );

      if (!isValid) {
        setImportStatus({
          success: false,
          message: 'El código de sincronización no pasó la verificación de integridad.',
        });
        return;
      }

      onImportNotes(importedNotes, importMergeMode);
      triggerHaptic('heavy');
      setImportStatus({
        success: true,
        message: `¡Éxito! Se sincronizaron ${importedNotes.length} notas desde el otro dispositivo.`,
      });
    } catch (err: any) {
      triggerHaptic('heavy');
      setImportStatus({
        success: false,
        message: err.message || 'Token inválido o contraseña incorrecta.',
      });
    }
  };

  const handleExportMarkdownZip = () => {
    // Generate combined Markdown file or plain bundle
    let combinedMd = `# Respaldo Completo Krypta Notes - ${new Date().toLocaleDateString()}\n\n`;
    for (const note of notes) {
      combinedMd += `---\n\n## ${note.title}\n*Fecha: ${new Date(note.createdAt).toLocaleString()} | Etiquetas: ${note.tags.join(', ') || 'ninguna'}*\n\n`;
      if (note.todos.length > 0) {
        combinedMd += `### Tareas:\n`;
        note.todos.forEach((t) => {
          combinedMd += `- [${t.completed ? 'x' : ' '}] ${t.text}\n`;
        });
        combinedMd += '\n';
      }
      combinedMd += `${note.content}\n\n`;
    }

    const blob = new Blob([combinedMd], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `krypta-notas-markdown-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden text-stone-900 dark:text-stone-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 pb-3 flex items-center justify-between border-b border-stone-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-xl">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Sincronización E2EE & Respaldos</h3>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                Transfiere tus notas entre Android, PC y tablet con cifrado
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/40 px-3 pt-2 gap-1 overflow-x-auto">
          <button
            onClick={() => {
              setTab('export');
              setImportStatus(null);
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 ${
              tab === 'export'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 border-t-2 border-emerald-600 shadow-sm'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Exportar Bóveda
          </button>
          <button
            onClick={() => {
              setTab('import');
              setImportStatus(null);
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 ${
              tab === 'import'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 border-t-2 border-emerald-600 shadow-sm'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Importar Bóveda
          </button>
          <button
            onClick={() => {
              setTab('syncToken');
              setImportStatus(null);
              handleGenerateSyncToken();
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 ${
              tab === 'syncToken'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 border-t-2 border-emerald-600 shadow-sm'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Sincronizar Dispositivo
          </button>
          <button
            onClick={() => {
              setTab('markdown');
              setImportStatus(null);
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 ${
              tab === 'markdown'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 border-t-2 border-emerald-600 shadow-sm'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Markdown (.md)
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {importStatus && (
            <div
              className={`p-3 rounded-2xl text-xs flex items-center gap-2 border ${
                importStatus.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 text-emerald-800 dark:text-emerald-200'
                  : 'bg-red-50 dark:bg-red-950/50 border-red-300 text-red-800 dark:text-red-200'
              }`}
            >
              {importStatus.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}

          {/* TAB 1: EXPORT */}
          {tab === 'export' && (
            <div className="space-y-4">
              <div className="p-3 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl border border-stone-200 dark:border-zinc-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">
                    Notas a exportar:
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold rounded-full">
                    {notes.length} notas
                  </span>
                </div>
                <p className="text-stone-500 dark:text-zinc-400">
                  Crea un archivo seguro que contiene todas tus notas, listas de tareas, notas de
                  voz y dibujos.
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 dark:text-stone-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={encryptExport}
                    onChange={(e) => setEncryptExport(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Proteger respaldo con Cifrado AES-256 (E2EE)</span>
                </label>

                {encryptExport && (
                  <div>
                    <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                      Contraseña de cifrado para este archivo:
                    </label>
                    <input
                      type="password"
                      value={exportPassword}
                      onChange={(e) => setExportPassword(e.target.value)}
                      placeholder="Ingresa una clave segura"
                      className="w-full px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handleExportVaultFile}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-md active:scale-98 transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Descargar Archivo de Bóveda (.krypta.json)
              </button>
            </div>
          )}

          {/* TAB 2: IMPORT */}
          {tab === 'import' && (
            <div className="space-y-4">
              <div className="p-3 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl border border-stone-200 dark:border-zinc-800 text-xs space-y-2">
                <p className="text-stone-600 dark:text-stone-300">
                  Restaura o combina notas desde un archivo <code className="font-mono text-emerald-600">.krypta.json</code> generado previamente.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Contraseña de descifrado (si el archivo está cifrado):
                </label>
                <input
                  type="password"
                  value={importPassword}
                  onChange={(e) => setImportPassword(e.target.value)}
                  placeholder="Contraseña del respaldo"
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Modo de Importación:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setImportMergeMode('merge')}
                    className={`p-2.5 rounded-2xl border text-xs font-semibold text-left transition ${
                      importMergeMode === 'merge'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/40 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      Combinar (Recomendado)
                    </div>
                    <p className="text-[10px] font-normal text-stone-500 dark:text-zinc-400 mt-0.5">
                      Agrega notas nuevas sin borrar las existentes
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportMergeMode('replace')}
                    className={`p-2.5 rounded-2xl border text-xs font-semibold text-left transition ${
                      importMergeMode === 'replace'
                        ? 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300'
                        : 'border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/40 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <div className="font-bold text-red-600 dark:text-red-400">
                      Reemplazar Todo
                    </div>
                    <p className="text-[10px] font-normal text-stone-500 dark:text-zinc-400 mt-0.5">
                      Sobrescribe todas las notas actuales
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <label className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-stone-300 dark:border-zinc-700 hover:border-emerald-500 rounded-3xl cursor-pointer bg-stone-50 dark:bg-zinc-800/40 transition">
                  <Upload className="w-8 h-8 text-emerald-600 mb-2" />
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    Seleccionar archivo .krypta.json
                  </span>
                  <span className="text-[11px] text-stone-400 mt-0.5">
                    Toca para explorar archivos locales
                  </span>
                  <input
                    type="file"
                    accept=".json,.krypta"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: SYNC TOKEN */}
          {tab === 'syncToken' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Sincronización Punto a Punto (P2P E2EE)
                </p>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  Copia este código cifrado y pégalo en tu otro dispositivo (teléfono Android, tableta o computadora) para sincronizar al instante sin servidores.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span>Tu Código de Sincronización Cifrado:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(syncTokenString);
                      setCopied(true);
                      triggerHaptic('light');
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? '¡Copiado!' : 'Copiar Código'}</span>
                  </button>
                </div>
                <textarea
                  value={syncTokenString}
                  onChange={(e) => setSyncTokenString(e.target.value)}
                  rows={4}
                  className="w-full p-2.5 rounded-2xl font-mono text-[10px] bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 break-all"
                  placeholder="Pega aquí el código copiado desde tu otro dispositivo..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                  Contraseña de descifrado del paquete:
                </label>
                <input
                  type="password"
                  value={importPassword}
                  onChange={(e) => setImportPassword(e.target.value)}
                  placeholder="Contraseña establecida al generar"
                  className="w-full px-4 py-2 rounded-2xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={handleImportSyncToken}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-md active:scale-98 transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Cargar Notas desde Código
              </button>
            </div>
          )}

          {/* TAB 4: MARKDOWN EXPORT */}
          {tab === 'markdown' && (
            <div className="space-y-4">
              <div className="p-3 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl border border-stone-200 dark:border-zinc-800 text-xs space-y-2">
                <p className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Exportación Libre en Texto Plano Markdown
                </p>
                <p className="text-stone-500 dark:text-zinc-400">
                  Exporta todas tus notas a formato Markdown estándar compatible con Obsidian, Notion, Bear o cualquier editor de texto.
                </p>
              </div>

              <button
                onClick={handleExportMarkdownZip}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-md active:scale-98 transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar Todo a Markdown (.md)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
