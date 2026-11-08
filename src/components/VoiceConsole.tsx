import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Square, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { AudioWaveform } from './AudioWaveform';
import { ReactorState, EmotionType } from '../types';

interface VoiceConsoleProps {
  reactorState: ReactorState;
  audioLevel: number;
  liveTranscript: string;
  isMicActive: boolean;
  onToggleMic: () => void;
  onSendMessage: (text: string) => void;
  onInterrupt: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  emotion: EmotionType;
}

export const VoiceConsole: React.FC<VoiceConsoleProps> = ({
  reactorState,
  audioLevel,
  liveTranscript,
  isMicActive,
  onToggleMic,
  onSendMessage,
  onInterrupt,
  isMuted,
  onToggleMute,
  emotion,
}) => {
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const isSpeaking = reactorState === 'SPEAKING';
  const isListening = reactorState === 'LISTENING';

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-2.5">
      {/* Live Transcript / Activity status bubble */}
      {(liveTranscript || isSpeaking || isListening) && (
        <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-slate-950/70 border border-cyan-500/30 backdrop-blur-md text-xs font-mono-tech text-cyan-300 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
            <span className="text-slate-400 shrink-0">
              {isSpeaking ? 'JARVIS SPEAKING:' : 'TRANSCRIBING:'}
            </span>
            <span className="truncate text-slate-100 font-sans italic">
              {liveTranscript || (isSpeaking ? 'Delivering verbal synthesis to Sir...' : 'Listening to Sir...')}
            </span>
          </div>

          {isSpeaking && (
            <button
              onClick={onInterrupt}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-hud hover:bg-rose-500/30 shrink-0 ml-2"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>BARGE-IN / STOP</span>
            </button>
          )}
        </div>
      )}

      {/* Main Bar with Waveform & Text/Voice Input */}
      <div className="flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl border border-cyan-500/40 bg-[#060c18]/90 backdrop-blur-lg shadow-[0_0_25px_rgba(6,182,212,0.15)]">
        {/* Audio Waveform integrated */}
        <div className="w-full sm:w-auto shrink-0 flex items-center justify-center">
          <AudioWaveform
            level={audioLevel}
            isActive={isListening || isSpeaking}
            barCount={28}
            className="w-full sm:w-56"
          />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex-1 w-full flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder='Message JARVIS or say "Jarvis" (Supports Telugu, Tanglish, English, Hindi)...'
            className="flex-1 bg-black/40 border border-cyan-950/80 focus:border-cyan-400/70 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-sans transition"
          />

          {/* Send text button */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl border border-cyan-400/40 bg-cyan-500/20 hover:bg-cyan-500/30 disabled:opacity-30 disabled:hover:bg-cyan-500/20 text-cyan-300 transition shrink-0"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>

          {/* Voice Input Toggle Button */}
          <button
            type="button"
            onClick={onToggleMic}
            className={`p-2.5 rounded-xl border transition shrink-0 ${
              isMicActive
                ? 'bg-cyan-500 border-cyan-300 text-black shadow-[0_0_15px_#00f2fe]'
                : 'bg-slate-900/80 border-cyan-900/60 text-cyan-400 hover:bg-cyan-950/40'
            }`}
            title={isMicActive ? 'Stop Listening' : 'Speak to JARVIS'}
          >
            {isMicActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          {/* Mute Voice Output Toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            className={`p-2.5 rounded-xl border transition shrink-0 ${
              isMuted
                ? 'bg-rose-950/40 border-rose-800/40 text-rose-400'
                : 'bg-slate-900/80 border-cyan-950 text-slate-400 hover:text-cyan-300'
            }`}
            title={isMuted ? 'Voice Muted' : 'Voice Enabled'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
