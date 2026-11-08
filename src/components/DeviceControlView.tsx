import React, { useState } from 'react';
import {
  Music,
  Youtube,
  Sliders,
  Sun,
  Volume2,
  Copy,
  Terminal,
  Play,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';

interface DeviceControlViewProps {
  onTriggerAction: (action: string, target: string, payload?: any) => void;
  actionLogs: Array<{ id: string; action: string; target: string; status: string; timestamp: string }>;
}

export const DeviceControlView: React.FC<DeviceControlViewProps> = ({
  onTriggerAction,
  actionLogs,
}) => {
  const [spotifyQuery, setSpotifyQuery] = useState('AC/DC Back in Black');
  const [youtubeQuery, setYoutubeQuery] = useState('Iron Man Mark VII suit up scene');
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [brightnessLevel, setBrightnessLevel] = useState(100);
  const [systemVolume, setSystemVolume] = useState(85);
  const [confirmModal, setConfirmModal] = useState<string | null>(null);

  const handleSpotifyPlay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotifyQuery.trim()) return;
    const searchUrl = `https://open.spotify.com/search/${encodeURIComponent(spotifyQuery)}`;
    onTriggerAction('SPOTIFY_SEARCH', 'Spotify Media Service', { query: spotifyQuery });
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
  };

  const handleYoutubeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeQuery.trim()) return;
    // Default Iron Man Mark VII / Stark clip video id
    const defaultIds: Record<string, string> = {
      default: 'VvH0eZl0FvA',
    };
    setActiveVideoId(defaultIds.default);
    onTriggerAction('YOUTUBE_PLAYBACK', 'YouTube Engine', { query: youtubeQuery });
  };

  const handleBrightnessChange = (val: number) => {
    setBrightnessLevel(val);
    document.documentElement.style.filter = `brightness(${val}%)`;
    onTriggerAction('ADJUST_DISPLAY_BRIGHTNESS', 'Display Controller', { value: val });
  };

  const handleVolumeTest = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance('Audio output diagnostic complete, Sir. Volume nominal.');
      u.volume = systemVolume / 100;
      window.speechSynthesis.speak(u);
      onTriggerAction('AUDIO_VOLUME_TEST', 'Acoustic Synthesizer', { level: systemVolume });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full max-w-4xl mx-auto w-full rounded-2xl border border-cyan-900/40 bg-[#060c18]/80 backdrop-blur-md overflow-hidden p-4 sm:p-6 shadow-[0_0_25px_rgba(6,182,212,0.1)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-cyan-950">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-hud tracking-wider text-sm font-semibold text-cyan-200">
              DEVICE CONTROL & MEDIA INTEGRATIONS
            </h2>
            <p className="text-[11px] font-mono-tech text-cyan-400/70">
              SPOTIFY, YOUTUBE & HARDWARE-LEVEL CONTROL PROTOCOLS
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mt-4 space-y-5 font-sans text-xs">
        {/* MEDIA ROW: SPOTIFY & YOUTUBE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Spotify Card */}
          <div className="p-4 rounded-xl border border-emerald-900/40 bg-black/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-emerald-950">
                <div className="flex items-center gap-2 text-emerald-400 font-hud text-xs">
                  <Music className="w-4 h-4" />
                  <span>SPOTIFY MEDIA INTEGRATION</span>
                </div>
                <span className="text-[10px] font-mono-tech px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-800 text-emerald-400">
                  READY
                </span>
              </div>

              <form onSubmit={handleSpotifyPlay} className="mt-3 space-y-2.5">
                <label className="block text-[11px] font-mono-tech text-slate-400">
                  Search Song, Artist, or Stark Lab Playlist:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={spotifyQuery}
                    onChange={(e) => setSpotifyQuery(e.target.value)}
                    className="flex-1 bg-slate-950 border border-emerald-900/60 focus:border-emerald-400 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/50 hover:bg-emerald-500/30 text-emerald-300 text-xs font-hud flex items-center gap-1 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>LAUNCH</span>
                  </button>
                </div>
              </form>
            </div>
            <div className="mt-3 text-[10px] font-mono-tech text-slate-500">
              *Executes official deep link to Spotify Web & App player.
            </div>
          </div>

          {/* YouTube Card */}
          <div className="p-4 rounded-xl border border-red-900/40 bg-black/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-red-950">
                <div className="flex items-center gap-2 text-red-400 font-hud text-xs">
                  <Youtube className="w-4 h-4" />
                  <span>YOUTUBE VIDEO INTEGRATION</span>
                </div>
                <span className="text-[10px] font-mono-tech px-1.5 py-0.2 rounded bg-red-950 border border-red-800 text-red-400">
                  ACTIVE
                </span>
              </div>

              <form onSubmit={handleYoutubeSearch} className="mt-3 space-y-2.5">
                <label className="block text-[11px] font-mono-tech text-slate-400">
                  Search Video or Tutorial:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={youtubeQuery}
                    onChange={(e) => setYoutubeQuery(e.target.value)}
                    className="flex-1 bg-slate-950 border border-red-900/60 focus:border-red-400 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-400/50 hover:bg-red-500/30 text-red-300 text-xs font-hud flex items-center gap-1 transition"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>STREAM</span>
                  </button>
                </div>
              </form>
            </div>
            <div className="mt-3 text-[10px] font-mono-tech text-slate-500">
              *Opens authorized video playback overlay.
            </div>
          </div>
        </div>

        {/* Embedded YouTube Player if active */}
        {activeVideoId && (
          <div className="p-3 rounded-2xl border border-cyan-900/50 bg-black/70 space-y-2">
            <div className="flex items-center justify-between text-xs font-hud text-cyan-300">
              <span>ACTIVE VIDEO STREAM: {youtubeQuery}</span>
              <button
                onClick={() => setActiveVideoId(null)}
                className="text-slate-400 hover:text-white"
              >
                DISMISS PLAYER
              </button>
            </div>
            <div className="relative pt-[56.25%] rounded-xl overflow-hidden border border-cyan-950">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1`}
                title="JARVIS Video Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* HARDWARE-LEVEL SYSTEM CONTROLLERS */}
        <div className="p-4 rounded-xl border border-cyan-900/40 bg-black/40 space-y-4">
          <div className="font-hud text-xs text-cyan-300 font-semibold border-b border-cyan-950 pb-2">
            DEVICE HARDWARE & DISPLAY DYNAMICS
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Display Brightness Slider */}
            <div>
              <div className="flex justify-between items-center mb-1 text-[11px] font-mono-tech">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  Display Brightness Filter:
                </span>
                <span className="text-cyan-300">{brightnessLevel}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="120"
                value={brightnessLevel}
                onChange={(e) => handleBrightnessChange(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Vocal Audio Gain Slider */}
            <div>
              <div className="flex justify-between items-center mb-1 text-[11px] font-mono-tech">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  Vocal Synthesis Volume:
                </span>
                <span className="text-cyan-300">{systemVolume}%</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={systemVolume}
                  onChange={(e) => setSystemVolume(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <button
                  onClick={handleVolumeTest}
                  className="px-2 py-1 rounded bg-slate-900 border border-cyan-950 text-[10px] font-mono-tech text-cyan-300 hover:border-cyan-400 whitespace-nowrap"
                >
                  TEST
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION AUDIT LOGS */}
        <div className="p-4 rounded-xl border border-cyan-900/40 bg-black/40">
          <div className="flex items-center justify-between pb-2 border-b border-cyan-950 font-hud text-xs text-cyan-300">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              ACTION AUDIT & COMMAND LOG
            </span>
            <span className="text-[10px] font-mono-tech text-slate-400">
              {actionLogs.length} EXECUTIONS
            </span>
          </div>

          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto font-mono-tech text-[11px]">
            {actionLogs.length === 0 ? (
              <div className="text-slate-500 py-2">No commands dispatched yet, Sir.</div>
            ) : (
              actionLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-cyan-950 text-slate-300"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span className="text-cyan-300 font-semibold">{log.action}</span>
                    <span className="text-slate-400">• {log.target}</span>
                  </div>
                  <span className="text-slate-500 text-[10px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
