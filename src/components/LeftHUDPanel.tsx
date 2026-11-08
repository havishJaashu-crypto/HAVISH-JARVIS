import React from 'react';
import { Mic, MicOff, Volume2, Sparkles, Languages, Radio, Gauge, Sliders } from 'lucide-react';
import { EmotionType, WakeSensitivity, LanguageLock } from '../types';

interface LeftHUDPanelProps {
  isMicActive: boolean;
  onToggleMic: () => void;
  wakeWordEnabled: boolean;
  onToggleWakeWord: () => void;
  wakeSensitivity: WakeSensitivity;
  onSelectWakeSensitivity: (s: WakeSensitivity) => void;
  lockedLanguage: LanguageLock;
  onResetLanguage: () => void;
  emotionModulationEnabled: boolean;
  onToggleEmotionModulation: () => void;
  emotionModulationIntensity: number;
  onEmotionIntensityChange: (val: number) => void;
  currentEmotion: EmotionType;
  onQuickPrompt: (text: string) => void;
}

export const LeftHUDPanel: React.FC<LeftHUDPanelProps> = ({
  isMicActive,
  onToggleMic,
  wakeWordEnabled,
  onToggleWakeWord,
  wakeSensitivity,
  onSelectWakeSensitivity,
  lockedLanguage,
  onResetLanguage,
  emotionModulationEnabled,
  onToggleEmotionModulation,
  emotionModulationIntensity,
  onEmotionIntensityChange,
  currentEmotion,
  onQuickPrompt,
}) => {
  const quickPrompts = [
    { label: 'TELUGU DIRECTIVE', text: 'జార్విస్, నమస్కారం! మన ప్రాజెక్ట్ స్టేటస్ ఎలా ఉంది?' },
    { label: 'TANGLISH WEATHER', text: 'Jarvis, repu weather ela untundhi?' },
    { label: 'ACTIVE PROJECTS', text: 'Jarvis, list our active projects and their status.' },
    { label: 'QUICK NOTE', text: 'Jarvis, note this: Schedule Stark ecosystem review at 10 AM tomorrow.' },
  ];

  return (
    <aside className="w-full lg:w-72 flex flex-col gap-4 text-xs font-mono-tech">
      {/* JARVIS Identity Card */}
      <div className="rounded-xl border border-cyan-900/50 bg-[#060c18]/80 backdrop-blur-md p-4 shadow-[0_0_20px_rgba(6,182,212,0.15)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between pb-2 border-b border-cyan-950">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-hud tracking-wider text-cyan-300 font-semibold">
              CORE IDENTITY
            </span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            DEDICATED
          </span>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Designation:</span>
            <span className="text-cyan-200 font-semibold font-hud">J.A.R.V.I.S.</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Owner Title:</span>
            <span className="text-white font-semibold">Sir</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Bilingual Triggers:</span>
            <span className="text-cyan-300 font-semibold">"Jarvis" / "జార్విస్"</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Active Language Lock:</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`font-semibold ${
                  lockedLanguage === 'Telugu'
                    ? 'text-amber-300'
                    : lockedLanguage === 'English'
                    ? 'text-cyan-300'
                    : 'text-slate-300'
                }`}
              >
                {lockedLanguage === 'auto' ? 'AUTO-DETECT' : lockedLanguage.toUpperCase()}
              </span>
              {lockedLanguage !== 'auto' && (
                <button
                  onClick={onResetLanguage}
                  className="text-[9px] px-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                  title="Unlock language"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Wake Word Sensitivity Tuning */}
        <div className="mt-3 pt-3 border-t border-cyan-950/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Wake Word Engine</span>
            </div>
            <button
              onClick={onToggleWakeWord}
              className={`px-2 py-0.5 rounded text-[10px] font-hud tracking-wider transition ${
                wakeWordEnabled
                  ? 'bg-cyan-500/20 border border-cyan-400/60 text-cyan-300'
                  : 'bg-slate-800 border border-slate-700 text-slate-400'
              }`}
            >
              {wakeWordEnabled ? 'ACTIVE' : 'MUTED'}
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] pt-1">
            <span className="text-slate-400 flex items-center gap-1">
              <Gauge className="w-3 h-3 text-cyan-400" /> Sensitivity:
            </span>
            <div className="flex items-center gap-1">
              {(['low', 'medium', 'high'] as WakeSensitivity[]).map((s) => (
                <button
                  key={s}
                  onClick={() => onSelectWakeSensitivity(s)}
                  className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-hud transition ${
                    wakeSensitivity === s
                      ? 'bg-cyan-500/30 border border-cyan-400 text-cyan-200'
                      : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Emotion-Aware Voice Modulation Panel */}
      <div className="rounded-xl border border-cyan-900/50 bg-[#060c18]/80 backdrop-blur-md p-4">
        <div className="flex items-center justify-between pb-2 border-b border-cyan-950">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span className="font-hud tracking-wider text-cyan-300 font-semibold">
              EMOTION MODULATION
            </span>
          </div>
          <button
            onClick={onToggleEmotionModulation}
            className={`px-2 py-0.5 rounded text-[10px] font-hud transition ${
              emotionModulationEnabled
                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800 border border-slate-700 text-slate-400'
            }`}
          >
            {emotionModulationEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="mt-3 space-y-2.5">
          <div className="flex justify-between items-center text-[10px] text-slate-300">
            <span className="text-slate-400">Modulation Intensity:</span>
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

          <div className="flex justify-between text-[9px] font-mono-tech text-slate-500">
            <span>SUBTLE (0%)</span>
            <span>BALANCED (75%)</span>
            <span>EXPRESSIVE</span>
          </div>

          <p className="text-[10px] text-slate-400 leading-tight">
            Dynamically shifts TTS pitch & speed: +22% rate on urgency, -15% rate & calm register on frustration.
          </p>
        </div>
      </div>

      {/* Voice Channel & Microphone Status */}
      <div className="rounded-xl border border-cyan-900/50 bg-[#060c18]/80 backdrop-blur-md p-4">
        <div className="flex items-center justify-between pb-2 border-b border-cyan-950">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span className="font-hud tracking-wider text-cyan-300 font-semibold">
              VOICE CHANNEL
            </span>
          </div>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded border ${
              isMicActive
                ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {isMicActive ? 'MIC OPEN' : 'STANDBY'}
          </span>
        </div>

        <div className="mt-3 space-y-2.5">
          <button
            onClick={onToggleMic}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-hud text-xs tracking-wider transition ${
              isMicActive
                ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300 hover:bg-rose-500/30'
                : 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
            }`}
          >
            {isMicActive ? (
              <>
                <MicOff className="w-3.5 h-3.5" />
                <span>DISENGAGE MIC</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5" />
                <span>ENGAGE VOICE INPUT</span>
              </>
            )}
          </button>
        </div>

        {/* Multilingual Support Badges */}
        <div className="mt-3 pt-3 border-t border-cyan-950">
          <div className="flex items-center gap-1.5 text-slate-400 mb-2">
            <Languages className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-semibold text-slate-300">Dual Wake Triggers:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 text-[10px]">
            <span
              className={`px-2 py-0.5 rounded border ${
                lockedLanguage === 'Telugu'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-cyan-950/60 border-cyan-800/40 text-cyan-300'
              }`}
            >
              "జార్విస్" (Telugu)
            </span>
            <span
              className={`px-2 py-0.5 rounded border ${
                lockedLanguage === 'English'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-cyan-950/60 border-cyan-800/40 text-cyan-300'
              }`}
            >
              "Jarvis" (English)
            </span>
          </div>
        </div>
      </div>

      {/* Quick Verbal Commands */}
      <div className="rounded-xl border border-cyan-900/50 bg-[#060c18]/80 backdrop-blur-md p-4">
        <span className="font-hud tracking-wider text-cyan-300 font-semibold block pb-2 border-b border-cyan-950">
          BILINGUAL COMMANDS
        </span>
        <div className="mt-2.5 space-y-1.5">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => onQuickPrompt(p.text)}
              className="w-full text-left p-2 rounded-lg border border-cyan-950 hover:border-cyan-500/40 bg-slate-950/40 hover:bg-cyan-950/30 transition text-slate-300 hover:text-cyan-200 group"
            >
              <div className="text-[9px] text-cyan-400/80 font-hud group-hover:text-cyan-300">
                {p.label}
              </div>
              <div className="truncate text-[11px] font-sans mt-0.5 text-slate-400 group-hover:text-slate-200">
                "{p.text}"
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};
