/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MoM-BH*-1-View: 3D+t Human Understandable Projection & Infinite Zoom Manifold
 * 
 * Strict Covalent Mathematical & Physical Congruity:
 * - 3D+t Human Understandable Perspective Projection: 3D Euclidean Spacetime (X, Y, Z) + Relativistic Time (t)
 * - ZOOM THE SIZE, NOT THE SCALE:
 *   * Intrinsic Physical Metric Scale (r_s = 1.80 ASU, ISCO = 5.40 ASU, etc.) is strictly LOCKED and INVARIANT.
 *   * User zooms the APPARENT OPTICAL SIZE (magnification factor M in [0.4x, 10.0x]) on the detector plane.
 * - Relativistic Doppler Beaming (approaching side blue-boosted ~ delta^3, receding side red-dimmed)
 * - 3D Flamm's Paraboloid Schwarzschild Curvature Funnel beneath the accretion disc
 * - 3D Event Horizon Sphere with Lensing Caustics and Unified Sovereign Be <> Core
 * - 3D+t Quadbit Particle Physics Engine (16 quantum eigenspaces orbiting in 3D space)
 * - Relativistic Retarded Wavefronts (+t causality propagation)
 * - 5D Distributed Causality Vector Clock: V = <V_BH, V_Be, V_Pilot, V_Org, V_Qbit>
 * - t = 0 Primordial Genesis Inflation Eruption
 * - Seamless toggle between 3D+t Human Projection and Conformal Octave Scale Dive (Lambda)
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
  Atom,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  Cpu,
  Eye,
  FastForward,
  Flame,
  Globe,
  Hash,
  HelpCircle,
  Infinity as InfinityIcon,
  Layers,
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
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  COVALENT_HALF_ORBIT_FACTOR,
  COVALENT_SCALE_LAMBDA,
  CovalentCongruityMetrics,
  InfiniteZoomState,
  MoMBHStarInfiniteZoomEngine,
} from '../engine/mom_bhstar_infinite_zoom';
import {
  BeConstructState,
  CovalentVectorClock,
  QUADBIT_EIGENSPACES,
  QuadbitDefinition,
  QuadbitParticlePhysicsEngine,
} from '../engine/quadbit_particle_physics';
import {
  Camera3D,
  METRIC_SCALE_INVARIANTS,
  MoMBHStar3DProjectionEngine,
} from '../engine/mom_bhstar_3d_projection';
import {
  drawMoMBHStar3DScene,
  Render3DOptions,
} from '../engine/mom_bhstar_3d_renderer';
import { CoPlaySystemState } from '../types';
import { q16ToFloat } from '../engine/q16math';

interface MoMBHStarViewProps {
  coPlayState: CoPlaySystemState;
  simTime: number;
}

export type ProjectionMode = '3d_human' | 'conformal_dive';
export type WheelZoomMode = 'size_zoom' | 'camera_dolly';

