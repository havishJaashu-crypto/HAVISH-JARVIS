import React, { useState } from 'react';
import {
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
  Radio,
  ShieldCheck,
  Zap,
  Lock,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { ConnectedDevice } from '../types';

interface ConnectedDevicesViewProps {
  devices: ConnectedDevice[];
  onSyncDevice: (id: string) => void;
  onTriggerCommand: (action: string, target: string) => void;
}

export const ConnectedDevicesView: React.FC<ConnectedDevicesViewProps> = ({
  devices,
  onSyncDevice,
  onTriggerCommand,
}) => {
  const [pairingCode, setPairingCode] = useState('STARK-965F-7A');
  const [showPairModal, setShowPairModal] = useState(false);
  const [commandFeedback, setCommandFeedback] = useState<string | null>(null);

  const handleCommand = (action: string, targetName: string) => {
    onTriggerCommand(action, targetName);
    setCommandFeedback(`Command '${action}' transmitted to ${targetName}.`);
    setTimeout(() => setCommandFeedback(null), 3000);
  };

  const generateNewPairingCode = () => {
    const randomHex = Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase().padStart(6, '0');
    setPairingCode(`STARK-${randomHex}`);
  };

  return (
    <div className="flex-1 flex flex-col h-full max-w-4xl mx-auto w-full rounded-2xl border border-cyan-900/40 bg-[#060c18]/80 backdrop-blur-md overflow-hidden p-4 sm:p-6 shadow-[0_0_25px_rgba(6,182,212,0.1)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-cyan-950">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h2 className="font-hud tracking-wider text-sm font-semibold text-cyan-200">
              CONNECTED MULTI-DEVICE ECOSYSTEM MESH
            </h2>
            <p className="text-[11px] font-mono-tech text-cyan-400/70">
              ONE JARVIS BRAIN ACROSS IPHONE PWA, ANDROID TABLET & WINDOWS WORKSTATION
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            generateNewPairingCode();
            setShowPairModal(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/50 hover:bg-cyan-500/30 text-cyan-300 text-xs font-hud transition shadow-[0_0_12px_rgba(6,182,212,0.2)]"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>PAIR NEW DEVICE</span>
        </button>
      </div>

      {/* Command Feedback Toast */}
      {commandFeedback && (
        <div className="mt-4 p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-400/50 text-cyan-200 text-xs font-mono-tech flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{commandFeedback}</span>
        </div>
      )}

      {/* Device Mesh Grid */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.map((device) => {
          const Icon =
            device.type === 'desktop' ? Monitor : device.type === 'tablet' ? Tablet : Smartphone;
          const isOnline = device.status === 'online';

          return (
            <div
              key={device.id}
              className={`p-4 rounded-xl border transition-all ${
                device.isCurrent
                  ? 'border-cyan-400/60 bg-cyan-950/20 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                  : 'border-cyan-900/40 bg-black/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      device.isCurrent
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-900 border-slate-700 text-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-hud font-semibold text-xs sm:text-sm text-white">
                        {device.name}
                      </h3>
                      {device.isCurrent && (
                        <span className="text-[9px] font-mono-tech px-1.5 py-0.2 rounded bg-cyan-500/20 border border-cyan-400/60 text-cyan-300">
                          THIS DEVICE
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono-tech text-slate-400 mt-0.5">
                      IP: {device.ip} • Battery: {device.battery}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                    }`}
                  />
                  <span className="text-[10px] font-mono-tech uppercase text-slate-300">
                    {device.status}
                  </span>
                </div>
              </div>

              {/* Action Controls */}
              <div className="mt-4 pt-3 border-t border-cyan-950 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-mono-tech text-slate-500">
                  Last Sync: {new Date(device.lastSync).toLocaleTimeString()}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onSyncDevice(device.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 border border-cyan-950 hover:border-cyan-500/40 text-[10px] font-mono-tech text-cyan-400 transition"
                    title="Synchronize context"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>SYNC</span>
                  </button>

                  <button
                    onClick={() => handleCommand('PING_AUDIO', device.name)}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 border border-cyan-950 hover:border-cyan-500/40 text-[10px] font-mono-tech text-slate-300 transition"
                    title="Send ping tone"
                  >
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>PING</span>
                  </button>

                  <button
                    onClick={() => handleCommand('REMOTE_LOCK', device.name)}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 border border-cyan-950 hover:border-cyan-500/40 text-[10px] font-mono-tech text-slate-300 transition"
                    title="Lock device terminal"
                  >
                    <Lock className="w-3 h-3" />
                    <span>LOCK</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pairing Modal */}
      {showPairModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-2xl border border-cyan-500/50 bg-[#060c18] p-6 shadow-[0_0_35px_rgba(6,182,212,0.3)] text-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="font-hud text-sm font-semibold text-cyan-300 tracking-wider">
              AUTHORIZE NEW ECOSYSTEM NODE
            </h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Enter this encrypted pairing PIN on your OnePlus Tablet or Windows Desktop app:
            </p>

            <div className="p-3 rounded-xl bg-black/70 border border-cyan-400/60 font-mono-tech text-lg text-cyan-300 font-bold tracking-widest">
              {pairingCode}
            </div>

            <button
              onClick={() => setShowPairModal(false)}
              className="mt-5 w-full py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 text-xs font-hud tracking-wider hover:bg-cyan-500/30 transition"
            >
              CLOSE WINDOW
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
