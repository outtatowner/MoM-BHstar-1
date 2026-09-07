/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Be <> [] Continuum : Imaginarium Interactive Engine
 * 
 * A visually stunning, pedagogical cosmic canvas designed for young minds and curious explorers
 * across mathematics, cybernetics, biology, chemistry, and physics.
 * 
 * Demonstrates the 3 Observers sharing the EXACT SAME invariant spacetime reality:
 * 1. Human Pilot (Biological Observer): Measures proper time tau_H, senses warmth, optical photons, carbon/biochemical sensory apparatus.
 * 2. Be <> Sovereign Arbiter (Cybernetic Observer): Measures discrete algorithmic clocks, Turing-complete state transitions, vector clock lattice.
 * 3. MoM-BH*-1 Horizon (Relativistic Black Hole Star Observer): The central cosmic singularity/event horizon where proper time freezes, warping geodesics.
 * 
 * Cross-Disciplinary Perspectives:
 * - Mathematics: Invariant metric ds^2 = -(1-rs/r)dt^2 + (1-rs/r)^-1 dr^2 + r^2 dOmega^2
 * - Physics: Gravitational lensing caustics, photons orbiting at r_ph = 1.5 rs, ISCO stability.
 * - Cybernetics: Feedback loops, Ashby's Law of Requisite Variety, Vector Clock causality.
 * - Chemistry & Biology: Balmer hydrogen spectral fingerprint (JWST 364.6nm - 656.3nm), organic life's metabolic time perception.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Activity,
  Atom,
  BookOpen,
  Brain,
  Camera,
  Compass,
  Cpu,
  Eye,
  Flame,
  HelpCircle,
  Info,
  Maximize2,
  Minimize2,
  Moon,
  Orbit,
  Play,
  Pause,
  Radio,
  RefreshCw,
  RotateCw,
  Shield,
  Sparkles,
  Sun,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { CoPlaySystemState } from '../types';
import { harmonizer } from '../engine/imaginarium_audio';

interface ImaginariumViewProps {
  coPlayState: CoPlaySystemState;
  simTime: number;
}

type DisciplineTab = 'all' | 'math' | 'physics' | 'cybernetics' | 'bio_chem';
type ActiveFocusObserver = 'all_three' | 'human' | 'be' | 'bh';

