import React, { useState, useEffect, useRef } from 'react';
import {
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sliders,
  Sparkles,
  Zap,
  Activity,
  Layers,
  Radio,
} from 'lucide-react';

interface SonicGeneratorViewProps {
  onSpeakText?: (text: string) => void;
}

type SoundscapeType = 'flight_mode' | 'neural_focus' | 'reactor_resonance' | 'cyber_lounge';

export const SonicGeneratorView: React.FC<SonicGeneratorViewProps> = ({ onSpeakText }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeSoundscape, setActiveSoundscape] = useState<SoundscapeType>('flight_mode');
  const [tempoBpm, setTempoBpm] = useState<number>(124);
  const [volume, setVolume] = useState<number>(0.65);
  const [energyLevel, setEnergyLevel] = useState<number>(80);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<any>(null);
  const animRef = useRef<number | null>(null);
  const activeNodesRef = useRef<any[]>([]);

  const soundscapes = [
    {
      id: 'flight_mode',
      title: 'STARK FLIGHT MODE // SYNTHWAVE PULSE',
      desc: 'High-energy 128 BPM arpeggiated drive with pulsing sub-bass and crisp cyber percussion.',
      bpm: 128,
      key: 'D Minor',
      color: '#06b6d4',
    },
    {
      id: 'neural_focus',
      title: 'NEURAL FOCUS MATRIX // 432 HZ BINAURAL',
      desc: 'Deep meditative ambient drone designed for complex coding, diagnostics, and high-stress intellect.',
      bpm: 72,
      key: 'A 432Hz',
      color: '#10b981',
    },
    {
      id: 'reactor_resonance',
      title: 'ARC REACTOR SUB-RESONANCE // 55 HZ',
      desc: 'Heavy electromagnetic harmonics, sub-bass pulse, and oscillating filter sweep.',
      bpm: 90,
      key: 'F Sub',
      color: '#f59e0b',
    },
    {
      id: 'cyber_lounge',
      title: 'CYBER INTELLIGENCE LOUNGE',
      desc: 'Chill, futuristic atmospheric lo-fi chords with smooth reverb pads.',
      bpm: 96,
      key: 'C Minor',
      color: '#a855f7',
    },
  ];

  const currentPreset = soundscapes.find((s) => s.id === activeSoundscape) || soundscapes[0];

  // Stop all active synthesizer nodes
  const stopAudio = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    activeNodesRef.current.forEach((n) => {
      try {
        n.stop();
        n.disconnect();
      } catch (e) {}
    });
    activeNodesRef.current = [];
    setIsPlaying(false);
  };

  // Start Generative Audio Synthesis Loop
  const startAudio = () => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (!analyserRef.current) {
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(volume, ctx.currentTime);
        masterGain.connect(analyser);
        analyser.connect(ctx.destination);
        analyserRef.current = analyser;
        masterGainRef.current = masterGain;
      }

      const master = masterGainRef.current!;
      stopAudio(); // clear previous
      setIsPlaying(true);

      // Chords based on selected preset
      const chords =
        activeSoundscape === 'flight_mode'
          ? [
              [146.83, 220.0, 293.66, 349.23], // Dm
              [130.81, 196.0, 261.63, 329.63], // C
              [116.54, 174.61, 233.08, 293.66], // Bb
              [130.81, 196.0, 261.63, 392.0], // C
            ]
          : activeSoundscape === 'neural_focus'
          ? [
              [216.0, 432.0, 648.0],
              [216.0, 324.0, 432.0],
            ]
          : activeSoundscape === 'reactor_resonance'
          ? [
              [55.0, 110.0, 165.0, 220.0],
              [65.41, 130.81, 196.0, 261.63],
            ]
          : [
              [130.81, 196.0, 246.94, 311.13], // Cm7
              [103.83, 155.56, 207.65, 261.63], // Abmaj7
              [116.54, 174.61, 220.0, 293.66], // Bb
            ];

      let step = 0;
      let chordIndex = 0;

      const intervalMs = Math.round((60 / tempoBpm) * 1000 * 0.25); // 16th note pulse

      timerRef.current = setInterval(() => {
        if (!audioContextRef.current || audioContextRef.current.state === 'suspended') return;
        const now = audioContextRef.current.currentTime;
        const curChord = chords[chordIndex % chords.length];
        const noteFreq = curChord[step % curChord.length];

        // 1. Arp Synthesizer Note
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = activeSoundscape === 'flight_mode' ? 'sawtooth' : activeSoundscape === 'neural_focus' ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(noteFreq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(activeSoundscape === 'flight_mode' ? 1800 : 800, now);

        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(master);

        osc.start(now);
        osc.stop(now + 0.28);

        // 2. Sub-Bass Kick Pulse on step 0 and 8
        if (step % 4 === 0) {
          const bassOsc = ctx.createOscillator();
          const bassGain = ctx.createGain();
          bassOsc.type = 'sine';
          bassOsc.frequency.setValueAtTime(activeSoundscape === 'reactor_resonance' ? 55 : 90, now);
          bassOsc.frequency.exponentialRampToValueAtTime(35, now + 0.15);

          bassGain.gain.setValueAtTime(0.35, now);
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

          bassOsc.connect(bassGain);
          bassGain.connect(master);
          bassOsc.start(now);
          bassOsc.stop(now + 0.22);
        }

        step = (step + 1) % 16;
        if (step === 0) {
          chordIndex++;
        }
      }, intervalMs);
    } catch (err) {
      console.warn('Audio synthesis warning:', err);
    }
  };

  // Real-Time Canvas Visualizer
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderVis = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, width, height);

      if (analyserRef.current && isPlaying) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        const barWidth = (width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height * 0.85;

          const grad = ctx.createLinearGradient(0, height, 0, height - barHeight);
          grad.addColorStop(0, '#06b6d4');
          grad.addColorStop(0.7, '#00f2fe');
          grad.addColorStop(1, '#ffffff');

          ctx.fillStyle = grad;
          ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

          x += barWidth;
        }
      } else {
        // Ambient idle sine line
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const cy = height / 2;
        for (let x = 0; x < width; x += 4) {
          const y = cy + Math.sin(x * 0.04 + Date.now() * 0.003) * 8;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(renderVis);
    };

    animId = requestAnimationFrame(renderVis);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Handle Volume Change
  useEffect(() => {
    if (masterGainRef.current && audioContextRef.current) {
      masterGainRef.current.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
    }
  }, [volume]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col gap-4 text-slate-100 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-cyan-500/40 bg-[#060c18]/90 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className="font-hud text-sm font-bold tracking-wider text-white flex items-center gap-2">
              STARK GENERATIVE SONIC MATRIX & MUSIC SYNTHESIZER
              <span className="px-1.5 py-0.2 rounded border border-cyan-500/40 text-cyan-300 bg-cyan-950/40 text-[9px] font-mono-tech">
                WEB AUDIO DSP
              </span>
            </h2>
            <p className="text-[10px] font-mono-tech text-cyan-400/80">
              PROCEDURAL SCI-FI SOUNDSCAPES // REAL-TIME HARMONIC FREQUENCY SYNTHESIS
            </p>
          </div>
        </div>

        {/* Master Play/Stop Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (isPlaying) {
                stopAudio();
              } else {
                startAudio();
              }
            }}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-hud font-bold transition shadow-[0_0_15px_rgba(6,182,212,0.4)] ${
              isPlaying
                ? 'bg-rose-500 hover:bg-rose-400 text-black'
                : 'bg-cyan-500 hover:bg-cyan-400 text-black'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'DISENGAGE AUDIO' : 'GENERATE MUSIC'}</span>
          </button>
        </div>
      </div>

      {/* Main Visualizer & Controller Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Frequency Spectrum Canvas (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-cyan-500/40 bg-[#030712] p-3 flex flex-col justify-between shadow-[0_0_30px_rgba(6,182,212,0.2)] min-h-[300px]">
          <div className="flex items-center justify-between text-xs font-mono-tech text-cyan-300 pb-2 border-b border-cyan-950">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              LIVE SPECTROGRAM // {currentPreset.title}
            </span>
            <span className="text-emerald-400 font-bold">{isPlaying ? 'DSP ACTIVE' : 'STANDBY'}</span>
          </div>

          <canvas ref={canvasRef} width={640} height={200} className="w-full h-48 rounded-xl object-cover my-2" />

          {/* Quick Stats Bar */}
          <div className="flex items-center justify-between text-[11px] font-mono-tech text-slate-400 pt-2 border-t border-cyan-950">
            <span>TEMPO: <strong className="text-white">{tempoBpm} BPM</strong></span>
            <span>TONAL KEY: <strong className="text-cyan-300">{currentPreset.key}</strong></span>
            <span>HARMONIC RATIO: <strong className="text-amber-400">1:1.618 (PHI)</strong></span>
          </div>
        </div>

        {/* Right: Soundscape Presets & Controls */}
        <div className="space-y-4">
          {/* Preset Selector */}
          <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-[#060c18] space-y-2.5">
            <div className="font-hud text-xs font-semibold text-cyan-300 flex items-center justify-between">
              <span>SONIC SOUNDSCAPES</span>
              <Music className="w-3.5 h-3.5 text-cyan-400" />
            </div>

            <div className="space-y-2">
              {soundscapes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveSoundscape(s.id as SoundscapeType);
                    setTempoBpm(s.bpm);
                    if (isPlaying) {
                      setTimeout(startAudio, 50);
                    }
                  }}
                  className={`w-full p-2.5 rounded-xl text-left transition border ${
                    activeSoundscape === s.id
                      ? 'border-cyan-400 bg-cyan-500/20 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-cyan-900'
                  }`}
                >
                  <div className="font-hud text-xs font-bold text-cyan-200">{s.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-[#060c18] space-y-3 font-mono-tech text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>MASTER GAIN / VOLUME</span>
                <span className="text-cyan-300 font-bold">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-900 rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>TEMPO SPEED</span>
                <span className="text-cyan-300 font-bold">{tempoBpm} BPM</span>
              </div>
              <input
                type="range"
                min="60"
                max="160"
                step="2"
                value={tempoBpm}
                onChange={(e) => {
                  setTempoBpm(parseInt(e.target.value, 10));
                  if (isPlaying) {
                    setTimeout(startAudio, 50);
                  }
                }}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-900 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
