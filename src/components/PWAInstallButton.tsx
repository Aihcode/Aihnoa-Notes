import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, Share, Cpu } from 'lucide-react';
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
      <div className="mx-4 mb-3 p-3.5 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 rounded-2xl text-white shadow-xl shadow-blue-950/20 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300 border border-blue-400/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl shadow-inner">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-tight">Instalar Aihnoa Notes en Android</h4>
            <p className="text-[11px] text-blue-100">Aplicación 100% offline y en pantalla completa</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              if (isIOS) setShowIOSGuide(true);
              else install();
            }}
            className="px-3.5 py-1.5 bg-white text-blue-800 text-xs font-bold rounded-xl shadow-md hover:bg-blue-50 active:scale-95 transition"
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
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition"
          title="Instalar Aihnoa Notes en Android"
        >
          <Download className="w-4 h-4" />
          <span>Instalar App</span>
        </button>
      )}

      {isIOS && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-blue-900/60 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 text-xs font-medium transition"
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-500" />
          <span>Instalar en iOS</span>
        </button>
      )}

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-blue-900 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-blue-950">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-bold">Instalar Aihnoa Notes en iOS</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-3 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-950 text-blue-500 rounded-lg">
                  <Share className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">1. Botón Compartir</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Toca el botón compartir en Safari abajo.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-950 text-blue-500 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">2. Agregar a Inicio</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Desplázate y selecciona "Agregar a pantalla de inicio".</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
