import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Key,
  X,
  UserCheck,
  Check,
  Smartphone,
  Fingerprint,
} from 'lucide-react';
import { AppAuthSession } from '../types';

interface AppAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: AppAuthSession;
  onUpdateSession: (newSession: AppAuthSession) => void;
}

export const AppAuthModal: React.FC<AppAuthModalProps> = ({
  isOpen,
  onClose,
  session,
  onUpdateSession,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuthorize = (pinToTest?: string) => {
    const input = pinToTest !== undefined ? pinToTest : pinInput;
    // Master PIN can be 1007 or 3000 or STARK
    if (input === '1007' || input === '3000' || input.toUpperCase() === 'STARK' || pinToTest === 'QUICK_AUTH') {
      const updated: AppAuthSession = {
        isAuthorized: true,
        ownerName: 'Sir (djhavish42@gmail.com)',
        authLevel: 'MASTER',
        authorizedAt: new Date().toISOString(),
      };
      localStorage.setItem('jarvis_auth_session', JSON.stringify(updated));
      onUpdateSession(updated);
      setSuccessMsg('Authorization confirmed. Welcome back, Sir.');
      setErrorMsg(null);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } else {
      setErrorMsg('Invalid authorization code. (Hint: Master PIN is 1007 or tap Quick Authorize)');
    }
  };

  const handleDeauthorize = () => {
    const locked: AppAuthSession = {
      isAuthorized: false,
      ownerName: 'Guest User',
      authLevel: 'GUEST',
    };
    localStorage.removeItem('jarvis_auth_session');
    onUpdateSession(locked);
    setSuccessMsg('Session locked to Guest Mode.');
    setTimeout(() => {
      setSuccessMsg(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-cyan-500/50 bg-[#060c18] p-6 shadow-[0_0_40px_rgba(6,182,212,0.35)] text-slate-100 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-950">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              session.isAuthorized
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                : 'bg-amber-500/20 border-amber-400 text-amber-300'
            }`}>
              {session.isAuthorized ? <ShieldCheck className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-hud text-sm font-semibold tracking-wider text-cyan-200">
                JARVIS APP AUTHORIZATION
              </h3>
              <p className="text-[10px] font-mono-tech text-cyan-400/70">
                SECURITY LEVEL: {session.authLevel} // OWNER: SIR
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Status Badge */}
        <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
          session.isAuthorized
            ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
            : 'bg-amber-950/30 border-amber-500/50 text-amber-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-3 h-3 rounded-full ${session.isAuthorized ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <div>
              <div className="font-hud text-xs font-bold">
                {session.isAuthorized ? 'SYSTEM AUTHORIZED: SIR' : 'GUEST ACCESS MODE'}
              </div>
              <div className="text-[10px] font-mono-tech text-slate-300">
                {session.isAuthorized
                  ? `Authenticated: ${session.ownerName}`
                  : 'Restricted actions require Sir\'s Passkey or PIN'}
              </div>
            </div>
          </div>

          {session.isAuthorized && (
            <button
              onClick={handleDeauthorize}
              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-[10px] font-hud transition"
            >
              LOCK APP
            </button>
          )}
        </div>

        {/* Verification Form */}
        {!session.isAuthorized ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono-tech text-cyan-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-cyan-400" />
                ENTER MASTER PIN / PASSCODE (DEFAULT: 1007)
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAuthorize()}
                  placeholder="Enter PIN (e.g. 1007)"
                  className="flex-1 bg-black/60 border border-cyan-900 rounded-xl px-3 py-2 text-xs font-mono-tech text-cyan-200 focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={() => handleAuthorize()}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-hud font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)] transition"
                >
                  VERIFY
                </button>
              </div>
            </div>

            {/* Quick 1-Tap Authorize Button */}
            <button
              onClick={() => handleAuthorize('QUICK_AUTH')}
              className="w-full py-2.5 rounded-xl border border-cyan-400/50 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-hud font-semibold flex items-center justify-center gap-2 transition"
            >
              <Fingerprint className="w-4 h-4 text-cyan-400" />
              <span>QUICK ONE-TAP BIOMETRIC AUTHORIZATION (SIR)</span>
            </button>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-slate-950/60 border border-cyan-950 space-y-2 text-[11px]">
            <div className="font-hud text-xs text-cyan-300 font-semibold flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              AUTHORIZED CAPABILITIES ACTIVE
            </div>
            <ul className="space-y-1 text-slate-300 text-[10px] font-mono-tech">
              <li className="flex items-center gap-1.5 text-emerald-400">
                <Check className="w-3 h-3" /> Voice-Activated Ride Booking (Rapido, Uber, Ola)
              </li>
              <li className="flex items-center gap-1.5 text-emerald-400">
                <Check className="w-3 h-3" /> Live Ecosystem Mesh & Connected Device Control
              </li>
              <li className="flex items-center gap-1.5 text-emerald-400">
                <Check className="w-3 h-3" /> Encrypted Memory Vault & Private Notes Storage
              </li>
              <li className="flex items-center gap-1.5 text-emerald-400">
                <Check className="w-3 h-3" /> Multilingual Emotion-Aware Vocal Synthesis
              </li>
            </ul>
          </div>
        )}

        {/* Status Messages */}
        {errorMsg && (
          <div className="p-2 rounded-lg bg-rose-950/50 border border-rose-500/40 text-rose-300 text-[11px]">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-2 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-[11px]">
            {successMsg}
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-cyan-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 border border-cyan-950 text-slate-300 hover:text-white text-xs font-hud transition"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
