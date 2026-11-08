import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Gamepad2,
  Box,
  RotateCcw,
  Sparkles,
  Volume2,
  Shield,
  Trophy,
  Sliders,
  ChevronDown,
  ChevronUp,
  Crosshair,
  Flame,
} from 'lucide-react';

interface ThreeGameSimulatorProps {
  onSpeakText?: (text: string) => void;
}

type SimulatorMode = 'hologram' | 'defense_game';
type FinishPreset = 'stark_gold' | 'cyber_cyan' | 'stealth_carbon';

export const ThreeGameSimulator: React.FC<ThreeGameSimulatorProps> = ({ onSpeakText }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<SimulatorMode>('hologram');
  const [explodedVal, setExplodedVal] = useState<number>(0);
  const [finish, setFinish] = useState<FinishPreset>('stark_gold');
  const [score, setScore] = useState<number>(0);
  const [wave, setWave] = useState<number>(1);
  const [health, setHealth] = useState<number>(100);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isControlsCollapsed, setIsControlsCollapsed] = useState<boolean>(false);

  // References across render loop
  const modeRef = useRef<SimulatorMode>(mode);
  const explodedTargetRef = useRef<number>(explodedVal);
  const finishRef = useRef<FinishPreset>(finish);
  const scoreRef = useRef<number>(score);
  const healthRef = useRef<number>(health);
  const gameOverRef = useRef<boolean>(gameOver);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    explodedTargetRef.current = explodedVal;
  }, [explodedVal]);

  useEffect(() => {
    finishRef.current = finish;
  }, [finish]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    healthRef.current = health;
  }, [health]);

  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  // Procedural Web Audio Sound Generator
  const playSfx = (type: 'laser' | 'explosion' | 'shield_hit' | 'victory') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'laser') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.14);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.14);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'explosion') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.28);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'shield_hit') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      }
    } catch (e) {}
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Software WebGL check as per skill instructions
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.015);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 22);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio Lighting Rig (Key, Fill, Rim)
    const keyLight = new THREE.DirectionalLight(0xfff0dd, 2.8);
    keyLight.position.set(12, 18, 14);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x00f2fe, 1.8);
    fillLight.position.set(-14, -8, -10);
    scene.add(fillLight);

    const hemiLight = new THREE.HemisphereLight(0x06b6d4, 0x030712, 0.9);
    scene.add(hemiLight);

    // ==========================================
    // 1. PROCEDURAL 3D ARC REACTOR (COMPOSITE GROUP)
    // ==========================================
    const reactorGroup = new THREE.Group();
    scene.add(reactorGroup);

    // (A) Central Luminous Core
    const coreGeo = new THREE.SphereGeometry(1.6, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    reactorGroup.add(coreMesh);

    // (B) Inner Glass Containment Sphere
    const glassGeo = new THREE.SphereGeometry(2.3, 32, 32);
    const glassMat = new THREE.MeshPhysicalMaterial({
      roughness: 0.1,
      metalness: 0.1,
      transmission: isSoftwareGl ? 0 : 0.85,
      transparent: true,
      opacity: isSoftwareGl ? 0.4 : 0.9,
      ior: 1.5,
      color: 0x67e8f9,
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    reactorGroup.add(glassMesh);

    // (C) Intermediate Copper Magnetic Ring with 10 Accelerator Coils
    const coilRingGroup = new THREE.Group();
    reactorGroup.add(coilRingGroup);

    const copperMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      metalness: 0.85,
      roughness: 0.25,
    });

    const coilCount = 10;
    const coilRadius = 3.8;
    for (let i = 0; i < coilCount; i++) {
      const angle = (i / coilCount) * Math.PI * 2;
      const coilGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.2, 16);
      const coilMesh = new THREE.Mesh(coilGeo, copperMat);
      coilMesh.position.set(Math.cos(angle) * coilRadius, Math.sin(angle) * coilRadius, 0);
      coilMesh.rotation.z = angle + Math.PI / 2;
      coilRingGroup.add(coilMesh);
    }

    // (D) Outer Heavy Armored Housing Ring
    const outerRingGeo = new THREE.TorusGeometry(5.4, 0.6, 24, 64);
    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.9,
      roughness: 0.2,
    });
    const outerRingMesh = new THREE.Mesh(outerRingGeo, armorMat);
    outerRingMesh.castShadow = !isSoftwareGl;
    reactorGroup.add(outerRingMesh);

    // (E) Particle Ring
    const particleCount = 400;
    const partGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const rad = 2.0 + Math.random() * 4.2;
      positions[i * 3] = Math.cos(angle) * rad;
      positions[i * 3 + 1] = Math.sin(angle) * rad;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    }
    partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const partMat = new THREE.PointsMaterial({
      color: 0x00f2fe,
      size: 0.12,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particleCloud = new THREE.Points(partGeo, partMat);
    reactorGroup.add(particleCloud);

    // ==========================================
    // 2. 3D STARK DEFENSE GAME ENTITIES
    // ==========================================
    const gameGroup = new THREE.Group();
    scene.add(gameGroup);

    interface DroneEntity {
      mesh: THREE.Group;
      velocity: THREE.Vector3;
      alive: boolean;
    }

    const drones: DroneEntity[] = [];
    const lasers: { mesh: THREE.Mesh; velocity: THREE.Vector3; life: number }[] = [];
    const explosions: { mesh: THREE.Points; life: number; maxLife: number }[] = [];

    // Helper to spawn a 3-part composite hostile drone
    const spawnDrone = () => {
      const droneGroup = new THREE.Group();
      // Body
      const dBodyGeo = new THREE.OctahedronGeometry(0.8);
      const dBodyMat = new THREE.MeshStandardMaterial({
        color: 0xe11d48,
        metalness: 0.8,
        roughness: 0.25,
      });
      const dBody = new THREE.Mesh(dBodyGeo, dBodyMat);
      droneGroup.add(dBody);

      // Energy Eye
      const eyeGeo = new THREE.SphereGeometry(0.3, 16, 16);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.z = 0.6;
      droneGroup.add(eye);

      // Wing pylons
      const wingGeo = new THREE.BoxGeometry(2.4, 0.15, 0.5);
      const wingMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.3 });
      const wing = new THREE.Mesh(wingGeo, wingMat);
      droneGroup.add(wing);

      // Spawn at distant perimeter
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.7;
      const dist = 32 + Math.random() * 8;
      droneGroup.position.set(
        Math.cos(theta) * Math.cos(phi) * dist,
        Math.sin(phi) * dist + 2,
        Math.sin(theta) * Math.cos(phi) * dist
      );

      const target = new THREE.Vector3(0, 0, 0);
      const vel = new THREE.Vector3().subVectors(target, droneGroup.position).normalize().multiplyScalar(0.08);

      gameGroup.add(droneGroup);
      drones.push({ mesh: droneGroup, velocity: vel, alive: true });
    };

    // Spawn 3D particle explosion
    const createExplosion = (pos: THREE.Vector3) => {
      const pCount = 50;
      const expGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount; i++) {
        pPos[i * 3] = pos.x + (Math.random() - 0.5) * 0.5;
        pPos[i * 3 + 1] = pos.y + (Math.random() - 0.5) * 0.5;
        pPos[i * 3 + 2] = pos.z + (Math.random() - 0.5) * 0.5;
      }
      expGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const expMat = new THREE.PointsMaterial({
        color: 0xf59e0b,
        size: 0.25,
        blending: THREE.AdditiveBlending,
      });
      const expMesh = new THREE.Points(expGeo, expMat);
      gameGroup.add(expMesh);
      explosions.push({ mesh: expMesh, life: 30, maxLife: 30 });
      playSfx('explosion');
    };

    // User Interaction (Firing Repulsors / Orbiting Camera)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isMouseDown = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let camRotX = 0;
    let camRotY = 0;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isMouseDown = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevMouseX = clientX;
      prevMouseY = clientY;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      if (modeRef.current === 'defense_game' && !gameOverRef.current) {
        // Fire laser toward cursor
        raycaster.setFromCamera(mouse, camera);
        const rayDir = raycaster.ray.direction.clone().normalize();

        const laserGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.0, 8);
        laserGeo.rotateX(Math.PI / 2);
        const laserMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
        const laserMesh = new THREE.Mesh(laserGeo, laserMat);

        laserMesh.position.copy(camera.position).add(rayDir.clone().multiplyScalar(1.5));
        laserMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), rayDir);

        gameGroup.add(laserMesh);
        lasers.push({
          mesh: laserMesh,
          velocity: rayDir.multiplyScalar(0.95),
          life: 90,
        });

        playSfx('laser');
      }
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (isMouseDown && modeRef.current === 'hologram') {
        const deltaX = clientX - prevMouseX;
        const deltaY = clientY - prevMouseY;
        camRotY += deltaX * 0.008;
        camRotX += deltaY * 0.008;
        camRotX = Math.max(-Math.PI * 0.4, Math.min(Math.PI * 0.4, camRotX));
      }
      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const handlePointerUp = () => {
      isMouseDown = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', handlePointerDown);
    domEl.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    domEl.addEventListener('touchstart', handlePointerDown, { passive: true });
    domEl.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    // Spawn initial wave of drones if game mode
    for (let i = 0; i < 5; i++) {
      spawnDrone();
    }

    // Main Clock & Animation Loop
    const clock = new THREE.Clock();
    let frameId = 0;
    let spawnTimer = 0;
    let curExploded = 0;

    const tick = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Update finish presets
      const f = finishRef.current;
      if (f === 'stark_gold') {
        armorMat.color.setHex(0xb91c1c); // Crimson
        copperMat.color.setHex(0xf59e0b); // Gold titanium
      } else if (f === 'cyber_cyan') {
        armorMat.color.setHex(0x0f172a);
        copperMat.color.setHex(0x06b6d4);
      } else if (f === 'stealth_carbon') {
        armorMat.color.setHex(0x111827);
        copperMat.color.setHex(0x475569);
      }

      // Smooth exponential damping for exploded view
      curExploded = THREE.MathUtils.damp(curExploded, explodedTargetRef.current, 6.0, delta);
      coilRingGroup.position.z = curExploded * 2.5;
      outerRingMesh.position.z = -curExploded * 2.8;

      // Rotate components
      reactorGroup.rotation.z = time * 0.15;
      coilRingGroup.rotation.z = -time * 0.4;
      particleCloud.rotation.z = time * 0.6;

      // Update camera orbit in hologram mode
      if (modeRef.current === 'hologram') {
        const radius = 22;
        camera.position.x = Math.sin(camRotY) * Math.cos(camRotX) * radius;
        camera.position.y = Math.sin(camRotX) * radius + 4;
        camera.position.z = Math.cos(camRotY) * Math.cos(camRotX) * radius;
        camera.lookAt(0, 0, 0);
      }

      // Game Mode Updates
      if (modeRef.current === 'defense_game' && !gameOverRef.current) {
        spawnTimer += delta;
        if (spawnTimer > 2.2) {
          spawnTimer = 0;
          spawnDrone();
        }

        // Move Drones
        drones.forEach((drone) => {
          if (!drone.alive) return;
          drone.mesh.position.add(drone.velocity);
          drone.mesh.rotation.y += 0.03;
          drone.mesh.rotation.z += 0.02;

          // Check if drone hit reactor core
          if (drone.mesh.position.length() < 5.8) {
            drone.alive = false;
            gameGroup.remove(drone.mesh);
            createExplosion(drone.mesh.position);
            playSfx('shield_hit');
            setHealth((prev) => {
              const next = Math.max(0, prev - 15);
              if (next <= 0) {
                setGameOver(true);
              }
              return next;
            });
          }
        });

        // Move Lasers & Collision Detection
        for (let l = lasers.length - 1; l >= 0; l--) {
          const laser = lasers[l];
          laser.mesh.position.add(laser.velocity);
          laser.life -= 1;

          // Check collision against all alive drones
          for (let d = 0; d < drones.length; d++) {
            const drone = drones[d];
            if (!drone.alive) continue;
            if (laser.mesh.position.distanceTo(drone.mesh.position) < 2.2) {
              drone.alive = false;
              gameGroup.remove(drone.mesh);
              createExplosion(drone.mesh.position);
              setScore((s) => s + 100);
              laser.life = 0;
              break;
            }
          }

          if (laser.life <= 0) {
            gameGroup.remove(laser.mesh);
            lasers.splice(l, 1);
          }
        }

        // Update Explosions
        for (let e = explosions.length - 1; e >= 0; e--) {
          const exp = explosions[e];
          exp.life -= 1;
          exp.mesh.scale.multiplyScalar(1.04);
          if (exp.life <= 0) {
            gameGroup.remove(exp.mesh);
            explosions.splice(e, 1);
          }
        }
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousedown', handlePointerDown);
      domEl.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      domEl.removeEventListener('touchstart', handlePointerDown);
      domEl.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      if (domEl.parentNode) {
        domEl.parentNode.removeChild(domEl);
      }
      renderer.dispose();
    };
  }, []);

  const handleRestartGame = () => {
    setHealth(100);
    setScore(0);
    setWave(1);
    setGameOver(false);
  };

  return (
    <div className="flex-1 flex flex-col relative w-full h-full min-h-[540px] rounded-2xl border border-cyan-500/40 bg-[#02050f] overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.25)]">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 cursor-crosshair" />

      {/* Top HUD Header Banner */}
      <div className="absolute top-3 inset-x-3 z-10 flex items-center justify-between p-3 rounded-xl bg-black/75 border border-cyan-900/80 backdrop-blur-md pointer-events-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
            {mode === 'hologram' ? <Box className="w-4 h-4" /> : <Gamepad2 className="w-4 h-4 text-emerald-400" />}
          </div>
          <div>
            <h3 className="font-hud text-xs sm:text-sm font-bold tracking-wider text-cyan-200">
              {mode === 'hologram'
                ? 'ARC REACTOR MARK VII 3D HOLOGRAPHIC BLUEPRINT'
                : 'STARK REPULSOR TARGET DEFENSE 3D SIMULATOR'}
            </h3>
            <p className="text-[10px] font-mono-tech text-cyan-400/80">
              {mode === 'hologram'
                ? 'ORBIT CONTROLS ACTIVE // DRAG TO ROTATE, WHEEL TO ZOOM'
                : 'TAP / CLICK TARGET TO FIRE PHOTON REPULSORS // DEFEND THE CORE'}
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-950 border border-cyan-950">
          <button
            onClick={() => {
              setMode('hologram');
              if (onSpeakText) onSpeakText('Arc Reactor 3D holographic analysis activated, Sir.');
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-hud transition ${
              mode === 'hologram'
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            3D HOLOGRAM
          </button>
          <button
            onClick={() => {
              setMode('defense_game');
              handleRestartGame();
              if (onSpeakText) onSpeakText('Defense matrix online, Sir! Hostile drones inbound. Repulsors armed.');
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-hud transition ${
              mode === 'defense_game'
                ? 'bg-emerald-500 text-black font-bold shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            DEFENSE GAME
          </button>
        </div>
      </div>

      {/* Game Mode HUD Stats Overlay */}
      {mode === 'defense_game' && (
        <div className="absolute top-20 left-4 z-10 flex flex-col gap-2 font-mono-tech text-xs pointer-events-none">
          <div className="p-3 rounded-xl bg-black/80 border border-cyan-900/80 backdrop-blur-md space-y-1.5">
            <div className="flex items-center justify-between gap-4 text-emerald-400 font-bold">
              <span className="flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" /> SCORE:
              </span>
              <span className="text-white text-sm">{score}</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-300">
                <span>CORE INTEGRITY</span>
                <span className={health > 30 ? 'text-cyan-300' : 'text-rose-400 font-bold'}>
                  {health}%
                </span>
              </div>
              <div className="w-40 h-2 bg-slate-900 rounded-full overflow-hidden border border-cyan-950">
                <div
                  className={`h-full transition-all duration-300 ${
                    health > 50 ? 'bg-emerald-400' : health > 25 ? 'bg-amber-400' : 'bg-rose-500 animate-pulse'
                  }`}
                  style={{ width: `${health}%` }}
                />
              </div>
            </div>
          </div>

          {gameOver && (
            <div className="p-4 rounded-xl bg-rose-950/90 border border-rose-500 text-center space-y-2 pointer-events-auto">
              <div className="font-hud text-sm font-bold text-rose-300">CORE BREACH // GAME OVER</div>
              <p className="text-[11px] text-slate-200">Final Defense Score: {score}</p>
              <button
                onClick={handleRestartGame}
                className="w-full py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-black font-hud text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> RE-ENGAGE CORE
              </button>
            </div>
          )}
        </div>
      )}

      {/* Unified Bottom Control Dock (Zero Viewport Occlusion as per Three.js guidelines) */}
      <div className="absolute bottom-4 inset-x-4 z-10 flex justify-center pointer-events-auto">
        <div className="w-full max-w-2xl rounded-2xl border border-cyan-500/50 bg-[#060c18]/90 backdrop-blur-xl p-3 shadow-[0_0_30px_rgba(6,182,212,0.35)] flex flex-col gap-2.5">
          {/* Drawer Toggle Header */}
          <div className="flex items-center justify-between text-[10px] font-mono-tech text-cyan-400/80 border-b border-cyan-950 pb-1.5">
            <span className="flex items-center gap-1 font-hud uppercase tracking-wider text-cyan-300">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              {mode === 'hologram' ? '3D SCHEMATIC CONTROLS' : 'DEFENSE SENSORY MATRIX'}
            </span>
            <button
              onClick={() => setIsControlsCollapsed((p) => !p)}
              className="flex items-center gap-1 hover:text-white transition"
            >
              <span>{isControlsCollapsed ? 'EXPAND CONTROLS' : 'COLLAPSE'}</span>
              {isControlsCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Collapsible Body */}
          {!isControlsCollapsed && (
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-sans">
              {mode === 'hologram' ? (
                <>
                  {/* Exploded View Slider */}
                  <div className="flex-1 min-w-[200px] space-y-1">
                    <div className="flex justify-between text-[10px] font-mono-tech text-slate-300">
                      <span>EXPLODED VIEW DISASSEMBLY</span>
                      <span className="text-cyan-300 font-bold">{Math.round(explodedVal * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={explodedVal}
                      onChange={(e) => setExplodedVal(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-900 rounded-lg"
                    />
                  </div>

                  {/* Material Finish Swatches */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono-tech text-slate-400 mr-1">ALLOY:</span>
                    {[
                      { id: 'stark_gold', label: 'STARK CRIMSON/GOLD' },
                      { id: 'cyber_cyan', label: 'CYBER CYAN' },
                      { id: 'stealth_carbon', label: 'STEALTH CARBON' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setFinish(f.id as FinishPreset)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono-tech transition border ${
                          finish === f.id
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold'
                            : 'border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between w-full text-slate-300 text-xs">
                  <span className="flex items-center gap-1.5 font-mono-tech text-[11px]">
                    <Crosshair className="w-4 h-4 text-emerald-400 animate-spin [animation-duration:10s]" />
                    PHOTON REPULSOR CANNON READY // TAP ANYWHERE ON SCREEN TO SHOOT
                  </span>
                  <button
                    onClick={handleRestartGame}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-xs font-hud transition hover:bg-cyan-500/30"
                  >
                    RESET DEFENSE
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
