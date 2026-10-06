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
  AlertCircle,
  Cpu
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
      a.download = `aihnoa-notes-${encryptExport ? 'e2ee-vault' : 'backup'}-${dateStr}.aihnoa.json`;
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
        message: `¡Éxito! Se importaron ${importedNotes.length} notas en Aihnoa Notes.`,
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
        message: `¡Éxito! Se sincronizaron ${importedNotes.length} notas en Aihnoa Notes.`,
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
    let combinedMd = `# Respaldo Completo Aihnoa Notes - ${new Date().toLocaleDateString()}\n\n`;
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
    a.download = `aihnoa-notas-markdown-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0B1120] shadow-2xl border border-slate-200 dark:border-blue-900 overflow-hidden text-slate-900 dark:text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 pb-3 flex items-center justify-between border-b border-slate-100 dark:border-blue-950">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-950 text-blue-500 rounded-xl">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Sincronización Tech & Respaldos</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transfiere tus notas de Aihnoa Notes entre Android, PC y tablet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-blue-950 bg-slate-50 dark:bg-slate-900/40 px-3 pt-2 gap-1 overflow-x-auto">
          <button
            onClick={() => {
              setTab('export');
              setImportStatus(null);
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 ${
              tab === 'export'
                ? 'bg-white dark:bg-[#0B1120] text-blue-600 dark:text-cyan-400 border-t-2 border-blue-500 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
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
                ? 'bg-white dark:bg-[#0B1120] text-blue-600 dark:text-cyan-400 border-t-2 border-blue-500 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
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
                ? 'bg-white dark:bg-[#0B1120] text-blue-600 dark:text-cyan-400 border-t-2 border-blue-500 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            P2P Sync
          </button>
          <button
            onClick={() => {
              setTab('markdown');
              setImportStatus(null);
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 ${
              tab === 'markdown'
                ? 'bg-white dark:bg-[#0B1120] text-blue-600 dark:text-cyan-400 border-t-2 border-blue-500 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
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
                  ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 text-blue-900 dark:text-cyan-300'
                  : 'bg-red-50 dark:bg-red-950/50 border-red-300 text-red-800 dark:text-red-200'
              }`}
            >
              {importStatus.success ? (
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}

          {/* TAB 1: EXPORT */}
          {tab === 'export' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-blue-950 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Notas en Aihnoa Notes:
                  </span>
                  <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-cyan-300 font-bold rounded-full border border-blue-200 dark:border-blue-800">
                    {notes.length} notas
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                  Crea un archivo seguro que contiene todas tus notas, tareas, audios y dibujos.
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={encryptExport}
                    onChange={(e) => setEncryptExport(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Proteger respaldo con Cifrado AES-256 (E2EE)</span>
                </label>

                {encryptExport && (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Contraseña de cifrado para este archivo:
                    </label>
                    <input
                      type="password"
                      value={exportPassword}
                      onChange={(e) => setExportPassword(e.target.value)}
                      placeholder="Ingresa una clave segura"
                      className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-blue-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handleExportVaultFile}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs font-bold rounded-2xl shadow-lg shadow-blue-600/20 active:scale-98 transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Descargar Bóveda (.aihnoa.json)
              </button>
            </div>
          )}

          {/* TAB 2: IMPORT */}
          {tab === 'import' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-blue-950 text-xs space-y-2">
                <p className="text-slate-600 dark:text-slate-300">
                  Restaura notas desde un archivo <code className="font-mono text-cyan-400">.aihnoa.json</code> o JSON.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contraseña de descifrado:
                </label>
                <input
                  type="password"
                  value={importPassword}
                  onChange={(e) => setImportPassword(e.target.value)}
                  placeholder="Contraseña del respaldo"
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-blue-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Modo de Importación:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setImportMergeMode('merge')}
                    className={`p-2.5 rounded-2xl border text-xs font-semibold text-left transition ${
                      importMergeMode === 'merge'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-blue-500" />
                      Combinar
                    </div>
                    <p className="text-[10px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                      Agrega notas sin borrar las existentes
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportMergeMode('replace')}
                    className={`p-2.5 rounded-2xl border text-xs font-semibold text-left transition ${
                      importMergeMode === 'replace'
                        ? 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-red-500">
                      Reemplazar
                    </div>
                    <p className="text-[10px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                      Sobrescribe todo
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <label className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-blue-900/80 hover:border-blue-500 rounded-3xl cursor-pointer bg-slate-50 dark:bg-slate-900/40 transition">
                  <Upload className="w-8 h-8 text-blue-500 mb-2" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Seleccionar archivo .aihnoa.json / .json
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Toca para explorar archivos locales
                  </span>
                  <input
                    type="file"
                    accept=".json,.aihnoa,.krypta"
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
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-2xl text-xs text-blue-950 dark:text-cyan-300">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Sincronización P2P Cifrada en Aihnoa Notes
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Copia este código cifrado y pégalo en tu otro dispositivo (teléfono Android, tablet o laptop) para sincronizar directamente.
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
                    className="flex items-center gap-1 text-blue-500 hover:text-cyan-400"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? '¡Copiado!' : 'Copiar Código'}</span>
                  </button>
                </div>
                <textarea
                  value={syncTokenString}
                  onChange={(e) => setSyncTokenString(e.target.value)}
                  rows={4}
                  className="w-full p-2.5 rounded-2xl font-mono text-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-blue-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 break-all"
                  placeholder="Pega aquí el código copiado desde tu otro dispositivo..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Contraseña de descifrado del paquete:
                </label>
                <input
                  type="password"
                  value={importPassword}
                  onChange={(e) => setImportPassword(e.target.value)}
                  placeholder="Contraseña establecida al generar"
                  className="w-full px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-blue-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleImportSyncToken}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs font-bold rounded-2xl shadow-md active:scale-98 transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Cargar Notas desde Código
              </button>
            </div>
          )}

          {/* TAB 4: MARKDOWN EXPORT */}
          {tab === 'markdown' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-blue-950 text-xs space-y-2">
                <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-500" />
                  Exportación Libre en Texto Plano Markdown
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  Exporta todas tus notas de Aihnoa Notes a formato Markdown estándar compatible con Obsidian, Notion o editores de texto.
                </p>
              </div>

              <button
                onClick={handleExportMarkdownZip}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs font-bold rounded-2xl shadow-md active:scale-98 transition flex items-center justify-center gap-2"
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
