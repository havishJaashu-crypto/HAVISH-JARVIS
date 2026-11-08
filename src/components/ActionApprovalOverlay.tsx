import React from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  MapPin,
  Clock,
  DollarSign,
  Mic,
  Navigation,
  Bike,
  Car,
  AlertTriangle,
} from 'lucide-react';
import { ActionApprovalRequest } from '../types';

interface ActionApprovalOverlayProps {
  action: ActionApprovalRequest | null;
  isListening: boolean;
  onApprove: (action: ActionApprovalRequest) => void;
  onReject: (action: ActionApprovalRequest) => void;
}

export const ActionApprovalOverlay: React.FC<ActionApprovalOverlayProps> = ({
  action,
  isListening,
  onApprove,
  onReject,
}) => {
  if (!action) return null;

  const isBike = action.vehicleType === 'Bike';
  const isAuto = action.vehicleType === 'Auto';

  return (
    <div className="fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 pointer-events-none animate-in slide-in-from-bottom duration-300">
      <div className="w-full max-w-lg rounded-2xl border-2 border-amber-400/80 bg-[#060c18]/95 backdrop-blur-xl p-5 shadow-[0_0_50px_rgba(245,158,11,0.35)] text-slate-100 pointer-events-auto flex flex-col gap-3.5">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between pb-2 border-b border-amber-500/30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-300">
              <ShieldAlert className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="font-hud text-xs sm:text-sm font-bold tracking-wider text-amber-300 flex items-center gap-1.5">
                AUTONOMOUS ACTION APPROVAL REQUIRED
              </h3>
              <p className="text-[10px] font-mono-tech text-amber-400/70">
                APPLICATION: {action.service.toUpperCase()} // VEHICLE: {action.vehicleType?.toUpperCase() || 'RIDE'}
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono-tech font-bold uppercase tracking-wider animate-pulse">
            Awaiting Sir's Approval
          </span>
        </div>

        {/* Ride Details Card */}
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
                {isBike ? <Bike className="w-4 h-4" /> : <Car className="w-4 h-4" />}
              </div>
              <div>
                <div className="font-hud text-xs font-semibold text-white">
                  {action.service} {action.vehicleType || 'Ride'}
                </div>
                <div className="text-[10px] font-mono-tech text-cyan-400/80">
                  {action.title}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-hud text-sm font-bold text-emerald-400">
                {action.estimatedFare}
              </div>
              <div className="text-[10px] font-mono-tech text-slate-400 flex items-center justify-end gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                ETA: {action.estimatedEta}
              </div>
            </div>
          </div>

          {/* Locations */}
          <div className="space-y-1.5 pt-1 text-[11px] font-sans border-t border-cyan-950/80">
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <div className="truncate flex-1">
                <span className="text-slate-400 font-mono-tech text-[10px]">PICKUP: </span>
                <span className="text-slate-200 font-medium">{action.pickup}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 mt-1 shrink-0 shadow-[0_0_6px_rgba(251,113,133,0.8)]" />
              <div className="truncate flex-1">
                <span className="text-slate-400 font-mono-tech text-[10px]">DESTINATION: </span>
                <span className="text-amber-200 font-medium">{action.destination}</span>
              </div>
            </div>
          </div>

          {/* Driver Preview */}
          {action.driverDetails && (
            <div className="p-2 rounded-lg bg-black/50 border border-cyan-950 flex items-center justify-between text-[10px] font-mono-tech">
              <span className="text-slate-300">
                CAPTAIN: <strong className="text-cyan-300">{action.driverDetails.name}</strong> ({action.driverDetails.vehicleNumber})
              </span>
              <span className="text-amber-400">{action.driverDetails.rating}</span>
            </div>
          )}
        </div>

        {/* Live Audio Listening Prompt Banner */}
        <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isListening ? 'bg-amber-400 text-black animate-ping' : 'bg-amber-500/20 text-amber-300'}`}>
              <Mic className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-hud text-[11px] text-amber-200 font-semibold">
                {isListening ? 'MICROPHONE ACTIVE — AWAITING SIR\'S DIRECTIVE' : 'SPOKEN APPROVAL READY'}
              </div>
              <div className="text-[10px] font-sans text-amber-300/80">
                Say: <strong className="text-emerald-300">"Yes / Confirm / బుక్ చేయి"</strong> or <strong className="text-rose-300">"Cancel / వద్దు"</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onApprove(action)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-hud font-bold shadow-[0_0_12px_rgba(16,185,129,0.5)] transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>APPROVE</span>
            </button>
            <button
              onClick={() => onReject(action)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 text-xs font-hud font-semibold transition"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>CANCEL</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