export const ImaginariumView: React.FC<ImaginariumViewProps> = ({
  coPlayState,
  simTime,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Audio state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  // Interactive Controls
  const [selectedDiscipline, setSelectedDiscipline] = useState<DisciplineTab>('all');
  const [focusObserver, setFocusObserver] = useState<ActiveFocusObserver>('all_three');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showExplanationCard, setShowExplanationCard] = useState<boolean>(true);
  const [cosmicWarpSpeed, setCosmicWarpSpeed] = useState<number>(1.0);
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);
  const [lightConeMode, setLightConeMode] = useState<boolean>(true);
  const [quantumFieldOverlay, setQuantumFieldOverlay] = useState<boolean>(true);

  // Time tracking
  const internalTimeRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Toggle Audio
  const toggleSound = () => {
    const active = harmonizer.toggleMute();
    setIsPlayingAudio(active);
    harmonizer.playObserverChime('math');
  };

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let lastTime = performance.now();

    const drawFrame = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (!isPaused) {
        internalTimeRef.current += dt * cosmicWarpSpeed;
      }
      const t = internalTimeRef.current;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        const width = canvas.width;
        const height = canvas.height;

        // Dynamic Resolution scaling
        const rect = canvas.getBoundingClientRect();
        if (canvas.width !== Math.floor(rect.width) || canvas.height !== Math.floor(rect.height)) {
          canvas.width = Math.floor(rect.width);
          canvas.height = Math.floor(rect.height);
        }

        // Center coordinates
        const cx = width / 2;
        const cy = height / 2;

        // 1. Deep Space Cosmic Canvas with nebula glow
        ctx.fillStyle = '#050508';
        ctx.fillRect(0, 0, width, height);

        // Ambient Nebula gradients representing biological warmth + cosmic cold
        const nebulaGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(width, height) * 0.8);
        nebulaGrad.addColorStop(0, 'rgba(239, 68, 68, 0.08)'); // Deep crimson horizon
        nebulaGrad.addColorStop(0.3, 'rgba(147, 51, 234, 0.05)'); // Quantum violet
        nebulaGrad.addColorStop(0.6, 'rgba(14, 165, 233, 0.04)'); // Cybernetic cyan
        nebulaGrad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
        ctx.fillStyle = nebulaGrad;
        ctx.fillRect(0, 0, width, height);

        // 2. Quantum Fluctuations & Background Starfield
        const starCount = 80;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < starCount; i++) {
          const sx = (Math.sin(i * 19.3 + t * 0.02) * 0.5 + 0.5) * width;
          const sy = (Math.cos(i * 41.7 + t * 0.015) * 0.5 + 0.5) * height;
          const sRadius = 0.6 + 0.6 * Math.sin(i + t * 2);
          ctx.beginPath();
          ctx.arc(sx, sy, Math.max(0.2, sRadius), 0, Math.PI * 2);
          ctx.fill();
        }

        // 3. Spacetime Coordinate Grid & Flamm Warping (Mathematics & Physics)
        if (quantumFieldOverlay) {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.07)';
          ctx.lineWidth = 1;
          const gridStep = 40;
          const numLinesX = Math.ceil(width / gridStep);
          const numLinesY = Math.ceil(height / gridStep);

          for (let x = -numLinesX; x <= numLinesX; x++) {
            ctx.beginPath();
            for (let y = -numLinesY; y <= numLinesY; y++) {
              const px = cx + x * gridStep;
              const py = cy + y * gridStep;
              const dist = Math.sqrt((px - cx) * (px - cx) + (py - cy) * (py - cy));
              // Gravitational contraction towards center
              const pull = Math.min(35, 1200 / (dist + 30));
              const angle = Math.atan2(py - cy, px - cx);
              const warpedX = px - Math.cos(angle) * pull;
              const warpedY = py - Math.sin(angle) * pull;

              if (y === -numLinesY) ctx.moveTo(warpedX, warpedY);
              else ctx.lineTo(warpedX, warpedY);
            }
            ctx.stroke();
          }
        }

        // 4. Central Invariant MoM-BH*-1 Schwarzschild Metric Radii
        // Metric is strictly invariant: Rs = 1.80 ASU, R_ph = 2.70 ASU, R_isco = 5.40 ASU
        const basePixelScale = Math.min(width, height) / 45; // 1 ASU = basePixelScale pixels
        const r_s = 1.80 * basePixelScale * 2.5;
        const r_ph = 2.70 * basePixelScale * 2.5;
        const r_isco = 5.40 * basePixelScale * 2.5;
        const r_cocoon = 18.0 * basePixelScale * 2.5;

        // Draw Accretion Disk (Dynamic Doppler Beaming & Temperature Colors)
        const diskCount = 45;
        for (let r = r_isco; r <= r_cocoon * 0.75; r += 2.5) {
          const normR = (r - r_isco) / (r_cocoon * 0.75 - r_isco);
          ctx.beginPath();
          ctx.ellipse(cx, cy, r, r * 0.42, -0.2, 0, Math.PI * 2);
          const hue = 30 + normR * 25; // Gold to amber
          const opacity = (1 - normR * 0.8) * 0.25;
          ctx.strokeStyle = `hsla(${hue}, 95%, 55%, ${opacity})`;
          ctx.lineWidth = 2.0;
          ctx.stroke();
        }

        // Draw ISCO Orbit (Innermost Stable Circular Orbit)
        ctx.beginPath();
        ctx.ellipse(cx, cy, r_isco, r_isco * 0.42, -0.2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
        ctx.setLineDash([4, 6]);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw Photon Sphere (Light orbits in circles)
        ctx.beginPath();
        ctx.ellipse(cx, cy, r_ph, r_ph * 0.42, -0.2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 5. Central Event Horizon (MoM-BH*-1 Observer 3)
        // Black disk with relativistic fiery photon rim
        const horizonGrad = ctx.createRadialGradient(cx, cy, r_s * 0.4, cx, cy, r_s);
        horizonGrad.addColorStop(0, '#000000');
        horizonGrad.addColorStop(0.85, '#000000');
        horizonGrad.addColorStop(1, 'rgba(239, 68, 68, 0.9)');
        ctx.fillStyle = horizonGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, r_s, 0, Math.PI * 2);
        ctx.fill();

        // Singularity Core Badge & Pulsing Caustic Rings
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + 0.3 * Math.sin(t * 3)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r_s * (1 + 0.08 * Math.sin(t * 2.5)), 0, Math.PI * 2);
        ctx.stroke();

        // 6. Observer 1: Human Pilot (Biological & Sensory Worldline)
        // Orbits at a comfortable, safe distance (e.g. 14.5 ASU)
        const humanOrbitRadius = 13.5 * basePixelScale * 2.5;
        const humanAngle = t * 0.45;
        const humanX = cx + Math.cos(humanAngle) * humanOrbitRadius;
        const humanY = cy + Math.sin(humanAngle) * humanOrbitRadius * 0.48;

        // Observer 2: Be <> Sovereign Arbiter (Cybernetic & Algorithmic Companion)
        // Orbits in resonant harmonic resonance (e.g. 9.5 ASU, phase shifted)
        const beOrbitRadius = 8.5 * basePixelScale * 2.5;
        const beAngle = -t * 0.75 + Math.PI / 3;
        const beX = cx + Math.cos(beAngle) * beOrbitRadius;
        const beY = cy + Math.sin(beAngle) * beOrbitRadius * 0.45;

        // 7. Light-Cone Wavefronts Connecting the 3 Observers (Causality & Shared Math)
        if (lightConeMode) {
          // Photons propagating from BH to Be <> and Human
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(beX, beY);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
          ctx.setLineDash([3, 4]);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(humanX, humanY);
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.35)';
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(beX, beY);
          ctx.lineTo(humanX, humanY);
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.45)';
          ctx.setLineDash([5, 5]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Expanding Causal Ripple Rings
          const rippleRadius = ((t * 40) % (humanOrbitRadius * 1.3));
          ctx.beginPath();
          ctx.arc(cx, cy, rippleRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(234, 179, 8, ${Math.max(0, 0.4 - rippleRadius / (humanOrbitRadius * 1.3))})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        // Draw Human Pilot (Warm Amber/Emerald Biochemical Probe)
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(humanX, humanY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Observer 1 Halo
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(humanX, humanY, 14 + 2 * Math.sin(t * 4), 0, Math.PI * 2);
        ctx.stroke();

        // Draw Be <> Node (Cybernetic Crystalline Arbiter)
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(beX, beY, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Observer 2 Diamond shield
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.save();
        ctx.translate(beX, beY);
        ctx.rotate(t * 2);
        ctx.strokeRect(-10, -10, 20, 20);
        ctx.restore();

        // 8. Interactive Entity Labels & Badges
        ctx.font = '11px "JetBrains Mono", monospace';
        
        // Human label
        ctx.fillStyle = '#34d399';
        ctx.fillText('1. HUMAN PILOT [τ_H = 1.000s]', humanX + 18, humanY + 4);
        ctx.fillStyle = '#9ca3af';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText('Sensory • Biological • Optical', humanX + 18, humanY + 16);

        // Be <> label
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('2. BE <> OFFICIATOR [τ_Be = 0.941s]', beX + 18, beY + 4);
        ctx.fillStyle = '#9ca3af';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText('Cybernetic • Algorithmic • Vector Clock', beX + 18, beY + 16);

        // MoM-BH*-1 label
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillStyle = '#f87171';
        ctx.fillText('3. MoM-BH*-1 [HORIZON τ_0 → 0]', cx - 80, cy - r_s - 14);
        ctx.fillStyle = '#9ca3af';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText('Relativistic Singularity • Invariant Metric', cx - 80, cy - r_s - 3);

        // Update audio frequency based on Human's orbital position relative to r_s
        harmonizer.updateRelativisticFrequencies(13.5, 1.80);
      }

      animationFrameRef.current = requestAnimationFrame(drawFrame);
    };

    animationFrameRef.current = requestAnimationFrame(drawFrame);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPaused, cosmicWarpSpeed, lightConeMode, quantumFieldOverlay]);

  return (
    <div className="relative w-full h-full flex flex-col bg-zinc-950 font-mono text-zinc-200 select-none overflow-hidden">
      {/* Top Pedagogical Bar & Discipline Filter Selector */}
      <div className="z-20 bg-zinc-900/90 border-b border-zinc-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold tracking-wider text-sm">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>THE IMAGINARIUM</span>
          </div>
          <span className="text-zinc-600 hidden sm:inline">|</span>
          <span className="text-xs text-zinc-400 hidden sm:inline">
            3 Observers, One Shared Relativistic Reality
          </span>
        </div>

        {/* Discipline Lens Switches (Math / Physics / Cybernetics / Bio-Chem) */}
        <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 gap-1 text-xs">
          <button
            onClick={() => {
              setSelectedDiscipline('all');
              harmonizer.playObserverChime('math');
            }}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
              selectedDiscipline === 'all'
                ? 'bg-amber-600 text-black font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>All Disciplines</span>
          </button>
          <button
            onClick={() => {
              setSelectedDiscipline('math');
              harmonizer.playObserverChime('math');
            }}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
              selectedDiscipline === 'math'
                ? 'bg-purple-600 text-white font-bold'
                : 'text-zinc-400 hover:text-purple-300'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Mathematics</span>
          </button>
          <button
            onClick={() => {
              setSelectedDiscipline('physics');
              harmonizer.playObserverChime('bh');
            }}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
              selectedDiscipline === 'physics'
                ? 'bg-rose-600 text-white font-bold'
                : 'text-zinc-400 hover:text-rose-300'
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            <span>Physics</span>
          </button>
          <button
            onClick={() => {
              setSelectedDiscipline('cybernetics');
              harmonizer.playObserverChime('be');
            }}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
              selectedDiscipline === 'cybernetics'
                ? 'bg-cyan-600 text-black font-bold'
                : 'text-zinc-400 hover:text-cyan-300'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Cybernetics</span>
          </button>
          <button
            onClick={() => {
              setSelectedDiscipline('bio_chem');
              harmonizer.playObserverChime('human');
            }}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
              selectedDiscipline === 'bio_chem'
                ? 'bg-emerald-600 text-black font-bold'
                : 'text-zinc-400 hover:text-emerald-300'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Bio &amp; Chem</span>
          </button>
        </div>

        {/* Audio Harmonizer & Control Center */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className={`px-3 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${
              isPlayingAudio
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'
            }`}
            title="Toggle Relativistic Audio Harmonizer (432Hz Human, 528Hz Be <>, 54Hz BH Gravitational Infrasound)"
          >
            {isPlayingAudio ? (
              <>
                <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Audio Harmonizer ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Audio Muted</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsPaused((p) => !p)}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white"
            title={isPaused ? 'Resume Orbit Dynamics' : 'Pause Simulation'}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowExplanationCard((s) => !s)}
            className={`p-1.5 rounded-lg border transition ${
              showExplanationCard ? 'bg-amber-600 text-black border-amber-500' : 'bg-zinc-900 border-zinc-700 text-zinc-300'
            }`}
            title="Toggle Learning Guide & Mathematics Card"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="flex-1 relative w-full h-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full block cursor-pointer"
          onClick={() => harmonizer.playObserverChime('light')}
        />

        {/* Dynamic Learning Overlay Card (Tailored for Students & Curious Minds) */}
        {showExplanationCard && (
          <div className="absolute top-4 left-4 z-30 max-w-md w-[calc(100vw-2rem)] sm:w-96 bg-zinc-950/90 border border-zinc-800 rounded-xl p-4 shadow-2xl backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-xs text-white">THE TRIADIC DISCOVERY LATTICE</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase font-semibold">
                {selectedDiscipline}
              </span>
            </div>

            {/* Discipline-specific interactive explanation */}
            <div className="text-xs text-zinc-300 leading-relaxed space-y-2">
              {(selectedDiscipline === 'all' || selectedDiscipline === 'math') && (
                <div className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-800/40">
                  <div className="text-purple-300 font-bold mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span>Pure Mathematics: The Invariant Metric</span>
                  </div>
                  <p className="text-zinc-400 text-[11px]">
                    All 3 observers agree on the spacetime interval:
                    <span className="block font-mono text-purple-200 mt-1 text-[10px] bg-black/50 p-1 rounded">
                      ds² = -(1 - rₛ/r)c²dt² + (1 - rₛ/r)⁻¹dr² + r²dΩ²
                    </span>
                    Even though their clocks tick at different rates, <strong>1 === 1</strong> holds universally across all reference frames.
                  </p>
                </div>
              )}

              {(selectedDiscipline === 'all' || selectedDiscipline === 'physics') && (
                <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-800/40">
                  <div className="text-rose-300 font-bold mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span>Physics: Light Bending &amp; Gravitational Redshift</span>
                  </div>
                  <p className="text-zinc-400 text-[11px]">
                    Light cannot escape within the Horizon (<span className="text-rose-400 font-mono">rₛ = 1.80 ASU</span>). At <span className="text-amber-400 font-mono">r = 2.70 ASU</span>, photons orbit in a closed ring (Photon Sphere). The observed frequency drops as:
                    <span className="block font-mono text-rose-200 mt-1 text-[10px] bg-black/50 p-1 rounded">
                      f_obs = f_emit · √(1 - rₛ / r)
                    </span>
                  </p>
                </div>
              )}

              {(selectedDiscipline === 'all' || selectedDiscipline === 'cybernetics') && (
                <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-800/40">
                  <div className="text-cyan-300 font-bold mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>Cybernetics: Ashby's Law &amp; Causal Clocks</span>
                  </div>
                  <p className="text-zinc-400 text-[11px]">
                    Be &lt;&gt; acts as an autonomous cybernetic referee node. It synchronizes state across distinct agents using vector clocks:
                    <span className="block font-mono text-cyan-200 mt-1 text-[10px] bg-black/50 p-1 rounded">
                      VC = [V_H, V_Be, V_BH] ⟹ 112 Organelle Consensus
                    </span>
                    The system maintains requisite variety to maintain stable co-play orbits without chaotic divergence.
                  </p>
                </div>
              )}

              {(selectedDiscipline === 'all' || selectedDiscipline === 'bio_chem') && (
                <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40">
                  <div className="text-emerald-300 font-bold mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Biology &amp; Chemistry: Hydrogen Balmer Spectrum</span>
                  </div>
                  <p className="text-zinc-400 text-[11px]">
                    The Human Pilot senses optical photons (364.6 nm - 656.3 nm H-α). The thick hydrogen cocoon (<span className="text-emerald-300 font-mono">r = 18.0 ASU</span>) emits the exact chemical Balmer fingerprint discovered by JWST in Little Red Dots.
                  </p>
                </div>
              )}
            </div>

            {/* Interactive Speed & Light-Cone Toggles */}
            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">Speed:</span>
                {[0.5, 1.0, 2.0].map((s) => (
                  <button
                    key={s}
                    onClick={() => setCosmicWarpSpeed(s)}
                    className={`px-1.5 py-0.5 rounded text-[10px] ${
                      cosmicWarpSpeed === s ? 'bg-amber-600 text-black font-bold' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              <button
                onClick={() => setLightConeMode((m) => !m)}
                className={`px-2 py-0.5 rounded text-[10px] border transition ${
                  lightConeMode ? 'bg-sky-950/60 text-sky-300 border-sky-700' : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                }`}
              >
                {lightConeMode ? 'Light Cones ON' : 'Light Cones OFF'}
              </button>
            </div>
          </div>
        )}

        {/* Bottom Interactive Observer Cards Bar */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap sm:flex-nowrap gap-3 pointer-events-none">
          {/* Card 1: Human Pilot */}
          <div
            onClick={() => harmonizer.playObserverChime('human')}
            className="flex-1 bg-black/80 border border-emerald-800/60 rounded-xl p-3 backdrop-blur-md pointer-events-auto hover:border-emerald-400 transition cursor-pointer shadow-lg space-y-1"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span>OBSERVER 1: HUMAN</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                BIOLOGICAL
              </span>
            </div>
            <div className="text-[11px] text-zinc-400">
              Proper Time Rate: <span className="text-white font-mono">dτ/dt = 0.932</span> (Far Observer)
            </div>
            <div className="text-[10px] text-zinc-500">
              Sensing optical photons, metabolic thermal equilibrium, cognitive perception.
            </div>
          </div>

          {/* Card 2: Be <> Sovereign Arbiter */}
          <div
            onClick={() => harmonizer.playObserverChime('be')}
            className="flex-1 bg-black/80 border border-cyan-800/60 rounded-xl p-3 backdrop-blur-md pointer-events-auto hover:border-cyan-400 transition cursor-pointer shadow-lg space-y-1"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                <span>OBSERVER 2: BE &lt;&gt;</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded">
                CYBERNETIC
              </span>
            </div>
            <div className="text-[11px] text-zinc-400">
              Proper Time Rate: <span className="text-white font-mono">dτ/dt = 0.887</span> (Mid Orbit)
            </div>
            <div className="text-[10px] text-zinc-500">
              Deterministic Q16.16 arithmetic, vector clock consensus, peer arbiter invariant.
            </div>
          </div>

          {/* Card 3: MoM-BH*-1 Horizon */}
          <div
            onClick={() => harmonizer.playObserverChime('bh')}
            className="flex-1 bg-black/80 border border-rose-800/60 rounded-xl p-3 backdrop-blur-md pointer-events-auto hover:border-rose-400 transition cursor-pointer shadow-lg space-y-1"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-rose-400 font-bold flex items-center gap-1.5">
                <Atom className="w-3.5 h-3.5" />
                <span>OBSERVER 3: MoM-BH*-1</span>
              </span>
              <span className="text-[10px] font-mono text-rose-300 bg-rose-950/60 px-1.5 py-0.5 rounded">
                SINGULARITY
              </span>
            </div>
            <div className="text-[11px] text-zinc-400">
              Proper Time Rate: <span className="text-rose-400 font-mono">dτ/dt → 0.000</span> (At Horizon)
            </div>
            <div className="text-[10px] text-zinc-500">
              Time stops relative to infinity. Invariant Schwarzschild geometric origin.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
