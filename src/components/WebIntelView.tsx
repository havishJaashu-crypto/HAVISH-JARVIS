import React, { useState } from 'react';
import { Globe, Search, ExternalLink, ArrowRight, Sparkles, Loader2 } from 'lucide-react';

interface WebIntelViewProps {
  onSpeakText: (text: string) => void;
}

export const WebIntelView: React.FC<WebIntelViewProps> = ({ onSpeakText }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [sources, setSources] = useState<Array<{ title: string; url: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  const sampleQueries = [
    'Current tech industry breakthroughs and quantum computing progress',
    'Weather forecast and meteorological outlook for Hyderabad and Silicon Valley',
    'Latest advancements in humanoid robotics and neural interfaces',
    'Global renewable energy milestones this week',
  ];

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    setReport(null);
    setSources([]);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Web grounding request failed.');
      }

      setReport(data.report);
      setSources(data.sources || []);
    } catch (err: any) {
      console.error('Search request error:', err);
      setError(err?.message || 'Search failed, Sir.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full max-w-4xl mx-auto w-full rounded-2xl border border-cyan-900/40 bg-[#060c18]/80 backdrop-blur-md overflow-hidden p-4 sm:p-6 shadow-[0_0_25px_rgba(6,182,212,0.1)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-cyan-950">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-hud tracking-wider text-sm font-semibold text-cyan-200">
              WEB INTEL & SEARCH GROUNDING
            </h2>
            <p className="text-[11px] font-mono-tech text-cyan-400/70">
              REAL-TIME GLOBAL INFORMATION ACCESS POWERED BY GOOGLE SEARCH
            </p>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(query);
        }}
        className="mt-4 flex items-center gap-2"
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Instruct JARVIS to investigate a global topic or live event..."
            className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-cyan-900/80 focus:border-cyan-400 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-sans"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/50 hover:bg-cyan-500/30 text-cyan-300 text-xs font-hud tracking-wider disabled:opacity-40 transition shadow-[0_0_12px_rgba(6,182,212,0.2)]"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>TRANSMIT QUERY</span>
        </button>
      </form>

      {/* Suggested Topic Chips */}
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-[11px] font-mono-tech text-slate-400 self-center">Presets:</span>
        {sampleQueries.map((q, idx) => (
          <button
            key={idx}
            onClick={() => {
              setQuery(q);
              handleSearch(q);
            }}
            className="text-[11px] px-2.5 py-1 rounded-lg border border-cyan-950 bg-slate-900/60 hover:bg-cyan-950/40 text-slate-300 hover:text-cyan-300 transition text-left truncate max-w-[260px]"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs font-mono-tech">
          {error}
        </div>
      )}

      {/* Loading animation */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-3 text-cyan-400 font-mono-tech text-xs">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <span>QUERYING GLOBAL SATELLITES & GOOGLE SEARCH CHANNELS...</span>
        </div>
      )}

      {/* Results View */}
      {report && !loading && (
        <div className="flex-1 overflow-y-auto mt-4 p-4 rounded-xl border border-cyan-900/30 bg-black/40 space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-950 pb-2">
            <span className="text-xs font-hud text-cyan-300">INTELLIGENCE SYNTHESIS</span>
            <button
              onClick={() => onSpeakText(report)}
              className="text-[11px] font-mono-tech text-cyan-400 hover:text-cyan-200 underline"
            >
              VOCALIZE REPORT
            </button>
          </div>

          <div className="text-sm font-sans text-slate-200 leading-relaxed whitespace-pre-wrap">
            {report}
          </div>

          {sources.length > 0 && (
            <div className="pt-3 border-t border-cyan-950">
              <span className="text-[11px] font-mono-tech text-cyan-400 font-semibold block mb-2">
                VERIFIED GROUNDING SOURCES:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sources.map((s, idx) => (
                  <a
                    key={idx}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-cyan-950/30 border border-cyan-900/50 hover:border-cyan-400 text-cyan-300 text-xs transition group"
                  >
                    <span className="truncate pr-2">{s.title || s.url}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
