import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Square, Play, Pause, Trash2, Check, RefreshCw, Volume2, Sparkles, Cpu } from 'lucide-react';
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

      timerRef.current = window.setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0B1120] shadow-2xl border border-slate-200 dark:border-blue-900 overflow-hidden text-slate-900 dark:text-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-5 pb-3 flex items-center justify-between border-b border-slate-100 dark:border-blue-950">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-950 text-blue-500 rounded-xl">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Nota de Voz & Transcripción Tech</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Aihnoa Notes procesa audio y voz a texto
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
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
                    ? 'bg-gradient-to-t from-blue-600 via-cyan-400 to-cyan-300 shadow-sm shadow-cyan-400/50 animate-pulse'
                    : audioUrl
                    ? 'bg-blue-400 dark:bg-blue-600'
                    : 'bg-slate-200 dark:bg-slate-800'
                }`}
                style={{
                  height: isRecording ? `${height}%` : audioUrl ? '35%' : '15%',
                }}
              />
            ))}
          </div>

          {/* Time Counter */}
          <div className="text-3xl font-mono font-bold tracking-tight text-slate-800 dark:text-slate-100">
            {formatSeconds(duration)}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            {!isRecording && !audioUrl && (
              <button
                onClick={startRecording}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 active:scale-95 transition"
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
                  className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md active:scale-95 transition"
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
                  className="w-12 h-12 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center active:scale-95 transition"
                  title="Grabar de nuevo"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Speech-to-text transcript box */}
          <div className="w-full">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5 px-1">
              <span className="flex items-center gap-1 font-semibold text-blue-500">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Transcripción en Tiempo Real:
              </span>
              {speechSupported ? (
                <span className="text-[10px] text-cyan-400 font-mono">● Activo</span>
              ) : (
                <span className="text-[10px] text-slate-400">Reconocimiento no disponible</span>
              )}
            </div>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="El texto dictado aparecerá aquí automáticamente mientras hablas..."
              rows={3}
              className="w-full p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-blue-900/60 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-blue-950 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!audioUrl}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-md transition"
          >
            <Check className="w-4 h-4" />
            Guardar en Nota
          </button>
        </div>
      </div>
    </div>
  );
};
