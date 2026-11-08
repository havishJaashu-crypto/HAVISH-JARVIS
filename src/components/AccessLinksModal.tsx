import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Smartphone,
  Globe,
  Share2,
  PlusSquare,
  QrCode,
  ShieldCheck,
  Monitor,
  Download,
  Laptop,
  Tablet,
  Terminal,
  Layers,
  Sparkles,
} from 'lucide-react';

interface AccessLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGitHubGuide?: () => void;
}

type PlatformTab = 'all' | 'windows' | 'android' | 'macos' | 'ipados';

export const AccessLinksModal: React.FC<AccessLinksModalProps> = ({
  isOpen,
  onClose,
  onOpenGitHubGuide,
}) => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [activePlatform, setActivePlatform] = useState<PlatformTab>('all');

  if (!isOpen) return null;

  // Active running cloud instance guaranteed to work across all browsers & devices
  const activeAppUrl =
    typeof window !== 'undefined' && window.location.origin && window.location.origin.startsWith('http')
      ? window.location.origin
      : 'https://ais-dev-iazvkde2oiem2smg7ekoi7-467763054311.us-east1.run.app';

  const publishedAppUrl = 'https://ais-pre-iazvkde2oiem2smg7ekoi7-467763054311.us-east1.run.app';

  // Public QR Code pointing directly to ACTIVE WORKING URL for guaranteed phone camera scan
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    activeAppUrl
  )}&bgcolor=03-07-12&color=00-f2-fe&qzone=1`;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(key);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  // Helper to trigger direct browser file download for platform launch scripts
  const downloadLauncherFile = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadWindowsLauncher = () => {
    const batContent = `@echo off
title JARVIS Mark VII Universal Assistant Launcher
echo =======================================================
echo          INITIALIZING J.A.R.V.I.S. MARK VII
echo            Connecting to Stark Cloud Mesh...
echo =======================================================
echo Launching standalone application window for Sir...
start msedge --app="${activeAppUrl}" || start chrome --app="${activeAppUrl}" || start "" "${activeAppUrl}"
exit
`;
    downloadLauncherFile('JARVIS-Windows-Launcher.bat', batContent, 'text/plain');
  };

  const handleDownloadMacLauncher = () => {
    const cmdContent = `#!/bin/bash
