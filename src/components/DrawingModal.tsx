import React, { useRef, useState, useEffect } from 'react';
import { Palette, Undo2, Redo2, Trash2, Check, X, Eraser, PenTool, Circle } from 'lucide-react';
import { triggerHaptic } from '../utils/theme';

interface DrawingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDrawing: (dataUrl: string) => void;
  initialDataUrl?: string;
}

const COLORS = [
  '#000000',
  '#10B981',
  '#3B82F6',
  '#EF4444',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#FFFFFF',
];

const BRUSH_SIZES = [2, 5, 10, 20];

export const DrawingModal: React.FC<DrawingModalProps> = ({
  isOpen,
  onClose,
  onSaveDrawing,
  initialDataUrl,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState('#10B981');
  const [brushSize, setBrushSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    // Initialize canvas
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Set high resolution canvas dimensions
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 400;
    const height = Math.min(window.innerHeight * 0.55, 420);

    canvas.width = width * 2;
    canvas.height = height * 2;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(2, 2);

    // Default white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    if (initialDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        saveState(ctx);
      };
      img.src = initialDataUrl;
    } else {
      saveState(ctx);
    }
  }, [isOpen]);

  const saveState = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep <= 0) return;
    triggerHaptic('light');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const newStep = historyStep - 1;
    ctx.putImageData(history[newStep], 0, 0);
    setHistoryStep(newStep);
  };

  const redo = () => {
    if (historyStep >= history.length - 1) return;
    triggerHaptic('light');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const newStep = historyStep + 1;
    ctx.putImageData(history[newStep], 0, 0);
    setHistoryStep(newStep);
  };

  const clearCanvas = () => {
    triggerHaptic('medium');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, rect.width, rect.height);
    saveState(ctx);
  };

  const getPointerPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    isDrawingRef.current = true;
    const { x, y } = getPointerPos(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = isEraser ? '#FFFFFF' : color;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const { x, y } = getPointerPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.closePath();
    saveState(ctx);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    triggerHaptic('heavy');
    const dataUrl = canvas.toDataURL('image/png');
    onSaveDrawing(dataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden text-stone-900 dark:text-stone-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-stone-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-xl">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Lienzo de Dibujo & Bocetos</h3>
              <p className="text-[11px] text-stone-500 dark:text-zinc-400">
                Dibuja a mano alzada con soporte táctil
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

        {/* Toolbar */}
        <div className="p-3 bg-stone-50 dark:bg-zinc-800/40 border-b border-stone-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
          {/* Colors */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  setIsEraser(false);
                }}
                className={`w-6 h-6 rounded-full border border-stone-300 dark:border-zinc-700 transition ${
                  color === c && !isEraser ? 'ring-2 ring-emerald-500 ring-offset-2 scale-110' : ''
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Tools & Brush Size */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsEraser(false)}
              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition ${
                !isEraser
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white dark:bg-zinc-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-zinc-700'
              }`}
              title="Pincel"
            >
              <PenTool className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsEraser(true)}
              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition ${
                isEraser
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white dark:bg-zinc-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-zinc-700'
              }`}
              title="Borrador"
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>

            {/* Brush sizes */}
            <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 p-1 rounded-lg border border-stone-200 dark:border-zinc-700">
              {BRUSH_SIZES.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setBrushSize(sz)}
                  className={`w-5 h-5 flex items-center justify-center rounded ${
                    brushSize === sz ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' : 'text-stone-500'
                  }`}
                >
                  <Circle
                    className="fill-current"
                    style={{ width: Math.max(4, sz * 0.7), height: Math.max(4, sz * 0.7) }}
                  />
                </button>
              ))}
            </div>

            {/* Undo / Redo / Clear */}
            <div className="flex items-center gap-1">
              <button
                onClick={undo}
                disabled={historyStep <= 0}
                className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-zinc-700 disabled:opacity-30 transition"
                title="Deshacer"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={historyStep >= history.length - 1}
                className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-zinc-700 disabled:opacity-30 transition"
                title="Rehacer"
              >
                <Redo2 className="w-4 h-4" />
              </button>
              <button
                onClick={clearCanvas}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                title="Borrar lienzo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-stone-200/60 dark:bg-zinc-950 p-2 flex items-center justify-center overflow-hidden touch-none select-none">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full bg-white rounded-2xl shadow-inner cursor-crosshair border border-stone-300"
          />
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 dark:bg-zinc-800/50 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-zinc-700/60 rounded-xl transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition"
          >
            <Check className="w-4 h-4" />
            Insertar Dibujo
          </button>
        </div>
      </div>
    </div>
  );
};
