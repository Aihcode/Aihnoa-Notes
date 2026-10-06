import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Square, Play, Pause, Trash2, Check, RefreshCw, Volume2, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../utils/theme';

interface VoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAudio: (audioData: string, duration: number, transcript: string) => void;
}

export const VoiceRecorderModal: React.FC<VoiceRecorderModalProps> = ({
  isOpen,
  onClose,
  onSaveAudio,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(false);
  const [volumeBars, setVolumeBars] = useState<number[]>([20, 40, 60, 30, 80, 50, 20]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
      }
    }
  }, []);

  // Cleanup on unmount or close
  useEffect(() => {
    if (!isOpen) {
      stopRecording();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioUrl(null);
      setDuration(0);
      setTranscript('');
      setIsPlaying(false);
    }
  }, [isOpen]);

  const startRecording = async () => {
    try {
      triggerHaptic('medium');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Audio Context for visualizer
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 32;
      analyserRef.current = analyser;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const updateVisualizer = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const bars = Array.from(dataArray.slice(0, 7)).map((v) => Math.max(15, (v / 255) * 100));
          setVolumeBars(bars);
        }
        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
      };
      updateVisualizer();

      // Media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setAudioUrl(reader.result as string);
        };
        stream.getTracks().forEach((track) => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      // Start duration counter
      timerRef.current = window.setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      // Web Speech recognition
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'es-ES';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition error:', e);
        };

        recognitionRef.current = recognition;
        recognition.start();
      }
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Por favor concede permiso de micrófono para grabar notas de voz.');
    }
  };

  const stopRecording = () => {
    triggerHaptic('light');
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
  };

  const togglePlayback = () => {
    if (!audioUrl) return;
    if (!audioPlayerRef.current) {
      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;
      audio.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSave = () => {
    if (audioUrl) {
      triggerHaptic('heavy');
      onSaveAudio(audioUrl, duration, transcript);
      onClose();
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden text-stone-900 dark:text-stone-100 flex flex-col">
        {/* Header */}
        <div className="p-5 pb-3 flex items-center justify-between border-b border-stone-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Nota de Voz & Transcripción</h3>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                Graba audio con transcripción local en vivo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full"
          >
            ✕
          </button>
        </div>

        {/* Visualizer & Record section */}
        <div className="p-6 flex flex-col items-center justify-center gap-6">
          {/* Animated waveform bars */}
          <div className="flex items-center justify-center gap-1.5 h-20 w-full px-8">
            {volumeBars.map((height, idx) => (
              <div
                key={idx}
                className={`w-3 rounded-full transition-all duration-75 ${
                  isRecording
                    ? 'bg-gradient-to-t from-emerald-500 to-teal-400 animate-pulse'
                    : audioUrl
                    ? 'bg-emerald-300 dark:bg-emerald-700'
                    : 'bg-stone-200 dark:bg-zinc-800'
                }`}
                style={{
                  height: isRecording ? `${height}%` : audioUrl ? '35%' : '15%',
                }}
              />
            ))}
          </div>

          {/* Time Counter */}
          <div className="text-3xl font-mono font-bold tracking-tight text-stone-800 dark:text-stone-100">
            {formatSeconds(duration)}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            {!isRecording && !audioUrl && (
              <button
                onClick={startRecording}
                className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 active:scale-95 transition"
                title="Iniciar grabación"
              >
                <Mic className="w-8 h-8" />
              </button>
            )}

            {isRecording && (
              <button
                onClick={stopRecording}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/30 active:scale-95 animate-pulse transition"
                title="Detener grabación"
              >
                <Square className="w-7 h-7" />
              </button>
            )}

            {!isRecording && audioUrl && (
              <>
                <button
                  onClick={togglePlayback}
                  className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-md active:scale-95 transition"
                  title={isPlaying ? 'Pausar' : 'Reproducir'}
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </button>
                <button
                  onClick={() => {
                    setAudioUrl(null);
                    setDuration(0);
                    setTranscript('');
                  }}
                  className="w-12 h-12 rounded-full border border-stone-300 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-600 dark:text-stone-300 flex items-center justify-center active:scale-95 transition"
                  title="Grabar de nuevo"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Speech-to-text transcript box */}
          <div className="w-full">
            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-zinc-400 mb-1.5 px-1">
              <span className="flex items-center gap-1 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Transcripción de Voz:
              </span>
              {speechSupported ? (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400">● En vivo</span>
              ) : (
                <span className="text-[10px] text-stone-400">Reconocimiento no disponible</span>
              )}
            </div>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="El texto dictado aparecerá aquí automáticamente mientras hablas..."
              rows={3}
              className="w-full p-3 rounded-2xl bg-stone-100 dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700/80 text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>
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
            disabled={!audioUrl}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-sm transition"
          >
            <Check className="w-4 h-4" />
            Guardar en Nota
          </button>
        </div>
      </div>
    </div>
  );
};
