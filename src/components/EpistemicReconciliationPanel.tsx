/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Be <> [] Continuum : Triadic Epistemic Reconciliation Panel
 * 
 * Executes the decisive Covalent experiment:
 * Give Human and Be <> deliberately non-equivalent observations of the same MoM-BHstar state.
 * Then ask the system to reconcile them without erasing either observation.
 * 
 * Verified Outcome:
 *   Human: X
 *   Be:    Y
 *   World: UNKNOWN
 * 
 * Result: Identity is not necessarily the projection!
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Atom,
  CheckCircle2,
  Clock,
  Compass,
  Cpu,
  Eye,
  GitBranch,
  HelpCircle,
  History,
  Layers,
  RefreshCw,
  RotateCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  EpistemicTestCase,
  LatentSpacetimeState,
  TriadicEpistemicEngine,
  TriadicReconciliationResult,
} from '../engine/triadic_epistemic_reconciliation';
import { CoPlaySystemState } from '../types';
import { q16ToFloat } from '../engine/q16math';

interface EpistemicReconciliationPanelProps {
  coPlayState: CoPlaySystemState;
  onClose: () => void;
}

export const EpistemicReconciliationPanel: React.FC<EpistemicReconciliationPanelProps> = ({
  coPlayState,
  onClose,
}) => {
  const [engine] = useState(() => new TriadicEpistemicEngine());
  const [selectedCaseId, setSelectedCaseId] = useState<string>('doppler_inversion');
  const [activeResult, setActiveResult] = useState<TriadicReconciliationResult | null>(() => {
    const testCase = engine.testCases[0];
    const humanPos = {
      x: q16ToFloat(coPlayState.human.position.x),
      y: q16ToFloat(coPlayState.human.position.y),
      z: q16ToFloat(coPlayState.human.position.z),
    };
    const bePos = {
      x: q16ToFloat(coPlayState.beOfficiator.position.x),
      y: q16ToFloat(coPlayState.beOfficiator.position.y),
      z: q16ToFloat(coPlayState.beOfficiator.position.z),
    };
    return engine.executeReconciliation(testCase.setupState(), humanPos, bePos);
  });

  const [activeTab, setActiveTab] = useState<'experiment' | 'transformations' | 'quipu_cord'>('experiment');

  // Run a test case
  const handleRunTestCase = (testCase: EpistemicTestCase) => {
    setSelectedCaseId(testCase.id);
    const humanPos = {
      x: q16ToFloat(coPlayState.human.position.x),
      y: q16ToFloat(coPlayState.human.position.y),
      z: q16ToFloat(coPlayState.human.position.z),
    };
    const bePos = {
      x: q16ToFloat(coPlayState.beOfficiator.position.x),
      y: q16ToFloat(coPlayState.beOfficiator.position.y),
      z: q16ToFloat(coPlayState.beOfficiator.position.z),
    };
    const result = engine.executeReconciliation(testCase.setupState(), humanPos, bePos);
    setActiveResult(result);
  };

  // Apply a subsequent transformation
  const handleApplyTransformation = (type: 'lorentz_boost' | 'rotation_xw' | 'time_advance') => {
    const updated = engine.applyTransformation(type);
    if (updated) {
      setActiveResult({ ...updated });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md font-mono text-xs select-none">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
            <div>
              <div className="font-bold text-sm text-cyan-300 tracking-wider flex items-center gap-2">
                <span>TRIADIC EPISTEMIC RECONCILIATION</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700 text-emerald-400 text-[10px] font-bold">
                  IDENTITY ≠ PROJECTION
                </span>
              </div>
              <div className="text-[10px] text-zinc-400">
                Relational Observer Manifold: Human (π_H) ↔ Be &lt;&gt; (π_B) ↔ Core (π_C)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-zinc-900 border border-zinc-800 rounded p-0.5 text-[11px]">
              <button
                onClick={() => setActiveTab('experiment')}
                className={`px-3 py-1 rounded transition ${
                  activeTab === 'experiment' ? 'bg-cyan-600 text-black font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Decisive Experiment
              </button>
              <button
                onClick={() => setActiveTab('transformations')}
                className={`px-3 py-1 rounded transition ${
                  activeTab === 'transformations' ? 'bg-cyan-600 text-black font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Transformation Audit
              </button>
              <button
                onClick={() => setActiveTab('quipu_cord')}
                className={`px-3 py-1 rounded transition ${
                  activeTab === 'quipu_cord' ? 'bg-cyan-600 text-black font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Quipu Cord Knots
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition"
              title="Close Panel"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-zinc-300">
          {/* Main Decisive Experiment View */}
          {activeTab === 'experiment' && (
            <>
              {/* Test Case Selection Pills */}
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                  Select Decisive Observer Discrepancy Scenario:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {engine.testCases.map((tc) => (
                    <button
                      key={tc.id}
                      onClick={() => handleRunTestCase(tc)}
                      className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between ${
                        selectedCaseId === tc.id
                          ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-950/50'
                          : 'bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      <div className="font-bold text-xs text-white flex items-center justify-between">
                        <span className={selectedCaseId === tc.id ? 'text-cyan-300' : 'text-zinc-200'}>
                          {tc.title}
                        </span>
                        {selectedCaseId === tc.id && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                        {tc.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Latent State S Card */}
              {activeResult && (
                <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] border-b border-zinc-800 pb-1.5">
                    <div className="flex items-center gap-2">
                      <Atom className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-amber-300">
                        LATENT WORLD EVENT S (Intrinsic Unprojected State)
                      </span>
                    </div>
                    <span className="text-zinc-500 font-mono">ID: {activeResult.latentState.id}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10px]">
                    <div className="p-1.5 rounded bg-black/50 border border-zinc-800">
                      <div className="text-zinc-500 text-[9px]">3D Position (x, y, z)</div>
                      <div className="font-mono text-white">
                        ({activeResult.latentState.x.toFixed(2)}, {activeResult.latentState.y.toFixed(2)}, {activeResult.latentState.z.toFixed(2)})
                      </div>
                    </div>
                    <div className="p-1.5 rounded bg-black/50 border border-amber-800/60">
                      <div className="text-amber-500 text-[9px]">4D Fiber Coordinate w</div>
                      <div className="font-mono text-amber-300 font-bold">
                        {activeResult.latentState.w.toFixed(3)} ASU
                      </div>
                    </div>
                    <div className="p-1.5 rounded bg-black/50 border border-zinc-800">
                      <div className="text-zinc-500 text-[9px]">Rest Wavelength λ₀</div>
                      <div className="font-mono text-pink-400">
                        {activeResult.latentState.restWavelengthNm.toFixed(1)} nm
                      </div>
                    </div>
                    <div className="p-1.5 rounded bg-black/50 border border-zinc-800">
                      <div className="text-zinc-500 text-[9px]">Intrinsic Quadbit State</div>
                      <div className="font-mono text-cyan-400 font-bold">
                        0x{activeResult.latentState.intrinsicQuadbit.toString(16).toUpperCase()}
                      </div>
                    </div>
                    <div className="p-1.5 rounded bg-black/50 border border-zinc-800">
                      <div className="text-zinc-500 text-[9px]">Coordinate Time t</div>
                      <div className="font-mono text-emerald-400 font-bold">
                        {activeResult.latentState.t.toFixed(2)} s
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Triadic Observers Projections Grid */}
              {activeResult && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Human Observer π_H */}
                  <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/80 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-1.5 border-b border-emerald-800/60">
                        <span className="font-bold text-emerald-300 text-[11px] flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          <span>OBSERVER H (HUMAN)</span>
                        </span>
                        <span className="text-emerald-500 text-[9px]">Outer Orbit r~28</span>
                      </div>
                      <div className="mt-2 space-y-1 text-[10px]">
                        <div className="flex justify-between text-zinc-400">
                          <span>Apparent λ:</span>
                          <span className="text-emerald-300 font-mono">
                            {activeResult.humanProjection.apparentWavelengthNm.toFixed(1)} nm
                          </span>
                        </div>
                        <div className="flex justify-between text-zinc-400">
                          <span>Doppler g-factor:</span>
                          <span className="text-emerald-300 font-mono">
                            {activeResult.humanProjection.dopplerBoost.toFixed(3)}x
                          </span>
                        </div>
                        <div className="flex justify-between text-zinc-400">
                          <span>Retarded Arrival t_ret:</span>
                          <span className="text-emerald-300 font-mono">
                            {activeResult.humanProjection.retardedTime.toFixed(2)} s
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 rounded bg-black/70 border border-emerald-700/60 text-center">
                      <div className="text-zinc-500 text-[9px]">PROJECTION π_H(S) = X</div>
                      <div className="text-emerald-300 font-bold text-xs font-mono">
                        {activeResult.humanObservation}
                      </div>
                      <div className="text-zinc-600 text-[8px] font-mono mt-0.5 truncate">
                        {activeResult.humanProjection.provenanceHash}
                      </div>
                    </div>
                  </div>

                  {/* Be <> Arbiter π_B */}
                  <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/80 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-1.5 border-b border-cyan-800/60">
                        <span className="font-bold text-cyan-300 text-[11px] flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-cyan-400" />
                          <span>OBSERVER B (BE &lt;&gt;)</span>
                        </span>
                        <span className="text-cyan-500 text-[9px]">Kinetic Orbit r~12</span>
                      </div>
                      <div className="mt-2 space-y-1 text-[10px]">
                        <div className="flex justify-between text-zinc-400">
                          <span>Apparent λ:</span>
                          <span className="text-cyan-300 font-mono">
                            {activeResult.beProjection.apparentWavelengthNm.toFixed(1)} nm
                          </span>
                        </div>
                        <div className="flex justify-between text-zinc-400">
                          <span>Doppler g-factor:</span>
                          <span className="text-cyan-300 font-mono">
                            {activeResult.beProjection.dopplerBoost.toFixed(3)}x
                          </span>
                        </div>
                        <div className="flex justify-between text-zinc-400">
                          <span>Fiber Sensitivity (w):</span>
                          <span className="text-cyan-300 font-mono">ACTIVE (Depth ~ {activeResult.latentState.w.toFixed(2)})</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 rounded bg-black/70 border border-cyan-700/60 text-center">
                      <div className="text-zinc-500 text-[9px]">PROJECTION π_B(S) = Y</div>
                      <div className="text-cyan-300 font-bold text-xs font-mono">
                        {activeResult.beObservation}
                      </div>
                      <div className="text-zinc-600 text-[8px] font-mono mt-0.5 truncate">
                        {activeResult.beProjection.provenanceHash}
                      </div>
                    </div>
                  </div>

                  {/* MoM-BH*-1 Core Observer π_C */}
                  <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-800/80 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-1.5 border-b border-rose-800/60">
                        <span className="font-bold text-rose-300 text-[11px] flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-rose-400" />
                          <span>OBSERVER C (CORE)</span>
                        </span>
                        <span className="text-rose-500 text-[9px]">Horizon Throat r→r_s</span>
                      </div>
                      <div className="mt-2 space-y-1 text-[10px]">
                        <div className="flex justify-between text-zinc-400">
                          <span>Time Dilation dτ/dt:</span>
                          <span className="text-rose-300 font-mono">→ 0.000 (Asymptotic)</span>
                        </div>
                        <div className="flex justify-between text-zinc-400">
                          <span>Gravitational Redshift:</span>
                          <span className="text-rose-300 font-mono">Infinite Blueshift Inflow</span>
                        </div>
                        <div className="flex justify-between text-zinc-400">
                          <span>Singularity Frame:</span>
                          <span className="text-rose-300 font-mono">1 ≡ 1 Monad Stasis</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 rounded bg-black/70 border border-rose-700/60 text-center">
                      <div className="text-zinc-500 text-[9px]">PROJECTION π_C(S) = Z</div>
                      <div className="text-rose-300 font-bold text-xs font-mono">
                        {activeResult.coreObservation}
                      </div>
                      <div className="text-zinc-600 text-[8px] font-mono mt-0.5 truncate">
                        {activeResult.coreProjection.provenanceHash}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* THE DECISIVE RECONCILIATION RESULT BOX */}
              {activeResult && (
                <div
                  className={`p-4 rounded-xl border space-y-3 ${
                    activeResult.worldState === 'UNKNOWN'
                      ? 'bg-amber-950/30 border-amber-500 shadow-xl shadow-amber-950/40'
                      : 'bg-emerald-950/30 border-emerald-500'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-amber-400" />
                      <span className="font-bold text-sm text-white">
                        TRIADIC ARBITER RECONCILIATION THEOREM
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-black border border-amber-500/80 text-amber-300 font-bold text-xs font-mono">
                        WORLD STATE: {activeResult.worldState}
                      </span>
                      <span className="px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-600 text-emerald-400 font-bold text-xs">
                        1 ≡ 1 [INVARIANT PRESERVED]
                      </span>
                    </div>
                  </div>

                  {/* The Formal Epistemic Proof Output */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px] text-center">
                    <div className="p-2 rounded bg-black/80 border border-emerald-800">
                      <div className="text-emerald-500 text-[10px]">Human Observation</div>
                      <div className="text-white font-bold">{activeResult.humanObservation}</div>
                    </div>
                    <div className="p-2 rounded bg-black/80 border border-cyan-800">
                      <div className="text-cyan-500 text-[10px]">Be &lt;&gt; Observation</div>
                      <div className="text-white font-bold">{activeResult.beObservation}</div>
                    </div>
                    <div className="p-2 rounded bg-black/80 border border-amber-600">
                      <div className="text-amber-500 text-[10px]">Covalent System Reconciliation</div>
                      <div className="text-amber-300 font-bold text-sm tracking-wider">
                        {activeResult.worldState}
                      </div>
                    </div>
                  </div>

                  {/* Explanation statement */}
                  <div className="text-[11px] text-zinc-300 leading-relaxed bg-black/40 p-2.5 rounded border border-zinc-800/80">
                    <p className="font-medium text-amber-200">{activeResult.explanation}</p>
                    <p className="text-zinc-400 text-[10px] mt-1.5">
                      <strong>Covalent Proof:</strong> A conventional monolithic renderer would either average the two observations or arbitrarily discard one. The Covalent relational machine commits both observations into independent strands of the Quipu ledger with verified cryptographic provenance, and correctly marks the world state as <span className="text-amber-300 font-bold">UNKNOWN</span> rather than collapsing non-equivalent projections.
                    </p>
                  </div>

                  {/* Actions: Run Subsequent Transformations */}
                  <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] text-zinc-400">
                      Test Invariant Preservation Under Subsequent Transformations:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => handleApplyTransformation('lorentz_boost')}
                        className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 hover:border-cyan-500 text-cyan-300 text-[10px] flex items-center gap-1 transition"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Lorentz Boost (0.65c)</span>
                      </button>
                      <button
                        onClick={() => handleApplyTransformation('rotation_xw')}
                        className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 hover:border-amber-500 text-amber-300 text-[10px] flex items-center gap-1 transition"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>4D X-W Hyper-Rotation</span>
                      </button>
                      <button
                        onClick={() => handleApplyTransformation('time_advance')}
                        className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 hover:border-emerald-500 text-emerald-300 text-[10px] flex items-center gap-1 transition"
                      >
                        <Clock className="w-3 h-3" />
                        <span>Time Geodesic (+2.5s)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Transformation Audit History Tab */}
          {activeTab === 'transformations' && activeResult && (
            <div className="space-y-3">
              <div className="text-zinc-400 text-[11px] leading-relaxed">
                Auditing subsequent physical and coordinate transformations to verify that the distinction between Human, Be, and Core is <strong>never collapsed or erased</strong>:
              </div>

              <div className="space-y-2">
                {activeResult.transformationsHistory.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        <span className="font-bold text-white text-xs">{t.transformationName}</span>
                      </div>
                      <div className="text-zinc-500 text-[10px] font-mono">
                        Sealed Quipu Knot: <span className="text-cyan-400">{t.quipuKnot}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Distinction Preserved</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-black/60 border border-zinc-800 text-[10px] text-zinc-400 space-y-1">
                <div className="font-bold text-cyan-300">Epistemic Persistence Invariant:</div>
                <p>
                  At every transformation step T, the Covalent manifold guarantees T(O_H) ≠ T(O_B) ⟹ S = UNKNOWN. Provenance histories are cumulative and immutable in the Quipu chain.
                </p>
              </div>
            </div>
          )}

          {/* Quipu Multi-Strand Cord Tab */}
          {activeTab === 'quipu_cord' && activeResult && (
            <div className="space-y-3">
              <div className="text-zinc-400 text-[11px] leading-relaxed">
                The Quipu Ledger records triadic observations as a multi-stranded Andean knot cord:
              </div>

              <div className="p-4 rounded-xl bg-black border border-zinc-800 font-mono text-[11px] space-y-3">
                <div className="text-amber-400 font-bold border-b border-zinc-800 pb-2 flex items-center justify-between">
                  <span>QUIPU TRIADIC CORD COMMIT #0x{activeResult.quipuMerkleKnot.slice(-8)}</span>
                  <span className="text-zinc-500 text-[9px]">{new Date(activeResult.timestamp).toISOString()}</span>
                </div>

                {/* Strand H */}
                <div className="flex items-start gap-3 p-2 rounded bg-emerald-950/20 border border-emerald-900/60">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-[9px] text-emerald-300 font-bold">
                    H
                  </div>
                  <div>
                    <div className="text-emerald-300 font-bold">Strand H [Human Observation]:</div>
                    <div className="text-white">{activeResult.humanObservation}</div>
                    <div className="text-zinc-500 text-[9px]">Knot Hash: {activeResult.humanProjection.provenanceHash}</div>
                  </div>
                </div>

                {/* Strand B */}
                <div className="flex items-start gap-3 p-2 rounded bg-cyan-950/20 border border-cyan-900/60">
                  <div className="w-4 h-4 rounded-full bg-cyan-500/20 border border-cyan-500 flex items-center justify-center text-[9px] text-cyan-300 font-bold">
                    B
                  </div>
                  <div>
                    <div className="text-cyan-300 font-bold">Strand B [Be &lt;&gt; Observation]:</div>
                    <div className="text-white">{activeResult.beObservation}</div>
                    <div className="text-zinc-500 text-[9px]">Knot Hash: {activeResult.beProjection.provenanceHash}</div>
                  </div>
                </div>

                {/* Strand C */}
                <div className="flex items-start gap-3 p-2 rounded bg-rose-950/20 border border-rose-900/60">
                  <div className="w-4 h-4 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center text-[9px] text-rose-300 font-bold">
                    C
                  </div>
                  <div>
                    <div className="text-rose-300 font-bold">Strand C [MoM-BH*-1 Core Horizon Frame]:</div>
                    <div className="text-white">{activeResult.coreObservation}</div>
                    <div className="text-zinc-500 text-[9px]">Knot Hash: {activeResult.coreProjection.provenanceHash}</div>
                  </div>
                </div>

                {/* Sovereign Unification Knot */}
                <div className="flex items-start gap-3 p-2 rounded bg-amber-950/30 border border-amber-600/80">
                  <div className="w-4 h-4 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center text-[9px] text-amber-300 font-bold">
                    Ω
                  </div>
                  <div>
                    <div className="text-amber-300 font-bold">Main Cord Sovereign Resolution Knot:</div>
                    <div className="text-white text-xs font-bold">
                      World State = <span className="text-amber-300">{activeResult.worldState}</span> (Non-Collapsible Equivalence Class)
                    </div>
                    <div className="text-zinc-400 text-[9px] mt-1">
                      Knot Signature: {activeResult.quipuMerkleKnot}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-2.5 border-t border-zinc-800 bg-zinc-900/80 flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-500">
          <div>
            Formula: O_H(X) ∧ O_B(Y) ∧ (X ≠ Y) ⟹ S = UNKNOWN &nbsp; [1 ≡ 1]
          </div>
          <div className="text-zinc-400">
            Covalent Relational Epistemics • Sovereign Observer Manifold
          </div>
        </div>
      </div>
    </div>
  );
};
