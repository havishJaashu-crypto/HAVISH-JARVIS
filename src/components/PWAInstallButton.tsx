import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, hide or show small badge
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-[11px] font-mono-tech text-cyan-400">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        PWA INSTALLED
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-400/50 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-hud transition shadow-sm hover:shadow-[0_0_12px_rgba(6,182,212,0.4)]"
      >
        <Download className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
        <span>INSTALL APP</span>
      </button>
    );
  }

  // iOS Safari flow (WebKit doesn't trigger beforeinstallprompt)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-400/40 bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 text-xs font-hud transition"
        >
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span>INSTALL ON IPHONE</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl border border-cyan-500/50 bg-[#060c18] p-6 shadow-[0_0_35px_rgba(6,182,212,0.3)] text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-cyan-900/50">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-cyan-300" />
                  </div>
                  <h3 className="font-hud text-sm font-semibold tracking-wider text-cyan-300">
                    INSTALL ON IPHONE / IPAD
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3.5 text-xs text-slate-300 font-sans">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-300 font-mono-tech shrink-0">
                    1
                  </div>
                  <div>
                    Tap the <strong className="text-white inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300"><Share2 className="w-3 h-3" /> Share</strong> icon at the bottom of Safari.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-300 font-mono-tech shrink-0">
                    2
                  </div>
                  <div>
                    Scroll down and select <strong className="text-white inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300"><PlusSquare className="w-3 h-3" /> Add to Home Screen</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-300 font-mono-tech shrink-0">
                    3
                  </div>
                  <div>
                    Confirm <span className="text-cyan-300 font-semibold">JARVIS</span> and launch directly from your home screen with full screen immersion!
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-cyan-500/20 border border-cyan-400/50 py-2.5 text-xs font-hud tracking-wider text-cyan-200 hover:bg-cyan-500/30 transition shadow-[0_0_15px_rgba(6,182,212,0.2)]"
              >
                ACKNOWLEDGED
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback trigger
  return (
    <button
      onClick={() => setShowIOSGuide(true)}
      className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-cyan-500/30 bg-cyan-950/30 hover:bg-cyan-900/40 text-cyan-400 text-xs font-hud transition"
    >
      <Download className="w-3.5 h-3.5" />
      <span>PWA READY</span>
    </button>
  );
};
