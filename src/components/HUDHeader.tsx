import React, { useState, useEffect } from 'react';
import {
  Activity,
  Cpu,
  Wifi,
  Shield,
  ShieldCheck,
  Layers,
  MessageSquare,
  Globe,
  FileText,
  Lock,
  Edit3,
  Monitor,
  Music,
  Settings,
  CircleDot,
  Languages,
  Navigation,
  Gamepad2,
  Radio,
  Github,
  User,
  Hand,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { LanguageLock, AppAuthSession } from '../types';
import { UserProfile } from './UserAccountAuthModal';

export type NavTab =
  | 'reactor'
  | 'chat'
  | 'map'
  | 'game3d'
  | 'music'
  | 'search'
  | 'files'
  | 'memory'
  | 'notes'
  | 'devices'
  | 'controls';

interface HUDHeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenDiagnostics: () => void;
  onOpenAccessLinks?: () => void;
  onOpenAuthModal?: () => void;
  onOpenGitHubGuide?: () => void;
  onOpenAccountModal?: () => void;
  onOpenGestures?: () => void;
  userProfile?: UserProfile | null;
  isOnline: boolean;
  modelName: string;
  lockedLanguage: LanguageLock;
  onSelectLanguage: (lang: LanguageLock) => void;
  authSession?: AppAuthSession;
}

