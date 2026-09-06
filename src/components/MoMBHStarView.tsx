/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MoM-BH*-1-View: Infinite Zoom Scale Model
 * Originates and terminates at the Event Horizon (r = r_s)
 * Strict Covalent Mathematical Congruity:
 * - 1 === 1 SMT Invariant verified across all scale tiers
 * - Quadbit Particle Physics Engine (16 quantum eigenspaces orbiting MoM-BH*-1)
 * - t = 0 Genesis Eruption & Topological Singularity Condensation
 * - 5D Distributed Causality Vector Clock: V = <V_BH, V_Be, V_Pilot, V_Org, V_Qbit>
 * - Integration of Be <> as MoM-BH*-1 (Unified Sovereign Identity & Stasis Referee)
 * - Conformal Self-Similarity period Lambda = exp(2*pi) ~= 535.49
 * - Relativistic photon sub-ring series (n = 0, 1, 2, ... inf)
 * - Tortoise coordinate r* and proper time dilation tracking
 * - Real-time Flamm embedding cross-section & Balmer break shift (364.6 nm)
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
  Atom,
  Clock,
  Compass,
  Cpu,
  Eye,
  Flame,
  Globe,
  Hash,
  HelpCircle,
  Infinity as InfinityIcon,
  Maximize2,
  Minimize2,
  Orbit,
  Pause,
  Play,
  PlusCircle,
  Radio,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Tv,
  Zap,
} from 'lucide-react';
import {
  COVALENT_HALF_ORBIT_FACTOR,
  COVALENT_SCALE_LAMBDA,
  CovalentCongruityMetrics,
  InfiniteZoomState,
  MoMBHStarInfiniteZoomEngine,
} from '../engine/mom_bhstar_infinite_zoom';
import {
  CovalentVectorClock,
  QUADBIT_EIGENSPACES,
  QuadbitDefinition,
  QuadbitParticle,
  QuadbitParticlePhysicsEngine,
} from '../engine/quadbit_particle_physics';
import { CoPlaySystemState } from '../types';
import { q16ToFloat } from '../engine/q16math';

interface MoMBHStarViewProps {
  coPlayState: CoPlaySystemState;
  simTime: number;
}