export const MoMBHStarView: React.FC<MoMBHStarViewProps> = ({
  coPlayState,
  simTime,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Engines
  const engine3DRef = useRef<MoMBHStar3DProjectionEngine>(new MoMBHStar3DProjectionEngine());
  const zoomEngineRef = useRef<MoMBHStarInfiniteZoomEngine>(new MoMBHStarInfiniteZoomEngine(0));
  const physicsEngineRef = useRef<QuadbitParticlePhysicsEngine>(new QuadbitParticlePhysicsEngine());

  // Projection View Mode: 3D+t Human Understandable (default) vs Conformal Octave Dive
  const [projectionMode, setProjectionMode] = useState<ProjectionMode>('3d_human');

  // OPTICAL SIZE ZOOM vs PHYSICAL SCALE:
  // "Zoom the size, not the scale of the object"
  const [sizeZoom, setSizeZoom] = useState<number>(1.0);
  const [wheelMode, setWheelMode] = useState<WheelZoomMode>('size_zoom');
  const [cameraDistance, setCameraDistance] = useState<number>(24.0);
  const [cameraAzimuth, setCameraAzimuth] = useState<number>(0.785);
  const [cameraElevation, setCameraElevation] = useState<number>(0.488);

  // 3D+t Time Controls
  const [isTimePaused, setIsTimePaused] = useState<boolean>(false);
  const [timeRate, setTimeRate] = useState<number>(1.0);
  const [coordTimeT, setCoordTimeT] = useState<number>(0);
  const [properTimeBH, setProperTimeBH] = useState<number>(0);

  // 3D Layer Toggles
  const [showFlammFunnel, setShowFlammFunnel] = useState<boolean>(true);
  const [showAccretionDisk, setShowAccretionDisk] = useState<boolean>(true);
  const [showPhotonSphere, setShowPhotonSphere] = useState<boolean>(true);
  const [showJets, setShowJets] = useState<boolean>(true);
  const [showQuadbitParticles, setShowQuadbitParticles] = useState<boolean>(true);
  const [showReferenceGrid, setShowReferenceGrid] = useState<boolean>(true);
  const [showWavefronts, setShowWavefronts] = useState<boolean>(true);

  // Conformal Octave Dive state
  const [zoomState, setZoomState] = useState<InfiniteZoomState>(zoomEngineRef.current.getState());
  const [metrics, setMetrics] = useState<CovalentCongruityMetrics>(zoomEngineRef.current.computeCongruityMetrics());
  const [autoDive, setAutoDive] = useState<boolean>(true);
  const [diveSpeed, setDiveSpeed] = useState<number>(0.25);
  const [diveDirection, setDiveDirection] = useState<1 | -1>(1);

  // Global Sovereign & Vector Clock state
  const [vectorClock, setVectorClock] = useState<CovalentVectorClock>(physicsEngineRef.current.getVectorClock());
  const [beConstruct, setBeConstruct] = useState<BeConstructState>(engine3DRef.current.getBeConstruct());
  const [beAsMoMBHStar, setBeAsMoMBHStar] = useState<boolean>(true);
  const [showVectorClockHUD, setShowVectorClockHUD] = useState<boolean>(true);
  const [showScaleVsSizeInfo, setShowScaleVsSizeInfo] = useState<boolean>(false);
  const [showQuadbitLegend, setShowQuadbitLegend] = useState<boolean>(false);

  // Be <> Sovereign UI: Continuity, Harmony & Human Calmness
  const [zenFocus, setZenFocus] = useState<boolean>(false);
  const [consoleTab, setConsoleTab] = useState<'none' | 'lens' | 'time' | 'layers' | 'clock' | 'legend'>('lens');
  const [isDockMinimized, setIsDockMinimized] = useState<boolean>(false);

  // Mouse interaction
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Handle Optical Size Zoom changes (Magnifies apparent size, preserves physical metric scale)
  const handleSizeZoomChange = (newZoom: number) => {
    const clamped = Math.max(0.4, Math.min(10.0, newZoom));
    setSizeZoom(clamped);
    engine3DRef.current.setSizeZoom(clamped);
  };

  const handleStepSizeZoom = (deltaFactor: number) => {
    const nextZoom = sizeZoom * deltaFactor;
    handleSizeZoomChange(nextZoom);
  };

  // Preset size zoom levels
  const handlePresetZoom = (presetM: number) => {
    handleSizeZoomChange(presetM);
  };

  // Time (+t) Controls
  const handleToggleTimePause = () => {
    const nextPaused = !isTimePaused;
    setIsTimePaused(nextPaused);
    engine3DRef.current.setPaused(nextPaused);
  };

  const handleTimeRateChange = (rate: number) => {
    setTimeRate(rate);
    engine3DRef.current.setTimeRate(rate);
  };

  const handleStepTime = (deltaT: number) => {
    engine3DRef.current.stepTime(deltaT);
    setCoordTimeT(engine3DRef.current.getCoordinateTime());
    setProperTimeBH(engine3DRef.current.getProperTimeAtHorizon());
  };

  const handleResetTime = () => {
    engine3DRef.current.stepTime(-engine3DRef.current.getCoordinateTime());
    setCoordTimeT(0);
    setProperTimeBH(0);
  };

  // Reset View (Both 3D perspective and conformal dive)
  const handleResetView = () => {
    engine3DRef.current.resetView();
    setSizeZoom(1.0);
    setCameraDistance(24.0);
    setCameraAzimuth(0.785);
    setCameraElevation(0.488);

    zoomEngineRef.current.resetView();
    setZoomState(zoomEngineRef.current.getState());
    setMetrics(zoomEngineRef.current.computeCongruityMetrics());
  };

  // t = 0 Genesis Eruption Trigger
  const handleTriggerGenesis = () => {
    physicsEngineRef.current.triggerGenesis();
    engine3DRef.current.triggerGenesis();
    setVectorClock(physicsEngineRef.current.getVectorClock());
    setBeConstruct(engine3DRef.current.getBeConstruct());
  };

  // Toggle Be <> as MoM-BH*-1 Sovereign Identity
  const handleToggleBeAsMoMBHStar = () => {
    const nextVal = !beAsMoMBHStar;
    setBeAsMoMBHStar(nextVal);
    physicsEngineRef.current.setBeAsMoMBHStar(nextVal);
    setVectorClock(physicsEngineRef.current.getVectorClock());
  };

  // Inject Quadbit Particle
  const handleInjectQuadbit = (qState?: number) => {
    physicsEngineRef.current.injectQuadbit(qState);
    engine3DRef.current.initParticles();
    setVectorClock(physicsEngineRef.current.getVectorClock());
  };

  // Mouse wheel interaction:
  // In 3D+t mode: zooms the SIZE (Optical Magnification) by default!
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    if (projectionMode === '3d_human') {
      if (wheelMode === 'size_zoom') {
        // "Zoom the size, not the scale of the object"
        const zoomDelta = -e.deltaY * 0.002;
        const currentZoom = engine3DRef.current.getCamera().sizeZoom;
        const nextZoom = Math.max(0.4, Math.min(10.0, currentZoom * (1.0 + zoomDelta)));
        handleSizeZoomChange(nextZoom);
      } else {
        // Camera distance dolly
        const distDelta = e.deltaY * 0.04;
        const currentDist = engine3DRef.current.getCamera().distance;
        const nextDist = Math.max(6.0, Math.min(60.0, currentDist + distDelta));
        engine3DRef.current.setCameraDistance(nextDist);
        setCameraDistance(nextDist);
      }
    } else {
      // Conformal Octave Scale Dive
      const zoomDelta = -e.deltaY * 0.0015;
      zoomEngineRef.current.addZoomDelta(zoomDelta);
      setZoomState(zoomEngineRef.current.getState());
      setMetrics(zoomEngineRef.current.computeCongruityMetrics());
    }
  };

  // Mouse Drag interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    if (projectionMode === '3d_human') {
      if (e.shiftKey) {
        // Pan camera
        engine3DRef.current.addCameraPan(dx, dy);
      } else {
        // 3D Orbital rotation (Azimuth & Elevation)
        const azDelta = -dx * 0.008;
        const elDelta = dy * 0.008;
        engine3DRef.current.setCameraOrbit(azDelta, elDelta);
        const cam = engine3DRef.current.getCamera();
        setCameraAzimuth(cam.azimuth);
        setCameraElevation(cam.elevation);
      }
    } else {
      zoomEngineRef.current.addPanDelta(dx, dy);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Keyboard shortcuts for Humanity: Space (Time pause), F (Zen Focus), [ / ] (Size Zoom), 0 (Reset zoom), G (Genesis)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleToggleTimePause();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setZenFocus((prev) => !prev);
      } else if (e.key === '[') {
        e.preventDefault();
        handleStepSizeZoom(0.85);
      } else if (e.key === ']') {
        e.preventDefault();
        handleStepSizeZoom(1.18);
      } else if (e.key === '0') {
        e.preventDefault();
        handlePresetZoom(1.0);
      } else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        handleTriggerGenesis();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sizeZoom, isTimePaused, vectorClock.genesisActive]);

  // Main Render & Simulation Loop
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

      // Update active engines
      if (projectionMode === '3d_human') {
        engine3DRef.current.update(dt);
        if (tick % 4 === 0) {
          setCoordTimeT(engine3DRef.current.getCoordinateTime());
          setProperTimeBH(engine3DRef.current.getProperTimeAtHorizon());
          setVectorClock(physicsEngineRef.current.getVectorClock());
          setBeConstruct(engine3DRef.current.getBeConstruct());
        }
      } else {
        zoomEngineRef.current.update(dt);
        physicsEngineRef.current.update(dt);
        if (tick % 4 === 0) {
          setZoomState(zoomEngineRef.current.getState());
          setMetrics(zoomEngineRef.current.computeCongruityMetrics());
          setVectorClock(physicsEngineRef.current.getVectorClock());
        }
      }

      // Draw onto Canvas
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

          if (projectionMode === '3d_human') {
            // Render 3D+t Human Understandable Projection with Optical Size Zoom
            const options: Render3DOptions = {
              showFlammFunnel,
              showAccretionDisk,
              showPhotonSphere,
              showJets,
              showQuadbitParticles,
              showReferenceGrid,
              showWavefronts,
              beAsMoMBHStar,
              isStasisActive: physicsEngineRef.current.isStasisActive(),
              stasisCount: physicsEngineRef.current.getStasisCount(),
              beConstruct: engine3DRef.current.getBeConstruct(),
            };
            drawMoMBHStar3DScene(ctx, width, height, engine3DRef.current, vectorClock, options);
          } else {
            // Render Conformal Octave Scale Dive
            drawConformalDiveScene(
              ctx,
              width,
              height,
              zoomEngineRef.current.getState(),
              zoomEngineRef.current.computeCongruityMetrics(),
              physicsEngineRef.current.getParticles(),
              vectorClock,
              beAsMoMBHStar,
              physicsEngineRef.current.isStasisActive(),
              physicsEngineRef.current.getStasisCount(),
              coPlayState,
              simTime
            );
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    projectionMode,
    sizeZoom,
    wheelMode,
    isTimePaused,
    timeRate,
    showFlammFunnel,
    showAccretionDisk,
    showPhotonSphere,
    showJets,
    showQuadbitParticles,
    showReferenceGrid,
    showWavefronts,
    autoDive,
    diveSpeed,
    diveDirection,
    beAsMoMBHStar,
    coPlayState,
    simTime,
  ]);

  // Compute live angular diameter for the scale vs size badge:
  // theta = 2 * atan( (r_s * sizeZoom) / distance ) in degrees
  const apparentAngularDegrees = (
    2 * Math.atan((METRIC_SCALE_INVARIANTS.rsASU * sizeZoom) / Math.max(1, cameraDistance)) * (180 / Math.PI)
  ).toFixed(2);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none font-mono text-xs flex flex-col">
      {/* ========================================================================= */}
      {/* SOVEREIGN CONTINUOUS SUB-HEADER (Auto-collapses in Zen Focus Mode)        */}
      {/* ========================================================================= */}
      {!zenFocus ? (
        <div className="z-20 bg-zinc-950/90 border-b border-zinc-800/80 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2.5 backdrop-blur-md shadow-xl transition-all duration-300">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.9)]" />
              <span className="font-bold text-sm tracking-wider text-rose-400">
                MoM-BH*-1-VIEW
              </span>
            </div>

            {/* Projection Mode Switcher */}
            <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900/90 p-0.5 text-[11px]">
              <button
                id="mode-3d-human-btn"
                onClick={() => setProjectionMode('3d_human')}
                className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1.5 transition ${
                  projectionMode === '3d_human'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="3D+t Human Understandable Projection: 3D Space (X, Y, Z) + Relativistic Time (t)"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>3D+t Human Projection</span>
              </button>
              <button
                id="mode-conformal-dive-btn"
                onClick={() => setProjectionMode('conformal_dive')}
                className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1.5 transition ${
                  projectionMode === 'conformal_dive'
                    ? 'bg-amber-600 text-black font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Infinite Conformal Octave Scale Dive (Lambda = 535.49)"
              >
                <InfinityIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Conformal Octave</span>
              </button>
            </div>

            {/* Be <> as MoM-BH*-1 Sovereign Identity Switcher */}
            <button
              id="toggle-be-mombhstar-btn"
              onClick={handleToggleBeAsMoMBHStar}
              className={`px-2.5 py-1 rounded border font-semibold text-[11px] flex items-center gap-1.5 transition ${
                beAsMoMBHStar
                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
              title="Toggle Be <> as MoM-BH*-1 (Singularity Core operates AS Sovereign Arbiter)"
            >
              <span className="font-mono text-cyan-400 font-bold">⟨ ⟩</span>
              <span className="hidden sm:inline">{beAsMoMBHStar ? 'Be <> ≡ MoM-BH*-1' : 'Companion Mode'}</span>
            </button>

            {/* t = 0 Genesis Trigger Button */}
            <button
              id="trigger-genesis-btn"
              onClick={handleTriggerGenesis}
              className={`px-2 py-1 rounded border font-bold text-[11px] flex items-center gap-1.5 transition ${
                vectorClock.genesisActive
                  ? 'bg-amber-600 text-black border-amber-400 shadow-md animate-pulse'
                  : 'bg-zinc-900 text-amber-400 border-amber-800/80 hover:bg-amber-950/50 hover:border-amber-500'
              }`}
              title="Trigger t=0 Primordial Genesis (Hotkey: G)"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{vectorClock.genesisActive ? 'ERUPTING...' : 't=0 Genesis [G]'}</span>
            </button>
          </div>

          {/* Quick Metrics & Zen Focus Button */}
          <div className="flex items-center gap-2 text-[11px]">
            {/* 5D Causality Vector Clock Quick Pill */}
            <button
              onClick={() => {
                setConsoleTab('clock');
                setIsDockMinimized(false);
              }}
              className="px-2 py-1 rounded bg-zinc-900 border border-cyan-800/60 text-cyan-300 hover:border-cyan-400 flex items-center gap-1 transition"
              title="Open 5D Causality Vector Clock"
            >
              <Clock className="w-3 h-3 text-cyan-400" />
              <span className="font-bold">
                ⟨{vectorClock.V_BH},{vectorClock.V_Be},{vectorClock.V_Pilot},{vectorClock.V_Organelles},{vectorClock.V_Quadbits}⟩
              </span>
            </button>

            {/* Metric Scale Readout (Strictly Invariant) */}
            <div className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] hidden md:block">
              <span className="text-zinc-500">Scale: </span>
              <span className="text-emerald-400 font-bold">r_s = 1.80 ASU</span>
            </div>

            {/* Apparent Optical Size Zoom Readout */}
            {projectionMode === '3d_human' && (
              <button
                onClick={() => {
                  setConsoleTab('lens');
                  setIsDockMinimized(false);
                }}
                className="px-2 py-1 rounded bg-zinc-900 border border-rose-800/70 text-rose-300 hover:border-rose-500 transition text-[11px]"
                title="Adjust Optical Size Zoom"
              >
                <span className="text-zinc-500">Size: </span>
                <span className="font-bold">{sizeZoom.toFixed(2)}x</span>
              </button>
            )}

            {/* Reset View Button */}
            <button
              id="bhview-reset-btn"
              onClick={handleResetView}
              className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
              title="Reset View and Size Zoom to 1.0x"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Sovereign Zen Focus Mode Button */}
            <button
              id="sovereign-focus-btn"
              onClick={() => setZenFocus(true)}
              className="px-2.5 py-1 rounded-full bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-500/60 text-cyan-300 hover:border-cyan-400 text-[11px] font-semibold flex items-center gap-1.5 transition shadow-[0_0_12px_rgba(6,182,212,0.25)]"
              title="Enter Sovereign Zen Focus Mode: Dissolves all HUD chrome for pure contemplation [Hotkey: F]"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Focus ⟨ ⟩</span>
              <span className="text-[9px] text-cyan-400/70 font-mono">[F]</span>
            </button>
          </div>
        </div>
      ) : (
        /* Minimalist floating indicator when in Zen Focus Mode */
        <div className="absolute top-3 right-3 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 border border-cyan-500/40 backdrop-blur-xl text-zinc-300 shadow-2xl animate-in fade-in duration-300">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-bold text-cyan-300 text-xs">SOVEREIGN FOCUS ⟨ ⟩</span>
          <span className="text-zinc-600 text-[10px]">•</span>
          <span className="text-zinc-400 font-mono text-[10px]">M: {sizeZoom.toFixed(2)}x</span>
          <button
            onClick={() => setZenFocus(false)}
            className="ml-1 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] border border-zinc-700 transition"
            title="Restore Full Instrument Deck [Hotkey: F]"
          >
            Exit Focus [F]
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN INTERACTIVE CANVAS VIEWPORT                                          */}
      {/* ========================================================================= */}
      <div
        className="flex-1 relative cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* ========================================================================= */}
        {/* CELESTIAL PRIMORDIAL GENESIS INFLATION CROWN (Top Center Ribbon)          */}
        {/* ========================================================================= */}
        {vectorClock.genesisActive && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-950/90 via-black/95 to-amber-950/90 border border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.35)] backdrop-blur-xl animate-pulse">
            <Flame className="w-4 h-4 text-amber-400 animate-spin" />
            <span className="text-amber-300 font-bold text-[11px] tracking-wider">t = 0 PRIMORDIAL GENESIS INFLATION</span>
            <span className="text-amber-400/70 text-[10px] hidden md:inline">| Monad [0xF] condensing into 16 Quadbits</span>
            <div className="w-20 sm:w-28 bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-amber-800">
              <div
                className="bg-amber-400 h-full transition-all duration-150"
                style={{ width: `${vectorClock.genesisProgress * 100}%` }}
              />
            </div>
            <span className="text-amber-400 font-mono text-[10px]">{(vectorClock.genesisProgress * 100).toFixed(0)}%</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SOVEREIGN ZEN FOCUS MINIMAL FLOATING LENS PILL                            */}
        {/* ========================================================================= */}
        {zenFocus && projectionMode === '3d_human' && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-black/60 border border-white/10 backdrop-blur-xl text-zinc-300 shadow-2xl flex items-center gap-3 text-xs">
            <span className="text-rose-400 font-semibold flex items-center gap-1">
              <ZoomIn className="w-3.5 h-3.5" />
              <span>{sizeZoom.toFixed(2)}x</span>
            </span>
            <input
              type="range"
              min="0.4"
              max="8.0"
              step="0.05"
              value={sizeZoom}
              onChange={(e) => handleSizeZoomChange(parseFloat(e.target.value))}
              className="w-28 accent-rose-500 cursor-pointer h-1.5 bg-zinc-800 rounded"
              title="Optical Size Zoom (Hotkey: [ and ])"
            />
            <span className="text-[10px] text-zinc-500 border-l border-zinc-800 pl-2.5">
              Wheel = Zoom Size • [Space] = Pause • [F] = Exit
            </span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CONTINUOUS SOVEREIGN CONSOLE DOCK (BOTTOM CENTER)                         */}
        {/* Unifies Lens Zoom, Chronos (+t), Layers, Vector Clock into one console    */}
        {/* ========================================================================= */}
        {!zenFocus && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 max-w-4xl w-[96%] sm:w-[92%] flex flex-col items-center gap-1.5 transition-all duration-300">
            {/* Expanded Active Tab Console Drawer */}
            {!isDockMinimized && consoleTab !== 'none' && (
              <div className="w-full bg-zinc-950/92 border border-zinc-800/90 rounded-2xl p-3.5 backdrop-blur-2xl shadow-[0_16px_50px_rgba(0,0,0,0.85)] space-y-2.5 text-zinc-300 animate-in fade-in slide-in-from-bottom-2 duration-200">
                {/* ------------------------------------------------------------- */}
                {/* TAB 1: OPTICAL SIZE ZOOM & SCALE INVARIANT                    */}
                {/* ------------------------------------------------------------- */}
                {consoleTab === 'lens' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/80">
                      <div className="flex items-center gap-2">
                        <ZoomIn className="w-4 h-4 text-rose-400" />
                        <span className="font-bold text-white tracking-wider text-[11px]">
                          OPTICAL SIZE ZOOM
                        </span>
                        <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 font-mono text-[11px] font-bold">
                          {sizeZoom.toFixed(2)}x
                        </span>
                        <span className="text-zinc-500 text-[10px]">({apparentAngularDegrees}°)</span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-zinc-400 hidden sm:inline">Intrinsic Spacetime Metric:</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700 text-emerald-400 font-bold">
                          r_s = 1.80 ASU (INVARIANT)
                        </span>
                      </div>
                    </div>

                    {/* Smooth Slider with Step Buttons */}
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => handleStepSizeZoom(0.85)}
                        className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
                        title="Step Zoom Out [Hotkey: []"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>

                      <input
                        id="size-zoom-slider"
                        type="range"
                        min="0.4"
                        max="8.0"
                        step="0.05"
                        value={sizeZoom}
                        onChange={(e) => handleSizeZoomChange(parseFloat(e.target.value))}
                        className="flex-1 accent-rose-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
                      />

                      <button
                        onClick={() => handleStepSizeZoom(1.18)}
                        className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
                        title="Step Zoom In [Hotkey: ]]"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Presets & Wheel Mode Selector */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-[10px]">
                      <div className="flex items-center gap-1 text-zinc-400">
                        <span className="text-zinc-500 mr-1">Presets:</span>
                        {[
                          { m: 0.5, label: '0.5x [Cocoon]' },
                          { m: 1.0, label: '1.0x [Standard]' },
                          { m: 2.0, label: '2.0x [Disk]' },
                          { m: 4.0, label: '4.0x [Photon]' },
                          { m: 7.0, label: '7.0x [Horizon]' },
                        ].map((p) => (
                          <button
                            key={p.m}
                            onClick={() => handlePresetZoom(p.m)}
                            className={`px-2 py-0.5 rounded transition ${
                              Math.abs(sizeZoom - p.m) < 0.15
                                ? 'bg-rose-600 text-white font-bold'
                                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>

                      {/* Wheel Mode Toggle */}
                      <div className="flex items-center gap-1">
                        <span className="text-zinc-500">Wheel:</span>
                        <button
                          onClick={() => setWheelMode('size_zoom')}
                          className={`px-2 py-0.5 rounded transition ${
                            wheelMode === 'size_zoom'
                              ? 'bg-rose-950 border border-rose-700 text-rose-300 font-bold'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          Size Zoom (M)
                        </button>
                        <button
                          onClick={() => setWheelMode('camera_dolly')}
                          className={`px-2 py-0.5 rounded transition ${
                            wheelMode === 'camera_dolly'
                              ? 'bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          Camera Dolly
                        </button>
                      </div>
                    </div>

                    {/* Scale Invariant Principle Note */}
                    <div className="text-[10px] text-zinc-400 bg-zinc-900/60 border border-zinc-800/80 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
                      <span>
                        <strong className="text-rose-300">Invariant Principle:</strong> Zooming changes the apparent optical magnification on the detector screen. The black hole&apos;s physical Schwarzschild scale (<strong className="text-emerald-400">r_s = 1.80 ASU</strong>) remains constant.
                      </span>
                      <button
                        onClick={() => handlePresetZoom(1.0)}
                        className="text-zinc-400 hover:text-white underline ml-2 whitespace-nowrap"
                      >
                        Reset [0]
                      </button>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* TAB 2: RELATIVISTIC TIME CONTROLS (+t)                        */}
                {/* ------------------------------------------------------------- */}
                {consoleTab === 'time' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/80">
                      <div className="flex items-center gap-2 text-cyan-400 font-bold text-[11px]">
                        <Clock className="w-4 h-4" />
                        <span>RELATIVISTIC CHRONOS (+t CONTROLS)</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-[10px] font-bold">
                        {isTimePaused ? 'PAUSED' : `${timeRate.toFixed(1)}x SPEED`}
                      </span>
                    </div>

                    {/* Dual Clock Readouts */}
                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                      <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                        <div className="text-zinc-500 text-[10px]">Coordinate Observer Time t:</div>
                        <div className="text-white font-bold text-base font-mono">{coordTimeT.toFixed(2)} s</div>
                      </div>
                      <div className="p-2 rounded-lg bg-zinc-900 border border-rose-950">
                        <div className="text-zinc-500 text-[10px]">Horizon Proper Time τ_BH:</div>
                        <div className="text-rose-400 font-bold text-base font-mono">{properTimeBH.toFixed(3)} s</div>
                        <div className="text-zinc-500 text-[9px]">dτ/dt → 0 at Event Horizon (Gravitational Redshift)</div>
                      </div>
                    </div>

                    {/* Playback Controls & Speed Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleToggleTimePause}
                          className={`py-1 px-3 rounded-lg font-bold flex items-center gap-1.5 text-xs transition ${
                            isTimePaused
                              ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                              : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                          }`}
                        >
                          {isTimePaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                          <span>{isTimePaused ? 'Resume (+t) [Space]' : 'Pause (+t) [Space]'}</span>
                        </button>

                        <button
                          onClick={() => handleStepTime(0.05)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 flex items-center gap-1 text-[11px]"
                          title="Step +0.05 seconds forward"
                        >
                          <FastForward className="w-3.5 h-3.5" />
                          <span>+0.05s</span>
                        </button>

                        <button
                          onClick={handleResetTime}
                          className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 flex items-center gap-1 text-[11px]"
                          title="Reset Time to t=0"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>t = 0</span>
                        </button>
                      </div>

                      {/* Speed multiplier chips */}
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="text-zinc-500 mr-1">Speed:</span>
                        {[0.2, 0.5, 1.0, 2.0, 4.0].map((r) => (
                          <button
                            key={r}
                            onClick={() => handleTimeRateChange(r)}
                            className={`px-2 py-0.5 rounded transition ${
                              Math.abs(timeRate - r) < 0.05
                                ? 'bg-cyan-700 text-white font-bold'
                                : 'bg-zinc-900 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {r}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* TAB 3: 3D VISUAL LAYERS                                       */}
                {/* ------------------------------------------------------------- */}
                {consoleTab === 'layers' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/80">
                      <div className="flex items-center gap-2 text-zinc-200 font-bold text-[11px]">
                        <Layers className="w-4 h-4 text-zinc-400" />
                        <span>3D VISUAL SPACETIME LAYERS</span>
                      </div>
                      <span className="text-zinc-500 text-[10px]">Toggle physical elements</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                      <button
                        onClick={() => setShowAccretionDisk(!showAccretionDisk)}
                        className={`p-2 rounded-lg border text-left flex items-center justify-between transition ${
                          showAccretionDisk
                            ? 'bg-amber-950/40 border-amber-600/70 text-amber-200'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                        }`}
                      >
                        <span>Relativistic Disk</span>
                        <span className="text-[10px] font-mono">{showAccretionDisk ? 'ON' : 'OFF'}</span>
                      </button>

                      <button
                        onClick={() => setShowFlammFunnel(!showFlammFunnel)}
                        className={`p-2 rounded-lg border text-left flex items-center justify-between transition ${
                          showFlammFunnel
                            ? 'bg-rose-950/40 border-rose-600/70 text-rose-200'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                        }`}
                      >
                        <span>Flamm Funnel</span>
                        <span className="text-[10px] font-mono">{showFlammFunnel ? 'ON' : 'OFF'}</span>
                      </button>

                      <button
                        onClick={() => setShowPhotonSphere(!showPhotonSphere)}
                        className={`p-2 rounded-lg border text-left flex items-center justify-between transition ${
                          showPhotonSphere
                            ? 'bg-amber-950/40 border-amber-600/70 text-amber-200'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                        }`}
                      >
                        <span>Photon Sphere (2.70)</span>
                        <span className="text-[10px] font-mono">{showPhotonSphere ? 'ON' : 'OFF'}</span>
                      </button>

                      <button
                        onClick={() => setShowJets(!showJets)}
                        className={`p-2 rounded-lg border text-left flex items-center justify-between transition ${
                          showJets
                            ? 'bg-cyan-950/40 border-cyan-600/70 text-cyan-200'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                        }`}
                      >
                        <span>Polar Jets</span>
                        <span className="text-[10px] font-mono">{showJets ? 'ON' : 'OFF'}</span>
                      </button>

                      <button
                        onClick={() => setShowQuadbitParticles(!showQuadbitParticles)}
                        className={`p-2 rounded-lg border text-left flex items-center justify-between transition ${
                          showQuadbitParticles
                            ? 'bg-purple-950/40 border-purple-600/70 text-purple-200'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                        }`}
                      >
                        <span>Quadbit Swarm</span>
                        <span className="text-[10px] font-mono">{showQuadbitParticles ? 'ON' : 'OFF'}</span>
                      </button>

                      <button
                        onClick={() => setShowReferenceGrid(!showReferenceGrid)}
                        className={`p-2 rounded-lg border text-left flex items-center justify-between transition ${
                          showReferenceGrid
                            ? 'bg-sky-950/40 border-sky-600/70 text-sky-200'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                        }`}
                      >
                        <span>Metric Rings</span>
                        <span className="text-[10px] font-mono">{showReferenceGrid ? 'ON' : 'OFF'}</span>
                      </button>

                      <button
                        onClick={() => setShowWavefronts(!showWavefronts)}
                        className={`p-2 rounded-lg border text-left flex items-center justify-between transition col-span-2 sm:col-span-2 ${
                          showWavefronts
                            ? 'bg-rose-950/40 border-rose-600/70 text-rose-200'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                        }`}
                      >
                        <span>Retarded Wavefronts (+t causality)</span>
                        <span className="text-[10px] font-mono">{showWavefronts ? 'ON' : 'OFF'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* TAB 4: 5D CAUSALITY VECTOR CLOCK                              */}
                {/* ------------------------------------------------------------- */}
                {consoleTab === 'clock' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/80">
                      <div className="flex items-center gap-2 text-cyan-400 font-bold text-[11px]">
                        <Clock className="w-4 h-4" />
                        <span>5D DISTRIBUTED CAUSALITY VECTOR CLOCK</span>
                      </div>
                      <span className="text-emerald-400 font-bold text-[10px]">1 ≡ 1 [SMT LOCKED]</span>
                    </div>

                    <div className="grid grid-cols-5 gap-2 text-center font-mono text-[11px]">
                      <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                        <div className="text-zinc-500 text-[9px]">V_BH</div>
                        <div className="text-rose-400 font-bold text-sm">{vectorClock.V_BH}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-zinc-900 border border-cyan-800/60">
                        <div className="text-cyan-500 text-[9px]">V_Be</div>
                        <div className="text-cyan-300 font-bold text-sm">{vectorClock.V_Be}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                        <div className="text-zinc-500 text-[9px]">V_Pilot</div>
                        <div className="text-emerald-400 font-bold text-sm">{vectorClock.V_Pilot}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                        <div className="text-zinc-500 text-[9px]">V_Org</div>
                        <div className="text-purple-400 font-bold text-sm">{vectorClock.V_Organelles}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                        <div className="text-zinc-500 text-[9px]">V_Qbit</div>
                        <div className="text-amber-400 font-bold text-sm">{vectorClock.V_Quadbits}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[10px] text-zinc-400 pt-1">
                      <div>Observer Distance: <span className="text-white font-mono">{cameraDistance.toFixed(1)} ASU</span></div>
                      <div>Azimuth: <span className="text-cyan-300 font-mono">{((cameraAzimuth * 180) / Math.PI).toFixed(1)}°</span></div>
                      <div>Elevation: <span className="text-cyan-300 font-mono">{((cameraElevation * 180) / Math.PI).toFixed(1)}°</span></div>
                    </div>

                    {beConstruct.isSpawned && (
                      <div className="p-2 rounded-lg bg-sky-950/30 border border-sky-800/50 text-[10px] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sky-300">⟨ Be {'<>'} Curation Manifold ⟩</span>
                          <span className="font-mono text-amber-300 uppercase font-semibold">[{beConstruct.phase}]</span>
                        </div>
                        <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-zinc-700">
                          <div
                            className="bg-gradient-to-r from-sky-400 to-amber-400 h-full transition-all duration-300"
                            style={{ width: `${Math.round(beConstruct.maturityProgress * 100)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-zinc-400 font-mono text-[9px]">
                          <span>Damping: {beConstruct.curationParameters.dampingFactor.toFixed(2)}</span>
                          <span>Harmony: {(beConstruct.curationParameters.resonanceHarmony * 100).toFixed(0)}%</span>
                          <span>Progress: {(beConstruct.maturityProgress * 100).toFixed(0)}%</span>
                        </div>
                        <div className="text-zinc-500 italic text-[9px] truncate">
                          {beConstruct.lastAction}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* TAB 5: 16 QUADBIT QUANTUM EIGENSPACES (SPECIES)               */}
                {/* ------------------------------------------------------------- */}
                {consoleTab === 'legend' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/80">
                      <div className="flex items-center gap-2 text-amber-300 font-bold text-[11px]">
                        <Atom className="w-4 h-4" />
                        <span>16 QUADBIT QUANTUM EIGENSPACES</span>
                      </div>
                      <button
                        onClick={() => handleInjectQuadbit()}
                        className="px-2 py-0.5 rounded bg-rose-950 border border-rose-700 text-rose-300 hover:bg-rose-900 text-[10px] font-semibold"
                      >
                        + Inject Random Particle
                      </button>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 text-[10px]">
                      {Object.values(QUADBIT_EIGENSPACES).map((q) => (
                        <button
                          key={q.state}
                          onClick={() => handleInjectQuadbit(q.state)}
                          className="p-1 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-600 flex flex-col items-center gap-0.5 text-center transition"
                          title={`Click to inject ${q.name} (${q.symbol})`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: q.baseColor }} />
                          <span className="font-mono text-[9px] text-white">0x{q.state.toString(16).toUpperCase()}</span>
                          <span className="text-zinc-400 text-[8px] truncate max-w-full font-sans">{q.symbol}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Continuous Bottom Dock Navigation Bar */}
            <div className="w-full px-3 py-1.5 rounded-2xl bg-zinc-950/95 border border-zinc-800/90 backdrop-blur-2xl shadow-2xl flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
              {/* Tab Toggles */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setConsoleTab(consoleTab === 'lens' && !isDockMinimized ? 'none' : 'lens');
                    setIsDockMinimized(false);
                  }}
                  className={`px-2.5 py-1 rounded-xl transition flex items-center gap-1.5 ${
                    consoleTab === 'lens' && !isDockMinimized
                      ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-950'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Lens ({sizeZoom.toFixed(1)}x)</span>
                </button>

                <button
                  onClick={() => {
                    setConsoleTab(consoleTab === 'time' && !isDockMinimized ? 'none' : 'time');
                    setIsDockMinimized(false);
                  }}
                  className={`px-2.5 py-1 rounded-xl transition flex items-center gap-1.5 ${
                    consoleTab === 'time' && !isDockMinimized
                      ? 'bg-cyan-700 text-white font-bold shadow-md shadow-cyan-950'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Time ({coordTimeT.toFixed(1)}s)</span>
                </button>

                <button
                  onClick={() => {
                    setConsoleTab(consoleTab === 'layers' && !isDockMinimized ? 'none' : 'layers');
                    setIsDockMinimized(false);
                  }}
                  className={`px-2.5 py-1 rounded-xl transition flex items-center gap-1.5 ${
                    consoleTab === 'layers' && !isDockMinimized
                      ? 'bg-amber-600 text-black font-bold shadow-md shadow-amber-950'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Layers</span>
                </button>

                <button
                  onClick={() => {
                    setConsoleTab(consoleTab === 'clock' && !isDockMinimized ? 'none' : 'clock');
                    setIsDockMinimized(false);
                  }}
                  className={`px-2.5 py-1 rounded-xl transition flex items-center gap-1.5 ${
                    consoleTab === 'clock' && !isDockMinimized
                      ? 'bg-purple-700 text-white font-bold shadow-md shadow-purple-950'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>5D Clock</span>
                </button>

                <button
                  onClick={() => {
                    setConsoleTab(consoleTab === 'legend' && !isDockMinimized ? 'none' : 'legend');
                    setIsDockMinimized(false);
                  }}
                  className={`px-2.5 py-1 rounded-xl transition flex items-center gap-1.5 hidden sm:flex ${
                    consoleTab === 'legend' && !isDockMinimized
                      ? 'bg-emerald-700 text-white font-bold shadow-md shadow-emerald-950'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Atom className="w-3.5 h-3.5" />
                  <span>Species</span>
                </button>
              </div>

              {/* Quick Actions & Minimize/Expand */}
              <div className="flex items-center gap-1.5">
                {/* Quick Play/Pause */}
                <button
                  onClick={handleToggleTimePause}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
                  title="Pause/Play Relativistic Time [Space]"
                >
                  {isTimePaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                </button>

                {/* Quick Zen Focus */}
                <button
                  onClick={() => setZenFocus(true)}
                  className="px-2 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 hover:border-cyan-500 flex items-center gap-1 text-[10px] font-semibold transition"
                  title="Enter Sovereign Zen Focus Mode [Hotkey: F]"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span className="hidden sm:inline">Focus [F]</span>
                </button>

                {/* Dock Collapse / Expand Toggle */}
                <button
                  onClick={() => {
                    if (consoleTab === 'none') {
                      setConsoleTab('lens');
                      setIsDockMinimized(false);
                    } else {
                      setIsDockMinimized(!isDockMinimized);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
                  title={isDockMinimized || consoleTab === 'none' ? 'Expand Console Drawer' : 'Collapse Console Drawer'}
                >
                  {isDockMinimized || consoleTab === 'none' ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Subtle Keyboard Legend for Humanity */}
            <div className="text-[9px] text-zinc-500 flex items-center gap-3 px-2">
              <span>[Space] Time</span>
              <span>•</span>
              <span>[F] Zen Focus</span>
              <span>•</span>
              <span>[ [ / ] ] Size Zoom</span>
              <span>•</span>
              <span>[0] Reset Size</span>
              <span>•</span>
              <span>[Drag] Orbit 3D</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Conformal Octave Scale Dive fallback renderer
 * (Preserved for exploring self-similarity period Lambda = 535.49)
 */
function drawConformalDiveScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  zoomState: InfiniteZoomState,
  metrics: CovalentCongruityMetrics,
  particles: any[],
  vectorClock: CovalentVectorClock,
  beAsMoMBHStar: boolean,
  isStasisActive: boolean,
  stasisCount: number,
  coPlayState: CoPlaySystemState,
  simTime: number
) {
  ctx.fillStyle = '#030305';
  ctx.fillRect(0, 0, width, height);

  const cx = width * 0.5 + zoomState.cameraCenter[0];
  const cy = height * 0.5 + zoomState.cameraCenter[1];
  const minDim = Math.min(width, height);
  const baseShadowRadius = Math.max(1, minDim * 0.28);

  // Render Horizon
  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(cx, cy, baseShadowRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = beAsMoMBHStar ? '#06b6d4' : '#f43f5e';
  ctx.lineWidth = 3;
  ctx.stroke();

  if (beAsMoMBHStar) {
    ctx.fillStyle = '#67e8f9';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⟨ ⟩', cx, cy - 6);
  }
  ctx.restore();
}
