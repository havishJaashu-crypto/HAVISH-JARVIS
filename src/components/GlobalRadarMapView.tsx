import React, { useState, useEffect, useRef } from 'react';
import {
  Navigation,
  Compass,
  MapPin,
  Bike,
  Car,
  Search,
  Shield,
  Clock,
  Layers,
  Crosshair,
  Volume2,
  ExternalLink,
} from 'lucide-react';
import { ActionApprovalRequest } from '../types';

interface GlobalRadarMapViewProps {
  onSpeakText?: (text: string) => void;
  onRequestBooking?: (service: 'Rapido' | 'Uber', vehicle: 'Bike' | 'Auto' | 'Cab', destination: string) => void;
  currentAction?: ActionApprovalRequest | null;
}

export const GlobalRadarMapView: React.FC<GlobalRadarMapViewProps> = ({
  onSpeakText,
  onRequestBooking,
  currentAction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState('Cyber Towers, Hitech City');
  const [mapMode, setMapMode] = useState<'radar' | 'satellite' | 'route'>('route');
  const [rideProgress, setRideProgress] = useState(0.35); // 0.0 to 1.0 along the route
  const [radarAngle, setRadarAngle] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const places = [
    { name: 'Cyber Towers, Hitech City', lat: 17.4485, lng: 78.3742, distance: '3.2 km', eta: '3 mins', fare: '₹75' },
    { name: 'Financial District, Gachibowli', lat: 17.4156, lng: 78.3427, distance: '6.8 km', eta: '8 mins', fare: '₹110' },
    { name: 'Inorbit Mall, Madhapur', lat: 17.4344, lng: 78.3867, distance: '2.4 km', eta: '3 mins', fare: '₹60' },
    { name: 'Banjara Hills Road No. 1', lat: 17.4162, lng: 78.4418, distance: '9.5 km', eta: '14 mins', fare: '₹140' },
    { name: 'Rajiv Gandhi Int. Airport (RGIA)', lat: 17.2403, lng: 78.4294, distance: '32.0 km', eta: '38 mins', fare: '₹420' },
  ];

  // Active target place
  const activeTarget = places.find((p) => p.name === selectedPlace) || places[0];

  // Animated sweep and ride progression
  useEffect(() => {
    let animId: number;
    const animate = () => {
      setRadarAngle((prev) => (prev + 1.5) % 360);
      setRideProgress((prev) => (prev >= 0.98 ? 0.05 : prev + 0.0008));
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Draw holographic tactical radar map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    // Background
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Concentric range circles
    const maxRadius = Math.min(width, height) * 0.44;
    ctx.lineWidth = 1;
    for (let r = 50; r <= maxRadius; r += 50) {
      ctx.strokeStyle = r === 150 ? 'rgba(6, 182, 212, 0.3)' : 'rgba(6, 182, 212, 0.12)';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Range text
      ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.font = '9px monospace';
      ctx.fillText(`${(r / 25).toFixed(1)} km`, cx + 6, cy - r + 10);
    }

    // Crosshairs
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
    ctx.beginPath();
    ctx.moveTo(cx, 20);
    ctx.lineTo(cx, height - 20);
    ctx.moveTo(20, cy);
    ctx.lineTo(width - 20, cy);
    ctx.stroke();

    // Radar rotating sweep beam
    const rad = (radarAngle * Math.PI) / 180;
    const sweepGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius);
    sweepGradient.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
    sweepGradient.addColorStop(1, 'rgba(6, 182, 212, 0)');

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, maxRadius, rad - 0.4, rad);
    ctx.closePath();
    ctx.fillStyle = sweepGradient;
    ctx.fill();

    // Sweep leading line
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(rad) * maxRadius, cy + Math.sin(rad) * maxRadius);
    ctx.stroke();
    ctx.restore();

    // Route Path (Curved Bézier from Sir's GPS to Target)
    const targetX = cx + 130;
    const targetY = cy - 90;
    const cpX = cx + 50;
    const cpY = cy + 40;

    // Route shadow / glow
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(cpX, cpY, targetX, targetY);
    ctx.stroke();

    // Route dashed track
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(cpX, cpY, targetX, targetY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Pickup Point (Sir's Position)
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#34d399';
    ctx.font = '10px monospace';
    ctx.fillText("SIR's GPS LOCKED (HYDERABAD)", cx + 18, cy + 4);

    // Destination Marker
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(targetX, targetY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
    ctx.beginPath();
    ctx.arc(targetX, targetY, 15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#fb7185';
    ctx.font = '10px monospace';
    ctx.fillText(activeTarget.name.toUpperCase(), targetX + 16, targetY + 4);

    // Live Moving Vehicle Marker (Rapido / Uber Captain)
    const t = rideProgress;
    // Quadratic bezier point: B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
    const vx = Math.pow(1 - t, 2) * cx + 2 * (1 - t) * t * cpX + Math.pow(t, 2) * targetX;
    const vy = Math.pow(1 - t, 2) * cy + 2 * (1 - t) * t * cpY + Math.pow(t, 2) * targetY;

    // Vehicle icon pulse
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(vx, vy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fef3c7';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('⚡ RAPIDO CAPTAIN (38 KM/H)', vx + 12, vy - 6);
    ctx.fillStyle = 'rgba(251, 191, 36, 0.8)';
    ctx.fillText(`ETA: ${activeTarget.eta} | FARE: ${activeTarget.fare}`, vx + 12, vy + 6);
  }, [radarAngle, rideProgress, activeTarget]);

  const handleLaunchRideDirective = (service: 'Rapido' | 'Uber') => {
    if (onRequestBooking) {
      onRequestBooking(service, 'Bike', activeTarget.name);
    }
    if (onSpeakText) {
      onSpeakText(`Sir, I have marked ${activeTarget.name} on the tactical GPS radar. Preparing a ${service} Bike dispatch request.`);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-4 text-slate-100 animate-in fade-in duration-200">
      {/* Top Telemetry Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-cyan-500/40 bg-[#060c18]/90 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
            <Compass className="w-4 h-4 animate-spin [animation-duration:8s]" />
          </div>
          <div>
            <h2 className="font-hud text-sm font-bold tracking-wider text-white flex items-center gap-2">
              TACTICAL GPS RADAR & RIDE NAVIGATION MESH
              <span className="px-1.5 py-0.2 rounded border border-emerald-500/40 text-emerald-400 bg-emerald-950/40 text-[9px] font-mono-tech">
                LIVE TELEMETRY
              </span>
            </h2>
            <p className="text-[10px] font-mono-tech text-cyan-400/80">
              ORBITAL SENSORS: 17.4485° N, 78.3742° E // HYDERABAD CYBER TOWERS MESH
            </p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-black/60 border border-cyan-950">
          {(['route', 'radar', 'satellite'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMapMode(m)}
              className={`px-3 py-1 rounded text-xs font-hud uppercase tracking-wider transition ${
                mapMode === m
                  ? 'bg-cyan-500 text-black font-bold shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left: Interactive Canvas Radar View (3 Cols) */}
        <div className="lg:col-span-3 rounded-2xl border border-cyan-500/40 bg-[#030712] p-2 relative overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.2)] flex flex-col justify-center items-center min-h-[440px]">
          <canvas
            ref={canvasRef}
            width={760}
            height={460}
            className="w-full h-full object-contain rounded-xl max-h-[480px]"
          />

          {/* Floating HUD Badges inside Radar View */}
          <div className="absolute top-4 left-4 bg-black/80 border border-cyan-900 rounded-xl p-2.5 backdrop-blur-md space-y-1 font-mono-tech text-[10px] text-slate-300">
            <div className="text-cyan-300 font-bold flex items-center gap-1">
              <Crosshair className="w-3 h-3 text-cyan-400" />
              SATELLITE FIX: DUAL GALILEO/IRNSS
            </div>
            <div>LAT: 17.44854° N | LNG: 78.37421° E</div>
            <div>ALTITUDE: 536m MSL | ACCURACY: ±0.8m</div>
          </div>

          <div className="absolute top-4 right-4 bg-black/80 border border-amber-500/40 rounded-xl p-2.5 backdrop-blur-md space-y-1 font-mono-tech text-[10px] text-amber-300">
            <div className="font-bold flex items-center gap-1">
              <Bike className="w-3.5 h-3.5 text-amber-400" />
              RAPIDO CAPTAIN IN MOTION
            </div>
            <div>SPEED: 38 km/h | VEHICLE: TVS APACHE</div>
            <div>DISPATCH STATUS: EN ROUTE TO DESTINATION</div>
          </div>
        </div>

        {/* Right Sidebar: Place Selector & Autonomous Booking Controls */}
        <div className="space-y-4">
          {/* Quick Location Targets */}
          <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-[#060c18] space-y-2.5">
            <div className="font-hud text-xs font-semibold text-cyan-300 flex items-center justify-between">
              <span>DESIGNATED DESTINATIONS</span>
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {places.map((place) => (
                <button
                  key={place.name}
                  onClick={() => setSelectedPlace(place.name)}
                  className={`w-full p-2 rounded-lg text-left text-xs transition border ${
                    selectedPlace === place.name
                      ? 'border-cyan-400 bg-cyan-500/20 text-white shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-cyan-900 hover:text-cyan-200'
                  }`}
                >
                  <div className="font-semibold truncate">{place.name}</div>
                  <div className="flex items-center justify-between text-[10px] font-mono-tech text-slate-400 mt-0.5">
                    <span>{place.distance} • ETA {place.eta}</span>
                    <span className="text-emerald-400 font-bold">{place.fare}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Autonomous Booking Buttons */}
          <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/20 space-y-3">
            <div className="font-hud text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-400" />
              RAPID RIDE DISPATCH (SIR'S VOICE / 1-TAP)
            </div>

            <p className="text-[11px] text-slate-300">
              Target: <strong className="text-white">{activeTarget.name}</strong> ({activeTarget.distance}, {activeTarget.eta})
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleLaunchRideDirective('Rapido')}
                className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-hud text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
              >
                <Bike className="w-4 h-4" />
                <span>BOOK RAPIDO</span>
              </button>
              <button
                onClick={() => handleLaunchRideDirective('Uber')}
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/50 text-cyan-200 font-hud text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Car className="w-4 h-4 text-cyan-400" />
                <span>BOOK UBER</span>
              </button>
            </div>

            <div className="text-[10px] font-mono-tech text-amber-400/80 text-center">
              Voice Trigger: Say <span className="text-white">"Jarvis, book a bike from Rapido"</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
