import React from 'react';
import {
  Cpu,
  Wifi,
  Database,
  Lock,
  Layers,
  HeartPulse,
  Monitor,
  Smartphone,
  Tablet,
  CheckCircle2,
} from 'lucide-react';
import { EmotionType, SystemTelemetry, ConnectedDevice } from '../types';

interface RightHUDPanelProps {
  telemetry: SystemTelemetry | null;
  currentEmotion: EmotionType;
  memoryCount: { personal: number; project: number; notes: number };
  devices: ConnectedDevice[];
  onOpenTab: (tab: any) => void;
}

export const RightHUDPanel: React.FC<RightHUDPanelProps> = ({
  telemetry,
  currentEmotion,
  memoryCount,
  devices,
  onOpenTab,
}) => {
  return (
    <aside className="w-full lg:w-72 flex flex-col gap-4 text-xs font-mono-tech">
      {/* AI Core Telemetry */}
      <div className="rounded-xl border border-cyan-900/50 bg-[#060c18]/80 backdrop-blur-md p-4 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
        <div className="flex items-center justify-between pb-2 border-b border-cyan-950">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="font-hud tracking-wider text-cyan-300 font-semibold">
              AI CORE TELEMETRY
            </span>
          </div>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Active Engine:</span>
            <span className="text-cyan-200 font-semibold">{telemetry?.model || 'gemini-3.8-flash'}</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Security Gateway:</span>
            <span className="text-emerald-400">Server-Side Proxy</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">API Status:</span>
            <span className={telemetry?.hasApiKey ? 'text-emerald-400' : 'text-amber-400'}>
              {telemetry?.hasApiKey ? 'Active (Ready)' : 'Standby / Secrets'}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Memory RSS:</span>
            <span className="text-slate-200">{telemetry?.memoryUsageMB || 42} MB</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Latency:</span>
            <span className="text-cyan-300">~24 ms</span>
          </div>
        </div>
      </div>

      {/* Human Emotion Estimator */}
      <div className="rounded-xl border border-cyan-900/50 bg-[#060c18]/80 backdrop-blur-md p-4">
        <div className="flex items-center justify-between pb-2 border-b border-cyan-950">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-cyan-400" />
            <span className="font-hud tracking-wider text-cyan-300 font-semibold">
              EMOTION AWARENESS
            </span>
          </div>
          <span className="text-[10px] text-cyan-400 font-hud">HEURISTIC</span>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40">
            <div>
              <div className="text-[10px] text-slate-400">Sir's Current State:</div>
              <div className="text-sm font-hud font-bold text-cyan-300 glow-text-cyan">
                {currentEmotion.toUpperCase()}
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            </div>
          </div>

          <p className="mt-2 text-[10px] text-slate-400 leading-tight">
            *Conversational tone, pitch, and phrasing adapt in real time to provide calm, reassuring, or concise responses.
          </p>
        </div>
      </div>

      {/* Memory & Running Notes Index */}
      <div className="rounded-xl border border-cyan-900/50 bg-[#060c18]/80 backdrop-blur-md p-4">
        <div className="flex items-center justify-between pb-2 border-b border-cyan-950">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span className="font-hud tracking-wider text-cyan-300 font-semibold">
              PERSISTENT MEMORY
            </span>
          </div>
          <button
            onClick={() => onOpenTab('memory')}
            className="text-[10px] text-cyan-400 hover:text-cyan-300 underline"
          >
            EXPLORE
          </button>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Personal Directives:</span>
            <span className="text-cyan-300 font-semibold">{memoryCount.personal} Records</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Active Projects:</span>
            <span className="text-cyan-300 font-semibold">{memoryCount.project} Projects</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Running Notes:</span>
            <span className="text-cyan-300 font-semibold">{memoryCount.notes} Notes</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Private Jashu Vault:</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Encrypted
            </span>
          </div>
        </div>
      </div>

      {/* Connected Ecosystem Mesh */}
      <div className="rounded-xl border border-cyan-900/50 bg-[#060c18]/80 backdrop-blur-md p-4">
        <div className="flex items-center justify-between pb-2 border-b border-cyan-950">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="font-hud tracking-wider text-cyan-300 font-semibold">
              CONNECTED MESH
            </span>
          </div>
          <button
            onClick={() => onOpenTab('devices')}
            className="text-[10px] text-cyan-400 hover:text-cyan-300 underline"
          >
            VIEW ALL
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {devices.slice(0, 3).map((d) => {
            const Icon = d.type === 'desktop' ? Monitor : d.type === 'tablet' ? Tablet : Smartphone;
            return (
              <div
                key={d.id}
                className="flex items-center justify-between p-1.5 rounded bg-slate-950/40 border border-cyan-950"
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate text-slate-300 text-[11px]">{d.name}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      d.status === 'online' ? 'bg-emerald-400' : 'bg-slate-600'
                    }`}
                  />
                  <span className="text-slate-400">{d.battery}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
