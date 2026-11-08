import React, { useState } from 'react';
import {
  X,
  Cpu,
  Volume2,
  Sparkles,
  AlertTriangle,
  Gauge,
  Languages,
  Sliders,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { SystemTelemetry, WakeSensitivity, LanguageLock, EmotionType } from '../types';

interface DiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: SystemTelemetry | null;
  wakeWordEnabled: boolean;
  onToggleWakeWord: () => void;
  wakeSensitivity: WakeSensitivity;
  onSelectWakeSensitivity: (s: WakeSensitivity) => void;
  lockedLanguage: LanguageLock;
  onSelectLockedLanguage: (l: LanguageLock) => void;
  emotionModulationEnabled: boolean;
  onToggleEmotionModulation: () => void;
  emotionModulationIntensity: number;
  onEmotionIntensityChange: (val: number) => void;
  onTestVocalModulation: (emotion: EmotionType, lang: 'English' | 'Telugu') => void;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoiceName: string;
  onSelectVoice: (name: string) => void;
  speechRate: number;
  onSpeechRateChange: (rate: number) => void;
  speechPitch: number;
  onSpeechPitchChange: (pitch: number) => void;
}

export const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({
  isOpen,
  onClose,
  telemetry,
  wakeWordEnabled,
  onToggleWakeWord,
  wakeSensitivity,
  onSelectWakeSensitivity,
  lockedLanguage,
  onSelectLockedLanguage,
  emotionModulationEnabled,
  onToggleEmotionModulation,
  emotionModulationIntensity,
  onEmotionIntensityChange,
  onTestVocalModulation,
  availableVoices,
  selectedVoiceName,
  onSelectVoice,
  speechRate,
  onSpeechRateChange,
  speechPitch,
  onSpeechPitchChange,
}) => {
  const [testLang, setTestLang] = useState<'English' | 'Telugu'>('English');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl border border-cyan-500/50 bg-[#060c18] p-6 shadow-[0_0_35px_rgba(6,182,212,0.3)] text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-950">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h3 className="font-hud text-sm font-semibold tracking-wider text-cyan-200">
              SYSTEM DIAGNOSTICS & ENGINE SETTINGS
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-5 text-xs font-sans pr-1">
          {/* SECTION 1: MULTILINGUAL WAKE WORD & SENSITIVITY */}
          <div className="p-4 rounded-xl border border-cyan-900/50 bg-black/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-hud text-xs text-cyan-300 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                MULTILINGUAL WAKE-WORD DETECTION
              </span>
              <button
                onClick={onToggleWakeWord}
                className={`px-2.5 py-1 rounded text-[10px] font-hud tracking-wider transition ${
                  wakeWordEnabled
                    ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
                    : 'bg-slate-800 border border-slate-700 text-slate-400'
                }`}
              >
                {wakeWordEnabled ? 'ACTIVE' : 'MUTED'}
              </button>
            </div>

            <div className="text-[11px] text-slate-300 leading-relaxed font-mono-tech space-y-1">
              <div>
                • English Wake Phrase: <span className="text-cyan-300 font-semibold">"Jarvis"</span> or <span className="text-cyan-300">"Hey Jarvis"</span>
              </div>
              <div>
                • Telugu Wake Phrase: <span className="text-amber-300 font-semibold">"జార్విస్"</span> (or romanized phonetic Tanglish)
              </div>
            </div>

            {/* Sensitivity Presets */}
            <div className="pt-2 border-t border-cyan-950">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono-tech text-slate-400 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  Wake Detection Sensitivity:
                </span>
                <span className="text-[10px] uppercase font-hud text-cyan-300 font-bold">
                  {wakeSensitivity} THRESHOLD
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as WakeSensitivity[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => onSelectWakeSensitivity(level)}
                    className={`py-1.5 rounded-lg border text-xs font-hud tracking-wider uppercase transition ${
                      wakeSensitivity === level
                        ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[10px] text-slate-500 font-mono-tech">
                {wakeSensitivity === 'high'
                  ? 'High: Triggers swiftly on casual speech. Ideal for noisy lab environments.'
                  : wakeSensitivity === 'medium'
                  ? 'Medium: Balanced phoneme threshold with low false activation.'
                  : 'Low: Strict phrase verification. Avoids background sound activation.'}
              </p>
            </div>

            {/* Language Auto-Lock Setting */}
            <div className="pt-2 border-t border-cyan-950">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono-tech text-slate-400 flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-cyan-400" />
                  Session Language Lock:
                </span>
                <span className="text-[10px] font-mono-tech text-cyan-300">
                  {lockedLanguage === 'auto' ? 'Auto-Detect' : lockedLanguage}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(['auto', 'English', 'Telugu'] as LanguageLock[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => onSelectLockedLanguage(lang)}
                    className={`py-1.5 rounded-lg border text-xs font-hud tracking-wider transition ${
                      lockedLanguage === lang
                        ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lang === 'auto' ? 'Auto' : lang}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[10px] text-slate-500 font-mono-tech">
                When Sir wakes JARVIS in English or Telugu, the system automatically locks future prompts and vocal replies to that language until unlocked.
              </p>
            </div>
          </div>

          {/* SECTION 2: EMOTION-AWARE VOICE MODULATION */}
          <div className="p-4 rounded-xl border border-cyan-900/50 bg-black/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span className="font-hud text-xs text-cyan-300 font-semibold">
                  EMOTION-AWARE VOICE MODULATION ENGINE
                </span>
              </div>
              <button
                onClick={onToggleEmotionModulation}
                className={`px-2.5 py-1 rounded text-[10px] font-hud tracking-wider transition ${
                  emotionModulationEnabled
                    ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-800 border border-slate-700 text-slate-400'
                }`}
              >
                {emotionModulationEnabled ? 'ACTIVE' : 'DISABLED'}
              </button>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed font-mono-tech">
              JARVIS dynamically modulates vocal pitch, speaking pace, and sentence intonation based on detected human emotions (Urgency, Frustration, Confusion, Excitement, Calmness).
            </p>

            {/* Modulation Intensity Slider */}
            <div>
              <div className="flex justify-between items-center text-[11px] font-mono-tech text-slate-300 mb-1">
                <span>Modulation Intensity Scale:</span>
                <span className="text-cyan-300 font-bold">
                  {Math.round(emotionModulationIntensity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                disabled={!emotionModulationEnabled}
                value={emotionModulationIntensity}
                onChange={(e) => onEmotionIntensityChange(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer disabled:opacity-30"
              />
              <div className="flex justify-between text-[9px] font-mono-tech text-slate-500 mt-0.5">
                <span>0% Subtle</span>
                <span>50% Balanced</span>
                <span>100% Expressive</span>
              </div>
            </div>

            {/* Interactive Audition Test Buttons */}
            <div className="pt-2 border-t border-cyan-950">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono-tech text-slate-400">
                  Audition Vocal Emotion Samples:
                </span>
                <div className="flex gap-1 text-[10px]">
                  <button
                    onClick={() => setTestLang('English')}
                    className={`px-2 py-0.5 rounded ${
                      testLang === 'English'
                        ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400'
                        : 'text-slate-400'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setTestLang('Telugu')}
                    className={`px-2 py-0.5 rounded ${
                      testLang === 'Telugu'
                        ? 'bg-amber-500/30 text-amber-200 border border-amber-400'
                        : 'text-slate-400'
                    }`}
                  >
                    Telugu
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(['Urgency', 'Frustration', 'Excited', 'Calm'] as EmotionType[]).map((emo) => (
                  <button
                    key={emo}
                    onClick={() => onTestVocalModulation(emo, testLang)}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-slate-900 border border-cyan-950 hover:border-cyan-400/50 text-cyan-300 hover:text-cyan-200 text-[10px] font-hud transition"
                  >
                    <Play className="w-2.5 h-2.5" />
                    <span>{emo.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 3: BASE VOICE SELECTION & SPEED */}
          <div className="p-4 rounded-xl border border-cyan-900/50 bg-black/40 space-y-3">
            <div className="flex items-center gap-1.5 font-hud text-xs text-cyan-300 font-semibold">
              <Volume2 className="w-3.5 h-3.5" />
              VOICE PROFILE & SYNTHESIS DYNAMICS
            </div>

            <div>
              <label className="block text-[11px] font-mono-tech text-slate-400 mb-1">
                Synthesizer Voice Persona:
              </label>
              <select
                value={selectedVoiceName}
                onChange={(e) => onSelectVoice(e.target.value)}
                className="w-full bg-slate-950 border border-cyan-900 focus:border-cyan-400 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none"
              >
                {availableVoices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-[11px] font-mono-tech text-slate-400 mb-1">
                  <span>Base Speech Rate:</span>
                  <span className="text-cyan-300">{speechRate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.4"
                  step="0.05"
                  value={speechRate}
                  onChange={(e) => onSpeechRateChange(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono-tech text-slate-400 mb-1">
                  <span>Base Speech Pitch:</span>
                  <span className="text-cyan-300">{speechPitch.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.3"
                  step="0.05"
                  value={speechPitch}
                  onChange={(e) => onSpeechPitchChange(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 4: iOS Safari Notice */}
          <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-300 text-[10px] font-mono-tech flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>iOS Safari Platform Limitation Notice:</strong> WebKit security policies suspend Web Audio and continuous microphone listening when the screen locks or when Safari is sent to the background. On iPhone, active-session wake word & tap-to-talk are guaranteed.
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/50 hover:bg-cyan-500/30 text-cyan-200 text-xs font-hud tracking-wider transition"
        >
          CONFIRM SETTINGS
        </button>
      </div>
    </div>
  );
};
