import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'button' | 'banner' | 'icon';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'button' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (variant === 'banner' && !bannerDismissed && (isInstallable || isIOS)) {
    return (
      <div className="mx-4 mb-3 p-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl text-white shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-tight">Instalar Krypta en Android / Móvil</h4>
            <p className="text-[11px] text-emerald-100">Úsala 100% offline y en pantalla completa</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              if (isIOS) setShowIOSGuide(true);
              else install();
            }}
            className="px-3 py-1.5 bg-white text-emerald-800 text-xs font-bold rounded-xl shadow hover:bg-emerald-50 active:scale-95 transition"
          >
            Instalar
          </button>
          <button
            onClick={() => setBannerDismissed(true)}
            className="p-1 text-white/80 hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {isInstallable && (
        <button
          onClick={install}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition"
          title="Instalar App en Android"
        >
          <Download className="w-4 h-4" />
          <span>Instalar App</span>
        </button>
      )}

      {isIOS && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-zinc-800 active:scale-95 text-xs font-medium transition"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
          <span>Instalar en iOS</span>
        </button>
      )}

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 p-6 shadow-2xl border border-stone-200 dark:border-zinc-800 text-stone-900 dark:text-stone-100">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold">Instalar en iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-stone-600 dark:text-stone-300">
              <div className="flex items-start gap-3 p-2.5 bg-stone-50 dark:bg-zinc-800/60 rounded-xl">
                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-lg">
                  <Share className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-stone-800 dark:text-stone-200">1. Botón Compartir</p>
                  <p className="text-xs text-stone-500 dark:text-zinc-400">Toca el botón compartir en Safari abajo.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 bg-stone-50 dark:bg-zinc-800/60 rounded-xl">
                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-stone-800 dark:text-stone-200">2. Agregar a Inicio</p>
                  <p className="text-xs text-stone-500 dark:text-zinc-400">Desplázate y selecciona "Agregar a pantalla de inicio".</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
