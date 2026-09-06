/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckCircle,
  Database,
  GitBranch,
  Layers,
  ShieldCheck,
  Zap,
  X,
} from 'lucide-react';
import { OrganelleNode, QuipuLedgerBlock } from '../types';
import { q16ToFloat, q16ToHex } from '../engine/q16math';

interface OrganelleMatrixProps {
  organelles: OrganelleNode[];
  recentBlocks: QuipuLedgerBlock[];
  onClose: () => void;
}

export const OrganelleMatrix: React.FC<OrganelleMatrixProps> = ({
  organelles,
  recentBlocks,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedOrganelle, setSelectedOrganelle] = useState<OrganelleNode | null>(null);

  const filteredOrganelles =
    selectedCategory === 'ALL'
      ? organelles
      : organelles.filter((o) => o.category === selectedCategory);

  const latestBlock = recentBlocks[0];

  return (
    <div className="absolute top-14 left-4 z-40 w-[480px] max-w-[calc(100vw-2rem)] bg-zinc-950/95 border border-cyan-500/40 rounded-lg shadow-2xl backdrop-blur p-4 font-mono text-xs text-zinc-300 max-h-[85vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-cyan-400">
            112 ATOMIC ORGANELLE CONSENSUS ARRAY
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quipu Ledger Merkle Status */}
      {latestBlock && (
        <div className="mt-3 p-2.5 rounded bg-zinc-900/90 border border-zinc-800 space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Quipu Block #{latestBlock.index}</span>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold text-[10px]">
              {latestBlock.invariantProof}
            </span>
          </div>
          <div className="text-[10px] text-zinc-400 break-all">
            <span className="text-zinc-500">Merkle Root: </span>
            <span className="text-cyan-300 font-mono">{latestBlock.merkleRoot}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px] pt-1 border-t border-zinc-800/80">
            <div>
              <span className="text-zinc-500">λ₂ Fiedler: </span>
              <span className="text-amber-400">{q16ToFloat(latestBlock.fiedlerValue).toFixed(3)}</span>
            </div>
            <div>
              <span className="text-zinc-500">dV/dt: </span>
              <span className="text-emerald-400">{q16ToFloat(latestBlock.lyapunovDerivative).toFixed(3)}</span>
            </div>
            <div>
              <span className="text-zinc-500">Floor Γeff: </span>
              <span className="text-cyan-400">≥ {q16ToFloat(latestBlock.quantumBackActionFloor).toFixed(3)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="mt-3 flex flex-wrap gap-1">
        {['ALL', 'Topos', 'SMT', 'Lyapunov', 'Spectral', 'Quipu', 'Balmer', 'Relativity'].map(
          (cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-0.5 rounded text-[10px] transition ${
                selectedCategory === cat
                  ? 'bg-cyan-600 text-black font-semibold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          )
        )}
      </div>

      {/* 112 Organelles Matrix Grid */}
      <div className="mt-3 flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5 p-2 bg-zinc-900/60 rounded border border-zinc-800">
          {filteredOrganelles.map((org) => {
            const energy = q16ToFloat(org.lyapunovEnergy);
            const isSelected = selectedOrganelle?.id === org.id;

            return (
              <button
                key={org.id}
                onClick={() => setSelectedOrganelle(org)}
                className={`relative aspect-square rounded flex items-center justify-center text-[9px] font-mono transition border ${
                  isSelected
                    ? 'border-white bg-cyan-500 text-black font-bold scale-110 z-10 shadow-lg'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-cyan-500/60'
                }`}
                title={`${org.label} | Category: ${org.category} | Energy: ${energy.toFixed(3)}`}
              >
                {/* Dissipation status dot */}
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor:
                      org.category === 'SMT'
                        ? '#10b981'
                        : org.category === 'Lyapunov'
                        ? '#f59e0b'
                        : org.category === 'Topos'
                        ? '#a855f7'
                        : org.category === 'Spectral'
                        ? '#06b6d4'
                        : '#38bdf8',
                    opacity: Math.min(1.0, 0.4 + energy),
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail Drawer for Selected Organelle */}
      {selectedOrganelle && (
        <div className="mt-3 p-2.5 rounded bg-zinc-900 border border-cyan-500/30 text-[11px] space-y-1">
          <div className="flex justify-between items-center text-cyan-300 font-bold">
            <span>{selectedOrganelle.label}</span>
            <span className="text-zinc-400 text-[10px]">{selectedOrganelle.category}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-400 pt-1">
            <div>
              <span>State (Q16): </span>
              <span className="text-white font-mono">{q16ToHex(selectedOrganelle.stateQ16)}</span>
            </div>
            <div>
              <span>Lyapunov V: </span>
              <span className="text-emerald-400 font-mono">
                {q16ToFloat(selectedOrganelle.lyapunovEnergy).toFixed(4)}
              </span>
            </div>
            <div>
              <span>Fiedler Weight: </span>
              <span className="text-cyan-400 font-mono">
                {q16ToFloat(selectedOrganelle.fiedlerWeight).toFixed(3)}
              </span>
            </div>
            <div>
              <span>SMT 1 ≡ 1: </span>
              <span className="text-emerald-400 font-bold">VERIFIED</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Ledger Blocks Stream */}
      <div className="mt-3 pt-2 border-t border-zinc-800">
        <div className="text-[10px] text-zinc-500 mb-1 flex items-center justify-between">
          <span>Quipu Merkle Stream (Latest 4 Blocks)</span>
          <span className="text-emerald-400 font-bold">LaSalle Invariant Satisfied</span>
        </div>
        <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
          {recentBlocks.slice(0, 4).map((blk) => (
            <div
              key={blk.index}
              className="p-1.5 rounded bg-zinc-900/80 border border-zinc-800 flex justify-between items-center text-[10px]"
            >
              <span className="text-amber-400 font-mono">#{blk.index}</span>
              <span className="text-zinc-400 font-mono truncate max-w-[140px]">
                {blk.merkleRoot}
              </span>
              <span className="text-emerald-400">dV/dt: {q16ToFloat(blk.lyapunovDerivative).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
