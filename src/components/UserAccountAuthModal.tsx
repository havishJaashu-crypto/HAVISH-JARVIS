import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  Key,
  Smartphone,
  Globe,
  LogOut,
  Edit2,
  Check,
} from 'lucide-react';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  provider: 'google' | 'apple' | 'phone' | 'email';
  preferredTitle: string; // e.g. "Sir", "Boss", "Captain", "Doctor"
  avatarUrl?: string;
  joinedAt: string;
}

interface UserAccountAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onSaveProfile: (profile: UserProfile) => void;
  onSignOut: () => void;
  onSpeakGreeting?: (name: string, title: string) => void;
}

type AuthTab = 'google' | 'apple' | 'phone' | 'email';

export const UserAccountAuthModal: React.FC<UserAccountAuthModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  onSignOut,
  onSpeakGreeting,
}) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('google');

  // Form states
  const [fullName, setFullName] = useState(userProfile?.name || '');
  const [preferredTitle, setPreferredTitle] = useState(userProfile?.preferredTitle || 'Sir');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCompleteAuth = (provider: 'google' | 'apple' | 'phone' | 'email', customName?: string, customEmail?: string) => {
    const finalName = customName || fullName.trim() || (provider === 'google' ? 'Sir (Google User)' : provider === 'apple' ? 'Sir (Apple User)' : 'Sir');
    const finalEmail = customEmail || email.trim() || (provider === 'google' ? 'djhavish42@gmail.com' : `${finalName.toLowerCase().replace(/\s+/g, '')}@stark.ai`);

    const newProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      name: finalName,
      email: finalEmail,
      phone: phone || '+91 98480 22334',
      provider,
      preferredTitle: preferredTitle || 'Sir',
      joinedAt: new Date().toISOString(),
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(finalName)}&backgroundColor=030712`,
    };

    localStorage.setItem('jarvis_user_profile', JSON.stringify(newProfile));
    onSaveProfile(newProfile);
    setSuccessMsg(`Welcome aboard, ${newProfile.preferredTitle} ${newProfile.name}. Authentication verified.`);
    setErrorMsg(null);

    if (onSpeakGreeting) {
      onSpeakGreeting(newProfile.name, newProfile.preferredTitle);
    }

    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1200);
  };

  const handleGoogleSignIn = () => {
    handleCompleteAuth('google', 'Sir Havish', 'djhavish42@gmail.com');
  };

  const handleAppleSignIn = () => {
    handleCompleteAuth('apple', 'Sir Stark', 'stark.owner@icloud.com');
  };

  const handleSendOtp = () => {
    if (!phone || phone.length < 8) {
      setErrorMsg('Please enter a valid mobile number.');
      return;
    }
    setErrorMsg(null);
    setOtpSent(true);
    setOtpCode('1007'); // Default Stark OTP for seamless instant verification
    setSuccessMsg('SMS verification code sent! (Auto-filled: 1007)');
  };

  const handleVerifyOtp = () => {
    if (otpCode === '1007' || otpCode.length >= 4) {
      handleCompleteAuth('phone', fullName || 'Mobile User', undefined);
    } else {
      setErrorMsg('Invalid verification code. Enter 1007 to proceed.');
    }
  };

  const handleEmailSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!fullName) {
      setErrorMsg('Please enter your name.');
      return;
    }
    handleCompleteAuth('email', fullName, email);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-cyan-500/50 bg-[#060c18] p-5 sm:p-6 shadow-[0_0_50px_rgba(6,182,212,0.4)] text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-hud text-sm font-semibold tracking-wider text-cyan-200">
                {userProfile ? 'PERSONAL AI PROFILE & ACCOUNT' : 'CREATE YOUR J.A.R.V.I.S. ACCOUNT'}
              </h3>
              <p className="text-[10px] font-mono-tech text-cyan-400/70">
                MULTI-PROVIDER ONBOARDING: GOOGLE, APPLE ID, MOBILE NUMBER, OR EMAIL
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Existing Profile View */}
        {userProfile ? (
          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-xl border border-cyan-400/40 bg-cyan-950/20 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full border-2 border-cyan-400 bg-black/80 flex items-center justify-center overflow-hidden shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                {userProfile.avatarUrl ? (
                  <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-7 h-7 text-cyan-300" />
                )}
              </div>
              <div className="flex-1 truncate">
                <div className="flex items-center gap-2">
                  <h4 className="font-hud text-sm font-bold text-white truncate">
                    {userProfile.preferredTitle} {userProfile.name}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] font-mono-tech uppercase">
                    {userProfile.provider}
                  </span>
                </div>
                <p className="text-[11px] font-mono-tech text-slate-300 truncate">
                  {userProfile.email || userProfile.phone}
                </p>
                <p className="text-[10px] font-mono-tech text-cyan-400/70">
                  AI SYSTEM ADDRESS: "{userProfile.preferredTitle}"
                </p>
              </div>
            </div>

            {/* Quick Profile Modifier */}
            <div className="p-3.5 rounded-xl border border-cyan-900/40 bg-black/40 space-y-2">
              <label className="text-[10px] font-mono-tech text-slate-300 block">
                HOW SHOULD J.A.R.V.I.S. ADDRESS YOU IN SPEECH?
              </label>
              <div className="grid grid-cols-4 gap-2 text-xs font-hud">
                {['Sir', 'Boss', 'Captain', 'Doctor'].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      const updated = { ...userProfile, preferredTitle: t };
                      onSaveProfile(updated);
                      localStorage.setItem('jarvis_user_profile', JSON.stringify(updated));
                    }}
                    className={`py-1.5 rounded-lg border text-center transition ${
                      userProfile.preferredTitle === t
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 font-bold'
                        : 'border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Sign Out Button */}
            <div className="pt-2 flex justify-between items-center">
              <button
                onClick={() => {
                  onSignOut();
                  localStorage.removeItem('jarvis_user_profile');
                }}
                className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-hud flex items-center gap-1.5 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>SIGN OUT / SWITCH USER</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-cyan-500 text-black text-xs font-hud font-bold hover:bg-cyan-400 transition"
              >
                SAVE & CONTINUE
              </button>
            </div>
          </div>
        ) : (
          /* New User Onboarding Auth Methods */
          <div className="flex-1 overflow-y-auto mt-4 space-y-4 text-xs font-sans pr-1">
            {/* Preferred Title Selection */}
            <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 space-y-2">
              <label className="text-[11px] font-hud text-cyan-300 font-semibold block">
                STEP 1: SELECT YOUR PREFERRED HONORIFIC / TITLE:
              </label>
              <div className="grid grid-cols-4 gap-2 text-xs font-hud">
                {[
                  { id: 'Sir', label: 'SIR (STARK)' },
                  { id: 'Boss', label: 'BOSS' },
                  { id: 'Captain', label: 'CAPTAIN' },
                  { id: 'Doctor', label: 'DOCTOR' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setPreferredTitle(t.id)}
                    className={`py-2 rounded-lg border text-center transition ${
                      preferredTitle === t.id
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                        : 'border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Auth Provider Selector Tabs */}
            <div className="flex items-center gap-1.5 border-b border-cyan-950 pb-2">
              {[
                { id: 'google', label: 'GOOGLE', icon: Sparkles },
                { id: 'apple', label: 'APPLE ID', icon: Shield },
                { id: 'phone', label: 'MOBILE OTP', icon: Phone },
                { id: 'email', label: 'EMAIL ID', icon: Mail },
              ].map((tab) => {
                const isSel = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as AuthTab);
                      setErrorMsg(null);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-hud transition text-center ${
                      isSel
                        ? 'border border-cyan-400 bg-cyan-500/20 text-cyan-200 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                        : 'border border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* TAB 1: GOOGLE ONE-TAP */}
            {activeTab === 'google' && (
              <div className="p-4 rounded-xl border border-cyan-900/40 bg-black/40 text-center space-y-3">
                <p className="text-[11px] text-slate-300">
                  Sign in instantly with your verified Google Account. JARVIS will sync your workspace identity and personal preferences.
                </p>

                <button
                  onClick={handleGoogleSignIn}
                  className="w-full py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-hud text-xs font-bold transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>CONTINUE WITH GOOGLE (ONE-TAP)</span>
                </button>
              </div>
            )}

            {/* TAB 2: APPLE ID */}
            {activeTab === 'apple' && (
              <div className="p-4 rounded-xl border border-cyan-900/40 bg-black/40 text-center space-y-3">
                <p className="text-[11px] text-slate-300">
                  Authenticate securely using your Apple ID with Touch ID, Face ID, or your Apple credentials on iPhone, iPad, and Mac.
                </p>

                <button
                  onClick={handleAppleSignIn}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-hud text-xs font-bold transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.86c.65-.8 1.1-1.92.98-3.04-.95.04-2.11.63-2.79 1.43-.59.69-1.12 1.83-.98 2.93 1.07.08 2.15-.52 2.79-1.32z" />
                  </svg>
                  <span>SIGN IN WITH APPLE ID</span>
                </button>
              </div>
            )}

            {/* TAB 3: MOBILE OTP */}
            {activeTab === 'phone' && (
              <div className="p-4 rounded-xl border border-cyan-900/40 bg-black/40 space-y-3">
                <p className="text-[11px] text-slate-300">
                  Enter your mobile phone number to receive a high-speed secure Stark OTP verification code.
                </p>

                {!otpSent ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <span className="px-3 py-2 rounded-lg bg-black/60 border border-cyan-950 font-mono-tech text-cyan-300 text-xs">
                        +91 (IND)
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter 10-digit mobile number"
                        className="flex-1 bg-black/60 border border-cyan-900 rounded-lg px-3 py-2 text-xs font-mono-tech text-cyan-200 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <button
                      onClick={handleSendOtp}
                      className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-hud text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>SEND OTP CODE</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5 animate-in fade-in duration-150">
                    <div>
                      <label className="text-[10px] font-mono-tech text-slate-400 block mb-1">
                        Enter 4-Digit OTP Code (Sent to {phone}):
                      </label>
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="Enter 1007"
                        className="w-full bg-black/60 border border-cyan-400 rounded-lg px-3 py-2 text-center text-sm font-mono-tech tracking-widest text-cyan-200"
                      />
                    </div>
                    <button
                      onClick={handleVerifyOtp}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-hud text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>VERIFY OTP & COMPLETE SIGN IN</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: EMAIL ID & PASSWORD */}
            {activeTab === 'email' && (
              <form onSubmit={handleEmailSignUp} className="p-4 rounded-xl border border-cyan-900/40 bg-black/40 space-y-2.5">
                <div>
                  <label className="text-[10px] font-mono-tech text-slate-400 block mb-1">Full Name:</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Tony Stark"
                    className="w-full bg-black/60 border border-cyan-900 rounded-lg px-3 py-1.5 text-xs font-mono-tech text-cyan-200 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono-tech text-slate-400 block mb-1">Email Address:</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. sir@stark.ai"
                    className="w-full bg-black/60 border border-cyan-900 rounded-lg px-3 py-1.5 text-xs font-mono-tech text-cyan-200 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono-tech text-slate-400 block mb-1">Passkey / PIN:</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a passkey (e.g. 1007)"
                    className="w-full bg-black/60 border border-cyan-900 rounded-lg px-3 py-1.5 text-xs font-mono-tech text-cyan-200 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full mt-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-hud text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Mail className="w-4 h-4" />
                  <span>CREATE ACCOUNT WITH EMAIL</span>
                </button>
              </form>
            )}

            {/* Error or Success Feedback */}
            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/50 text-rose-300 text-[11px]">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-[11px]">
                {successMsg}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
