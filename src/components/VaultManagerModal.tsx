import React, { useState } from 'react';
import { Lock, Unlock, KeyRound, ShieldCheck, ShieldAlert, Timer, Eye, EyeOff, Check, X } from 'lucide-react';
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
      setError('Error al configurar la bóveda cifrada.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden text-stone-900 dark:text-stone-100 flex flex-col">
        {/* Header */}
        <div className="p-5 pb-4 bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl">
              {vaultConfig.isUnlocked ? (
                <Unlock className="w-6 h-6 text-white" />
              ) : (
                <Lock className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold">Bóveda Cifrada E2EE</h3>
              <p className="text-xs text-emerald-100">
                Cifrado AES-256 de extremo a extremo
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
        <div className="px-6 py-3 bg-stone-50 dark:bg-zinc-800/50 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between text-xs text-stone-600 dark:text-stone-300">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>
              {encryptedNotesCount}{' '}
              {encryptedNotesCount === 1 ? 'nota cifrada' : 'notas cifradas'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Timer className="w-3.5 h-3.5 text-stone-400" />
            <span>Auto-bloqueo: {autoLockMinutes} min</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {mode === 'unlock' && vaultConfig.isVaultSetup && (
            <form onSubmit={handleUnlock} className="space-y-4">
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Ingresa tu contraseña maestra para desbloquear y ver tus notas protegidas:
              </p>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña de la bóveda"
                  className="w-full px-4 py-3 pr-10 rounded-2xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-stone-400 hover:text-stone-600"
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
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-2xl shadow-md active:scale-98 transition flex items-center justify-center gap-2"
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
                  className="text-xs text-stone-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                >
                  ¿Deseas cambiar o restablecer tu clave?
                </button>
              </div>
            </form>
          )}

          {(mode === 'setup' || mode === 'change') && (
            <form onSubmit={handleSetup} className="space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-2xl text-xs text-amber-800 dark:text-amber-300 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  Cifrado de Conocimiento Cero (Zero-Knowledge)
                </p>
                <p>
                  Tu contraseña nunca se envía a ningún servidor. Si la olvidas, no será posible
                  recuperar tus notas cifradas.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Nueva Contraseña Maestra (mínimo 6 caracteres)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-10 rounded-2xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Confirmar Contraseña
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Tiempo de auto-bloqueo por inactividad
                </label>
                <select
                  value={autoLockMinutes}
                  onChange={(e) => setAutoLockMinutes(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={1}>1 Minuto</option>
                  <option value={5}>5 Minutos (Recomendado)</option>
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
                    className="flex-1 py-2.5 text-xs font-semibold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 rounded-2xl transition"
                  >
                    Volver
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-md active:scale-98 transition flex items-center justify-center gap-1.5"
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
