import React, { useRef, useEffect } from 'react';
import { Volume2, User, Sparkles, Trash2, Globe, HeartPulse } from 'lucide-react';
import { ChatMessage } from '../types';

interface IntelligenceChatViewProps {
  messages: ChatMessage[];
  onSpeakMessage: (text: string) => void;
  onClearHistory: () => void;
  isLoading: boolean;
}

export const IntelligenceChatView: React.FC<IntelligenceChatViewProps> = ({
  messages,
  onSpeakMessage,
  onClearHistory,
  isLoading,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 flex flex-col h-full max-w-4xl mx-auto w-full rounded-2xl border border-cyan-900/40 bg-[#060c18]/80 backdrop-blur-md overflow-hidden shadow-[0_0_25px_rgba(6,182,212,0.1)]">
      {/* View Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-cyan-950 bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h2 className="font-hud tracking-wider text-xs sm:text-sm font-semibold text-cyan-200">
            INTELLIGENCE CONVERSATION LOG
          </h2>
          <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/40 text-cyan-300">
            {messages.length} EXCHANGES
          </span>
        </div>

        <button
          onClick={onClearHistory}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-800 hover:border-rose-900/50 bg-slate-900/50 hover:bg-rose-950/30 text-slate-400 hover:text-rose-300 text-xs font-mono-tech transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">PURGE STREAM</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-sans text-sm">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[88%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                  isUser
                    ? 'bg-blue-950/60 border-blue-500/40 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                    : 'bg-cyan-950/60 border-cyan-400/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <span className="font-hud text-xs font-bold">J</span>}
              </div>

              {/* Message Content Bubble */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  isUser
                    ? 'bg-blue-950/30 border-blue-800/40 text-slate-100 rounded-tr-none'
                    : 'bg-[#091426]/90 border-cyan-900/50 text-slate-200 rounded-tl-none shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
                }`}
              >
                {/* Meta details */}
                <div className="flex items-center justify-between gap-3 pb-1.5 mb-2 border-b border-white/5 text-[10px] font-mono-tech text-slate-400">
                  <span className="text-cyan-400 font-semibold">{isUser ? 'SIR' : 'J.A.R.V.I.S.'}</span>
                  <div className="flex items-center gap-2">
                    {m.emotion && (
                      <span className="flex items-center gap-1 text-cyan-400/80">
                        <HeartPulse className="w-2.5 h-2.5" />
                        {m.emotion}
                      </span>
                    )}
                    <span>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Text Body */}
                <div className="whitespace-pre-wrap leading-relaxed text-slate-200">
                  {m.text}
                </div>

                {/* Grounding Web Sources if available */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-cyan-950/80 text-xs">
                    <div className="flex items-center gap-1 text-[11px] font-mono-tech text-cyan-400 mb-1.5">
                      <Globe className="w-3 h-3" />
                      <span>GROUNDED SOURCES:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.sources.map((s, idx) => (
                        <a
                          key={idx}
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-0.5 rounded bg-cyan-950/50 border border-cyan-800/40 hover:border-cyan-400 text-cyan-300 text-[10px] truncate max-w-[200px]"
                        >
                          {s.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Re-speak button for JARVIS messages */}
                {!isUser && (
                  <div className="mt-2.5 pt-2 border-t border-cyan-950/60 flex items-center justify-end">
                    <button
                      onClick={() => onSpeakMessage(m.text)}
                      className="flex items-center gap-1 text-[10px] font-mono-tech text-cyan-400 hover:text-cyan-200 transition"
                      title="Read aloud"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>RE-SYNTHESIZE</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-[80%] mr-auto items-center animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-hud text-xs">
              J
            </div>
            <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-xs font-mono-tech text-cyan-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>JARVIS IS COMPUTING RESPONSE FOR SIR...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};