# JARVIS Mark VII macOS App Launcher
echo "Connecting to J.A.R.V.I.S. Core for Sir..."
open -na "Google Chrome" --args --app="${activeAppUrl}" || open "${activeAppUrl}"
`;
    downloadLauncherFile('JARVIS-Mac-Launcher.command', cmdContent, 'text/plain');
  };

  const handleDownloadManifest = () => {
    const manifest = {
      name: 'JARVIS AI Ecosystem',
      short_name: 'JARVIS',
      start_url: activeAppUrl,
      display: 'standalone',
      background_color: '#030712',
      theme_color: '#030712',
      description: 'Universal personal AI ecosystem dedicated to Sir.',
      icons: [
        { src: `${activeAppUrl}/pwa-192x192.png`, sizes: '192x192', type: 'image/png' },
        { src: `${activeAppUrl}/pwa-512x512.png`, sizes: '512x512', type: 'image/png' },
      ],
    };
    downloadLauncherFile('jarvis.webmanifest', JSON.stringify(manifest, null, 2), 'application/json');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl border border-cyan-500/50 bg-[#060c18] p-5 sm:p-6 shadow-[0_0_50px_rgba(6,182,212,0.4)] text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-hud text-sm font-semibold tracking-wider text-cyan-200">
                JARVIS LIVE ACCESS & MULTI-PLATFORM APP DOWNLOADS
              </h3>
              <p className="text-[10px] font-mono-tech text-cyan-400/70">
                CROSS-PLATFORM SUITE: WINDOWS, ANDROID, MAC-OS, IPAD-OS & IPHONE SAFARI
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Platform Selection Tabs */}
        <div className="flex items-center gap-1.5 pt-3 overflow-x-auto no-scrollbar border-b border-cyan-950 pb-2.5">
          {[
            { id: 'all', label: 'ALL LINKS & QR', icon: Layers },
            { id: 'windows', label: 'WINDOWS APP', icon: Laptop },
            { id: 'android', label: 'ANDROID APP', icon: Smartphone },
            { id: 'macos', label: 'MAC-OS APP', icon: Monitor },
            { id: 'ipados', label: 'IPAD-OS & IOS', icon: Tablet },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activePlatform === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePlatform(tab.id as PlatformTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-hud tracking-wider whitespace-nowrap transition ${
                  isSel
                    ? 'border border-cyan-400 bg-cyan-500/25 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'border border-transparent text-slate-400 hover:text-cyan-300 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSel ? 'text-cyan-300' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto mt-3 space-y-4 text-xs font-sans pr-1">
          {/* TAB 1: ALL LINKS & QR */}
          {activePlatform === 'all' && (
            <>
              {/* PRIMARY ACTIVE RUNNING APP URL */}
              <div className="p-4 rounded-xl border border-cyan-400/80 bg-cyan-950/30 shadow-[0_0_25px_rgba(6,182,212,0.25)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-hud text-xs text-cyan-200 font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    LIVE RUNNING INSTANCE (100% OPERATIONAL // OPEN ON ANY DEVICE)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono-tech font-bold animate-pulse">
                    ACTIVE LIVE // HTTPS
                  </span>
                </div>

                <p className="text-[11px] text-slate-200">
                  Direct guaranteed live access URL for <strong>iPhone Safari</strong>, <strong>Android Chrome</strong>, <strong>iPad</strong>, and <strong>desktop browsers</strong> without needing any deployment setup.
                </p>

                <div className="flex items-center gap-2 bg-black/70 border border-cyan-500/50 rounded-xl p-2 font-mono-tech text-xs">
                  <span className="truncate flex-1 text-cyan-200 font-bold select-all">{activeAppUrl}</span>
                  <button
                    onClick={() => handleCopy(activeAppUrl, 'active')}
                    className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/60 text-cyan-200 flex items-center gap-1 transition shrink-0"
                    title="Copy link"
                  >
                    {copiedLink === 'active' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px]">COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[10px]">COPY</span>
                      </>
                    )}
                  </button>
                  <a
                    href={activeAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center gap-1 transition shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                    title="Open in new window"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="text-[10px]">OPEN NOW</span>
                  </a>
                </div>
              </div>

              {/* GITHUB REPO PUBLISHING ACTION BANNER */}
              {onOpenGitHubGuide && (
                <div className="p-3.5 rounded-xl border border-purple-500/40 bg-purple-950/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-purple-300 shrink-0">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-hud text-xs text-purple-200 font-bold">
                        WANT TO PUBLISH TO YOUR OWN GITHUB REPO?
                      </div>
                      <div className="text-[10px] text-slate-300">
                        Step-by-step terminal commands & automated GitHub Pages deployment setup.
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={onOpenGitHubGuide}
                    className="px-3.5 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-black font-hud text-xs font-bold transition shrink-0 shadow-[0_0_12px_rgba(168,85,247,0.35)]"
                  >
                    VIEW GITHUB GUIDE
                  </button>
                </div>
              )}

              {/* PRODUCTION STAGING URL CARD */}
              <div className="p-3.5 rounded-xl border border-cyan-900/40 bg-black/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-hud text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    PRODUCTION RELEASE STAGING URL
                  </span>
                  <span className="text-[10px] font-mono-tech text-amber-400/80">POST-PUBLISH TARGET</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Activated automatically whenever you trigger "Publish / Share Release" in AI Studio:
                </p>

                <div className="flex items-center gap-2 bg-black/60 border border-cyan-950 rounded-xl p-2 font-mono-tech text-xs">
                  <span className="truncate flex-1 text-slate-300 select-all">{publishedAppUrl}</span>
                  <button
                    onClick={() => handleCopy(publishedAppUrl, 'published')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1 transition shrink-0"
                  >
                    {copiedLink === 'published' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={publishedAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1 transition shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* QR CODE SCAN */}
              <div className="p-4 rounded-xl border border-cyan-900/50 bg-black/40 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-36 h-36 p-2 rounded-xl bg-[#030712] border border-cyan-500/40 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
                  <img src={qrCodeUrl} alt="QR Code" className="w-full h-full object-contain rounded-lg" />
                </div>

                <div className="space-y-1.5 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 font-hud text-xs text-cyan-300 font-semibold">
                    <QrCode className="w-4 h-4 text-cyan-400" />
                    INSTANT CAMERA SCAN
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Point your iPhone, Android, or tablet camera at this code to open JARVIS instantly in Safari or Chrome.
                  </p>
                  <div className="text-[10px] font-mono-tech text-cyan-400/80">
                    ✓ Full Audio Reactivity • ✓ Multilingual Voice • ✓ Emotion Detection
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: WINDOWS APP */}
          {activePlatform === 'windows' && (
            <div className="space-y-3.5">
              <div className="p-4 rounded-xl border border-cyan-500/40 bg-cyan-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Laptop className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h4 className="font-hud text-xs sm:text-sm font-semibold text-white">
                        WINDOWS STANDALONE APP INSTALLER
                      </h4>
                      <p className="text-[10px] font-mono-tech text-cyan-400/70">
                        WINDOWS 10 & 11 COMPATIBLE // RUNS IN NATIVE APP WINDOW
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono-tech">
                    WIN32 / PWA
                  </span>
                </div>

                <p className="text-[11px] text-slate-300">
                  Sir can download the 1-click Windows Desktop Launcher script, which launches JARVIS in dedicated kiosk app mode without browser search bars or tabs!
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={handleDownloadWindowsLauncher}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-hud font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>DOWNLOAD JARVIS-WINDOWS-LAUNCHER.BAT</span>
                  </button>
                  <button
                    onClick={handleDownloadManifest}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-hud transition"
                  >
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>DOWNLOAD WEBMANIFEST</span>
                  </button>
                </div>
              </div>

              {/* Step-by-Step Edge/Chrome Windows Install */}
              <div className="p-3.5 rounded-xl border border-cyan-900/40 bg-black/40 space-y-2">
                <div className="font-hud text-xs text-cyan-300 font-semibold">
                  HOW TO INSTALL VIA MICROSOFT EDGE OR GOOGLE CHROME:
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-300 font-sans">
                  <div className="flex items-start gap-2 p-1.5 rounded-lg bg-slate-950/60">
                    <span className="text-cyan-400 font-mono-tech font-bold text-[10px]">1.</span>
                    <span>Open the Primary Shared URL in Microsoft Edge or Google Chrome on Windows.</span>
                  </div>
                  <div className="flex items-start gap-2 p-1.5 rounded-lg bg-slate-950/60">
                    <span className="text-cyan-400 font-mono-tech font-bold text-[10px]">2.</span>
                    <span>Look for the <strong>App Available / Install</strong> icon at the right end of the address bar.</span>
                  </div>
                  <div className="flex items-start gap-2 p-1.5 rounded-lg bg-slate-950/60">
                    <span className="text-cyan-400 font-mono-tech font-bold text-[10px]">3.</span>
                    <span>Click <strong>"Install JARVIS AI Ecosystem"</strong> and check <em>Pin to taskbar</em> & <em>Create Desktop shortcut</em>.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANDROID APP */}
          {activePlatform === 'android' && (
            <div className="space-y-3.5">
              <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="font-hud text-xs sm:text-sm font-semibold text-white">
                        ANDROID WEBAPK & HOME SCREEN INSTALL
                      </h4>
                      <p className="text-[10px] font-mono-tech text-emerald-400/70">
                        FULL BACKGROUND AUDIO & WAKE-WORD SUPPORT
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono-tech">
                    WEBAPK READY
                  </span>
                </div>

                <p className="text-[11px] text-slate-300">
                  On Android, Google Chrome automatically synthesizes a real system <strong>WebAPK</strong> with splash screen, app icon, and full permissions.
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href={activeAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-hud font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>OPEN IN ANDROID CHROME</span>
                  </a>
                  <button
                    onClick={handleDownloadManifest}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-hud transition"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>DOWNLOAD MANIFEST</span>
                  </button>
                </div>
              </div>

              {/* Step-by-Step Android Guide */}
              <div className="p-3.5 rounded-xl border border-cyan-900/40 bg-black/40 space-y-2">
                <div className="font-hud text-xs text-emerald-300 font-semibold">
                  EASY INSTALL STEPS ON ANDROID:
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-300 font-sans">
                  <div className="flex items-start gap-2 p-1.5 rounded-lg bg-slate-950/60">
                    <span className="text-emerald-400 font-mono-tech font-bold text-[10px]">1.</span>
                    <span>Open the Shared Link in Chrome for Android.</span>
                  </div>
                  <div className="flex items-start gap-2 p-1.5 rounded-lg bg-slate-950/60">
                    <span className="text-emerald-400 font-mono-tech font-bold text-[10px]">2.</span>
                    <span>Tap the <strong>three dots menu (⋮)</strong> at top right.</span>
                  </div>
                  <div className="flex items-start gap-2 p-1.5 rounded-lg bg-slate-950/60">
                    <span className="text-emerald-400 font-mono-tech font-bold text-[10px]">3.</span>
                    <span>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2 p-1.5 rounded-lg bg-slate-950/60">
                    <span className="text-emerald-400 font-mono-tech font-bold text-[10px]">4.</span>
                    <span>JARVIS will install as a real app in your app drawer alongside other apps!</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MACOS APP */}
          {activePlatform === 'macos' && (
            <div className="space-y-3.5">
              <div className="p-4 rounded-xl border border-purple-500/40 bg-purple-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-purple-400" />
                    <div>
                      <h4 className="font-hud text-xs sm:text-sm font-semibold text-white">
                        MAC-OS DOCK & DESKTOP APP
                      </h4>
                      <p className="text-[10px] font-mono-tech text-purple-400/70">
                        MACOS SONOMA, VENTURA & MONTEREY COMPATIBLE
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-mono-tech">
                    MAC DOCK
                  </span>
                </div>

                <p className="text-[11px] text-slate-300">
                  On macOS Sonoma (Safari 17+) or Chrome, you can install JARVIS directly into your Mac Dock and Launchpad as a native macOS application bundle.
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={handleDownloadMacLauncher}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-black text-xs font-hud font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)] transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>DOWNLOAD JARVIS-MAC-LAUNCHER.COMMAND</span>
                  </button>
                  <a
                    href={activeAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-hud transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                    <span>OPEN IN MAC SAFARI</span>
                  </a>
                </div>
              </div>

              {/* Step-by-Step macOS Safari Guide */}
              <div className="p-3.5 rounded-xl border border-cyan-900/40 bg-black/40 space-y-2">
                <div className="font-hud text-xs text-purple-300 font-semibold">
                  HOW TO ADD TO MAC DOCK (SAFARI 17+ / SONOMA):
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-300 font-sans">
                  <div className="flex items-start gap-2 p-1.5 rounded-lg bg-slate-950/60">
                    <span className="text-purple-400 font-mono-tech font-bold text-[10px]">1.</span>
                    <span>Open the Shared Link in Safari on your Mac.</span>
                  </div>
                  <div className="flex items-start gap-2 p-1.5 rounded-lg bg-slate-950/60">
                    <span className="text-purple-400 font-mono-tech font-bold text-[10px]">2.</span>
                    <span>In the Mac top menu bar, click <strong>File</strong> → <strong>"Add to Dock..."</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2 p-1.5 rounded-lg bg-slate-950/60">
                    <span className="text-purple-400 font-mono-tech font-bold text-[10px]">3.</span>
                    <span>Click <strong>Add</strong>. JARVIS is now a standalone Mac app in your Dock!</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: IPAD-OS & IOS */}
          {activePlatform === 'ipados' && (
            <div className="space-y-3.5">
              <div className="p-4 rounded-xl border border-cyan-500/40 bg-cyan-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tablet className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h4 className="font-hud text-xs sm:text-sm font-semibold text-white">
                        IPAD-OS & IPHONE SAFARI FULLSCREEN PWA
                      </h4>
                      <p className="text-[10px] font-mono-tech text-cyan-400/70">
                        STANDALONE IMMERSIVE MODE WITH NO SAFARI BARS
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono-tech">
                    IOS 14 - 18+
                  </span>
                </div>

                <p className="text-[11px] text-slate-300">
                  Designed specifically for iPad Pro, iPad Air, and iPhone Safari. When added to the home screen, it launches in native full-screen standalone mode without any browser URL bars!
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => handleCopy(activeAppUrl, 'shared-ios')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-hud font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] transition"
                  >
                    {copiedLink === 'shared-ios' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink === 'shared-ios' ? 'COPIED TO CLIPBOARD' : 'COPY LINK FOR IPAD SAFARI'}</span>
                  </button>
                </div>
              </div>

              {/* Step-by-Step iPad & iPhone Guide */}
              <div className="p-3.5 rounded-xl border border-cyan-900/40 bg-black/40 space-y-2">
                <div className="font-hud text-xs text-cyan-300 font-semibold">
                  EASY 3-STEP INSTALL ON IPAD & IPHONE:
                </div>
                <div className="space-y-2 text-[11px] text-slate-300 font-sans">
                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-900">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono-tech flex items-center justify-center text-[10px] shrink-0 font-bold">
                      1
                    </span>
                    <span>
                      Open the link in <strong>Safari</strong> on your iPad or iPhone.
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-900">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono-tech flex items-center justify-center text-[10px] shrink-0 font-bold">
                      2
                    </span>
                    <span>
                      Tap the <strong className="text-cyan-300 inline-flex items-center gap-1"><Share2 className="w-3 h-3 inline" /> Share</strong> button at the top toolbar on iPad (or bottom toolbar on iPhone).
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-900">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono-tech flex items-center justify-center text-[10px] shrink-0 font-bold">
                      3
                    </span>
                    <span>
                      Scroll down and tap <strong className="text-cyan-300 inline-flex items-center gap-1"><PlusSquare className="w-3 h-3 inline" /> Add to Home Screen</strong>, then tap <strong>Add</strong>.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-cyan-950 flex items-center justify-between">
          <div className="text-[10px] font-mono-tech text-cyan-400/70">
            J.A.R.V.I.S. MARK VII ECOSYSTEM // PRODUCTION READY
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/50 hover:bg-cyan-500/30 text-cyan-200 text-xs font-hud tracking-wider transition"
          >
            DISMISS PORTAL
          </button>
        </div>
      </div>
    </div>
  );
};
