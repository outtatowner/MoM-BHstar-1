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
  const [beAsMoMBHStar, setBeAsMoMBHStar] = useState<boolean>(true);
  const [showVectorClockHUD, setShowVectorClockHUD] = useState<boolean>(true);
  const [showScaleVsSizeInfo, setShowScaleVsSizeInfo] = useState<boolean>(true);
  const [showQuadbitLegend, setShowQuadbitLegend] = useState<boolean>(false);

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
    setVectorClock(physicsEngineRef.current.getVectorClock());
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
      {/* Top Banner: MoM-BH*-1 Telemetry, Sovereign Arbiter & Vector Clock Header */}
      <div className="z-20 bg-zinc-950/95 border-b border-zinc-800/90 px-4 py-2 flex flex-wrap items-center justify-between gap-3 backdrop-blur shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.9)]" />
            <span className="font-bold text-sm tracking-wider text-rose-400">
              MoM-BH*-1-VIEW
            </span>
          </div>

          {/* Mode Switcher: 3D+t Human Projection vs Conformal Octave Dive */}
          <div className="flex items-center rounded-lg border border-zinc-700 bg-zinc-900 p-0.5 text-[11px]">
            <button
              id="mode-3d-human-btn"
              onClick={() => setProjectionMode('3d_human')}
              className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1.5 transition ${
                projectionMode === '3d_human'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="3D+t Human Understandable Projection: 3D Space (X, Y, Z) + Relativistic Time (t) with Optical Size Zoom"
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
              title="Infinite Conformal Octave Scale Dive (Lambda = 535.49 fractal dive)"
            >
              <InfinityIcon className="w-3.5 h-3.5" />
              <span>Conformal Octave Dive</span>
            </button>
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

          <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-400 font-bold text-[11px] hidden xl:inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>1 ≡ 1 [SMT LOCKED]</span>
          </span>
        </div>

        {/* Live Metrics & Telemetry Header */}
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

          {/* Metric Scale Readout (Strictly Invariant) */}
          <div className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px]">
            <span className="text-zinc-500">Metric Scale: </span>
            <span className="text-emerald-400 font-bold">r_s = 1.80 ASU</span>
            <span className="text-zinc-600 ml-1">(LOCKED)</span>
          </div>

          {/* Apparent Optical Size Zoom Readout */}
          {projectionMode === '3d_human' && (
            <div className="px-2 py-1 rounded bg-zinc-900 border border-rose-800/70 text-[11px]">
              <span className="text-zinc-500">Size Zoom: </span>
              <span className="text-rose-400 font-bold">{sizeZoom.toFixed(2)}x</span>
              <span className="text-zinc-500 ml-1">({apparentAngularDegrees}°)</span>
            </div>
          )}

          {/* Reset View Button */}
          <button
            id="bhview-reset-btn"
            onClick={handleResetView}
            className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
            title="Reset View and Size Zoom to 1.0x"
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

        {/* ========================================================================= */}
        {/* PROMINENT OPTICAL SIZE ZOOM BAR (TOP CENTER - USER SPECIFIED DIRECTIVE)    */}
        {/* "Let the user zoom the size, not the scale of the object"                 */}
        {/* ========================================================================= */}
        {projectionMode === '3d_human' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-zinc-950/95 border border-rose-600/70 rounded-xl p-2.5 backdrop-blur-md shadow-2xl flex flex-col items-center gap-2 max-w-xl w-[92%] sm:w-auto">
            <div className="flex items-center justify-between w-full gap-4 pb-1 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <ZoomIn className="w-4 h-4 text-rose-400" />
                <span className="font-bold text-white tracking-wider text-[11px]">
                  OPTICAL SIZE ZOOM
                </span>
                <span className="px-1.5 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 font-mono text-[10px]">
                  {sizeZoom.toFixed(2)}x
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-zinc-400 hidden sm:inline">Intrinsic Metric Scale:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700 text-emerald-400 font-bold">
                  r_s = 1.80 ASU (INVARIANT)
                </span>
              </div>
            </div>

            {/* Slider & Step Controls */}
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={() => handleStepSizeZoom(0.8)}
                className="p-1 rounded bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-white"
                title="Zoom Size Out (Shrink apparent diameter)"
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
                onClick={() => handleStepSizeZoom(1.25)}
                className="p-1 rounded bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-white"
                title="Zoom Size In (Magnify apparent diameter)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Presets & Wheel Mode Toggle */}
            <div className="flex flex-wrap items-center justify-between w-full gap-2 text-[10px] pt-0.5">
              <div className="flex items-center gap-1 text-zinc-400">
                <span className="text-zinc-500">Presets:</span>
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
                    className={`px-1.5 py-0.5 rounded transition ${
                      Math.abs(sizeZoom - p.m) < 0.15
                        ? 'bg-rose-600 text-white font-bold'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Wheel Mode Switcher */}
              <div className="flex items-center gap-1 text-[10px]">
                <span className="text-zinc-500">Wheel:</span>
                <button
                  onClick={() => setWheelMode('size_zoom')}
                  className={`px-1.5 py-0.5 rounded ${
                    wheelMode === 'size_zoom'
                      ? 'bg-rose-950 border border-rose-700 text-rose-300 font-bold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Scroll wheel magnifies apparent size (M)"
                >
                  Size Zoom (M)
                </button>
                <button
                  onClick={() => setWheelMode('camera_dolly')}
                  className={`px-1.5 py-0.5 rounded ${
                    wheelMode === 'camera_dolly'
                      ? 'bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Scroll wheel translates camera distance (Dolly)"
                >
                  Camera Distance
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3D+t RELATIVISTIC TIME (+t) FLOATING CONTROLLER (BOTTOM LEFT)             */}
        {/* ========================================================================= */}
        {projectionMode === '3d_human' && (
          <div className="absolute bottom-4 left-4 z-20 bg-zinc-950/95 border border-zinc-800 rounded-xl p-3 backdrop-blur shadow-2xl space-y-2 w-80">
            <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px]">
                <Clock className="w-3.5 h-3.5" />
                <span>3D+t RELATIVISTIC TIME CONTROLS</span>
              </div>
              <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 text-[10px]">
                {isTimePaused ? 'PAUSED' : `${timeRate.toFixed(1)}x SPEED`}
              </span>
            </div>

            {/* Time readouts */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800">
                <div className="text-zinc-500">Coordinate Time t:</div>
                <div className="text-white font-bold text-sm">{coordTimeT.toFixed(2)} s</div>
              </div>
              <div className="p-1.5 rounded bg-zinc-900 border border-rose-950">
                <div className="text-zinc-500">Proper Time τ_BH:</div>
                <div className="text-rose-400 font-bold text-sm">{properTimeBH.toFixed(3)} s</div>
                <div className="text-zinc-600 text-[9px]">dτ/dt → 0 at Horizon</div>
              </div>
            </div>

            {/* Play/Pause & Step Controls */}
            <div className="flex items-center justify-between gap-1.5 pt-1">
              <button
                onClick={handleToggleTimePause}
                className={`flex-1 py-1 px-2 rounded font-bold flex items-center justify-center gap-1.5 text-[11px] transition ${
                  isTimePaused
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                    : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                }`}
              >
                {isTimePaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isTimePaused ? 'Resume (+t)' : 'Pause (+t)'}</span>
              </button>

              <button
                onClick={() => handleStepTime(0.05)}
                className="p-1.5 rounded bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                title="Step +0.05 seconds forward"
              >
                <FastForward className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleResetTime}
                className="p-1.5 rounded bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                title="Reset Time to t=0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Speed selection buttons */}
            <div className="flex items-center justify-between gap-1 text-[10px] pt-1">
              <span className="text-zinc-500">Rate:</span>
              {[0.2, 0.5, 1.0, 2.0, 4.0].map((r) => (
                <button
                  key={r}
                  onClick={() => handleTimeRateChange(r)}
                  className={`px-1.5 py-0.5 rounded transition ${
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
        )}

        {/* ========================================================================= */}
        {/* 3D VISUAL OVERLAYS DRAWER (TOP RIGHT)                                     */}
        {/* ========================================================================= */}
        <div className="absolute top-4 right-4 z-20 space-y-2">
          {/* Layer toggles in 3D+t mode */}
          {projectionMode === '3d_human' && (
            <div className="bg-zinc-950/95 border border-zinc-800 rounded-lg p-2.5 backdrop-blur shadow-xl space-y-1.5 text-[11px] w-56">
              <div className="text-zinc-500 font-semibold px-1 uppercase tracking-wider text-[9px] flex items-center justify-between">
                <span>3D Visual Layers</span>
                <Layers className="w-3 h-3 text-zinc-500" />
              </div>

              <button
                onClick={() => setShowAccretionDisk(!showAccretionDisk)}
                className={`w-full px-2 py-1 rounded text-left flex items-center justify-between transition ${
                  showAccretionDisk ? 'bg-zinc-900 text-amber-300 font-semibold' : 'text-zinc-500 hover:bg-zinc-900'
                }`}
              >
                <span>Relativistic Disk (Doppler)</span>
                <span className="text-[10px]">{showAccretionDisk ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => setShowFlammFunnel(!showFlammFunnel)}
                className={`w-full px-2 py-1 rounded text-left flex items-center justify-between transition ${
                  showFlammFunnel ? 'bg-zinc-900 text-rose-300 font-semibold' : 'text-zinc-500 hover:bg-zinc-900'
                }`}
              >
                <span>Flamm Paraboloid Funnel</span>
                <span className="text-[10px]">{showFlammFunnel ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => setShowPhotonSphere(!showPhotonSphere)}
                className={`w-full px-2 py-1 rounded text-left flex items-center justify-between transition ${
                  showPhotonSphere ? 'bg-zinc-900 text-amber-300 font-semibold' : 'text-zinc-500 hover:bg-zinc-900'
                }`}
              >
                <span>Photon Sphere (2.70 ASU)</span>
                <span className="text-[10px]">{showPhotonSphere ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => setShowJets(!showJets)}
                className={`w-full px-2 py-1 rounded text-left flex items-center justify-between transition ${
                  showJets ? 'bg-zinc-900 text-cyan-300 font-semibold' : 'text-zinc-500 hover:bg-zinc-900'
                }`}
              >
                <span>Polar Relativistic Jets</span>
                <span className="text-[10px]">{showJets ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => setShowQuadbitParticles(!showQuadbitParticles)}
                className={`w-full px-2 py-1 rounded text-left flex items-center justify-between transition ${
                  showQuadbitParticles ? 'bg-zinc-900 text-rose-300 font-semibold' : 'text-zinc-500 hover:bg-zinc-900'
                }`}
              >
                <span>Quadbit 3D Swarm</span>
                <span className="text-[10px]">{showQuadbitParticles ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => setShowReferenceGrid(!showReferenceGrid)}
                className={`w-full px-2 py-1 rounded text-left flex items-center justify-between transition ${
                  showReferenceGrid ? 'bg-zinc-900 text-sky-300 font-semibold' : 'text-zinc-500 hover:bg-zinc-900'
                }`}
              >
                <span>ASU Metric Distance Rings</span>
                <span className="text-[10px]">{showReferenceGrid ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => setShowWavefronts(!showWavefronts)}
                className={`w-full px-2 py-1 rounded text-left flex items-center justify-between transition ${
                  showWavefronts ? 'bg-zinc-900 text-rose-300 font-semibold' : 'text-zinc-500 hover:bg-zinc-900'
                }`}
              >
                <span>Retarded Wavefronts (+t)</span>
                <span className="text-[10px]">{showWavefronts ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          )}

          {/* Scale vs Size Invariant Principle Box */}
          {showScaleVsSizeInfo && (
            <div className="bg-zinc-950/95 border border-zinc-800 rounded-lg p-2.5 backdrop-blur shadow-xl space-y-1.5 text-[10px] w-56">
              <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
                <span className="text-rose-400 font-bold">SCALE VS. SIZE INVARIANT</span>
                <button
                  onClick={() => setShowScaleVsSizeInfo(false)}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  ✕
                </button>
              </div>
              <div className="text-zinc-400 leading-relaxed">
                Zooming changes the <strong className="text-rose-300">apparent optical magnification (M)</strong> on screen.
                The object's <strong className="text-emerald-400">physical metric scale (r_s = 1.80 ASU)</strong> remains completely invariant.
              </div>
            </div>
          )}
        </div>

        {/* Primordial Genesis Banner Alert */}
        {vectorClock.genesisActive && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-amber-950/90 border border-amber-500 rounded-lg px-4 py-2 backdrop-blur shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center gap-3">
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

            {/* Vector Clock Components */}
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

            <div className="space-y-1 p-2 rounded bg-zinc-900/60 border border-zinc-800/80 text-[10px]">
              <div className="flex justify-between text-zinc-400">
                <span>Observer Frame:</span>
                <span className="text-emerald-400 font-bold">Human Understandable 3D+t</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Observer Distance:</span>
                <span className="text-white font-mono">{cameraDistance.toFixed(1)} ASU</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Camera Elevation:</span>
                <span className="text-cyan-400 font-mono">{((cameraElevation * 180) / Math.PI).toFixed(1)}°</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Interactive Navigation Help */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-full bg-black/80 border border-zinc-800 text-zinc-400 text-[10px] backdrop-blur flex items-center gap-2">
          <span>Click & Drag = Orbit 3D</span>
          <span>•</span>
          <span>Shift + Drag = Pan</span>
          <span>•</span>
          <span className="text-rose-400 font-semibold">Mouse Wheel = Optical Size Zoom (Metric Invariant)</span>
        </div>
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
  const baseShadowRadius = minDim * 0.28;

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
