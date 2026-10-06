import React, { useState } from 'react';
import { Lock, Unlock, KeyRound, ShieldCheck, ShieldAlert, Timer, Eye, EyeOff, Check, X, Cpu } from 'lucide-react';
import { VaultConfig } from '../types/note';
import { hashPassword } from '../services/crypto';
import { triggerHaptic } from '../utils/theme';

interface VaultManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultConfig: VaultConfig;
  onUpdateConfig: (config: VaultConfig) => void;
  onUnlockSuccess: (password: string) => void;
  encryptedNotesCount: number;
}

export const VaultManagerModal: React.FC<VaultManagerModalProps> = ({
  isOpen,
  onClose,
  vaultConfig,
  onUpdateConfig,
  onUnlockSuccess,
  encryptedNotesCount,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'unlock' | 'setup' | 'change'>(
    vaultConfig.isVaultSetup ? 'unlock' : 'setup'
  );
  const [autoLockMinutes, setAutoLockMinutes] = useState(vaultConfig.autoLockMinutes || 5);

  if (!isOpen) return null;

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Por favor ingresa tu contraseña.');
      return;
    }

    try {
      if (vaultConfig.passwordHash && vaultConfig.salt) {
        const hash = await hashPassword(password, vaultConfig.salt);
        if (hash !== vaultConfig.passwordHash) {
          triggerHaptic('heavy');
          setError('Contraseña incorrecta. Inténtalo de nuevo.');
          return;
        }
      }

      triggerHaptic('medium');
      onUnlockSuccess(password);
      onUpdateConfig({
        ...vaultConfig,
        isUnlocked: true,
        lastUnlockedAt: Date.now(),
        autoLockMinutes,
      });
      onClose();
    } catch {
      setError('Error al validar la contraseña.');
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      const salt = window.crypto.randomUUID();
      const hash = await hashPassword(password, salt);

      const newConfig: VaultConfig = {
        isVaultSetup: true,
        isUnlocked: true,
        passwordHash: hash,
        salt,
        autoLockMinutes,
        lastUnlockedAt: Date.now(),
      };

      triggerHaptic('heavy');
      onUpdateConfig(newConfig);
      onUnlockSuccess(password);
      onClose();
    } catch {
      setError('Error al configurar la bóveda cifrada en Aihnoa Notes.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0B1120] shadow-2xl border border-slate-200 dark:border-blue-900 overflow-hidden text-slate-900 dark:text-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-5 pb-4 bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-600 text-white flex items-center justify-between border-b border-blue-400/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner">
              {vaultConfig.isUnlocked ? (
                <Unlock className="w-6 h-6 text-white" />
              ) : (
                <Lock className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold">Bóveda Cifrada Aihnoa</h3>
              <p className="text-xs text-blue-100 font-mono">
                Cifrado AES-256-GCM / PBKDF2
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status info banner */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-blue-950/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-500" />
            <span>
              {encryptedNotesCount}{' '}
              {encryptedNotesCount === 1 ? 'nota cifrada' : 'notas cifradas'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Timer className="w-3.5 h-3.5 text-slate-400" />
            <span>Auto-bloqueo: {autoLockMinutes} min</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {mode === 'unlock' && vaultConfig.isVaultSetup && (
            <form onSubmit={handleUnlock} className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Ingresa tu contraseña maestra para desbloquear y ver tus notas protegidas:
              </p>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña de la bóveda"
                  className="w-full px-4 py-3 pr-10 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-blue-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <div className="p-2.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-blue-600/30 active:scale-98 transition flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                Desbloquear Bóveda
              </button>

              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('change');
                    setPassword('');
                    setError('');
                  }}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-cyan-400 transition"
                >
                  ¿Deseas cambiar o restablecer tu clave?
                </button>
              </div>
            </form>
          )}

          {(mode === 'setup' || mode === 'change') && (
            <form onSubmit={handleSetup} className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-2xl text-xs text-blue-900 dark:text-cyan-300 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <KeyRound className="w-4 h-4 text-cyan-500" />
                  Seguridad Zero-Knowledge en Aihnoa Notes
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Tus datos se cifran en tu dispositivo. Guarda tu clave en un lugar seguro.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nueva Contraseña Maestra (mínimo 6 caracteres)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-10 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-blue-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirmar Contraseña
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-blue-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tiempo de auto-bloqueo por inactividad
                </label>
                <select
                  value={autoLockMinutes}
                  onChange={(e) => setAutoLockMinutes(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-blue-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1 Minuto</option>
                  <option value={5}>5 Minutos (Recomendado Tech)</option>
                  <option value={15}>15 Minutos</option>
                  <option value={60}>1 Hora</option>
                  <option value={0}>Bloqueo manual solamente</option>
                </select>
              </div>

              {error && (
                <div className="p-2.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                {vaultConfig.isVaultSetup && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('unlock');
                      setError('');
                    }}
                    className="flex-1 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-2xl transition"
                  >
                    Volver
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs font-bold rounded-2xl shadow-md active:scale-98 transition flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Guardar y Activar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
