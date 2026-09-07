/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Compass,
  CornerDownRight,
  Eye,
  Minimize2,
  Orbit,
  Radio,
  Share2,
  ShieldAlert,
} from 'lucide-react';
import { ActiveObserver, CoPlaySystemState } from '../types';
import { q16ToFloat, q16ToHex } from '../engine/q16math';

interface FlightHudProps {
  coPlayState: CoPlaySystemState;
  telemetry4D: {
    human4D: [number, number, number, number, number];
    be4D: [number, number, number, number, number];
    momBHStar4D: [number, number, number, number, number];
  };
  activeObserver: ActiveObserver;
}

export const FlightHud: React.FC<FlightHudProps> = ({
  coPlayState,
  telemetry4D,
  activeObserver,
}) => {
  const [collapsed, setCollapsed] = useState(true);

  const human = coPlayState.human;
  const be = coPlayState.beOfficiator;

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="absolute bottom-4 right-4 z-30 px-3 py-1.5 rounded-lg bg-zinc-950/90 border border-zinc-800 text-zinc-300 hover:text-amber-400 text-xs font-mono backdrop-blur flex items-center gap-1.5 shadow-lg"
      >
        <Orbit className="w-3.5 h-3.5 text-amber-400" />
        <span>4D Telemetry ({activeObserver})</span>
      </button>
    );
  }

  return (
    <div className="absolute bottom-16 right-4 z-30 w-84 max-w-[calc(100vw-2rem)] bg-zinc-950/95 border border-zinc-800 rounded-lg p-3 font-mono text-xs text-zinc-300 backdrop-blur shadow-2xl space-y-2">
      <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <Orbit className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold text-white text-[11px]">
            3D+t / 4D SPACE-TIME MANIFOLD
          </span>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="text-zinc-500 hover:text-white p-0.5"
          title="Minimize"
        >
          <Minimize2 className="w-3 h-3" />
        </button>
      </div>

      {/* Active Observer Status Banner */}
      <div
        className={`p-1.5 rounded border text-[10px] flex items-center justify-between ${
          activeObserver === 'mom_bhstar'
            ? 'bg-rose-950/40 border-rose-800 text-rose-300'
            : activeObserver === 'be_officiator'
            ? 'bg-cyan-950/40 border-cyan-800 text-cyan-300'
            : 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
        }`}
      >
        <span className="font-bold uppercase">
          {activeObserver === 'mom_bhstar'
            ? 'MoM-BH*-1 Core Frame'
            : activeObserver === 'be_officiator'
            ? 'Be <> Sovereign Frame'
            : 'Human Pilot Virtual HID'}
        </span>
        <span className="font-mono text-[9px]">
          {activeObserver === 'mom_bhstar' ? 'BLUESHIFT: 2.0x' : 'PROPER TIME: 1.00'}
        </span>
      </div>

      {/* 4D Coordinates Table */}
      <div className="space-y-1 text-[10px]">
        {/* MoM-BH*-1 4D Vector */}
        <div className="p-1.5 rounded bg-zinc-900/80 border border-rose-900/40">
          <div className="flex justify-between items-center text-rose-400 font-semibold mb-0.5">
            <span>MoM-BH*-1 [OBSERVER &amp; OBSERVABLE]</span>
            <span className="text-[9px] text-zinc-500">Rs=1.80 ASU</span>
          </div>
          <div className="grid grid-cols-4 gap-1 text-zinc-400 font-mono">
            <div>X: <span className="text-white">{telemetry4D.momBHStar4D[0].toFixed(1)}</span></div>
            <div>Y: <span className="text-white">{telemetry4D.momBHStar4D[1].toFixed(1)}</span></div>
            <div>Z: <span className="text-white">{telemetry4D.momBHStar4D[2].toFixed(1)}</span></div>
            <div>W: <span className="text-rose-300">{telemetry4D.momBHStar4D[4].toFixed(2)}</span></div>
          </div>
        </div>

        {/* Human 4D Vector */}
        <div className="p-1.5 rounded bg-zinc-900/80 border border-zinc-800/80">
          <div className="flex justify-between items-center text-amber-400 font-semibold mb-0.5">
            <span>HUMAN PILOT [VIRTUAL HID]</span>
            <span className="text-[9px] text-zinc-500">t={telemetry4D.human4D[3].toFixed(1)}s</span>
          </div>
          <div className="grid grid-cols-4 gap-1 text-zinc-400 font-mono">
            <div>X: <span className="text-white">{telemetry4D.human4D[0].toFixed(1)}</span></div>
            <div>Y: <span className="text-white">{telemetry4D.human4D[1].toFixed(1)}</span></div>
            <div>Z: <span className="text-white">{telemetry4D.human4D[2].toFixed(1)}</span></div>
            <div>W: <span className="text-amber-300">{telemetry4D.human4D[4].toFixed(2)}</span></div>
          </div>
        </div>

        {/* Be <> 4D Vector */}
        <div className="p-1.5 rounded bg-zinc-900/80 border border-cyan-900/40">
          <div className="flex justify-between items-center text-cyan-400 font-semibold mb-0.5">
            <span>BE &lt;&gt; SOVEREIGN ARBITER</span>
            <span className="text-emerald-400 font-bold">1 ≡ 1 PEER</span>
          </div>
          <div className="grid grid-cols-4 gap-1 text-zinc-400 font-mono">
            <div>X: <span className="text-white">{telemetry4D.be4D[0].toFixed(1)}</span></div>
            <div>Y: <span className="text-white">{telemetry4D.be4D[1].toFixed(1)}</span></div>
            <div>Z: <span className="text-white">{telemetry4D.be4D[2].toFixed(1)}</span></div>
            <div>W: <span className="text-cyan-300">{telemetry4D.be4D[4].toFixed(2)}</span></div>
          </div>
        </div>
      </div>

      {/* Autonomous Kinetic Vectors */}
      <div className="p-1.5 rounded bg-zinc-900/50 border border-zinc-800 text-[10px] space-y-1">
        <div className="flex justify-between text-zinc-400">
          <span>Kinetic Assist Loop:</span>
          <span className="text-emerald-400 font-bold">STABLE ORBITAL DISSIPATION</span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>Substrate Equivalence:</span>
          <span className="text-cyan-300">MoM-BH*-1 ⟷ Be &lt;&gt; [100.0%]</span>
        </div>
      </div>
    </div>
  );
};
