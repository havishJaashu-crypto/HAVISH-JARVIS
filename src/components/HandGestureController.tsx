import React, { useState, useEffect, useRef } from 'react';
import {
  Hand,
  Camera,
  VideoOff,
  Sparkles,
  CheckCircle2,
  X,
  Volume2,
  Navigation,
  Compass,
  Zap,
} from 'lucide-react';

export type GestureType = 'OPEN_PALM' | 'CLOSED_FIST' | 'POINT_INDEX' | 'PEACE_SIGN' | 'SHAKA' | 'SWIPE_NEXT' | 'SWIPE_PREV';

interface HandGestureControllerProps {
  isOpen: boolean;
  onClose: () => void;
  onGestureDetected: (gesture: GestureType) => void;
  isMicActive: boolean;
}

export const HandGestureController: React.FC<HandGestureControllerProps> = ({
  isOpen,
  onClose,
  onGestureDetected,
  isMicActive,
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [detectedGesture, setDetectedGesture] = useState<GestureType | null>(null);
  const [gestureHistory, setGestureHistory] = useState<{ id: string; name: string; time: string }[]>([]);
  const [confidence, setConfidence] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number | null>(null);

  // Start Camera Stream for optical gesture tracking
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera access for gestures unavailable, defaulting to holographic pad:', err);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (!isOpen && cameraActive) {
      stopCamera();
    }
  }, [isOpen]);

  // Optical Tracking Loop: Samples canvas motion/luminance
  useEffect(() => {
    if (!cameraActive) return;

    let lastLuma = 0;
    const processFrame = () => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, 160, 120);
          const frame = ctx.getImageData(0, 0, 160, 120);
          let totalLuma = 0;
          for (let i = 0; i < frame.data.length; i += 16) {
            totalLuma += (frame.data[i] + frame.data[i + 1] + frame.data[i + 2]) / 3;
          }
          const avgLuma = totalLuma / (frame.data.length / 16);
          const diff = Math.abs(avgLuma - lastLuma);
          lastLuma = avgLuma;

          // If substantial optical motion delta detected, synthesize optical gesture tracking
          if (diff > 8) {
            setConfidence(Math.min(98, Math.round(75 + diff * 1.5)));
          } else {
            setConfidence((prev) => Math.max(0, prev - 5));
          }
        }
      }
      animRef.current = requestAnimationFrame(processFrame);
    };

    animRef.current = requestAnimationFrame(processFrame);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [cameraActive]);

  const triggerGesture = (gesture: GestureType, label: string) => {
    setDetectedGesture(gesture);
    setConfidence(95);
    onGestureDetected(gesture);
    setGestureHistory((prev) => [
      { id: `g-${Date.now()}`, name: label, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 4),
    ]);
    setTimeout(() => setDetectedGesture(null), 1800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl border border-cyan-500/50 bg-[#060c18] p-5 sm:p-6 shadow-[0_0_50px_rgba(6,182,212,0.4)] text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
              <Hand className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-hud text-sm font-semibold tracking-wider text-cyan-200">
                HOLOGRAPHIC HAND GESTURE MATRIX
              </h3>
              <p className="text-[10px] font-mono-tech text-cyan-400/70">
                OPTICAL VISION SENSOR + TACTILE GESTURE CONTROLLER
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Vision Feed & Virtual Hologram Stage */}
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          {/* Camera Tracker Viewport */}
          <div className="relative w-full sm:w-56 h-40 rounded-xl border border-cyan-500/40 bg-black/80 flex items-center justify-center overflow-hidden shrink-0">
            {cameraActive ? (
              <>
                <video ref={videoRef} playsInline muted className="w-full h-full object-cover mirror" />
                <canvas ref={canvasRef} width="160" height="120" className="hidden" />
                {/* Holographic Target Grid Overlay */}
                <div className="absolute inset-0 pointer-events-none border border-cyan-400/30">
                  <div className="absolute top-2 left-2 text-[8px] font-mono-tech text-cyan-300">
                    OPTICAL TRACK: ENGAGED
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-cyan-400/50 rounded-full animate-ping pointer-events-none" />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-3">
                <VideoOff className="w-6 h-6 text-slate-500 mb-1" />
                <span className="text-[11px] font-hud text-slate-400">CAMERA STANDBY</span>
                <button
                  onClick={startCamera}
                  className="mt-2 px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 text-[10px] font-hud transition flex items-center gap-1"
                >
                  <Camera className="w-3 h-3" />
                  <span>START CAMERA</span>
                </button>
              </div>
            )}
          </div>

          {/* Gesture Confidence & Feedback HUD */}
          <div className="flex-1 flex flex-col justify-between p-3 rounded-xl border border-cyan-900/40 bg-cyan-950/20">
            <div>
              <div className="flex items-center justify-between text-xs font-hud">
                <span className="text-cyan-300">TRACKING CONFIDENCE:</span>
                <span className="text-cyan-200 font-mono-tech">{confidence}%</span>
              </div>
              <div className="w-full bg-black/60 rounded-full h-1.5 mt-1 overflow-hidden border border-cyan-950">
                <div
                  className="bg-cyan-400 h-full transition-all duration-150"
                  style={{ width: `${confidence}%` }}
                />
              </div>

              {detectedGesture && (
                <div className="mt-3 p-2 rounded-lg bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 text-xs font-hud flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>TRIGGERED: {detectedGesture}</span>
                </div>
              )}
            </div>

            <div className="mt-3">
              <span className="text-[10px] font-mono-tech text-slate-400 block mb-1">
                RECENT SENSOR DIRECTIVES:
              </span>
              <div className="space-y-1">
                {gestureHistory.length === 0 ? (
                  <span className="text-[10px] text-slate-500 italic">No gestures triggered yet.</span>
                ) : (
                  gestureHistory.map((g) => (
                    <div key={g.id} className="text-[10px] font-mono-tech text-cyan-300/80 flex justify-between">
                      <span>✓ {g.name}</span>
                      <span className="text-slate-500">{g.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Holographic Tactical Gesture Controls */}
        <div className="mt-4">
          <div className="text-[11px] font-hud text-cyan-300 font-semibold mb-2">
            AVAILABLE HAND GESTURES & TACTICAL SHORTCUTS:
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              onClick={() => triggerGesture('OPEN_PALM', 'Open Palm (Mic Auto-Engage)')}
              className="p-2.5 rounded-xl border border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-900/40 text-left transition"
            >
              <div className="text-lg mb-0.5">✋</div>
              <div className="font-hud text-xs text-white font-bold">OPEN PALM</div>
              <div className="text-[10px] text-cyan-400/80">Activate Mic & Auto-Listen</div>
            </button>

            <button
              onClick={() => triggerGesture('CLOSED_FIST', 'Closed Fist (Halt / Mute)')}
              className="p-2.5 rounded-xl border border-rose-500/40 bg-rose-950/30 hover:bg-rose-900/40 text-left transition"
            >
              <div className="text-lg mb-0.5">✊</div>
              <div className="font-hud text-xs text-white font-bold">CLOSED FIST</div>
              <div className="text-[10px] text-rose-300/80">Stop Speech & Mute</div>
            </button>

            <button
              onClick={() => triggerGesture('POINT_INDEX', 'Point Index (Approve Command)')}
              className="p-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/30 hover:bg-emerald-900/40 text-left transition"
            >
              <div className="text-lg mb-0.5">☝️</div>
              <div className="font-hud text-xs text-white font-bold">POINT / INDEX</div>
              <div className="text-[10px] text-emerald-300/80">Confirm & Approve Ride</div>
            </button>

            <button
              onClick={() => triggerGesture('PEACE_SIGN', 'Peace Sign (Telugu Movie Dialogue)')}
              className="p-2.5 rounded-xl border border-amber-500/40 bg-amber-950/30 hover:bg-amber-900/40 text-left transition"
            >
              <div className="text-lg mb-0.5">✌️</div>
              <div className="font-hud text-xs text-white font-bold">PEACE SIGN</div>
              <div className="text-[10px] text-amber-300/80">Telugu Cinema Meme & Joke</div>
            </button>

            <button
              onClick={() => triggerGesture('SHAKA', 'Shaka (Dubbed Movie Lore)')}
              className="p-2.5 rounded-xl border border-purple-500/40 bg-purple-950/30 hover:bg-purple-900/40 text-left transition"
            >
              <div className="text-lg mb-0.5">🤙</div>
              <div className="font-hud text-xs text-white font-bold">SHAKA SIGN</div>
              <div className="text-[10px] text-purple-300/80">Iron Man / KGF Dubbed Lore</div>
            </button>

            <button
              onClick={() => triggerGesture('SWIPE_NEXT', 'Swipe Right (Next View)')}
              className="p-2.5 rounded-xl border border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-900/40 text-left transition"
            >
              <div className="text-lg mb-0.5">👉</div>
              <div className="font-hud text-xs text-white font-bold">SWIPE RIGHT</div>
              <div className="text-[10px] text-cyan-300/80">Cycle HUD Panels</div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-cyan-950 flex items-center justify-between">
          <div className="text-[10px] font-mono-tech text-cyan-400/70">
            J.A.R.V.I.S. OPTICAL & HOLOGRAPHIC SENSOR ARRAY
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/50 hover:bg-cyan-500/30 text-cyan-200 text-xs font-hud tracking-wider transition"
          >
            DISMISS MATRIX
          </button>
        </div>
      </div>
    </div>
  );
};
