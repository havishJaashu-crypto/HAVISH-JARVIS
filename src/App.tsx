import React, { useState, useEffect, useCallback } from 'react';
import { HUDHeader, NavTab } from './components/HUDHeader';
import { ArcReactorOrb } from './components/ArcReactorOrb';
import { LeftHUDPanel } from './components/LeftHUDPanel';
import { RightHUDPanel } from './components/RightHUDPanel';
import { VoiceConsole } from './components/VoiceConsole';
import { IntelligenceChatView } from './components/IntelligenceChatView';
import { WebIntelView } from './components/WebIntelView';
import { FileWorkspaceView } from './components/FileWorkspaceView';
import { MemoryVaultView } from './components/MemoryVaultView';
import { RunningNotesView } from './components/RunningNotesView';
import { ConnectedDevicesView } from './components/ConnectedDevicesView';
import { DeviceControlView } from './components/DeviceControlView';
import { DiagnosticsModal } from './components/DiagnosticsModal';
import { AccessLinksModal } from './components/AccessLinksModal';
import { ActionApprovalOverlay } from './components/ActionApprovalOverlay';
import { AppAuthModal } from './components/AppAuthModal';
import { GlobalRadarMapView } from './components/GlobalRadarMapView';
import { ThreeGameSimulator } from './components/ThreeGameSimulator';
import { SonicGeneratorView } from './components/SonicGeneratorView';
import { GitHubPublishGuideModal } from './components/GitHubPublishGuideModal';
import { UserAccountAuthModal, UserProfile } from './components/UserAccountAuthModal';
import { HandGestureController, GestureType } from './components/HandGestureController';
import { useVoiceEngine } from './hooks/useVoiceEngine';
import { Mic, Volume2, Sparkles, User, Github, Hand, Film, GraduationCap } from 'lucide-react';
import {
  ChatMessage,
  PersonalMemoryItem,
  ProjectMemoryItem,
  PrivateVaultItem,
  RunningNote,
  ConnectedDevice,
  SystemTelemetry,
  EmotionType,
  ActionApprovalRequest,
  AppAuthSession,
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('reactor');
  const [wakeWordEnabled, setWakeWordEnabled] = useState(true);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showAccessLinks, setShowAccessLinks] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [telemetry, setTelemetry] = useState<SystemTelemetry | null>(null);

  // Core Data States
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [personalMemory, setPersonalMemory] = useState<PersonalMemoryItem[]>([]);
  const [projectMemory, setProjectMemory] = useState<ProjectMemoryItem[]>([]);
  const [privateVault, setPrivateVault] = useState<PrivateVaultItem[]>([]);
  const [notes, setNotes] = useState<RunningNote[]>([]);
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);
  const [actionLogs, setActionLogs] = useState<any[]>([]);

  // Action Approval & Authentication States
  const [pendingAction, setPendingAction] = useState<ActionApprovalRequest | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showGitHubGuide, setShowGitHubGuide] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showGesturesModal, setShowGesturesModal] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('jarvis_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });
  const [authSession, setAuthSession] = useState<AppAuthSession>(() => {
    try {
      const saved = localStorage.getItem('jarvis_auth_session');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      isAuthorized: true,
      ownerName: 'Sir (djhavish42@gmail.com)',
      authLevel: 'MASTER',
      authorizedAt: new Date().toISOString(),
    };
  });

  // Connectivity listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch initial system telemetry and persistent data
  const refreshData = useCallback(async () => {
    try {
      const [healthRes, memRes, notesRes, devRes, logsRes] = await Promise.all([
        fetch('/api/health').catch(() => null),
        fetch('/api/memory').catch(() => null),
        fetch('/api/notes').catch(() => null),
        fetch('/api/devices').catch(() => null),
        fetch('/api/device-control/logs').catch(() => null),
      ]);

      if (healthRes && healthRes.ok) {
        const data = await healthRes.json();
        setTelemetry(data);
      }

      if (memRes && memRes.ok) {
        const memData = await memRes.json();
        setPersonalMemory(memData.personalMemory || []);
        setProjectMemory(memData.projectMemory || []);
        setPrivateVault(memData.privateVault || []);
        if (memData.conversationHistory && memData.conversationHistory.length > 0) {
          setMessages(memData.conversationHistory);
        }
      }

      if (notesRes && notesRes.ok) {
        const notesData = await notesRes.json();
        setNotes(notesData);
      }

      if (devRes && devRes.ok) {
        const devData = await devRes.json();
        setDevices(devData);
      }

      if (logsRes && logsRes.ok) {
        const logsData = await logsRes.json();
        setActionLogs(logsData);
      }
    } catch (err) {
      console.warn('Initial telemetry load warning:', err);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Action Approval Reference
  const pendingActionRef = React.useRef<ActionApprovalRequest | null>(null);

  // Approve Action (Rapido, Uber, Ola, etc.)
  const handleApproveAction = useCallback(
    async (action: ActionApprovalRequest) => {
      try {
        const updatedAction = { ...action, status: 'dispatched' as const };
        setPendingAction(updatedAction);
        pendingActionRef.current = null;

        const res = await fetch('/api/action/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ actionId: action.id, action: updatedAction }),
        });
        if (res.ok) {
          const data = await res.json();
          setActionLogs((prev) => [data.logEntry, ...prev]);
        }

        // Spoken confirmation
        const confirmSpeech =
          voiceEngine.lockedLanguage === 'Telugu'
            ? `సర్, ${action.service} ${action.vehicleType || 'రైడ్'} బుకింగ్ కన్ఫర్మ్ అయింది! కెప్టెన్ ${action.driverDetails?.name || 'విక్రమ్'} 3 నిమిషాల్లో చేరుకుంటున్నారు.`
            : voiceEngine.lockedLanguage === 'Tanglish'
            ? `Sir, ${action.service} ${action.vehicleType || 'ride'} confirmed! Captain ${action.driverDetails?.name || 'Vikram'} is arriving in 3 minutes.`
            : voiceEngine.lockedLanguage === 'Hindi'
            ? `Sir, ${action.service} ${action.vehicleType || 'ride'} confirm ho gayi hai! Captain ${action.driverDetails?.name || 'Vikram'} 3 minute me aa rahe hain.`
            : `Booking confirmed with ${action.service}, Sir! Captain ${action.driverDetails?.name || 'Vikram'} has been dispatched and will arrive in 3 minutes.`;

        const botConfirmMsg: ChatMessage = {
          id: `bot-conf-${Date.now()}`,
          role: 'assistant',
          text: confirmSpeech,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botConfirmMsg]);
        voiceEngine.speakText(confirmSpeech);

        setTimeout(() => {
          setPendingAction(null);
        }, 5000);
      } catch (err) {
        console.error('Action approval error:', err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Reject Action
  const handleRejectAction = useCallback(
    async (action: ActionApprovalRequest) => {
      try {
        setPendingAction(null);
        pendingActionRef.current = null;

        await fetch('/api/action/reject', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ actionId: action.id, reason: "Cancelled by Sir's directive" }),
        });

        const cancelSpeech =
          voiceEngine.lockedLanguage === 'Telugu'
            ? 'బుకింగ్ రద్దు చేయబడింది, సర్.'
            : voiceEngine.lockedLanguage === 'Tanglish'
            ? 'Sir, booking cancel chesanu.'
            : 'Understood, Sir. The booking command has been cancelled.';

        const botCancelMsg: ChatMessage = {
          id: `bot-canc-${Date.now()}`,
          role: 'assistant',
          text: cancelSpeech,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botCancelMsg]);
        voiceEngine.speakText(cancelSpeech);
      } catch (err) {
        console.error('Action rejection error:', err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Handle outgoing message transmission to JARVIS
  const handleSendMessage = useCallback(
    async (text: string, detectedEmotion?: EmotionType, detectedLanguage?: string) => {
      if (!text.trim()) return;

      const activeLang =
        voiceEngine.lockedLanguage !== 'auto'
          ? voiceEngine.lockedLanguage
          : detectedLanguage || 'English';

      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        text: text.trim(),
        timestamp: new Date().toISOString(),
        emotion: detectedEmotion,
        language: activeLang,
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsChatLoading(true);
      voiceEngine.setReactorState('PROCESSING');

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text.trim(),
            detectedEmotion: detectedEmotion || voiceEngine.currentEmotion,
            currentLanguage: activeLang,
            userTitle: userProfile?.preferredTitle || 'Sir',
            userName: userProfile?.name || 'Sir',
          }),
        });

        const data = await res.json();
        const replyText = data.reply || 'Understood, Sir.';

        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toISOString(),
          emotion: data.detectedEmotion,
          language: data.language,
        };

        setMessages((prev) => [...prev, botMsg]);

        // If command requested a view switch (radar, 3d, or music)
        if (data.targetTab) {
          setActiveTab(data.targetTab);
        }

        // If an autonomous action requires approval, store it and AUTO-ACTIVATE MIC after speech ends!
        if (data.pendingAction) {
          setPendingAction(data.pendingAction);
          pendingActionRef.current = data.pendingAction;

          // Speak prompt, and on end, AUTOMATICALLY ACTIVATE MICROPHONE to listen for Sir's approval
          voiceEngine.speakText(
            replyText,
            () => {
              // Automatically activate mic for Sir's confirmation
              voiceEngine.startListening();
            },
            data.detectedEmotion
          );
        } else {
          // Speak standard reply
          voiceEngine.speakText(replyText, undefined, data.detectedEmotion);
        }
      } catch (err: any) {
        console.error('Chat error:', err);
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: 'Apologies, Sir. A transient communication anomaly occurred while contacting our server circuits.',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
        voiceEngine.setReactorState('ERROR');
        setTimeout(() => voiceEngine.setReactorState('IDLE'), 3500);
      } finally {
        setIsChatLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Initialize Voice Engine with Multilingual Wake Word & Emotion Modulation
  const voiceEngine = useVoiceEngine({
    wakeWordEnabled,
    onTranscriptReady: (transcript, emotion, language) => {
      // Check if an autonomous action approval is currently pending
      if (pendingActionRef.current) {
        const lower = transcript.toLowerCase().trim();
        const isAffirmative =
          /\b(yes|confirm|confirmed|proceed|book|book it|approved|approve|sure|okay|ok|haan|ha|sare)\b/i.test(lower) ||
          /(సరే|చెయ్యి|బుక్ చేయి|బుక్ చెయ్|హా|అవును|చేయి|హ)/i.test(transcript);

        const isNegative =
          /\b(no|cancel|cancelled|stop|abort|don't|dont|wait|not now|reject)\b/i.test(lower) ||
          /(వద్దు|ఆపు|క్యాన్సిల్|వద్దండి)/i.test(transcript);

        if (isAffirmative) {
          handleApproveAction(pendingActionRef.current);
          return;
        } else if (isNegative) {
          handleRejectAction(pendingActionRef.current);
          return;
        }
      }

      handleSendMessage(transcript, emotion, language);
    },
  });

  // Optical & Holographic Hand Gesture Event Handler
  const handleGesture = useCallback(
    (gesture: GestureType) => {
      switch (gesture) {
        case 'OPEN_PALM':
          voiceEngine.startListening();
          voiceEngine.speakText('Open palm acknowledged, Sir. Audio sensory matrix active and listening.');
          break;
        case 'CLOSED_FIST':
          voiceEngine.stopSpeaking();
          voiceEngine.stopListening();
          break;
        case 'POINT_INDEX':
          if (pendingActionRef.current) {
            handleApproveAction(pendingActionRef.current);
          } else {
            voiceEngine.speakText('Affirmative gesture confirmed, Sir.');
          }
          break;
        case 'PEACE_SIGN':
          handleSendMessage('Jarvis, tell me famous Telugu movie punch dialogues and funny memes!');
          break;
        case 'SHAKA':
          handleSendMessage('Jarvis, tell me about Iron Man, KGF, and Robo dubbed in Telugu');
          break;
        case 'SWIPE_NEXT': {
          const tabs: NavTab[] = ['reactor', 'chat', 'map', 'game3d', 'music', 'search', 'files', 'memory', 'notes', 'devices', 'controls'];
          const idx = tabs.indexOf(activeTab);
          setActiveTab(tabs[(idx + 1) % tabs.length]);
          break;
        }
        case 'SWIPE_PREV': {
          const tabs: NavTab[] = ['reactor', 'chat', 'map', 'game3d', 'music', 'search', 'files', 'memory', 'notes', 'devices', 'controls'];
          const idx = tabs.indexOf(activeTab);
          setActiveTab(tabs[(idx - 1 + tabs.length) % tabs.length]);
          break;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTab, handleApproveAction, handleSendMessage]
  );

  // Memory Actions
  const handleAddMemory = async (type: 'personal' | 'project' | 'private', item: any) => {
    try {
      const res = await fetch('/api/memory/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, item }),
      });
      if (res.ok) {
        refreshData();
      }
    } catch (e) {}
  };

  const handleDeleteMemory = async (type: 'personal' | 'project' | 'private', id: string) => {
    try {
      await fetch(`/api/memory/${type}/${id}`, { method: 'DELETE' });
      refreshData();
    } catch (e) {}
  };

  // Notes Actions
  const handleAddNote = async (note: any) => {
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      });
      if (res.ok) {
        refreshData();
      }
    } catch (e) {}
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      refreshData();
    } catch (e) {}
  };

  // Device Sync
  const handleSyncDevice = async (deviceId: string) => {
    try {
      await fetch('/api/devices/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId }),
      });
      refreshData();
    } catch (e) {}
  };

  // Device Trigger Action
  const handleTriggerAction = async (action: string, target: string, payload?: any) => {
    try {
      const res = await fetch('/api/device-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, target, payload }),
      });
      if (res.ok) {
        const data = await res.json();
        setActionLogs((prev) => [data.logEntry, ...prev]);
      }
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col relative overflow-x-hidden">
      {/* Background Subtle Tech Grid & Cyber Glow */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 25%, rgba(6, 182, 212, 0.15) 0%, transparent 60%),
            linear-gradient(to right, rgba(6, 182, 212, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 40px 40px, 40px 40px',
        }}
      />

      {/* Futuristic Scanline Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(rgba(0,242,254,0.02)_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Top HUD Header */}
      <HUDHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenDiagnostics={() => setShowDiagnostics(true)}
        onOpenAccessLinks={() => setShowAccessLinks(true)}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onOpenGitHubGuide={() => setShowGitHubGuide(true)}
        onOpenAccountModal={() => setShowAccountModal(true)}
        onOpenGestures={() => setShowGesturesModal(true)}
        userProfile={userProfile}
        isOnline={isOnline}
        modelName={telemetry?.model || 'gemini-3.8-flash'}
        lockedLanguage={voiceEngine.lockedLanguage}
        onSelectLanguage={voiceEngine.setLockedLanguage}
        authSession={authSession}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-3 sm:p-6 relative z-10 max-w-7xl mx-auto w-full">
        {/* Sensory Receptors & Microphone Auto-Activation Banner */}
        {!voiceEngine.isMicActive && (
          <div className="mb-4 p-3.5 rounded-2xl border border-cyan-400/70 bg-cyan-950/40 backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.3)] flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <Mic className="w-5 h-5 text-cyan-300 animate-pulse" />
              </div>
              <div>
                <div className="font-hud text-xs sm:text-sm font-bold text-cyan-200 flex items-center gap-2">
                  <span>MAXIMUM INTENSITY VOICE RECEPTORS READY</span>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 text-[9px] font-mono-tech">
                    3.5X PRE-AMP GAIN
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Click to grant microphone access. J.A.R.V.I.S. will automatically initialize high-sensitivity audio capture and start listening for wake words and commands.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                voiceEngine.requestPermissionAndActivate(() => {
                  const title = userProfile?.preferredTitle || 'Sir';
                  voiceEngine.speakText(
                    `Microphone permissions granted. Sensory matrix fully engaged and calibrated to maximum intensity, ${title}. I am listening.`
                  );
                });
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-hud text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
            >
              <Sparkles className="w-4 h-4" />
              <span>GRANT PERMISSION & ENGAGE MIC</span>
            </button>
          </div>
        )}

        {/* Tactical Discovery & Interactive Skill Bar */}
        <div className="mb-4 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => handleSendMessage('Jarvis, tell me famous Telugu movie punch dialogues and memes')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 text-xs font-hud whitespace-nowrap transition shadow-[0_0_10px_rgba(245,158,11,0.2)]"
          >
            <Film className="w-3.5 h-3.5 text-amber-400" />
            <span>🎬 TELUGU CINEMA & MEMES</span>
          </button>

          <button
            onClick={() => handleSendMessage('Jarvis, tell me about Iron Man, KGF, and Robo dubbed in Telugu')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-500/40 bg-purple-950/30 hover:bg-purple-900/40 text-purple-300 text-xs font-hud whitespace-nowrap transition shadow-[0_0_10px_rgba(168,85,247,0.2)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>🎭 DUBBED MOVIES LORE</span>
          </button>

          <button
            onClick={() => handleSendMessage('Jarvis, teach me Python and Software Architecture step by step')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-300 text-xs font-hud whitespace-nowrap transition shadow-[0_0_10px_rgba(16,185,129,0.2)]"
          >
            <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
            <span>🎓 TEACH ME STEP-BY-STEP</span>
          </button>

          <button
            onClick={() => setShowGesturesModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-400/50 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-200 text-xs font-hud whitespace-nowrap transition shadow-[0_0_10px_rgba(6,182,212,0.2)]"
          >
            <Hand className="w-3.5 h-3.5 text-cyan-400" />
            <span>✋ HAND GESTURE MATRIX</span>
          </button>
        </div>
        {/* TAB 1: REACTOR CORE (PRIMARY HUD) */}
        {activeTab === 'reactor' && (
          <div className="flex-1 flex flex-col justify-between gap-6">
            {/* Upper HUD Grid */}
            <div className="flex-1 flex flex-col lg:flex-row items-center justify-between gap-6 py-4">
              {/* Left Telemetry Panel */}
              <div className="w-full lg:w-72 order-2 lg:order-1">
                <LeftHUDPanel
                  isMicActive={voiceEngine.isMicActive}
                  onToggleMic={() => {
                    if (voiceEngine.isMicActive) {
                      voiceEngine.stopListening();
                    } else {
                      voiceEngine.startListening();
                    }
                  }}
                  wakeWordEnabled={wakeWordEnabled}
                  onToggleWakeWord={() => setWakeWordEnabled((prev) => !prev)}
                  wakeSensitivity={voiceEngine.wakeSensitivity}
                  onSelectWakeSensitivity={voiceEngine.setWakeSensitivity}
                  lockedLanguage={voiceEngine.lockedLanguage}
                  onResetLanguage={voiceEngine.resetLanguageLock}
                  emotionModulationEnabled={voiceEngine.emotionModulationEnabled}
                  onToggleEmotionModulation={() =>
                    voiceEngine.setEmotionModulationEnabled((p) => !p)
                  }
                  emotionModulationIntensity={voiceEngine.emotionModulationIntensity}
                  onEmotionIntensityChange={voiceEngine.setEmotionModulationIntensity}
                  currentEmotion={voiceEngine.currentEmotion}
                  onQuickPrompt={(text) => handleSendMessage(text)}
                />
              </div>

              {/* Centerpiece: Original JARVIS Arc Reactor Orb */}
              <div className="flex-1 flex flex-col items-center justify-center order-1 lg:order-2 my-2">
                <ArcReactorOrb
                  state={voiceEngine.reactorState}
                  audioLevel={voiceEngine.audioLevel}
                  emotion={voiceEngine.currentEmotion}
                  lockedLanguage={voiceEngine.lockedLanguage}
                  onResetLanguage={voiceEngine.resetLanguageLock}
                  onClick={() => {
                    if (voiceEngine.reactorState === 'SPEAKING') {
                      voiceEngine.stopSpeaking();
                    } else if (voiceEngine.isMicActive) {
                      voiceEngine.stopListening();
                    } else {
                      voiceEngine.startListening();
                    }
                  }}
                />
              </div>

              {/* Right Telemetry Panel */}
              <div className="w-full lg:w-72 order-3">
                <RightHUDPanel
                  telemetry={telemetry}
                  currentEmotion={voiceEngine.currentEmotion}
                  memoryCount={{
                    personal: personalMemory.length,
                    project: projectMemory.length,
                    notes: notes.length,
                  }}
                  devices={devices}
                  onOpenTab={(t) => setActiveTab(t)}
                />
              </div>
            </div>

            {/* Bottom Voice & Text Console */}
            <div className="w-full pt-2">
              <VoiceConsole
                reactorState={voiceEngine.reactorState}
                audioLevel={voiceEngine.audioLevel}
                liveTranscript={voiceEngine.liveTranscript}
                isMicActive={voiceEngine.isMicActive}
                onToggleMic={() => {
                  if (voiceEngine.isMicActive) {
                    voiceEngine.stopListening();
                  } else {
                    voiceEngine.startListening();
                  }
                }}
                onSendMessage={(text) => handleSendMessage(text)}
                onInterrupt={() => voiceEngine.stopSpeaking()}
                isMuted={voiceEngine.isMuted}
                onToggleMute={voiceEngine.toggleMute}
                emotion={voiceEngine.currentEmotion}
              />
            </div>
          </div>
        )}

        {/* TAB 2: INTELLIGENCE / FULL CHAT */}
        {activeTab === 'chat' && (
          <IntelligenceChatView
            messages={messages}
            onSpeakMessage={(text) => voiceEngine.speakText(text)}
            onClearHistory={() => setMessages([])}
            isLoading={isChatLoading}
          />
        )}

        {/* TAB 2B: GPS RADAR & RIDES */}
        {activeTab === 'map' && (
          <GlobalRadarMapView
            onSpeakText={(text) => voiceEngine.speakText(text)}
            onRequestBooking={(service, vehicle, dest) =>
              handleSendMessage(`Book a ${vehicle} from ${service} to ${dest}`)
            }
            currentAction={pendingAction}
          />
        )}

        {/* TAB 2C: 3D STARK SIMULATOR & ARC REACTOR HOLOGRAM */}
        {activeTab === 'game3d' && (
          <ThreeGameSimulator onSpeakText={(text) => voiceEngine.speakText(text)} />
        )}

        {/* TAB 2D: STARK SONIC MATRIX & GENERATIVE MUSIC */}
        {activeTab === 'music' && (
          <SonicGeneratorView onSpeakText={(text) => voiceEngine.speakText(text)} />
        )}

        {/* TAB 3: WEB INTEL (GOOGLE SEARCH GROUNDING) */}
        {activeTab === 'search' && (
          <WebIntelView onSpeakText={(text) => voiceEngine.speakText(text)} />
        )}

        {/* TAB 4: FILE WORKSPACE (MULTIMODAL VISION) */}
        {activeTab === 'files' && (
          <FileWorkspaceView onSpeakText={(text) => voiceEngine.speakText(text)} />
        )}

        {/* TAB 5: MEMORY VAULT & JASHU PORTAL */}
        {activeTab === 'memory' && (
          <MemoryVaultView
            personalMemory={personalMemory}
            projectMemory={projectMemory}
            privateVault={privateVault}
            onAddMemory={handleAddMemory}
            onDeleteMemory={handleDeleteMemory}
          />
        )}

        {/* TAB 6: RUNNING NOTES */}
        {activeTab === 'notes' && (
          <RunningNotesView
            notes={notes}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
          />
        )}

        {/* TAB 7: CONNECTED DEVICES */}
        {activeTab === 'devices' && (
          <ConnectedDevicesView
            devices={devices}
            onSyncDevice={handleSyncDevice}
            onTriggerCommand={(action, target) => handleTriggerAction(action, target)}
          />
        )}

        {/* TAB 8: DEVICE CONTROLS & MEDIA */}
        {activeTab === 'controls' && (
          <DeviceControlView
            onTriggerAction={handleTriggerAction}
            actionLogs={actionLogs}
          />
        )}
      </main>

      {/* Diagnostics & Settings Modal */}
      <DiagnosticsModal
        isOpen={showDiagnostics}
        onClose={() => setShowDiagnostics(false)}
        telemetry={telemetry}
        wakeWordEnabled={wakeWordEnabled}
        onToggleWakeWord={() => setWakeWordEnabled((prev) => !prev)}
        wakeSensitivity={voiceEngine.wakeSensitivity}
        onSelectWakeSensitivity={voiceEngine.setWakeSensitivity}
        lockedLanguage={voiceEngine.lockedLanguage}
        onSelectLockedLanguage={voiceEngine.setLockedLanguage}
        emotionModulationEnabled={voiceEngine.emotionModulationEnabled}
        onToggleEmotionModulation={() =>
          voiceEngine.setEmotionModulationEnabled((p) => !p)
        }
        emotionModulationIntensity={voiceEngine.emotionModulationIntensity}
        onEmotionIntensityChange={voiceEngine.setEmotionModulationIntensity}
        onTestVocalModulation={voiceEngine.testVocalModulation}
        availableVoices={voiceEngine.availableVoices}
        selectedVoiceName={voiceEngine.selectedVoiceName}
        onSelectVoice={voiceEngine.setSelectedVoiceName}
        speechRate={voiceEngine.speechRate}
        onSpeechRateChange={voiceEngine.setSpeechRate}
        speechPitch={voiceEngine.speechPitch}
        onSpeechPitchChange={voiceEngine.setSpeechPitch}
      />

      {/* Autonomous Action Approval Holographic Overlay with Mic Auto-Activation */}
      <ActionApprovalOverlay
        action={pendingAction}
        isListening={voiceEngine.isMicActive}
        onApprove={handleApproveAction}
        onReject={handleRejectAction}
      />

      {/* App Authorization & Security Modal */}
      <AppAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        session={authSession}
        onUpdateSession={setAuthSession}
      />

      {/* Public Deployment & iPhone Safari Access Links Modal */}
      <AccessLinksModal
        isOpen={showAccessLinks}
        onClose={() => setShowAccessLinks(false)}
        onOpenGitHubGuide={() => {
          setShowAccessLinks(false);
          setShowGitHubGuide(true);
        }}
      />

      {/* GitHub Repository Publishing Guide Modal */}
      <GitHubPublishGuideModal
        isOpen={showGitHubGuide}
        onClose={() => setShowGitHubGuide(false)}
      />

      {/* Multi-Provider User Account & Onboarding Modal */}
      <UserAccountAuthModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        userProfile={userProfile}
        onSaveProfile={(profile) => {
          setUserProfile(profile);
          setAuthSession((prev) => ({
            ...prev,
            isAuthorized: true,
            ownerName: `${profile.preferredTitle} (${profile.email || profile.name})`,
          }));
        }}
        onSignOut={() => {
          setUserProfile(null);
        }}
        onSpeakGreeting={(name, title) => {
          voiceEngine.speakText(`Welcome aboard, ${title} ${name}. Systems are primed and ready for your command.`);
        }}
      />

      {/* Optical & Holographic Hand Gesture Matrix */}
      <HandGestureController
        isOpen={showGesturesModal}
        onClose={() => setShowGesturesModal(false)}
        onGestureDetected={handleGesture}
        isMicActive={voiceEngine.isMicActive}
      />
    </div>
  );
}
