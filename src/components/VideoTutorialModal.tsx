import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Gauge, 
  RotateCcw, 
  FastForward, 
  Rewind, 
  Maximize2, 
  Sparkles,
  Check,
  Video
} from 'lucide-react';
import { playSound } from '../utils/audio';

interface VideoTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
  driveWebUrl?: string;
  soundEnabled?: boolean;
}

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

export function VideoTutorialModal({
  isOpen,
  onClose,
  videoUrl = "https://drive.google.com/file/d/19_DcgumyNW0R8CJKVlGtveUF6tmSugzGfbVubh0sH2A/preview",
  driveWebUrl = "https://docs.google.com/videos/d/19_DcgumyNW0R8CJKVlGtveUF6tmSugzGfbVubh0sH2A/play?usp=sharing",
  soundEnabled = true
}: VideoTutorialModalProps) {
  const [selectedSpeed, setSelectedSpeed] = useState<number>(1.0);
  const [speedNotification, setSpeedNotification] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle speed notification toast timeout
  useEffect(() => {
    if (speedNotification) {
      const timer = setTimeout(() => {
        setSpeedNotification(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [speedNotification]);

  if (!isOpen) return null;

  const sendIframeCommand = (func: string, args: any[] = []) => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        // YouTube / Google Video IFrame API postMessage standard
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: func,
            args: args
          }),
          '*'
        );

        // Generic postMessage format supported by HTML5 video wrappers
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            method: func,
            value: args[0],
            args: args
          }),
          '*'
        );
      }
    } catch (err) {
      console.warn("Could not send postMessage to video iframe:", err);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setSelectedSpeed(speed);
    playSound('click', soundEnabled);

    // Send command to the video player
    sendIframeCommand('setPlaybackRate', [speed]);
    setSpeedNotification(`Velocidad: ${speed === 1.0 ? '1.0x (Normal)' : `${speed}x`}`);
  };

  const handleSeek = (secondsOffset: number) => {
    playSound('click', soundEnabled);
    // Request relative seek if supported
    sendIframeCommand('seekBy', [secondsOffset]);
    setSpeedNotification(secondsOffset > 0 ? `+${secondsOffset}s` : `${secondsOffset}s`);
  };

  const handleRestart = () => {
    playSound('click', soundEnabled);
    sendIframeCommand('seekTo', [0, true]);
    setSpeedNotification('Reiniciando video desde 0:00');
  };

  const toggleFullscreen = () => {
    playSound('click', soundEnabled);
    if (!modalContainerRef.current) return;

    if (!document.fullscreenElement) {
      modalContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.warn("Fullscreen request error:", err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        ref={modalContainerRef}
        className="relative w-full max-w-5xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
      >
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#39A900]/20 text-[#39A900] flex items-center justify-center shrink-0 border border-[#39A900]/30 shadow-xs">
              <Video className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-black truncate text-white">
                Video Tutorial: Inducción al Reglamento del Aprendiz SENA
              </h3>
              <p className="text-[10px] sm:text-[11px] text-emerald-400 font-semibold truncate flex items-center gap-1.5">
                <span>Acuerdo No. 009 de 2024</span>
                <span>•</span>
                <span className="text-slate-400">Controles con cambio de velocidad</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {driveWebUrl && (
              <a
                href={driveWebUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-colors cursor-pointer"
                title="Abrir en pestaña completa de Google Drive"
              >
                <span>Ver en Drive</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Pantalla Completa"
              aria-label="Alternar pantalla completa"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Cerrar video tutorial"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Area */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          <iframe
            ref={iframeRef}
            src={`${videoUrl}?enablejsapi=1`}
            className="w-full h-full border-0"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            title="Video Tutorial de Inducción SENA"
          />

          {/* Floating Speed Feedback Badge */}
          {speedNotification && (
            <div className="absolute top-4 left-4 z-20 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
              <div className="px-3.5 py-1.5 rounded-full bg-slate-900/90 text-white border border-[#39A900] shadow-xl text-xs font-black flex items-center gap-2 backdrop-blur-md">
                <Gauge className="w-3.5 h-3.5 text-[#39A900]" />
                <span>{speedNotification}</span>
              </div>
            </div>
          )}
        </div>

        {/* Video Controls Bar with Speed Changes */}
        <div className="bg-slate-900/95 border-t border-slate-800 p-3 sm:p-4 space-y-3">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3 text-xs">
            {/* Speed Change Controls */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 w-full lg:w-auto">
              <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs mr-1">
                <Gauge className="w-4 h-4 text-[#39A900]" />
                <span>Velocidad:</span>
              </div>

              <div className="flex flex-wrap items-center gap-1 bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
                {SPEED_OPTIONS.map((speed) => {
                  const isCurrent = selectedSpeed === speed;
                  return (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => handleSpeedChange(speed)}
                      className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#39A900] text-white shadow-md shadow-emerald-900/50 ring-2 ring-emerald-400/40 scale-105'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                      title={`Reproducir a ${speed}x`}
                    >
                      {speed === 1.0 ? '1x (Normal)' : `${speed}x`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Seek & Navigation Controls */}
            <div className="flex items-center gap-2 w-full lg:w-auto justify-center">
              <button
                type="button"
                onClick={() => handleSeek(-10)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                title="Retroceder 10 segundos"
              >
                <Rewind className="w-3.5 h-3.5 text-amber-400" />
                <span>-10s</span>
              </button>

              <button
                type="button"
                onClick={() => handleSeek(10)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                title="Adelantar 10 segundos"
              >
                <span>+10s</span>
                <FastForward className="w-3.5 h-3.5 text-amber-400" />
              </button>

              <button
                type="button"
                onClick={handleRestart}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                title="Volver al inicio (0:00)"
              >
                <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                <span>Reiniciar</span>
              </button>
            </div>
          </div>

          {/* Helpful Information Note */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 gap-2 text-center sm:text-left">
            <p className="flex items-center gap-1.5">
              <span className="text-[#39A900]">💡 Tip:</span>
              <span>
                También puedes cambiar la velocidad y calidad directamente en el icono de engranaje ⚙️ dentro del video.
              </span>
            </p>

            <a
              href={driveWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-semibold underline flex items-center gap-1 cursor-pointer"
            >
              <span>Abrir reproductor nativo de Google Drive</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