export const HUDHeader: React.FC<HUDHeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenDiagnostics,
  onOpenAccessLinks,
  onOpenAuthModal,
  onOpenGitHubGuide,
  onOpenAccountModal,
  onOpenGestures,
  userProfile,
  isOnline,
  modelName,
  lockedLanguage,
  onSelectLanguage,
  authSession = { isAuthorized: true, ownerName: 'Sir', authLevel: 'MASTER' },
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setDateStr(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }).toUpperCase()
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'reactor', label: 'REACTOR CORE', icon: CircleDot },
    { id: 'chat', label: 'INTELLIGENCE', icon: MessageSquare },
    { id: 'map', label: 'GPS RADAR & RIDES', icon: Navigation },
    { id: 'game3d', label: '3D SIMULATOR', icon: Gamepad2 },
    { id: 'music', label: 'SONIC MATRIX', icon: Radio },
    { id: 'search', label: 'WEB INTEL', icon: Globe },
    { id: 'files', label: 'DOCUMENTS', icon: FileText },
    { id: 'memory', label: 'MEMORY VAULT', icon: Lock },
    { id: 'notes', label: 'RUNNING NOTES', icon: Edit3 },
    { id: 'devices', label: 'ECOSYSTEM', icon: Monitor },
    { id: 'controls', label: 'MEDIA & I/O', icon: Music },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-cyan-900/40 bg-[#030712]/90 backdrop-blur-md px-3 sm:px-6 py-2.5 transition-all">
      {/* Top Banner Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg border border-cyan-400/60 bg-cyan-950/40 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
            <span className="font-hud font-extrabold text-sm text-cyan-300">J</span>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-hud tracking-[0.2em] text-sm sm:text-base font-bold text-white glow-text-cyan">
                J.A.R.V.I.S.
              </h1>
              <span className="text-[10px] font-mono-tech px-1.5 py-0.5 rounded border border-cyan-500/30 text-cyan-400 bg-cyan-950/50">
                MARK VII
              </span>
            </div>
            <p className="text-[10px] font-mono-tech text-cyan-400/70 hidden sm:block">
              UNIVERSAL PERSONAL AI ECOSYSTEM // DEDICATED TO SIR
            </p>
          </div>
        </div>

        {/* Center Clock / Status Readout */}
        <div className="hidden lg:flex items-center gap-5 text-xs font-mono-tech border border-cyan-950/80 bg-slate-950/60 px-4 py-1.5 rounded-full">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span>{isOnline ? 'SYSTEM ONLINE' : 'OFFLINE'}</span>
          </div>
          <span className="text-cyan-900">|</span>
          <div className="text-slate-300">
            <span>{dateStr}</span>
          </div>
          <span className="text-cyan-900">|</span>
          <div className="text-cyan-300 font-semibold tracking-widest">
            {timeStr}
          </div>
          <span className="text-cyan-900">|</span>
          <div className="flex items-center gap-1 text-slate-400 text-[11px]">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>{modelName}</span>
          </div>
        </div>

        {/* Action Controls, Language Selector & Auth */}
        <div className="flex items-center gap-2">
          {/* Dedicated Manual Language Selection Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowLangDropdown((prev) => !prev)}
              title="Manual Language Lock (Override Auto-Detect)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-cyan-400/50 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-200 text-xs font-mono-tech transition shadow-[0_0_10px_rgba(6,182,212,0.2)]"
            >
              <Languages className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold uppercase tracking-wider">
                {lockedLanguage === 'auto' ? 'LANG: AUTO' : lockedLanguage === 'Telugu' ? 'LANG: తెలుగు' : lockedLanguage === 'Tanglish' ? 'LANG: TANG' : lockedLanguage === 'Hindi' ? 'LANG: हिंदी' : 'LANG: EN'}
              </span>
            </button>

            {showLangDropdown && (
              <div className="absolute right-0 mt-1 w-44 rounded-xl border border-cyan-400/60 bg-[#060c18] p-1.5 shadow-[0_0_25px_rgba(6,182,212,0.4)] z-50 flex flex-col gap-1 text-xs font-mono-tech animate-in fade-in duration-150">
                <div className="px-2 py-1 text-[10px] text-cyan-400/70 border-b border-cyan-950 font-hud">
                  OVERRIDE LANGUAGE:
                </div>
                {[
                  { id: 'auto', label: 'AUTO (DYNAMIC)' },
                  { id: 'English', label: 'ENGLISH (STARK)' },
                  { id: 'Telugu', label: 'తెలుగు (TELUGU)' },
                  { id: 'Tanglish', label: 'TANGLISH (BLEND)' },
                  { id: 'Hindi', label: 'हिंदी (HINDI)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectLanguage(item.id as LanguageLock);
                      setShowLangDropdown(false);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition ${
                      lockedLanguage === item.id
                        ? 'bg-cyan-500/20 text-cyan-200 font-bold border border-cyan-400/50'
                        : 'text-slate-300 hover:bg-slate-900/80 hover:text-cyan-300'
                    }`}
                  >
                    <span>{item.label}</span>
                    {lockedLanguage === item.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Account Onboarding & Profile Chip */}
          {onOpenAccountModal && (
            <button
              onClick={onOpenAccountModal}
              title={
                userProfile
                  ? `Active User Profile: ${userProfile.preferredTitle} ${userProfile.name}`
                  : 'Create Your User Account (Google, Apple ID, Mobile Number, Email)'
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-hud transition ${
                userProfile
                  ? 'border-cyan-400/60 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                  : 'border-amber-400/60 bg-amber-950/40 hover:bg-amber-900/50 text-amber-200 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.3)]'
              }`}
            >
              {userProfile?.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt="Avatar"
                  className="w-3.5 h-3.5 rounded-full object-cover border border-cyan-400/60"
                />
              ) : (
                <User className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span className="hidden sm:inline font-bold">
                {userProfile
                  ? `${userProfile.preferredTitle.toUpperCase()}: ${userProfile.name.split(' ')[0]}`
                  : 'CREATE ACCOUNT'}
              </span>
            </button>
          )}

          {/* Dedicated GitHub Publish Guide Button */}
          {onOpenGitHubGuide && (
            <button
              onClick={onOpenGitHubGuide}
              title="Publish to Your Own GitHub Repository & Setup GitHub Pages"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-purple-500/50 bg-purple-950/40 hover:bg-purple-900/50 text-purple-200 text-xs font-hud transition shadow-[0_0_10px_rgba(168,85,247,0.25)]"
            >
              <Github className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">GITHUB</span>
            </button>
          )}

          {/* Hand Gestures Sensor Button */}
          {onOpenGestures && (
            <button
              onClick={onOpenGestures}
              title="Optical Camera & Holographic Hand Gestures Controller"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-cyan-400/50 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-200 text-xs font-hud transition shadow-[0_0_10px_rgba(6,182,212,0.25)]"
            >
              <Hand className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">GESTURES</span>
            </button>
          )}

          {/* App Authorization Status Chip */}
          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              title="JARVIS App Security & Owner Authorization"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-hud transition ${
                authSession?.isAuthorized
                  ? 'border-emerald-500/40 bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'border-amber-500/40 bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
              }`}
            >
              {authSession?.isAuthorized ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="hidden sm:inline font-bold">
                {authSession?.isAuthorized ? 'AUTH: SIR' : 'AUTH REQ'}
              </span>
            </button>
          )}

          {onOpenAccessLinks && (
            <button
              onClick={onOpenAccessLinks}
              title="View Public Links & Multi-Platform App Downloads"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-cyan-400/50 bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-300 text-xs font-hud transition shadow-[0_0_12px_rgba(6,182,212,0.2)]"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">LAUNCH LINKS</span>
            </button>
          )}

          <PWAInstallButton />

          <button
            onClick={onOpenDiagnostics}
            title="System Diagnostics & Settings"
            className="p-1.5 rounded-lg border border-cyan-900/60 bg-slate-900/50 hover:bg-cyan-950/40 text-cyan-400 hover:text-cyan-300 transition"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <nav className="mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as NavTab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-hud tracking-wider whitespace-nowrap transition-all ${
                isActive
                  ? 'border border-cyan-400/80 bg-cyan-500/20 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                  : 'border border-transparent text-slate-400 hover:text-cyan-300 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-300' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
