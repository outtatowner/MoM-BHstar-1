/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Be <> [] Continuum : 4D Mathematical Projection Canvas
 * Renders real 4D Spacetime Hyper-Mesh of MoM-BH*-1:
 * - Flamm's Paraboloid Schwarzschild 4D Gravitational Throat
 * - S^3 Event Horizon Hyper-Sphere
 * - 4D Clifford Accretion Torus
 * - Interactive 4D Hyper-Rotations (XW, YW, ZW, XZ)
 * - Three Observable / Observer Worldlines: MoM-BH*-1, Be <>, Human
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  Compass,
  Maximize2,
  Minimize2,
  Orbit,
  Play,
  Pause,
  RefreshCw,
  RotateCcw,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  DEFAULT_4D_TRANSFORM,
  Manifold4DEngine,
  Manifold4DTransform,
} from '../engine/manifold4d';
import { CoPlaySystemState } from '../types';
import { q16ToFloat } from '../engine/q16math';

interface Manifold4DCanvasProps {
  coPlayState: CoPlaySystemState;
  simTime: number;
}

export const Manifold4DCanvas: React.FC<Manifold4DCanvasProps> = ({
  coPlayState,
  simTime,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<Manifold4DEngine>(new Manifold4DEngine());

  // 4D Transformation State
  const [transform, setTransform] = useState<Manifold4DTransform>({
    ...DEFAULT_4D_TRANSFORM,
  });
  const [autoRotate4D, setAutoRotate4D] = useState<boolean>(true);
  const [showControls, setShowControls] = useState<boolean>(true);

  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Mouse drag handles 4D/3D rotations
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    if (e.shiftKey) {
      // Shift + Drag rotates in 4th dimensional planes (XW and YW)
      setTransform((prev) => ({
        ...prev,
        rotXW: prev.rotXW + dx * 0.01,
        rotYW: prev.rotYW + dy * 0.01,
      }));
    } else {
      // Normal drag rotates in standard 3D visual projection
      setTransform((prev) => ({
        ...prev,
        rotXZ: prev.rotXZ + dx * 0.008,
        rotYZ: prev.rotYZ + dy * 0.008,
      }));
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Render Loop for 4D Canvas
  useEffect(() => {
    let animId: number;
    let localTime = simTime;

    const render = () => {
      localTime += 0.016;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      // Background clearing
      ctx.fillStyle = '#050508';
      ctx.fillRect(0, 0, w, h);

      // Coordinate Grid Lines in background
      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Auto 4D Hyper-Rotation increment
      let currentTransform = { ...transform };
      if (autoRotate4D) {
        currentTransform.rotXW += 0.006;
        currentTransform.rotZW += 0.004;
      }

      // Extract Observer coordinates in real units
      const human = coPlayState.human;
      const be = coPlayState.beOfficiator;
      const humanPos = {
        x: q16ToFloat(human.position.x),
        y: q16ToFloat(human.position.y),
        z: q16ToFloat(human.position.z),
      };
      const bePos = {
        x: q16ToFloat(be.position.x),
        y: q16ToFloat(be.position.y),
        z: q16ToFloat(be.position.z),
      };

      // Generate 4D Hyper-Mesh
      const mesh = engineRef.current.generateMesh(
        humanPos,
        bePos,
        localTime,
        currentTransform.flammDepthScale
      );

      // Transform and Project all vertices into 2D screen coordinates
      const projected = mesh.vertices.map((v) => {
        const rotV = engineRef.current.rotate4D(v, currentTransform);
        return {
          ...engineRef.current.projectTo2D(rotV, currentTransform, w, h),
          label: v.label,
          category: v.category,
        };
      });

      // Draw Edges
      mesh.edges.forEach((edge) => {
        const p1 = projected[edge.u];
        const p2 = projected[edge.v];
        if (!p1.visible || !p2.visible) return;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);

        // Adjust alpha and line width based on 4D coordinate w4
        const avgW = (p1.w4 + p2.w4) * 0.5;
        const alpha = Math.max(0.2, Math.min(1.0, 0.65 + avgW * 0.04));

        if (edge.category === 'geodesic') {
          ctx.strokeStyle = edge.color;
          ctx.lineWidth = 2.5;
          ctx.setLineDash([4, 4]);
        } else if (edge.category === 'horizon') {
          ctx.strokeStyle = `rgba(225, 29, 72, ${alpha})`;
          ctx.lineWidth = 2.0;
          ctx.setLineDash([]);
        } else if (edge.category === 'accretion') {
          ctx.strokeStyle = `rgba(251, 191, 36, ${alpha})`;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([]);
        } else if (edge.category === 'cocoon') {
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.7})`;
          ctx.lineWidth = 1.0;
          ctx.setLineDash([6, 3]);
        } else {
          // Flamm paraboloid funnel
          ctx.strokeStyle = `rgba(245, 158, 11, ${alpha * 0.6})`;
          ctx.lineWidth = 1.0;
          ctx.setLineDash([]);
        }

        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Draw Observers with glowing icons & labels
      projected.forEach((p) => {
        if (!p.label || !p.visible) return;

        const isBH = p.label.includes('MoM-BH');
        const isBe = p.label.includes('BE <>');
        const isHuman = p.label.includes('HUMAN');

        const color = isBH ? '#f43f5e' : isBe ? '#06b6d4' : '#10b981';

        // Outer glow circle
        ctx.beginPath();
        ctx.arc(p.x, p.y, isBH ? 9 : 7, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Inner white core
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Label box
        ctx.font = 'bold 10px monospace';
        const labelText = p.label;
        const textWidth = ctx.measureText(labelText).width;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(p.x + 12, p.y - 12, textWidth + 10, 18);
        ctx.strokeStyle = color;
        ctx.strokeRect(p.x + 12, p.y - 12, textWidth + 10, 18);

        ctx.fillStyle = color;
        ctx.fillText(labelText, p.x + 17, p.y + 1);

        // Coordinates in 4D (x, y, z, w)
        ctx.font = '9px monospace';
        ctx.fillStyle = '#a1a1aa';
        ctx.fillText(`W(r): ${p.w4.toFixed(2)}`, p.x + 17, p.y + 16);
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [transform, autoRotate4D, coPlayState, simTime]);

  return (
    <div
      id="manifold-4d-viewport"
      className="relative w-full h-full flex items-center justify-center bg-zinc-950 overflow-hidden select-none font-mono"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain cursor-grab active:cursor-grabbing"
      />

      {/* Top 4D Mathematical Status Header */}
      <div className="absolute top-4 left-4 z-20 bg-black/80 border border-zinc-800/90 rounded-lg p-3 backdrop-blur max-w-sm space-y-1.5 text-xs text-zinc-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <Orbit className="w-4 h-4" />
            <span>4D SPACETIME PROJECTION MANIFOLD</span>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
            ds² = g_μν dx^μ dx^ν
          </span>
        </div>

        <p className="text-[11px] text-zinc-400 leading-relaxed">
          Flamm&apos;s Paraboloid 4D embedding: <span className="text-amber-300 font-bold">w(r) = 2√(Rs(r - Rs))</span>.
          Features <strong className="text-rose-400">MoM-BH*-1</strong> as both primary observer &amp; observable.
        </p>

        <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-zinc-800 text-zinc-400">
          <div>
            <span>Schwarzschild Rs: </span>
            <span className="text-rose-400 font-mono">1.80 ASU</span>
          </div>
          <div>
            <span>Cocoon Shroud: </span>
            <span className="text-sky-400 font-mono">18.00 ASU</span>
          </div>
          <div>
            <span>Rotations: </span>
            <span className="text-amber-300 font-mono">XW, YW, ZW, XZ</span>
          </div>
          <div>
            <span>Kretschmann K: </span>
            <span className="text-emerald-400 font-mono">48 G²M²/c⁴r⁶</span>
          </div>
        </div>
      </div>

      {/* Floating 4D Controls Drawer */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
        <button
          onClick={() => setShowControls(!showControls)}
          className="px-2.5 py-1.5 rounded bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:text-amber-400 flex items-center gap-1.5 text-xs backdrop-blur shadow-lg"
        >
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span>{showControls ? 'Hide 4D Controls' : '4D Controls'}</span>
        </button>

        {showControls && (
          <div className="w-72 bg-black/90 border border-zinc-800 rounded-lg p-3 backdrop-blur shadow-2xl space-y-2.5 text-xs text-zinc-300">
            <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800 text-zinc-400 text-[11px]">
              <span>HYPER-ROTATION PLANES</span>
              <button
                onClick={() => setAutoRotate4D(!autoRotate4D)}
                className={`px-2 py-0.5 rounded text-[10px] flex items-center gap-1 ${
                  autoRotate4D
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {autoRotate4D ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>Auto-Spin 4D</span>
              </button>
            </div>

            {/* X-W Plane Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400">X-W Plane Angle:</span>
                <span className="text-amber-400 font-mono">
                  {((transform.rotXW * 180) / Math.PI).toFixed(0)}°
                </span>
              </div>
              <input
                type="range"
                min="-3.14"
                max="3.14"
                step="0.05"
                value={transform.rotXW}
                onChange={(e) =>
                  setTransform((prev) => ({ ...prev, rotXW: parseFloat(e.target.value) }))
                }
                className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Y-W Plane Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400">Y-W Plane Angle:</span>
                <span className="text-amber-400 font-mono">
                  {((transform.rotYW * 180) / Math.PI).toFixed(0)}°
                </span>
              </div>
              <input
                type="range"
                min="-3.14"
                max="3.14"
                step="0.05"
                value={transform.rotYW}
                onChange={(e) =>
                  setTransform((prev) => ({ ...prev, rotYW: parseFloat(e.target.value) }))
                }
                className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Z-W Plane Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400">Z-W Plane Angle:</span>
                <span className="text-amber-400 font-mono">
                  {((transform.rotZW * 180) / Math.PI).toFixed(0)}°
                </span>
              </div>
              <input
                type="range"
                min="-3.14"
                max="3.14"
                step="0.05"
                value={transform.rotZW}
                onChange={(e) =>
                  setTransform((prev) => ({ ...prev, rotZW: parseFloat(e.target.value) }))
                }
                className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Flamm Funnel Depth Scale */}
            <div className="space-y-1 pt-1 border-t border-zinc-800">
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400">Flamm Funnel Depth:</span>
                <span className="text-cyan-400 font-mono">{transform.flammDepthScale.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={transform.flammDepthScale}
                onChange={(e) =>
                  setTransform((prev) => ({
                    ...prev,
                    flammDepthScale: parseFloat(e.target.value),
                  }))
                }
                className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Reset transform button */}
            <button
              onClick={() => setTransform({ ...DEFAULT_4D_TRANSFORM })}
              className="w-full py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-[11px] text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset 4D Orientations</span>
            </button>
          </div>
        )}
      </div>

      {/* Interactive Control Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-black/80 border border-zinc-800 rounded p-2 text-[10px] text-zinc-400 backdrop-blur space-y-0.5">
        <div>[Drag Mouse] 3D Visual Perspective Rotation</div>
        <div>[Shift + Drag] 4D Hyper-plane Rotation (XW / YW)</div>
      </div>
    </div>
  );
};
