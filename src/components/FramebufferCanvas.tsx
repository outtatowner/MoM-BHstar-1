/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Compass,
  Crosshair,
  Gauge,
  Maximize2,
  Navigation,
  Shield,
  Zap,
} from 'lucide-react';
import { CoPlaySystemState, FramebufferMode } from '../types';
import { q16ToFloat, vec3_length } from '../engine/q16math';

interface FramebufferCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  mode: FramebufferMode;
  crtScanlines: boolean;
  coPlayState: CoPlaySystemState;
  renderTimeMs: number;
  lyapunovScale: number;
  onMoveInput: (delta: { forward: number; strafe: number; elevate: number; boost: boolean }) => void;
  onLookInput: (delta: { yaw: number; pitch: number }) => void;
  wavelengthNm: number;
}

export const FramebufferCanvas: React.FC<FramebufferCanvasProps> = ({
  canvasRef,
  mode,
  crtScanlines,
  coPlayState,
  renderTimeMs,
  lyapunovScale,
  onMoveInput,
  onLookInput,
  wavelengthNm,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Key state tracking
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in text fields/inputs
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }
      keysPressed.current[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Game loop tick for keyboard movement
    const moveInterval = setInterval(() => {
      const keys = keysPressed.current;
      let forward = 0;
      let strafe = 0;
      let elevate = 0;
      const boost = !!(keys['ShiftLeft'] || keys['ShiftRight']);

      if (keys['KeyW'] || keys['ArrowUp']) forward += 1;
      if (keys['KeyS'] || keys['ArrowDown']) forward -= 1;
      if (keys['KeyD'] || keys['ArrowRight']) strafe += 1;
      if (keys['KeyA'] || keys['ArrowLeft']) strafe -= 1;
      if (keys['Space']) elevate += 1;
      if (keys['KeyC'] || keys['ControlLeft']) elevate -= 1;

      if (forward !== 0 || strafe !== 0 || elevate !== 0) {
        onMoveInput({ forward, strafe, elevate, boost });
      }
    }, 20);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(moveInterval);
    };
  }, [onMoveInput]);

  // Pointer drag for looking
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    onLookInput({
      yaw: dx * 0.005,
      pitch: dy * 0.005,
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Touch controls for mobile
  const touchStartRef = useRef({ x: 0, y: 0 });
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - touchStartRef.current.x;
      const dy = e.touches[0].clientY - touchStartRef.current.y;
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      onLookInput({
        yaw: dx * 0.006,
        pitch: dy * 0.006,
      });
    }
  };

  const human = coPlayState.human;
  const be = coPlayState.beOfficiator;
  const distToBH = q16ToFloat(vec3_length(human.position)).toFixed(2);
  const beDist = Math.sqrt(
    Math.pow(q16ToFloat(human.position.x) - q16ToFloat(be.position.x), 2) +
    Math.pow(q16ToFloat(human.position.y) - q16ToFloat(be.position.y), 2) +
    Math.pow(q16ToFloat(human.position.z) - q16ToFloat(be.position.z), 2)
  ).toFixed(2);

  return (
    <div
      ref={containerRef}
      id="dev-fb-viewport"
      className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden select-none cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      {/* Raw /dev/fb Canvas Target */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain [image-rendering:pixelated]"
      />

      {/* CRT Scanline Filter Shader Overlay */}
      {crtScanlines && (
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-30"
          style={{
            background:
              'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.7) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
            backgroundSize: '100% 3px, 6px 100%',
          }}
        />
      )}

      {/* Retro Vignette effect */}
      <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_90px_rgba(0,0,0,0.85)]" />

      {/* HUD Flight Overlays & Target Trackers */}
      <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 font-mono text-xs">
        {/* Top Flight Header */}
        <div className="flex justify-between items-start">
          <div className="bg-black/75 border border-zinc-800/80 p-2.5 rounded backdrop-blur max-w-xs space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Crosshair className="w-3.5 h-3.5" />
              <span>TARGET: MoM-BH*-1 [LITTLE RED DOT]</span>
            </div>
            <div className="text-[11px] text-zinc-400 space-y-0.5">
              <div className="flex justify-between">
                <span>Distance:</span>
                <span className="text-white font-mono">{distToBH} ASU</span>
              </div>
              <div className="flex justify-between">
                <span>Horizon (Rs):</span>
                <span className="text-rose-400 font-mono">1.80 ASU</span>
              </div>
              <div className="flex justify-between">
                <span>Photon Sphere:</span>
                <span className="text-amber-300 font-mono">2.70 ASU</span>
              </div>
              <div className="flex justify-between">
                <span>Hydrogen Cocoon:</span>
                <span className="text-orange-400 font-mono">18.00 ASU</span>
              </div>
              <div className="flex justify-between">
                <span>Luminosity:</span>
                <span className="text-yellow-300 font-mono">100 Billion L☉</span>
              </div>
            </div>
          </div>

          {/* Be <> Co-Play Companion Status */}
          <div className="bg-black/75 border border-cyan-800/80 p-2.5 rounded backdrop-blur max-w-xs space-y-1 text-right">
            <div className="flex items-center justify-end gap-1.5 text-cyan-400 font-bold">
              <span>BE &lt;&gt; SOVEREIGN ARBITER</span>
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-[11px] text-zinc-400 space-y-0.5">
              <div className="flex justify-between gap-4">
                <span>Status:</span>
                <span className="text-emerald-400 font-bold">{be.refereeStatus}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Peer Equivalence:</span>
                <span className="text-cyan-300 font-mono">1 ≡ 1 [100%]</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Escort Separation:</span>
                <span className="text-white font-mono">{beDist} ASU</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Trajectory:</span>
                <span className="text-zinc-300">ORBITAL HARMONIC</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Reticle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
          <div className="w-8 h-8 rounded-full border border-amber-500/40 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,1)]" />
          </div>
          <div className="h-2 w-px bg-amber-500/50 mt-1" />
          <div className="text-[9px] text-amber-400/80 mt-1 bg-black/60 px-1 rounded">
            λ: {wavelengthNm.toFixed(1)} nm
          </div>
        </div>

        {/* Bottom Instrument Panel */}
        <div className="flex justify-between items-end">
          {/* Virtual HID Control Guide */}
          <div className="bg-black/75 border border-zinc-800/80 p-2.5 rounded backdrop-blur space-y-1 text-[11px] text-zinc-400 hidden sm:block">
            <div className="text-zinc-300 font-semibold flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-amber-400" />
              <span>VIRTUAL HID FLIGHT INJECTION</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
              <div>[W / S] Thrust Fwd / Rev</div>
              <div>[Mouse Drag] Pitch / Yaw</div>
              <div>[A / D] Lateral Strafe</div>
              <div>[Space / C] Elevate Up / Down</div>
              <div>[Shift] Lyapunov Afterburner</div>
              <div>[Click + Drag] Look Around</div>
            </div>
          </div>

          {/* Mobile Touch Quick Controls */}
          <div className="flex sm:hidden gap-1.5 pointer-events-auto">
            <button
              onClick={() => onMoveInput({ forward: 1, strafe: 0, elevate: 0, boost: false })}
              className="px-3 py-2 bg-zinc-900/90 border border-zinc-700 rounded text-xs active:bg-amber-600"
            >
              FWD
            </button>
            <button
              onClick={() => onMoveInput({ forward: -1, strafe: 0, elevate: 0, boost: false })}
              className="px-3 py-2 bg-zinc-900/90 border border-zinc-700 rounded text-xs active:bg-amber-600"
            >
              REV
            </button>
            <button
              onClick={() => onMoveInput({ forward: 0, strafe: -1, elevate: 0, boost: false })}
              className="px-3 py-2 bg-zinc-900/90 border border-zinc-700 rounded text-xs active:bg-amber-600"
            >
              LFT
            </button>
            <button
              onClick={() => onMoveInput({ forward: 0, strafe: 1, elevate: 0, boost: false })}
              className="px-3 py-2 bg-zinc-900/90 border border-zinc-700 rounded text-xs active:bg-amber-600"
            >
              RGT
            </button>
          </div>

          {/* Engine Real-Time Performance & Lyapunov Stasis */}
          <div className="bg-black/75 border border-zinc-800/80 p-2.5 rounded backdrop-blur text-right space-y-1">
            <div className="flex items-center justify-end gap-1 text-emerald-400 font-semibold text-xs">
              <Zap className="w-3.5 h-3.5" />
              <span>LYAPUNOV STASIS DISSIPATION</span>
            </div>
            <div className="text-[11px] text-zinc-400 space-y-0.5">
              <div className="flex justify-between gap-3">
                <span>Frame Render Time:</span>
                <span className="text-white font-mono">{renderTimeMs.toFixed(1)} ms</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Culling Factor:</span>
                <span className="text-amber-400 font-mono">{lyapunovScale.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Arithmetic Mode:</span>
                <span className="text-emerald-300 font-mono">Q16.16 CORDIC</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Shard Target:</span>
                <span className="text-zinc-200 font-mono">/dev/fb0 RAW</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
