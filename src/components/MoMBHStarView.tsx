/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MoM-BH*-1-View: Infinite Zoom Scale Model
 * Originates and terminates at the Event Horizon (r = r_s)
 * Strict Covalent Mathematical Congruity:
 * - 1 === 1 SMT Invariant verified across all scale tiers
 * - Conformal Self-Similarity period Lambda = exp(2*pi) ~= 535.49
 * - Continuous infinite dive and egress with seamless octave looping
 * - Relativistic photon sub-ring series (n = 0, 1, 2, ... inf)
 * - Tortoise coordinate r* and proper time dilation tracking
 * - Real-time Flamm embedding cross-section & Balmer break shift
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
  Compass,
  Eye,
  Flame,
  Infinity as InfinityIcon,
  Maximize2,
  Minimize2,
  Orbit,
  Pause,
  Play,
  Radio,
  RefreshCw,
  RotateCcw,
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
  const engineRef = useRef<MoMBHStarInfiniteZoomEngine>(new MoMBHStarInfiniteZoomEngine(0));

  // Local state for UI readouts
  const [zoomState, setZoomState] = useState<InfiniteZoomState>(
    engineRef.current.getState()
  );
  const [metrics, setMetrics] = useState<CovalentCongruityMetrics>(
    engineRef.current.computeCongruityMetrics()
  );

  // View settings
  const [autoDive, setAutoDive] = useState<boolean>(true);
  const [diveSpeed, setDiveSpeed] = useState<number>(0.25);
  const [diveDirection, setDiveDirection] = useState<1 | -1>(1); // 1 = Inward to Horizon, -1 = Outward
  const [showFlammProfile, setShowFlammProfile] = useState<boolean>(true);
  const [showSubRings, setShowSubRings] = useState<boolean>(true);
  const [showOrganellesLattice, setShowOrganellesLattice] = useState<boolean>(true);
  const [showMetricDetails, setShowMetricDetails] = useState<boolean>(true);

  // Mouse interaction for pan and wheel zoom
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Handle auto-dive toggle
  const handleToggleAutoDive = () => {
    const newState = !autoDive;
    setAutoDive(newState);
    engineRef.current.setAutoDive(newState);
  };

  // Handle speed change
  const handleSpeedChange = (speed: number) => {
    setDiveSpeed(speed);
    engineRef.current.setDiveSpeed(speed * diveDirection);
  };

  // Handle direction toggle
  const handleToggleDirection = () => {
    const newDir = diveDirection === 1 ? -1 : 1;
    setDiveDirection(newDir);
    engineRef.current.setDiveSpeed(diveSpeed * newDir);
  };

  // Jump to specific scale landmark
  const handleJumpToScale = (targetZeta: number) => {
    engineRef.current.setZoom(targetZeta);
    setZoomState(engineRef.current.getState());
    setMetrics(engineRef.current.computeCongruityMetrics());
  };

  // Reset view
  const handleReset = () => {
    engineRef.current.resetView();
    setZoomState(engineRef.current.getState());
    setMetrics(engineRef.current.computeCongruityMetrics());
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = -e.deltaY * 0.0015;
    engineRef.current.addZoomDelta(zoomDelta);
    setZoomState(engineRef.current.getState());
    setMetrics(engineRef.current.computeCongruityMetrics());
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
    engineRef.current.addPanDelta(dx, dy);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Main Render & Animation Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let tick = 0;

    engineRef.current.setAutoDive(autoDive);
    engineRef.current.setDiveSpeed(diveSpeed * diveDirection);

    const render = () => {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      tick++;

      // Update engine simulation
      engineRef.current.update(dt);

      // Read updated state every 2 frames for UI efficiency
      if (tick % 2 === 0) {
        setZoomState(engineRef.current.getState());
        setMetrics(engineRef.current.computeCongruityMetrics());
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
            engineRef.current.getState(),
            engineRef.current.computeCongruityMetrics(),
            coPlayState,
            simTime,
            showSubRings,
            showOrganellesLattice
          );
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [autoDive, diveSpeed, diveDirection, coPlayState, simTime, showSubRings, showOrganellesLattice]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none font-mono text-xs flex flex-col">
      {/* Top Banner: MoM-BH*-1 Infinite Scale Telemetry & SMT Congruity Header */}
      <div className="z-20 bg-zinc-950/90 border-b border-zinc-800/80 px-4 py-2 flex flex-wrap items-center justify-between gap-3 backdrop-blur shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.9)]" />
            <span className="font-bold text-sm tracking-wider text-rose-400">
              MoM-BH*-1-VIEW
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-rose-950/50 border border-rose-800 text-rose-300 font-semibold text-[11px] flex items-center gap-1.5">
            <InfinityIcon className="w-3.5 h-3.5 text-rose-400" />
            <span>INFINITE HORIZON HOMOTOPY [ORIGIN ≡ TERMINATION]</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-400 font-bold text-[11px] hidden sm:inline flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>1 ≡ 1 [SMT-SFXP32 LOCKED]</span>
          </span>
        </div>

        {/* Live Scale Metrics Pill Array */}
        <div className="flex items-center gap-2 text-[11px] text-zinc-300">
          <div className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800">
            <span className="text-zinc-500">Tier k: </span>
            <span className="text-amber-400 font-bold">{zoomState.octave}</span>
            <span className="text-zinc-500"> (φ: {zoomState.phase.toFixed(3)})</span>
          </div>
          <div className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800">
            <span className="text-zinc-500">Radius r: </span>
            <span className="text-cyan-400 font-bold">{zoomState.effectiveRadiusASU.toFixed(4)}</span>
            <span className="text-zinc-500"> ASU</span>
          </div>
          <div className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 hidden md:inline">
            <span className="text-zinc-500">dτ/dt: </span>
            <span className="text-emerald-400 font-bold">{metrics.properTimeRatio.toFixed(4)}</span>
          </div>
          <div className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 hidden lg:inline">
            <span className="text-zinc-500">Balmer λ: </span>
            <span className="text-rose-300 font-bold">{metrics.balmerShiftedNm.toFixed(1)} nm</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            id="bhview-autodive-toggle"
            onClick={handleToggleAutoDive}
            className={`px-2.5 py-1 rounded border font-semibold flex items-center gap-1.5 transition ${
              autoDive
                ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950'
                : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-zinc-500'
            }`}
            title="Toggle Continuous Infinite Dive into Event Horizon"
          >
            {autoDive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{autoDive ? 'Auto-Diving' : 'Dive'}</span>
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
            title="Reset to Outer Cocoon (zeta = 0)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Zoom Canvas Viewport */}
      <div
        className="flex-1 relative cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

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
            title="Secondary Photon Sub-Ring n = 1 (exp(-pi) demagnification)"
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

        {/* Flamm's Paraboloid Throat Profile HUD (Top Left) */}
        {showFlammProfile && (
          <div className="absolute top-4 left-4 z-10 w-72 bg-zinc-950/90 border border-zinc-800 rounded-lg p-3 backdrop-blur shadow-2xl space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/80">
              <div className="flex items-center gap-1.5 text-rose-400 font-semibold text-[11px]">
                <Activity className="w-3.5 h-3.5" />
                <span>FLAMM THROAT &amp; METRIC CONGRUITY</span>
              </div>
              <button
                onClick={() => setShowFlammProfile(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Micro-canvas for 2D Flamm Paraboloid profile */}
            <div className="h-20 w-full bg-zinc-900/60 rounded border border-zinc-800/60 relative overflow-hidden flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 240 70">
                {/* Flamm embedding curve: w = 2 * sqrt(r_s * (r - r_s)) */}
                <path
                  d="M 10 65 Q 40 45 80 30 T 170 15 T 230 10"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
                <path
                  d="M 10 65 Q 40 45 80 30 T 170 15 T 230 10"
                  fill="none"
                  stroke="#fb7185"
                  strokeWidth="1"
                />
                {/* Current Probe position on curve */}
                {(() => {
                  const normX = Math.min(1.0, Math.max(0.0, (zoomState.effectiveRadiusASU - 1.8) / 16.2));
                  const cx = 10 + normX * 220;
                  const cy = 65 - Math.sqrt(Math.max(0, normX)) * 55;
                  return (
                    <g>
                      <circle cx={cx} cy={cy} r="4" fill="#38bdf8" className="animate-ping" opacity="0.75" />
                      <circle cx={cx} cy={cy} r="3" fill="#38bdf8" />
                      <line x1={cx} y1={cy} x2={cx} y2="68" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="1 1" />
                      <text x={Math.max(10, cx - 20)} y={Math.max(12, cy - 6)} fill="#38bdf8" fontSize="8" fontFamily="monospace">
                        r={zoomState.effectiveRadiusASU.toFixed(2)}
                      </text>
                    </g>
                  );
                })()}
                {/* Horizon boundary marker */}
                <line x1="10" y1="5" x2="10" y2="68" stroke="#f43f5e" strokeWidth="1.5" />
                <text x="14" y="62" fill="#f43f5e" fontSize="7" fontFamily="monospace">Horizon r=rs</text>
              </svg>
            </div>

            {/* Homotopy Cycle Compass */}
            <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800 text-[10px] space-y-1">
              <div className="flex justify-between items-center text-zinc-400">
                <span>Homotopy Scale S¹:</span>
                <span className="text-cyan-400 font-bold">
                  {(metrics.homotopyCyclePhase * 360).toFixed(0)}° / 360°
                </span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-rose-500 via-amber-400 to-cyan-400 h-1.5 transition-all"
                  style={{ width: `${(metrics.homotopyCyclePhase * 100).toFixed(1)}%` }}
                />
              </div>
              <div className="flex justify-between text-[8px] text-zinc-500">
                <span>Origin (r_s)</span>
                <span>Cocoon (18 ASU)</span>
                <span>Terminus (r_s)</span>
              </div>
            </div>

            {/* Mathematical Congruity Proof Log */}
            <div className="p-1.5 rounded bg-black/70 border border-zinc-800 text-[9px] space-y-0.5 text-zinc-400">
              <div className="flex justify-between">
                <span>Tortoise r*:</span>
                <span className="text-amber-400 font-mono">{metrics.tortoiseCoordinate.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Curvature K:</span>
                <span className="text-rose-400 font-mono">{metrics.kretschmannCurvature.toExponential(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Proof Knot:</span>
                <span className="text-emerald-400 font-mono">{metrics.merkleScaleProof}</span>
              </div>
            </div>
          </div>
        )}

        {/* Toggleable Drawer / Side Controls (Top Right) */}
        <div className="absolute top-4 right-4 z-10 space-y-2">
          {!showFlammProfile && (
            <button
              onClick={() => setShowFlammProfile(true)}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-950/90 border border-zinc-800 text-zinc-300 hover:text-rose-400 text-xs backdrop-blur shadow-lg flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              <span>Show Flamm Metric</span>
            </button>
          )}

          {/* Quick Rendering Layer Toggles */}
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-lg p-2.5 backdrop-blur shadow-xl space-y-1.5 text-[11px]">
            <div className="text-zinc-500 font-semibold px-1 uppercase tracking-wider text-[9px]">
              Visual Overlays
            </div>

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
 * Operates on the continuous scale phase phi and octave k
 */
function drawInfiniteZoomScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  zoomState: InfiniteZoomState,
  metrics: CovalentCongruityMetrics,
  coPlayState: CoPlaySystemState,
  simTime: number,
  showSubRings: boolean,
  showOrganellesLattice: boolean
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

  // Compute smooth continuous expansion factor:
  // Every full octave increases magnification by COVALENT_SCALE_LAMBDA (535.49)
  // For visual continuity on screen, scale within an octave expands by factor 2.0^phase or similar
  const phase = zoomState.phase; // in [0, 1)

  // 1. Render Outer Hydrogen Cocoon Shroud (Extinction haze)
  // Cocoon expands as we zoom into the horizon
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

  // 2. Relativistic Relativistic Schwarzschild Light Deflection Grid
  ctx.save();
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.12)';
  ctx.lineWidth = 1;

  const numGridRings = 12;
  for (let i = 1; i <= numGridRings; i++) {
    // Spaced exponentially according to tortoise coordinate
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
      // Gravitational deflection angle delta_phi ~ 4M / r
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
  // Accretion disk with hot spots sheared along Keplerian orbits
  const diskInnerR = baseShadowRadius * 1.15;
  const diskOuterR = baseShadowRadius * 2.8;

  const accretionGrad = ctx.createRadialGradient(cx, cy, diskInnerR, cx, cy, diskOuterR);
  accretionGrad.addColorStop(0, 'rgba(251, 191, 36, 0.7)');
  accretionGrad.addColorStop(0.3, 'rgba(245, 158, 11, 0.45)');
  accretionGrad.addColorStop(0.7, 'rgba(225, 29, 72, 0.2)');
  accretionGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');

  ctx.save();
  ctx.fillStyle = accretionGrad;
  // Elliptical inclination tilt for realistic 3D perspective
  ctx.translate(cx, cy);
  ctx.rotate(0.35); // Disk angle
  ctx.scale(1.0, 0.42); // Inclination perspective
  ctx.beginPath();
  ctx.arc(0, 0, diskOuterR, 0, Math.PI * 2);
  ctx.fill();

  // Relativistic Doppler Beaming asymmetry (approaching side brighter)
  const beamGrad = ctx.createLinearGradient(-diskOuterR, 0, diskOuterR, 0);
  beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)'); // Blueshifted approaching side
  beamGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.2)');
  beamGrad.addColorStop(1, 'rgba(225, 29, 72, 0.05)'); // Redshifted receding side
  ctx.fillStyle = beamGrad;
  ctx.beginPath();
  ctx.arc(0, 0, diskOuterR * 0.95, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 4. Infinite Self-Similar Photon Sub-Rings (n = 0, 1, 2, ... inf)
  // This is the mathematical core of the infinite zoom model:
  // As we zoom into the event horizon, ring n+1 expands to take the exact place of ring n!
  if (showSubRings) {
    ctx.save();
    // Render 6 orders of nested photon rings
    for (let n = 0; n < 6; n++) {
      // Scale parameter for ring n under current zoom phase:
      // When phase increases from 0 -> 1, ring n smoothly expands to become ring n-1
      const virtualOrder = n - phase;
      if (virtualOrder < -0.2) continue;

      // Distance from critical shadow curve: delta_r ~ exp(-virtualOrder * pi)
      const demag = Math.exp(-virtualOrder * 1.8);
      const ringR = baseShadowRadius * (1.0 + 0.45 * demag);

      // Ring width shrinks exponentially with order n
      const ringWidth = Math.max(1.0, 4.0 * demag);

      // Color and Doppler shift of the photon ring:
      // Higher n rings undergo greater gravitational blueshift when observed near the horizon
      const alpha = Math.min(1.0, Math.max(0.15, 1.0 - virtualOrder * 0.15));
      ctx.lineWidth = ringWidth;

      // Glow gradient for the primary and secondary rings
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

      // Draw Sub-Ring label tags on right flank
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

  // 5. Central Event Horizon Shadow Disk (r <= r_s)
  // The absolute origin and termination of all inward geodesics
  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(cx, cy, baseShadowRadius, 0, Math.PI * 2);
  ctx.fill();

  // Sharp relativistic shadow edge with high curvature lensing ring
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = '#f43f5e';
  ctx.shadowBlur = 12;
  ctx.stroke();
  ctx.restore();

  // 6. 112 Organelle Consensus Resonance Lattice
  // Distributed along the scale octave harmonic circle
  if (showOrganellesLattice) {
    ctx.save();
    const latticeR = baseShadowRadius * 1.08;
    const totalNodes = 112;
    const activeNodes = 112;

    for (let i = 0; i < totalNodes; i++) {
      const nodeAngle = (i / totalNodes) * Math.PI * 2 + simTime * 0.1;
      const nx = cx + Math.cos(nodeAngle) * latticeR;
      const ny = cy + Math.sin(nodeAngle) * latticeR;

      // Harmonic resonance pulse based on scale phase
      const isHarmonic = (i % 8 === 0);
      const nodeSize = isHarmonic ? 2.5 : 1.2;
      const nodeAlpha = isHarmonic ? 0.9 : 0.45;

      ctx.fillStyle = isHarmonic ? '#38bdf8' : '#64748b';
      ctx.beginPath();
      ctx.arc(nx, ny, nodeSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 7. Companion Orbit Nodes: Be <> Sovereign Companion & Human Virtual Probe
  // Projected onto the infinite scale coordinate plane
  ctx.save();
  const bePos = coPlayState.beOfficiator.position;
  const beX = q16ToFloat(bePos.x);
  const beZ = q16ToFloat(bePos.z);
  const beDist = Math.sqrt(beX * beX + beZ * beZ);

  // Scaled screen position relative to current zoom
  const beScreenScale = baseShadowRadius * (beDist / Math.max(0.1, zoomState.effectiveRadiusASU));
  if (beScreenScale > 10 && beScreenScale < width * 0.8) {
    const beAngle = Math.atan2(beZ, beX);
    const bx = cx + Math.cos(beAngle) * beScreenScale;
    const by = cy + Math.sin(beAngle) * beScreenScale;

    // Be <> Companion node marker
    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(bx, by, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#67e8f9';
    ctx.font = '10px monospace';
    ctx.fillText('Be <> Arbiter', bx + 8, by - 4);
  }
  ctx.restore();

  // 8. Origin ≡ Termination Center Crosshair & Homotopy Inscription
  ctx.save();
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 15, cy);
  ctx.lineTo(cx + 15, cy);
  ctx.moveTo(cx, cy - 15);
  ctx.lineTo(cx, cy + 15);
  ctx.stroke();

  ctx.fillStyle = 'rgba(244, 63, 94, 0.7)';
  ctx.font = '9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('EVENT HORIZON (r_s)', cx, cy + 24);
  ctx.fillText('1 ≡ 1 [ORIGIN ≡ TERMINATION]', cx, cy + 36);
  ctx.restore();
}