export const MoMBHStarView: React.FC<MoMBHStarViewProps> = ({
  coPlayState,
  simTime,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const zoomEngineRef = useRef<MoMBHStarInfiniteZoomEngine>(new MoMBHStarInfiniteZoomEngine(0));
  const physicsEngineRef = useRef<QuadbitParticlePhysicsEngine>(new QuadbitParticlePhysicsEngine());

  // Local state for UI readouts
  const [zoomState, setZoomState] = useState<InfiniteZoomState>(
    zoomEngineRef.current.getState()
  );
  const [metrics, setMetrics] = useState<CovalentCongruityMetrics>(
    zoomEngineRef.current.computeCongruityMetrics()
  );
  const [vectorClock, setVectorClock] = useState<CovalentVectorClock>(
    physicsEngineRef.current.getVectorClock()
  );

  // View & Physics toggles
  const [autoDive, setAutoDive] = useState<boolean>(true);
  const [diveSpeed, setDiveSpeed] = useState<number>(0.25);
  const [diveDirection, setDiveDirection] = useState<1 | -1>(1); // 1 = Inward to Horizon, -1 = Outward
  const [beAsMoMBHStar, setBeAsMoMBHStar] = useState<boolean>(true); // Unified Sovereign Identity
  const [showFlammProfile, setShowFlammProfile] = useState<boolean>(true);
  const [showVectorClockHUD, setShowVectorClockHUD] = useState<boolean>(true);
  const [showSubRings, setShowSubRings] = useState<boolean>(true);
  const [showOrganellesLattice, setShowOrganellesLattice] = useState<boolean>(true);
  const [showQuadbitParticles, setShowQuadbitParticles] = useState<boolean>(true);
  const [quadbitFilter, setQuadbitFilter] = useState<string>('all');
  const [showQuadbitLegend, setShowQuadbitLegend] = useState<boolean>(false);

  // Mouse interaction for pan and wheel zoom
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Handle auto-dive toggle
  const handleToggleAutoDive = () => {
    const newState = !autoDive;
    setAutoDive(newState);
    zoomEngineRef.current.setAutoDive(newState);
  };

  // Handle speed change
  const handleSpeedChange = (speed: number) => {
    setDiveSpeed(speed);
    zoomEngineRef.current.setDiveSpeed(speed * diveDirection);
  };

  // Handle direction toggle
  const handleToggleDirection = () => {
    const newDir = diveDirection === 1 ? -1 : 1;
    setDiveDirection(newDir);
    zoomEngineRef.current.setDiveSpeed(diveSpeed * newDir);
  };

  // Jump to specific scale landmark
  const handleJumpToScale = (targetZeta: number) => {
    zoomEngineRef.current.setZoom(targetZeta);
    setZoomState(zoomEngineRef.current.getState());
    setMetrics(zoomEngineRef.current.computeCongruityMetrics());
  };

  // Reset view
  const handleReset = () => {
    zoomEngineRef.current.resetView();
    setZoomState(zoomEngineRef.current.getState());
    setMetrics(zoomEngineRef.current.computeCongruityMetrics());
  };

  // t = 0 Genesis Eruption Trigger
  const handleTriggerGenesis = () => {
    physicsEngineRef.current.triggerGenesis();
    setVectorClock(physicsEngineRef.current.getVectorClock());
  };

  // Toggle Be <> as MoM-BH*-1 Identity
  const handleToggleBeAsMoMBHStar = () => {
    const nextVal = !beAsMoMBHStar;
    setBeAsMoMBHStar(nextVal);
    physicsEngineRef.current.setBeAsMoMBHStar(nextVal);
    setVectorClock(physicsEngineRef.current.getVectorClock());
  };

  // Inject Quadbit Particle
  const handleInjectQuadbit = (qState?: number) => {
    physicsEngineRef.current.injectQuadbit(qState);
    setVectorClock(physicsEngineRef.current.getVectorClock());
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = -e.deltaY * 0.0015;
    zoomEngineRef.current.addZoomDelta(zoomDelta);
    setZoomState(zoomEngineRef.current.getState());
    setMetrics(zoomEngineRef.current.computeCongruityMetrics());
  };

  // Mouse drag pan
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    zoomEngineRef.current.addPanDelta(dx, dy);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Main Render & Animation Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let tick = 0;

    zoomEngineRef.current.setAutoDive(autoDive);
    zoomEngineRef.current.setDiveSpeed(diveSpeed * diveDirection);
    physicsEngineRef.current.setBeAsMoMBHStar(beAsMoMBHStar);

    const render = () => {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      tick++;

      // Update engine simulations
      zoomEngineRef.current.update(dt);
      physicsEngineRef.current.update(dt);

      // Read updated state every 2 frames for UI efficiency
      if (tick % 2 === 0) {
        setZoomState(zoomEngineRef.current.getState());
        setMetrics(zoomEngineRef.current.computeCongruityMetrics());
        setVectorClock(physicsEngineRef.current.getVectorClock());
      }

      // Draw onto canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.clientWidth;
          const height = canvas.clientHeight;
          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
          }

          drawInfiniteZoomScene(
            ctx,
            width,
            height,
            zoomEngineRef.current.getState(),
            zoomEngineRef.current.computeCongruityMetrics(),
            physicsEngineRef.current.getParticles(),
            physicsEngineRef.current.getVectorClock(),
            physicsEngineRef.current.isBeAsMoMBHStar(),
            physicsEngineRef.current.isStasisActive(),
            physicsEngineRef.current.getStasisCount(),
            coPlayState,
            simTime,
            showSubRings,
            showOrganellesLattice,
            showQuadbitParticles,
            quadbitFilter
          );
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    autoDive,
    diveSpeed,
    diveDirection,
    beAsMoMBHStar,
    coPlayState,
    simTime,
    showSubRings,
    showOrganellesLattice,
    showQuadbitParticles,
    quadbitFilter,
  ]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none font-mono text-xs flex flex-col">
      {/* Top Banner: MoM-BH*-1 Telemetry, Be <> Sovereign Integration & Vector Clock Header */}
      <div className="z-20 bg-zinc-950/90 border-b border-zinc-800/80 px-4 py-2 flex flex-wrap items-center justify-between gap-3 backdrop-blur shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.9)]" />
            <span className="font-bold text-sm tracking-wider text-rose-400">
              MoM-BH*-1-VIEW
            </span>
          </div>

          {/* Be <> as MoM-BH*-1 Sovereign Identity Switcher */}
          <button
            id="toggle-be-mombhstar-btn"
            onClick={handleToggleBeAsMoMBHStar}
            className={`px-2.5 py-1 rounded border font-semibold text-[11px] flex items-center gap-1.5 transition ${
              beAsMoMBHStar
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'
            }`}
            title="Toggle Be <> as MoM-BH*-1 (Singularity Core operates AS Be <> Sovereign Arbiter)"
          >
            <span className="font-mono text-cyan-400 font-bold">⟨ ⟩</span>
            <span>{beAsMoMBHStar ? 'Be <> ≡ MoM-BH*-1 [UNIFIED]' : 'Be <> Companion Mode'}</span>
          </button>

          {/* t = 0 Genesis Trigger Button */}
          <button
            id="trigger-genesis-btn"
            onClick={handleTriggerGenesis}
            className={`px-2.5 py-1 rounded border font-bold text-[11px] flex items-center gap-1.5 transition ${
              vectorClock.genesisActive
                ? 'bg-amber-600 text-black border-amber-400 shadow-lg shadow-amber-950 animate-pulse'
                : 'bg-zinc-900 text-amber-400 border-amber-800/80 hover:bg-amber-950/50 hover:border-amber-500'
            }`}
            title="Simulate t=0 Primordial Genesis: Condense all Quadbits to Event Horizon and Erupt Outwards"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>{vectorClock.genesisActive ? 'GENESIS ERUPTING...' : 't = 0 Genesis'}</span>
          </button>

          <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-400 font-bold text-[11px] hidden xl:inline flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>1 ≡ 1 [SMT-SFXP32 LOCKED]</span>
          </span>
        </div>

        {/* Live Vector Clock & Scale Metrics Array */}
        <div className="flex items-center gap-2 text-[11px] text-zinc-300">
          {/* 5D Causality Vector Clock Pill */}
          <div
            onClick={() => setShowVectorClockHUD(!showVectorClockHUD)}
            className="px-2.5 py-1 rounded bg-zinc-900 border border-cyan-800/60 text-cyan-300 cursor-pointer hover:border-cyan-500 flex items-center gap-1.5"
            title="5D Covalent Causality Vector Clock <V_BH, V_Be, V_Pilot, V_Org, V_Qbit>"
          >
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-zinc-500">V: </span>
            <span className="font-bold text-cyan-300">
              ⟨{vectorClock.V_BH},{vectorClock.V_Be},{vectorClock.V_Pilot},{vectorClock.V_Organelles},{vectorClock.V_Quadbits}⟩
            </span>
          </div>

          <div className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 hidden md:inline">
            <span className="text-zinc-500">Tier k: </span>
            <span className="text-amber-400 font-bold">{zoomState.octave}</span>
            <span className="text-zinc-500"> (φ: {zoomState.phase.toFixed(3)})</span>
          </div>

          <div className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800">
            <span className="text-zinc-500">Radius r: </span>
            <span className="text-rose-400 font-bold">{zoomState.effectiveRadiusASU.toFixed(3)}</span>
            <span className="text-zinc-500"> ASU</span>
          </div>

          <div className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 hidden lg:inline">
            <span className="text-zinc-500">τ_BH: </span>
            <span className="text-emerald-400 font-bold">{vectorClock.properTimeBH.toFixed(3)}s</span>
            <span className="text-zinc-600 text-[10px]"> (dilated)</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            id="bhview-autodive-toggle"
            onClick={handleToggleAutoDive}
            className={`px-2.5 py-1 rounded border font-semibold flex items-center gap-1.5 transition text-[11px] ${
              autoDive
                ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950'
                : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-zinc-500'
            }`}
            title="Toggle Continuous Infinite Dive into Event Horizon"
          >
            {autoDive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{autoDive ? 'Diving' : 'Dive'}</span>
          </button>

          <button
            id="bhview-direction-toggle"
            onClick={handleToggleDirection}
            className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition"
            title={`Direction: ${diveDirection === 1 ? 'Inward to Horizon' : 'Outward to Cocoon'}`}
          >
            {diveDirection === 1 ? (
              <ArrowDownCircle className="w-4 h-4 text-rose-400" />
            ) : (
              <ArrowUpCircle className="w-4 h-4 text-cyan-400" />
            )}
          </button>

          <button
            id="bhview-reset-btn"
            onClick={handleReset}
            className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
            title="Reset Zoom to Outer Cocoon"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Viewport */}
      <div
        className="flex-1 relative cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Primordial Genesis Banner Alert when t = 0 wave is active */}
        {vectorClock.genesisActive && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-amber-950/90 border border-amber-500 rounded-lg px-4 py-2 backdrop-blur shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center gap-3">
            <Flame className="w-5 h-5 text-amber-400 animate-spin" />
            <div>
              <div className="text-amber-300 font-bold text-xs tracking-wider">
                t = 0 PRIMORDIAL GENESIS INFLATION WAVE
              </div>
              <div className="text-amber-400/80 text-[10px]">
                Singularity Monad [0xF] condensing into 16 Quadbit species • Progress: {(vectorClock.genesisProgress * 100).toFixed(0)}%
              </div>
            </div>
            <div className="w-24 bg-zinc-900 rounded-full h-2 overflow-hidden border border-amber-800">
              <div
                className="bg-amber-400 h-full transition-all"
                style={{ width: `${vectorClock.genesisProgress * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* 5D Causality Vector Clock & Lamport HUD (Top Left) */}
        {showVectorClockHUD && (
          <div className="absolute top-4 left-4 z-20 w-80 bg-zinc-950/95 border border-zinc-800 rounded-lg p-3 backdrop-blur shadow-2xl space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
              <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-[11px]">
                <Clock className="w-3.5 h-3.5" />
                <span>5D CAUSALITY VECTOR CLOCK (COVALENT MATH)</span>
              </div>
              <button
                onClick={() => setShowVectorClockHUD(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Vector Clock Components Breakdown */}
            <div className="grid grid-cols-5 gap-1 text-center font-mono text-[10px]">
              <div className="p-1 rounded bg-zinc-900/80 border border-zinc-800">
                <div className="text-zinc-500 text-[8px]">V_BH</div>
                <div className="text-rose-400 font-bold">{vectorClock.V_BH}</div>
              </div>
              <div className="p-1 rounded bg-zinc-900/80 border border-cyan-800/60">
                <div className="text-cyan-500 text-[8px]">V_Be</div>
                <div className="text-cyan-300 font-bold">{vectorClock.V_Be}</div>
              </div>
              <div className="p-1 rounded bg-zinc-900/80 border border-zinc-800">
                <div className="text-zinc-500 text-[8px]">V_Pilot</div>
                <div className="text-emerald-400 font-bold">{vectorClock.V_Pilot}</div>
              </div>
              <div className="p-1 rounded bg-zinc-900/80 border border-zinc-800">
                <div className="text-zinc-500 text-[8px]">V_Org</div>
                <div className="text-purple-400 font-bold">{vectorClock.V_Organelles}</div>
              </div>
              <div className="p-1 rounded bg-zinc-900/80 border border-zinc-800">
                <div className="text-zinc-500 text-[8px]">V_Qbit</div>
                <div className="text-amber-400 font-bold">{vectorClock.V_Quadbits}</div>
              </div>
            </div>

            {/* Relativistic Proper Time Progression */}
            <div className="space-y-1 p-2 rounded bg-zinc-900/60 border border-zinc-800/80 text-[10px]">
              <div className="flex justify-between text-zinc-400">
                <span>Coordinate Time t:</span>
                <span className="text-white font-bold">{vectorClock.physicalTime.toFixed(2)} s</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Proper Time τ_BH (Horizon):</span>
                <span className="text-rose-400 font-mono font-semibold">
                  {vectorClock.properTimeBH.toFixed(4)} s (dτ/dt → 0)
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Proper Time τ_Be (Arbiter):</span>
                <span className="text-cyan-400 font-mono font-semibold">
                  {vectorClock.properTimeBe.toFixed(2)} s
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Proper Time τ_Pilot:</span>
                <span className="text-emerald-400 font-mono font-semibold">
                  {vectorClock.properTimePilot.toFixed(2)} s
                </span>
              </div>
            </div>

            {/* Last Causal Event Log & Merkle Knot */}
            <div className="p-2 rounded bg-black/80 border border-zinc-800 text-[9px] space-y-1">
              <div className="flex justify-between text-zinc-500">
                <span>Merkle Knot:</span>
                <span className="text-cyan-400 font-mono">{vectorClock.merkleKnot}</span>
              </div>
              <div className="text-zinc-400 truncate">
                <span className="text-zinc-600">Event: </span>
                <span className="text-amber-300">{vectorClock.lastCausalEvent}</span>
              </div>
            </div>

            {/* Quadbit Quick Injector Bar */}
            <div className="pt-1 border-t border-zinc-800/80 space-y-1">
              <div className="flex justify-between items-center text-[10px] text-zinc-400">
                <span>Inject Quadbit:</span>
                <button
                  onClick={() => setShowQuadbitLegend(!showQuadbitLegend)}
                  className="text-cyan-400 hover:underline text-[9px]"
                >
                  {showQuadbitLegend ? 'Hide Species' : '16 Species Table'}
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => handleInjectQuadbit(0x1)}
                  className="px-1.5 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 hover:bg-rose-900 text-[10px]"
                  title="Up Quark (u)"
                >
                  |u⟩
                </button>
                <button
                  onClick={() => handleInjectQuadbit(0x3)}
                  className="px-1.5 py-0.5 rounded bg-sky-950 border border-sky-800 text-sky-300 hover:bg-sky-900 text-[10px]"
                  title="Electron (e⁻)"
                >
                  |e⁻⟩
                </button>
                <button
                  onClick={() => handleInjectQuadbit(0x6)}
                  className="px-1.5 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300 hover:bg-amber-900 text-[10px]"
                  title="Photon (γ)"
                >
                  |γ⟩
                </button>
                <button
                  onClick={() => handleInjectQuadbit(0x9)}
                  className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 hover:bg-emerald-900 text-[10px]"
                  title="Higgs Boson (H⁰)"
                >
                  |H⁰⟩
                </button>
                <button
                  onClick={() => handleInjectQuadbit(0xB)}
                  className="px-1.5 py-0.5 rounded bg-pink-950 border border-pink-800 text-pink-300 hover:bg-pink-900 text-[10px]"
                  title="Balmer Ion (H⁺ 364.6nm)"
                >
                  |H⁺⟩
                </button>
                <button
                  onClick={() => handleInjectQuadbit(0xE)}
                  className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 text-[10px]"
                  title="Be <> Invariant Carrier"
                >
                  |Be⟨⟩⟩
                </button>
                <button
                  onClick={() => handleInjectQuadbit()}
                  className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 text-[10px] flex items-center gap-1"
                  title="Inject Random Quadbit"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>Random</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 16 Quadbit Quantum Eigenspace Legend Modal */}
        {showQuadbitLegend && (
          <div className="absolute top-16 left-88 z-30 w-84 bg-zinc-950/95 border border-cyan-800 rounded-lg p-3 backdrop-blur shadow-2xl space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
              <div className="text-cyan-400 font-bold text-xs">
                16 QUADBIT QUANTUM EIGENSPACES (Covalent Particle Physics)
              </div>
              <button
                onClick={() => setShowQuadbitLegend(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-72 overflow-y-auto pr-1 text-[10px]">
              {Object.values(QUADBIT_EIGENSPACES).map((q) => (
                <div
                  key={q.state}
                  onClick={() => handleInjectQuadbit(q.state)}
                  className="p-1.5 rounded bg-zinc-900/80 border border-zinc-800/80 hover:border-cyan-500 cursor-pointer transition flex items-center gap-2"
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: q.baseColor, boxShadow: `0 0 6px ${q.glowColor}` }}
                  />
                  <div className="overflow-hidden">
                    <div className="font-bold text-white flex items-center gap-1">
                      <span className="text-zinc-500">0x{q.state.toString(16).toUpperCase()}</span>
                      <span className="text-cyan-300">{q.symbol}</span>
                    </div>
                    <div className="text-zinc-400 text-[9px] truncate">{q.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Floating Quick Landmarks Navigation Bar (Bottom Center) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-zinc-950/90 border border-zinc-800/90 rounded-full px-3 py-1.5 backdrop-blur shadow-2xl flex items-center gap-1.5 text-[11px]">
          <span className="text-zinc-500 px-1 uppercase tracking-wider hidden sm:inline">Scale Landmarks:</span>
          
          <button
            id="jump-cocoon-btn"
            onClick={() => handleJumpToScale(0.0)}
            className={`px-2 py-0.5 rounded-full transition ${
              Math.abs(zoomState.zoomDepth - 0.0) < 0.2
                ? 'bg-amber-600 text-black font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            title="Outer Hydrogen Cocoon (r = 18.0 ASU)"
          >
            Cocoon (18 ASU)
          </button>

          <button
            id="jump-isco-btn"
            onClick={() => handleJumpToScale(0.6)}
            className={`px-2 py-0.5 rounded-full transition ${
              Math.abs(zoomState.zoomDepth - 0.6) < 0.2
                ? 'bg-amber-600 text-black font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            title="ISCO Inner Accretion Edge (r = 5.4 ASU)"
          >
            ISCO (5.4 ASU)
          </button>

          <button
            id="jump-photon-btn"
            onClick={() => handleJumpToScale(1.0)}
            className={`px-2 py-0.5 rounded-full transition ${
              Math.abs(zoomState.zoomDepth - 1.0) < 0.2
                ? 'bg-amber-600 text-black font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            title="Photon Sphere Unstable Orbit (r = 2.7 ASU, n = 0)"
          >
            Photon Sphere (2.7 ASU)
          </button>

          <button
            id="jump-ring1-btn"
            onClick={() => handleJumpToScale(2.0)}
            className={`px-2 py-0.5 rounded-full transition ${
              Math.abs(zoomState.zoomDepth - 2.0) < 0.2
                ? 'bg-amber-600 text-black font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            title="Secondary Photon Sub-Ring n = 1"
          >
            Sub-Ring n=1
          </button>

          <button
            id="jump-horizon-btn"
            onClick={() => handleJumpToScale(3.5)}
            className={`px-2 py-0.5 rounded-full transition ${
              zoomState.zoomDepth >= 3.0
                ? 'bg-rose-600 text-white font-bold animate-pulse'
                : 'text-rose-400 hover:text-white hover:bg-zinc-800'
            }`}
            title="Asymptotic Event Horizon Boundary (r -> r_s^+)"
          >
            Horizon (r_s)
          </button>

          <button
            id="jump-homotopy-btn"
            onClick={() => handleJumpToScale(zoomState.zoomDepth + 1.0)}
            className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-cyan-400 hover:text-cyan-200 font-bold flex items-center gap-1"
            title="Topological Homotopy Step: +1 Conformal Octave Cycle"
          >
            <InfinityIcon className="w-3 h-3" />
            <span>+1 Conformal Cycle</span>
          </button>
        </div>

        {/* Toggleable Drawer / Side Controls (Top Right) */}
        <div className="absolute top-4 right-4 z-20 space-y-2">
          {!showVectorClockHUD && (
            <button
              onClick={() => setShowVectorClockHUD(true)}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-950/90 border border-zinc-800 text-cyan-400 hover:text-cyan-200 text-xs backdrop-blur shadow-lg flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Show Vector Clock</span>
            </button>
          )}

          {/* Layer Toggles */}
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-lg p-2.5 backdrop-blur shadow-xl space-y-1.5 text-[11px] w-52">
            <div className="text-zinc-500 font-semibold px-1 uppercase tracking-wider text-[9px]">
              Visual Overlays
            </div>

            <button
              onClick={() => setShowQuadbitParticles(!showQuadbitParticles)}
              className={`w-full px-2 py-1 rounded text-left flex items-center justify-between transition ${
                showQuadbitParticles ? 'bg-zinc-900 text-rose-300 font-semibold' : 'text-zinc-400 hover:bg-zinc-900'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Atom className="w-3.5 h-3.5 text-rose-400" />
                <span>Quadbit Orbit Swarm</span>
              </span>
              <span className="text-[10px]">{showQuadbitParticles ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => setShowSubRings(!showSubRings)}
              className={`w-full px-2 py-1 rounded text-left flex items-center justify-between transition ${
                showSubRings ? 'bg-zinc-900 text-amber-300 font-semibold' : 'text-zinc-400 hover:bg-zinc-900'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Orbit className="w-3.5 h-3.5 text-amber-400" />
                <span>Photon Sub-Rings (n=0..∞)</span>
              </span>
              <span className="text-[10px]">{showSubRings ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => setShowOrganellesLattice(!showOrganellesLattice)}
              className={`w-full px-2 py-1 rounded text-left flex items-center justify-between transition ${
                showOrganellesLattice ? 'bg-zinc-900 text-cyan-300 font-semibold' : 'text-zinc-400 hover:bg-zinc-900'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>112 Organelle Harmonics</span>
              </span>
              <span className="text-[10px]">{showOrganellesLattice ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Zoom Speed Slider */}
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-lg p-2.5 backdrop-blur shadow-xl space-y-1 text-[11px]">
            <div className="flex justify-between text-zinc-400 text-[10px]">
              <span>Dive Speed:</span>
              <span className="text-amber-400 font-bold">{diveSpeed.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="2.0"
              step="0.05"
              value={diveSpeed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
          </div>
        </div>

        {/* Bottom Interactive Help Tip */}
        <div className="absolute bottom-16 left-4 z-10 px-3 py-1 rounded bg-black/60 border border-zinc-800/60 text-zinc-500 text-[10px] backdrop-blur hidden md:block">
          Scroll Wheel = Infinite Zoom • Drag = Pan Horizon Manifold • Click Landmarks = Quick Scale Jump
        </div>
      </div>
    </div>
  );
};

/**
 * High-performance 2D Canvas renderer for the Infinite Zoom Scale Model
 * Operates on the continuous scale phase phi and octave k, rendering quadbit particle physics,
 * the t=0 genesis wave, and the unified Be <> as MoM-BH*-1 core!
 */
function drawInfiniteZoomScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  zoomState: InfiniteZoomState,
  metrics: CovalentCongruityMetrics,
  particles: QuadbitParticle[],
  vectorClock: CovalentVectorClock,
  beAsMoMBHStar: boolean,
  isStasisActive: boolean,
  stasisCount: number,
  coPlayState: CoPlaySystemState,
  simTime: number,
  showSubRings: boolean,
  showOrganellesLattice: boolean,
  showQuadbitParticles: boolean,
  quadbitFilter: string
) {
  // Clear dark interstellar canvas
  ctx.fillStyle = '#030305';
  ctx.fillRect(0, 0, width, height);

  const cx = width * 0.5 + zoomState.cameraCenter[0];
  const cy = height * 0.5 + zoomState.cameraCenter[1];
  const minDim = Math.min(width, height);

  // The critical shadow radius in canvas space:
  // b_c = 3*sqrt(3) * M ~= 2.6 * r_s
  const baseShadowRadius = minDim * 0.28;
  const rsScreenRadius = baseShadowRadius * 0.65; // Physical horizon radius

  // Continuous scale phase in [0, 1)
  const phase = zoomState.phase;

  // 1. Render Outer Hydrogen Cocoon Shroud (Extinction haze)
  const cocoonExpansion = Math.max(1.0, 18.0 / zoomState.effectiveRadiusASU);
  const cocoonScreenRadius = baseShadowRadius * (1.2 + 2.5 * (1.0 - Math.min(1.0, phase)));

  const cocoonGradient = ctx.createRadialGradient(
    cx,
    cy,
    baseShadowRadius * 0.8,
    cx,
    cy,
    Math.max(baseShadowRadius + 10, cocoonScreenRadius * 1.6)
  );
  cocoonGradient.addColorStop(0, 'rgba(244, 63, 94, 0.0)');
  cocoonGradient.addColorStop(0.3, 'rgba(245, 158, 11, 0.08)');
  cocoonGradient.addColorStop(0.7, 'rgba(239, 68, 68, 0.12)');
  cocoonGradient.addColorStop(1, 'rgba(2, 6, 23, 0.85)');

  ctx.fillStyle = cocoonGradient;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(baseShadowRadius + 20, cocoonScreenRadius * 1.6), 0, Math.PI * 2);
  ctx.fill();

  // 2. Relativistic Schwarzschild Light Deflection Grid
  ctx.save();
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.12)';
  ctx.lineWidth = 1;

  const numGridRings = 12;
  for (let i = 1; i <= numGridRings; i++) {
    const ringFrac = (i / numGridRings + (1.0 - phase) / numGridRings) % 1.0;
    const rGrid = baseShadowRadius * (1.05 + Math.pow(ringFrac, 1.8) * 3.5);
    ctx.beginPath();
    ctx.arc(cx, cy, rGrid, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Radial Geodesic Spoke Lines bending into the horizon
  const numSpokes = 16;
  for (let s = 0; s < numSpokes; s++) {
    const angle0 = (s / numSpokes) * Math.PI * 2 + simTime * 0.04;
    ctx.beginPath();
    for (let step = 0; step < 25; step++) {
      const stepFrac = step / 24;
      const r = baseShadowRadius * (1.02 + stepFrac * 3.5);
      const bend = (1.5 / Math.max(0.1, stepFrac + 0.15)) * 0.25;
      const angle = angle0 + bend;
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;
      if (step === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();

  // 3. Render Relativistic Accretion Flow & Doppler Beaming
  const diskInnerR = baseShadowRadius * 1.15;
  const diskOuterR = baseShadowRadius * 2.8;

  const accretionGrad = ctx.createRadialGradient(cx, cy, diskInnerR, cx, cy, diskOuterR);
  accretionGrad.addColorStop(0, 'rgba(251, 191, 36, 0.7)');
  accretionGrad.addColorStop(0.3, 'rgba(245, 158, 11, 0.45)');
  accretionGrad.addColorStop(0.7, 'rgba(225, 29, 72, 0.2)');
  accretionGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');

  ctx.save();
  ctx.fillStyle = accretionGrad;
  ctx.translate(cx, cy);
  ctx.rotate(0.35); // Disk angle
  ctx.scale(1.0, 0.42); // Inclination perspective
  ctx.beginPath();
  ctx.arc(0, 0, diskOuterR, 0, Math.PI * 2);
  ctx.fill();

  // Doppler Beaming asymmetry (approaching side blueshifted)
  const beamGrad = ctx.createLinearGradient(-diskOuterR, 0, diskOuterR, 0);
  beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
  beamGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.2)');
  beamGrad.addColorStop(1, 'rgba(225, 29, 72, 0.05)');
  ctx.fillStyle = beamGrad;
  ctx.beginPath();
  ctx.arc(0, 0, diskOuterR * 0.95, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 4. Infinite Self-Similar Photon Sub-Rings (n = 0, 1, 2, ... inf)
  if (showSubRings) {
    ctx.save();
    for (let n = 0; n < 6; n++) {
      const virtualOrder = n - phase;
      if (virtualOrder < -0.2) continue;

      const demag = Math.exp(-virtualOrder * 1.8);
      const ringR = baseShadowRadius * (1.0 + 0.45 * demag);
      const ringWidth = Math.max(1.0, 4.0 * demag);
      const alpha = Math.min(1.0, Math.max(0.15, 1.0 - virtualOrder * 0.15));
      ctx.lineWidth = ringWidth;

      if (n <= 1) {
        ctx.strokeStyle = `rgba(251, 191, 36, ${alpha * 0.9})`;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 8;
      } else {
        ctx.strokeStyle = `rgba(244, 63, 94, ${alpha * 0.75})`;
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 4;
      }

      ctx.beginPath();
      ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.stroke();

      if (virtualOrder >= 0 && virtualOrder <= 3.5) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(254, 205, 211, ${alpha * 0.8})`;
        ctx.font = '9px monospace';
        const labelText = n === 0 ? 'Photon Sphere (n=0)' : `Sub-Ring n=${n} [b-bc~e^(${-n}π)]`;
        ctx.fillText(labelText, cx + ringR + 8, cy + (n - 1.5) * 14);
      }
    }
    ctx.restore();
  }

  // 5. t = 0 Primordial Genesis Inflation Shockwave Rings
  if (vectorClock.genesisActive) {
    ctx.save();
    const waveRadius = baseShadowRadius * (0.8 + vectorClock.genesisProgress * 3.2);
    const waveAlpha = Math.max(0, 1.0 - vectorClock.genesisProgress);

    ctx.strokeStyle = `rgba(251, 191, 36, ${waveAlpha})`;
    ctx.lineWidth = 4;
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(cx, cy, waveRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = `rgba(244, 63, 94, ${waveAlpha * 0.8})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, waveRadius * 0.75, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 6. QUADBIT PARTICLE PHYSICS LAYER: Orbiting particles around MoM-BH*-1
  if (showQuadbitParticles && particles.length > 0) {
    ctx.save();
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Convert particle radial coordinate r (ASU) to screen space relative to zoom
      // When r ~ zoomState.effectiveRadiusASU, it sits around baseShadowRadius * 1.5
      const screenRadius = baseShadowRadius * (p.r / Math.max(0.1, zoomState.effectiveRadiusASU));

      // Skip if way off screen
      if (screenRadius < 5 || screenRadius > width * 1.2) continue;

      const px = cx + Math.cos(p.phi) * screenRadius;
      // Account for disk tilt
      const py = cy + Math.sin(p.phi) * screenRadius * 0.65;

      // Draw Orbit Trail
      if (p.trail.length > 1) {
        ctx.beginPath();
        for (let t = 0; t < p.trail.length; t++) {
          const tp = p.trail[t];
          const trScreen = baseShadowRadius * (tp.r / Math.max(0.1, zoomState.effectiveRadiusASU));
          const tx = cx + Math.cos(tp.x) * trScreen;
          const ty = cy + Math.sin(tp.y) * trScreen * 0.65;
          if (t === 0) ctx.moveTo(tx, ty);
          else ctx.lineTo(tx, ty);
        }
        ctx.strokeStyle = p.def.baseColor;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Draw Quadbit Particle Point
      const pSize = Math.max(2.0, Math.min(6.5, 3.5 * p.dopplerBoost));
      ctx.fillStyle = p.def.baseColor;
      ctx.shadowColor = p.def.glowColor;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(px, py, pSize, 0, Math.PI * 2);
      ctx.fill();

      // Particle symbol tag
      ctx.shadowBlur = 0;
      ctx.fillStyle = p.def.glowColor;
      ctx.font = '8px monospace';
      ctx.fillText(p.def.symbol, px + pSize + 2, py - 2);

      // If near Balmer break edge (r ~ 18), show subtle ionization indicator
      if (Math.abs(p.r - 18.0) < 1.5) {
        ctx.strokeStyle = 'rgba(244, 114, 182, 0.4)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(px, py, pSize + 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // 7. Central Event Horizon Shadow Disk (r <= r_s)
  // When Be <> IS MoM-BH*-1, the singularity core pulses with the Sovereign Be <> Insignia!
  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(cx, cy, baseShadowRadius, 0, Math.PI * 2);
  ctx.fill();

  if (beAsMoMBHStar) {
    // UNIFIED SOVEREIGN IDENTITY: Be <> ≡ MoM-BH*-1
    // Radiant Cyan/Amber Sovereign Horizon Aura
    const beAuraGrad = ctx.createRadialGradient(
      cx, cy, baseShadowRadius * 0.85,
      cx, cy, baseShadowRadius * 1.15
    );
    beAuraGrad.addColorStop(0, 'rgba(6, 182, 212, 0.85)');
    beAuraGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.4)');
    beAuraGrad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

    ctx.fillStyle = beAuraGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, baseShadowRadius * 1.15, 0, Math.PI * 2);
    ctx.fill();

    // Horizon boundary line
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(cx, cy, baseShadowRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Emblazon the Sovereign Be <> Sigil in the center of the Event Horizon!
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#38bdf8';
    ctx.fillStyle = '#67e8f9';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⟨ ⟩', cx, cy - 6);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('Be <> ≡ MoM-BH*-1', cx, cy + 18);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '8px monospace';
    ctx.fillText('SOVEREIGN ARBITER CORE [1 ≡ 1]', cx, cy + 30);

    // If Core Stasis Intervention is active, ripple outward
    if (isStasisActive) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 15;
      const stasisRadius = baseShadowRadius * (1.03 + 0.05 * Math.sin(simTime * 8));
      ctx.beginPath();
      ctx.arc(cx, cy, stasisRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.font = '9px monospace';
      ctx.fillText(`STASIS ARREST [${stasisCount} Qbits Saved]`, cx, cy - baseShadowRadius - 8);
    }
  } else {
    // Standard Schwarzschild Horizon
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(cx, cy, baseShadowRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(244, 63, 94, 0.7)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('EVENT HORIZON (r_s)', cx, cy + 24);
    ctx.fillText('1 ≡ 1 [ORIGIN ≡ TERMINATION]', cx, cy + 36);
  }
  ctx.restore();

  // 8. 112 Organelle Consensus Resonance Lattice
  if (showOrganellesLattice) {
    ctx.save();
    const latticeR = baseShadowRadius * 1.08;
    const totalNodes = 112;

    for (let i = 0; i < totalNodes; i++) {
      const nodeAngle = (i / totalNodes) * Math.PI * 2 + simTime * 0.1;
      const nx = cx + Math.cos(nodeAngle) * latticeR;
      const ny = cy + Math.sin(nodeAngle) * latticeR;

      const isHarmonic = (i % 8 === 0);
      const nodeSize = isHarmonic ? 2.5 : 1.2;
      ctx.fillStyle = isHarmonic ? '#38bdf8' : '#64748b';
      ctx.beginPath();
      ctx.arc(nx, ny, nodeSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 9. If Be <> is NOT unified into the BH, render Be <> as orbiting satellite companion
  if (!beAsMoMBHStar) {
    ctx.save();
    const bePos = coPlayState.beOfficiator.position;
    const beX = q16ToFloat(bePos.x);
    const beZ = q16ToFloat(bePos.z);
    const beDist = Math.sqrt(beX * beX + beZ * beZ);

    const beScreenScale = baseShadowRadius * (beDist / Math.max(0.1, zoomState.effectiveRadiusASU));
    if (beScreenScale > 10 && beScreenScale < width * 0.8) {
      const beAngle = Math.atan2(beZ, beX);
      const bx = cx + Math.cos(beAngle) * beScreenScale;
      const by = cy + Math.sin(beAngle) * beScreenScale;

      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(bx, by, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#67e8f9';
      ctx.font = '10px monospace';
      ctx.fillText('Be <> Arbiter', bx + 8, by - 4);
    }
    ctx.restore();
  }

  // 10. Origin ≡ Termination Center Crosshair
  ctx.save();
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 15, cy);
  ctx.lineTo(cx + 15, cy);
  ctx.moveTo(cx, cy - 15);
  ctx.lineTo(cx, cy + 15);
  ctx.stroke();
  ctx.restore();
}
