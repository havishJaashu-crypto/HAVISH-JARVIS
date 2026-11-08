import React, { useMemo } from 'react';
import { ReactorState, EmotionType, LanguageLock } from '../types';

interface ArcReactorOrbProps {
  state: ReactorState;
  audioLevel: number;
  emotion?: EmotionType;
  lockedLanguage?: LanguageLock;
  onResetLanguage?: () => void;
  onClick?: () => void;
  className?: string;
}

export const ArcReactorOrb: React.FC<ArcReactorOrbProps> = ({
  state,
  audioLevel,
  emotion = 'Calm',
  lockedLanguage = 'auto',
  onResetLanguage,
  onClick,
  className = '',
}) => {
  // Compute dynamic scale and glow based on reactor state & audioLevel (0-100)
  const normalizedLevel = Math.min(100, Math.max(0, audioLevel));

  // Determine core color scheme and speeds based on state and emotion
  const { coreColor, auraColor, secondaryColor, ringSpeedClass, stateLabel, subLabel } = useMemo(() => {
    switch (state) {
      case 'WAKE_WORD_DETECTED':
        return {
          coreColor: '#ffffff',
          auraColor: '#00f2fe',
          secondaryColor: '#f59e0b',
          ringSpeedClass: 'animate-spin-fast',
          stateLabel: 'WAKE WORD ENGAGED',
          subLabel: 'JARVIS DUAL MATRIX ACTIVE',
        };
      case 'LISTENING':
        return {
          coreColor: '#38bdf8',
          auraColor: '#06b6d4',
          secondaryColor: '#00f2fe',
          ringSpeedClass: 'animate-spin-medium',
          stateLabel: 'NEURAL LISTENING',
          subLabel: `SENSORY FLUX: ${normalizedLevel}dB`,
        };
      case 'PROCESSING':
        return {
          coreColor: '#a5f3fc',
          auraColor: '#38bdf8',
          secondaryColor: '#818cf8',
          ringSpeedClass: 'animate-spin-fast',
          stateLabel: 'SYNAPSE PROCESSING',
          subLabel: 'QUANTUM LOGIC SOLVING...',
        };
      case 'SPEAKING':
        return {
          coreColor: '#ffffff',
          auraColor: '#00f2fe',
          secondaryColor: '#38bdf8',
          ringSpeedClass: 'animate-spin-medium',
          stateLabel: 'VOCAL SYNTHESIS',
          subLabel: `SPEECH MODULATION: ${normalizedLevel}%`,
        };
      case 'ERROR':
        return {
          coreColor: '#fda4af',
          auraColor: '#f43f5e',
          secondaryColor: '#fb7185',
          ringSpeedClass: 'animate-spin-slow',
          stateLabel: 'SYSTEM ALERT',
          subLabel: 'RE-CALIBRATING CIRCUITS',
        };
      case 'IDLE':
      default:
        return {
          coreColor: '#00f2fe',
          auraColor: '#0284c7',
          secondaryColor: '#0ea5e9',
          ringSpeedClass: 'animate-spin-slow',
          stateLabel: 'ONLINE // READY',
          subLabel: 'SAY "JARVIS" • TELUGU / EN',
        };
    }
  }, [state, normalizedLevel]);

  // Audio-reactive scaling
  const coreScale = useMemo(() => {
    if (state === 'LISTENING' || state === 'SPEAKING') {
      return 1 + (normalizedLevel / 100) * 0.42;
    }
    if (state === 'PROCESSING') {
      return 1.2;
    }
    if (state === 'WAKE_WORD_DETECTED') {
      return 1.35;
    }
    return 1.0;
  }, [state, normalizedLevel]);

  // 32-Bar Radial Spectrum Audio Visualizer Bars around the perimeter
  const radialBars = useMemo(() => {
    const bars = [];
    const count = 32;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 360;
      // Synthesize bar height modulated by audioLevel and sin wave
      const phase = (i % 8) / 8;
      const barHeight = Math.max(4, Math.min(24, 5 + (normalizedLevel / 100) * 19 * Math.sin(phase * Math.PI + (normalizedLevel / 20))));
      bars.push({ angle, height: barHeight });
    }
    return bars;
  }, [normalizedLevel]);

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      title="Click or tap to talk to JARVIS (Say 'Jarvis' in English or Telugu)"
      className={`relative flex flex-col items-center justify-center select-none cursor-pointer group focus:outline-none ${className}`}
    >
      {/* 1. Holographic Projection Floor Grid & Light Cone */}
      <div
        className="absolute w-[320px] h-[320px] sm:w-[440px] sm:h-[440px] rounded-full pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${auraColor}28 0%, ${auraColor}0d 50%, transparent 72%)`,
          transform: `scale(${coreScale * 1.15})`,
          filter: state === 'WAKE_WORD_DETECTED' ? 'blur(8px)' : 'blur(24px)',
        }}
      />

      {/* 2. Cyber Scanline & Hologram Projector Effect */}
      <div
        className="absolute -top-10 w-[240px] sm:w-[320px] h-[220px] pointer-events-none opacity-20"
        style={{
          background: `conic-gradient(from 180deg at 50% 100%, transparent 40%, ${auraColor}44 50%, transparent 60%)`,
          filter: 'blur(12px)',
        }}
      />

      {/* Main SVG & HTML Hologram Stage */}
      <div className="relative w-[300px] h-[300px] sm:w-[390px] sm:h-[390px] flex items-center justify-center">
        {/* Layer 1: Outermost Holographic HUD Ring with Degree Ticks and Compass Coordinates */}
        <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Subtle Outer Grid Frame */}
          <circle
            cx="200"
            cy="200"
            r="194"
            fill="none"
            stroke="rgba(6, 182, 212, 0.25)"
            strokeWidth="1"
            strokeDasharray="2, 6"
          />
          <circle
            cx="200"
            cy="200"
            r="184"
            fill="none"
            stroke="rgba(14, 165, 233, 0.45)"
            strokeWidth="1.5"
          />

          {/* Compass & Precision Degree Markings */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <line
              key={deg}
              x1="200"
              y1="8"
              x2="200"
              y2={deg % 90 === 0 ? '24' : '16'}
              stroke={deg % 90 === 0 ? '#00f2fe' : 'rgba(56, 189, 248, 0.6)'}
              strokeWidth={deg % 90 === 0 ? '2' : '1'}
              transform={`rotate(${deg} 200 200)`}
            />
          ))}

          {/* Precision Cardinal Coordinates */}
          <text x="200" y="32" fill="rgba(56, 189, 248, 0.8)" fontSize="7" fontFamily="'Orbitron', sans-serif" textAnchor="middle">000° // NORTH</text>
          <text x="368" y="202" fill="rgba(56, 189, 248, 0.8)" fontSize="7" fontFamily="'Orbitron', sans-serif" textAnchor="middle">090°</text>
          <text x="200" y="375" fill="rgba(56, 189, 248, 0.8)" fontSize="7" fontFamily="'Orbitron', sans-serif" textAnchor="middle">180° // SOUTH</text>
          <text x="32" y="202" fill="rgba(56, 189, 248, 0.8)" fontSize="7" fontFamily="'Orbitron', sans-serif" textAnchor="middle">270°</text>

          {/* Floating Telemetry Coordinates */}
          <text x="75" y="75" fill="rgba(6, 182, 212, 0.6)" fontSize="6" fontFamily="'Share Tech Mono', monospace">STARK MK-VII</text>
          <text x="325" y="75" fill="rgba(6, 182, 212, 0.6)" fontSize="6" fontFamily="'Share Tech Mono', monospace" textAnchor="end">FLUX: 3.21 GW</text>
          <text x="75" y="335" fill="rgba(6, 182, 212, 0.6)" fontSize="6" fontFamily="'Share Tech Mono', monospace">ARC: 99.8%</text>
          <text x="325" y="335" fill="rgba(6, 182, 212, 0.6)" fontSize="6" fontFamily="'Share Tech Mono', monospace" textAnchor="end">HOLO-PROJ</text>
        </svg>

        {/* Layer 2: 32-Bar Radial Spectrum Audio Visualizer (Dynamic Dancing Crown) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            {radialBars.map((bar, idx) => (
              <line
                key={idx}
                x1="200"
                y1="28"
                x2="200"
                y2={28 + bar.height}
                stroke={idx % 4 === 0 ? '#00f2fe' : 'rgba(56, 189, 248, 0.7)'}
                strokeWidth="2.5"
                strokeLinecap="round"
                transform={`rotate(${bar.angle} 200 200)`}
                className="transition-all duration-75"
              />
            ))}
          </svg>
        </div>

        {/* Layer 3: Rotating Holographic Energy Ring (Clockwise) */}
        <div className={`absolute inset-0 w-full h-full ${ringSpeedClass}`}>
          <svg viewBox="0 0 400 400" className="w-full h-full">
            {/* Segmented Outer Arc Plates */}
            <circle
              cx="200"
              cy="200"
              r="162"
              fill="none"
              stroke={auraColor}
              strokeWidth="4"
              strokeDasharray="70 25 20 25"
              strokeOpacity="0.85"
            />
            <circle
              cx="200"
              cy="200"
              r="150"
              fill="none"
              stroke={secondaryColor}
              strokeWidth="1.8"
              strokeDasharray="4 8"
              strokeOpacity="0.75"
            />
          </svg>
        </div>

        {/* Layer 4: Counter-Rotating Mechanical Induction Ring (Counter-Clockwise) */}
        <div
          className={`absolute inset-0 w-full h-full ${
            state === 'PROCESSING' ? 'animate-spin-reverse-medium' : 'animate-spin-reverse-slow'
          }`}
        >
          <svg viewBox="0 0 400 400" className="w-full h-full">
            {/* 10 Induction Coils (Authentic Stark Arc Reactor) */}
            {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((deg) => (
              <g key={deg} transform={`rotate(${deg} 200 200)`}>
                {/* Copper/Cyan Induction Block */}
                <rect
                  x="188"
                  y="58"
                  width="24"
                  height="18"
                  rx="3"
                  fill="rgba(6, 182, 212, 0.25)"
                  stroke="#00f2fe"
                  strokeWidth="1.5"
                />
                {/* Core winding line */}
                <line x1="200" y1="58" x2="200" y2="76" stroke="#ffffff" strokeWidth="2" />
              </g>
            ))}

            <circle
              cx="200"
              cy="200"
              r="128"
              fill="none"
              stroke="rgba(6, 182, 212, 0.6)"
              strokeWidth="2.5"
              strokeDasharray="35 15"
            />
          </svg>
        </div>

        {/* Layer 5: 3D Holographic Orbit Dust Particles */}
        <div
          className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none animate-spin-slow"
          style={{ transform: `scale(${1 + (normalizedLevel / 100) * 0.15})` }}
        >
          <svg viewBox="0 0 400 400" className="w-full h-full opacity-80">
            {/* Floating particle orbit rings */}
            <ellipse
              cx="200"
              cy="200"
              rx="115"
              ry="75"
              fill="none"
              stroke="rgba(0, 242, 254, 0.4)"
              strokeWidth="1"
              strokeDasharray="8 12"
              transform="rotate(35 200 200)"
            />
            <ellipse
              cx="200"
              cy="200"
              rx="115"
              ry="75"
              fill="none"
              stroke="rgba(56, 189, 248, 0.4)"
              strokeWidth="1"
              strokeDasharray="8 12"
              transform="rotate(-35 200 200)"
            />
            <circle cx="290" cy="160" r="3" fill="#ffffff" filter="drop-shadow(0 0 6px #00f2fe)" />
            <circle cx="110" cy="240" r="2.5" fill="#00f2fe" filter="drop-shadow(0 0 6px #00f2fe)" />
            <circle cx="220" cy="285" r="2" fill="#38bdf8" />
            <circle cx="180" cy="115" r="2" fill="#ffffff" />
          </svg>
        </div>

        {/* Layer 6: Audio-Reactive Inner Ring */}
        <div
          className="absolute inset-0 w-full h-full flex items-center justify-center transition-transform duration-150"
          style={{ transform: `scale(${1 + (normalizedLevel / 100) * 0.14})` }}
        >
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <circle
              cx="200"
              cy="200"
              r="102"
              fill="none"
              stroke="#00f2fe"
              strokeWidth={Math.max(2, Math.min(7, 2 + (normalizedLevel / 100) * 5))}
              strokeDasharray="20 6"
              strokeOpacity="0.9"
            />

            {/* Fine Radial Spoke lines */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <line
                key={deg}
                x1="200"
                y1="104"
                x2="200"
                y2="128"
                stroke="rgba(56, 189, 248, 0.8)"
                strokeWidth="1.5"
                transform={`rotate(${deg} 200 200)`}
              />
            ))}
          </svg>
        </div>

        {/* Layer 7: Concentric Core & High-Intensity Plasma Glow */}
        <div
          className="relative z-10 rounded-full flex items-center justify-center transition-all duration-200"
          style={{
            width: `${125 * coreScale}px`,
            height: `${125 * coreScale}px`,
          }}
        >
          {/* Multi-layered Glowing Core Rings with Radial Dispersion */}
          <div
            className="absolute inset-0 rounded-full transition-all duration-300"
            style={{
              background: `radial-gradient(circle, #ffffff 0%, #38bdf8 28%, ${auraColor} 65%, rgba(2, 6, 23, 0.85) 100%)`,
              boxShadow:
                state === 'WAKE_WORD_DETECTED'
                  ? '0 0 70px #ffffff, 0 0 120px #00f2fe, 0 0 160px #38bdf8'
                  : state === 'SPEAKING' || state === 'LISTENING'
                  ? `0 0 ${40 + normalizedLevel * 0.45}px #00f2fe, 0 0 ${80 + normalizedLevel * 0.7}px ${auraColor}`
                  : '0 0 35px #00f2fe, 0 0 75px rgba(6, 182, 212, 0.45)',
            }}
          />

          {/* Central Triangular Palladium Tri-Core Geometry */}
          <svg viewBox="0 0 100 100" className="w-18 h-18 z-20 pointer-events-none">
            <polygon
              points="50,20 76,70 24,70"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.8"
              strokeLinejoin="round"
              opacity="0.95"
              filter="drop-shadow(0 0 6px #00f2fe)"
            />
            {/* Inverted Sub-Triangle */}
            <polygon
              points="50,65 65,36 35,36"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.8"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <circle cx="50" cy="50" r="11" fill="#ffffff" filter="drop-shadow(0 0 8px #ffffff)" />
            <circle cx="50" cy="50" r="5" fill="#00f2fe" />
          </svg>

          {/* Interactive touch hint overlay */}
          <div className="absolute inset-0 rounded-full bg-cyan-400/0 hover:bg-cyan-400/10 transition-colors" />
        </div>
      </div>

      {/* Futuristic Reactor HUD Status Readout with Telugu indicator */}
      <div className="mt-4 flex flex-col items-center text-center">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              state === 'ERROR'
                ? 'bg-rose-500 animate-ping'
                : state === 'LISTENING'
                ? 'bg-cyan-400 animate-ping'
                : state === 'SPEAKING'
                ? 'bg-cyan-300 animate-pulse'
                : 'bg-cyan-500'
            }`}
          />
          <span className="font-hud tracking-[0.25em] text-xs font-bold text-cyan-300 glow-text-cyan">
            {stateLabel}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center justify-center gap-2 text-[10px] font-mono-tech tracking-wider text-cyan-400/80">
          <span>{subLabel}</span>
          <span>•</span>
          <span className="text-slate-400">EMOTION: {emotion.toUpperCase()}</span>
          {lockedLanguage && lockedLanguage !== 'auto' && (
            <>
              <span>•</span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  if (onResetLanguage) onResetLanguage();
                }}
                className={`px-1.5 py-0.5 rounded border transition cursor-pointer ${
                  lockedLanguage === 'Telugu'
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                    : 'border-cyan-400/50 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20'
                }`}
                title="Click to unlock language"
              >
                LOCKED: {lockedLanguage === 'Telugu' ? 'TELUGU (తెలుగు)' : 'ENGLISH'} ✕
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
