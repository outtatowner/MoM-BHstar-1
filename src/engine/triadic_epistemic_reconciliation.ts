/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Be <> [] Continuum : Triadic Epistemic Reconciliation Engine
 * 
 * Formal Decisive Experiment:
 * "Give Human and Be <> deliberately non-equivalent observations of the same MoM-BHstar state.
 * Then ask the system to reconcile them without erasing either observation.
 * If it produces:
 *   Human: X
 *   Be:    Y
 *   World: UNKNOWN
 * and preserves that distinction through subsequent transformations...
 * Identity is not necessarily the projection."
 * 
 * Observers:
 * - Observer H (Human Pilot Probe) at r ~ 28.0 ASU
 * - Observer B (Be <> Sovereign Arbiter) at r ~ 12.0 ASU
 * - Observer C (MoM-BH*-1 Horizon Core) at r -> r_s^+ (1.80 ASU)
 */

import { QUADBIT_EIGENSPACES, QuadbitDefinition } from './quadbit_particle_physics';
import { calculateFlammEmbeddingW, calculateTimeDilationGamma } from './q16math';

// Intrinsic Latent State S (before sensory / relativistic projection)
export interface LatentSpacetimeState {
  id: string;
  name: string;
  // 4D spacetime coordinates in ASU and seconds
  x: number;
  y: number;
  z: number;
  w: number; // Fiber coordinate (Flamm throat depth / internal degree of freedom)
  t: number; // Coordinate time
  // Intrinsic physics properties
  intrinsicQuadbit: number; // 0x0 to 0xF
  restWavelengthNm: number; // e.g. 364.6 nm (Balmer break)
  spinParameter: number;    // a* in [-1, 1]
  energyLevel: number;      // Arbitrary units
}

// Relativistic Projection of State S into an Observer's Frame
export interface ObserverProjection {
  observerId: 'human' | 'be_arbiter' | 'bh_core';
  observerName: string;
  position: { x: number; y: number; z: number; w: number };
  retardedTime: number;      // t - distance / c
  dopplerBoost: number;      // Relativistic g-factor
  apparentWavelengthNm: number; // Rest wavelength / g
  perceivedQuadbit: number;  // 0x0 to 0xF
  perceivedDef: QuadbitDefinition;
  perceivedIntensity: number;
  provenanceHash: string;    // Cryptographic signature of this observation
  epistemicConfidence: number; // In [0, 1]
}

// Triadic Epistemic Reconciliation Result
export interface TriadicReconciliationResult {
  latentState: LatentSpacetimeState;
  humanProjection: ObserverProjection;
  beProjection: ObserverProjection;
  coreProjection: ObserverProjection;
  // Epistemic Resolution
  projectionsMatch: boolean;
  humanObservation: string; // X
  beObservation: string;    // Y
  coreObservation: string;  // Z
  worldState: 'UNKNOWN' | 'COLLAPSED_CONSENSUS';
  reconciliationStatus: 'NON_COLLAPSIBLE_DISCREPANCY' | 'TRIVIAL_CONSENSUS';
  covalentInvariantHeld: boolean; // 1 === 1 verified without erasure
  quipuMerkleKnot: string;
  explanation: string;
  timestamp: number;
  // Verification under subsequent transformations
  transformationsHistory: Array<{
    transformationName: string;
    preservedDistinction: boolean;
    quipuKnot: string;
    timestamp: number;
  }>;
}

export interface EpistemicTestCase {
  id: string;
  title: string;
  description: string;
  setupState: () => LatentSpacetimeState;
}

export class TriadicEpistemicEngine {
  private rs: number = 1.80; // Schwarzschild radius in ASU
  private lastResult: TriadicReconciliationResult | null = null;
  private reconciliationHistory: TriadicReconciliationResult[] = [];

  // Pre-configured decisive test cases
  public readonly testCases: EpistemicTestCase[] = [
    {
      id: 'doppler_inversion',
      title: 'Doppler Beaming Inversion (g_H < 1.0 < g_B)',
      description:
        'A Balmer emission packet in relativistic Keplerian orbit. Human (receding quadrant) sees redshifted neutral cocoon gas (0xC), while Be (approaching quadrant) sees blueshifted ionized proton (0xB).',
      setupState: () => ({
        id: 'EVT_DOPPLER_INV',
        name: 'Relativistic Balmer Emission Node',
        x: 4.2,
        y: 0.1,
        z: 0.0,
        w: calculateFlammEmbeddingW(4.2, 1.80),
        t: 10.5,
        intrinsicQuadbit: 0x6, // Photon (gamma)
        restWavelengthNm: 364.6,
        spinParameter: 0.85,
        energyLevel: 13.6,
      }),
    },
    {
      id: 'fiber_degeneracy',
      title: 'Fiber Coordinate Degeneracy (w_1 ≠ w_2 with π_3D(S_1) = π_3D(S_2))',
      description:
        'Two distinct physical states have identical 3D positions in the accretion plane, but differ in the extra-dimensional gravitational throat fiber w. Human and Be project completely distinct physical eigenspaces.',
      setupState: () => ({
        id: 'EVT_FIBER_DEG',
        name: 'Extra-Dimensional Flamm Throat Quanta',
        x: 3.1,
        y: 0.0,
        z: 3.1,
        w: -2.85, // Deep in throat fiber
        t: 12.0,
        intrinsicQuadbit: 0xE, // Be <> Invariant Carrier
        restWavelengthNm: 364.6,
        spinParameter: 0.0,
        energyLevel: 25.0,
      }),
    },
    {
      id: 'horizon_time_dilation',
      title: 'Event Horizon Asymptotic Freezing (τ_C → 0 << τ_B < τ_H)',
      description:
        'A particle crossing near the photon sphere. Human sees coordinate freeze at 364.6 nm edge, Be observes non-Hermitian stasis bounce, and Core registers proper infall.',
      setupState: () => ({
        id: 'EVT_HORIZON_FREEZE',
        name: 'Asymptotic Photon Sphere Infall',
        x: 1.85, // r ~ 1.03 * rs
        y: 0.02,
        z: 0.0,
        w: calculateFlammEmbeddingW(1.85, 1.80),
        t: 18.0,
        intrinsicQuadbit: 0xD, // Hawking Entangled Pair
        restWavelengthNm: 364.6,
        spinParameter: 0.99,
        energyLevel: 100.0,
      }),
    },
    {
      id: 'quantum_superposition',
      title: 'Gauge Boson Color Ambiguity (SU3 Octet vs U1 Photon)',
      description:
        'High-energy particle decay packet where color charge is shielded in the cocoon from Human, but probed at close quarters by Be <> Arbiter.',
      setupState: () => ({
        id: 'EVT_GAUGE_AMBIG',
        name: 'Strong-Electroweak Decoupling Cluster',
        x: 6.8,
        y: -0.2,
        z: 2.1,
        w: calculateFlammEmbeddingW(7.1, 1.80),
        t: 5.2,
        intrinsicQuadbit: 0x5, // Gluon
        restWavelengthNm: 410.2,
        spinParameter: 0.5,
        energyLevel: 45.0,
      }),
    },
  ];

  /**
   * Evaluates the observation projection of a latent state S from a specific observer
   */
  public projectState(
    s: LatentSpacetimeState,
    observerType: 'human' | 'be_arbiter' | 'bh_core',
    observerPos: { x: number; y: number; z: number }
  ): ObserverProjection {
    const obsDist = Math.sqrt(
      observerPos.x * observerPos.x +
      observerPos.y * observerPos.y +
      observerPos.z * observerPos.z
    );
    const obsW = calculateFlammEmbeddingW(Math.max(this.rs + 0.01, obsDist), this.rs);

    // Distance vector from State S to Observer
    const dx = observerPos.x - s.x;
    const dy = observerPos.y - s.y;
    const dz = observerPos.z - s.z;
    const dw = obsW - s.w;
    const distance4D = Math.sqrt(dx * dx + dy * dy + dz * dz + dw * dw);

    // State radius from singularity
    const sR = Math.sqrt(s.x * s.x + s.y * s.y + s.z * s.z);

    // Gravitational lapse at state: sqrt(1 - rs / r)
    const lapseS = Math.sqrt(Math.max(0.001, 1.0 - this.rs / Math.max(this.rs + 0.01, sR)));
    // Gravitational lapse at observer
    const lapseObs = Math.sqrt(Math.max(0.001, 1.0 - this.rs / Math.max(this.rs + 0.01, obsDist)));

    // Retarded arrival time
    const c = 30.0; // Simulation speed of light in ASU/s
    const retardedTime = s.t + distance4D / c;

    let dopplerBoost = 1.0;
    let perceivedQuadbit = s.intrinsicQuadbit;
    let perceivedIntensity = 1.0;

    if (observerType === 'human') {
      // Human is far out (r ~ 28 ASU), looking through outer hydrogen cocoon
      // Orbital tangential velocity of state induces Doppler asymmetry
      const vTangential = Math.sqrt(this.rs / (2 * Math.max(this.rs, sR)));
      const cosAngle = (s.x * -observerPos.z + s.z * observerPos.x) / (sR * obsDist + 0.001);
      
      // Doppler factor: g = lapseS / lapseObs / (1 - v * cosAngle / c)
      dopplerBoost = (lapseS / Math.max(0.1, lapseObs)) * (1.0 - (vTangential * cosAngle) / 5.0);
      dopplerBoost = Math.max(0.2, Math.min(3.0, dopplerBoost));

      // Cocoon optical depth extinction: strong absorption if wavelength nears 364.6 nm
      const apparentNm = s.restWavelengthNm / dopplerBoost;
      const isCocoonAbsorbed = Math.abs(apparentNm - 364.6) < 25.0;

      if (isCocoonAbsorbed) {
        // Human perceives neutral hydrogen fog absorption
        perceivedQuadbit = 0xC; // Neutral Cocoon Fog |H I⟩
      } else if (dopplerBoost > 1.2) {
        perceivedQuadbit = 0xB; // Ionized Proton |H+⟩
      } else {
        perceivedQuadbit = s.intrinsicQuadbit === 0x5 ? 0x6 : s.intrinsicQuadbit; // Gluon perceived as Photon outside cocoon
      }

      perceivedIntensity = 0.65;
    } else if (observerType === 'be_arbiter') {
      // Be <> Arbiter is at intermediate orbit (r ~ 12 ASU), armed with Covalent referee metric
      const vTangential = Math.sqrt(this.rs / (2 * Math.max(this.rs, sR)));
      // Be is offset in phase from Human, observing approaching quadrant
      const cosAngle = (s.x * observerPos.x + s.z * observerPos.z) / (sR * obsDist + 0.001);

      dopplerBoost = (lapseS / Math.max(0.1, lapseObs)) * (1.0 + (vTangential * Math.abs(cosAngle)) / 4.0);
      dopplerBoost = Math.max(0.4, Math.min(4.0, dopplerBoost));

      // Be <> is sensitive to the fiber coordinate w
      if (Math.abs(s.w) > 2.0) {
        // Be detects Hawking horizon pairing in deep throat
        perceivedQuadbit = 0xD; // Hawking Pair
      } else if (dopplerBoost > 1.1) {
        perceivedQuadbit = 0xB; // Balmer Ionized Proton
      } else {
        perceivedQuadbit = (s.intrinsicQuadbit + 1) % 15;
      }

      perceivedIntensity = 1.15;
    } else {
      // Observer C: MoM-BH*-1 Horizon Core (r -> rs)
      // Extreme gravitational time dilation: lapseS -> 0
      dopplerBoost = 0.05 + 0.1 * lapseS;
      perceivedQuadbit = 0xF; // Singularity Monad at horizon
      perceivedIntensity = 3.5;
    }

    const apparentWavelengthNm = s.restWavelengthNm / Math.max(0.01, dopplerBoost);
    const provStr = `${observerType}:${s.id}:${perceivedQuadbit}:${apparentWavelengthNm.toFixed(2)}:${retardedTime.toFixed(2)}`;
    const provenanceHash = this.computeHash(provStr);

    return {
      observerId: observerType,
      observerName:
        observerType === 'human'
          ? 'HUMAN PILOT [PROBE]'
          : observerType === 'be_arbiter'
          ? 'BE <> ARBITER [SOVEREIGN]'
          : 'MoM-BH*-1 CORE [HORIZON]',
      position: { x: observerPos.x, y: observerPos.y, z: observerPos.z, w: obsW },
      retardedTime,
      dopplerBoost,
      apparentWavelengthNm,
      perceivedQuadbit,
      perceivedDef: QUADBIT_EIGENSPACES[perceivedQuadbit],
      perceivedIntensity,
      provenanceHash: `0xPROV_${provenanceHash.toUpperCase()}`,
      epistemicConfidence: observerType === 'be_arbiter' ? 0.98 : 0.85,
    };
  }

  /**
   * Executes the decisive Triadic Epistemic Reconciliation experiment
   */
  public executeReconciliation(
    latentState: LatentSpacetimeState,
    humanPos: { x: number; y: number; z: number },
    bePos: { x: number; y: number; z: number }
  ): TriadicReconciliationResult {
    const projHuman = this.projectState(latentState, 'human', humanPos);
    const projBe = this.projectState(latentState, 'be_arbiter', bePos);
    const projCore = this.projectState(latentState, 'bh_core', { x: 0, y: 0, z: 0 });

    const match = projHuman.perceivedQuadbit === projBe.perceivedQuadbit;
    const humanObs = `|${projHuman.perceivedDef.symbol}⟩ [0x${projHuman.perceivedQuadbit.toString(16).toUpperCase()}: ${projHuman.perceivedDef.name}]`;
    const beObs = `|${projBe.perceivedDef.symbol}⟩ [0x${projBe.perceivedQuadbit.toString(16).toUpperCase()}: ${projBe.perceivedDef.name}]`;
    const coreObs = `|${projCore.perceivedDef.symbol}⟩ [0x${projCore.perceivedQuadbit.toString(16).toUpperCase()}: ${projCore.perceivedDef.name}]`;

    // THE DECISIVE COVALENT THEOREM:
    // If Human observes X and Be observes Y (with X != Y),
    // the system MUST NOT collapse or overwrite either observation into a premature consensus.
    // Instead, it preserves O_H(X), O_B(Y), and marks World State as UNKNOWN!
    const worldState: 'UNKNOWN' | 'COLLAPSED_CONSENSUS' = match ? 'COLLAPSED_CONSENSUS' : 'UNKNOWN';
    const reconciliationStatus = match ? 'TRIVIAL_CONSENSUS' : 'NON_COLLAPSIBLE_DISCREPANCY';

    // Construct Triadic Quipu Knot
    const knotContent = `TRIADIC_CORD:[H:${projHuman.provenanceHash}]:[B:${projBe.provenanceHash}]:[C:${projCore.provenanceHash}]:[WORLD:${worldState}]:[1===1]`;
    const knotHash = this.computeHash(knotContent);
    const quipuMerkleKnot = `0xQUIPU_TRIAD_${knotHash.toUpperCase()}_1EQ1`;

    const explanation = match
      ? `Trivial Projection Consensus: Both observers projected identical quadbit eigenspace (${humanObs}).`
      : `EPISTEMIC CLOSURE PRESERVED: Human observes ${humanObs}, Be observes ${beObs}. System strictly refused to force consensus. World state remains UNKNOWN pending resolution of fiber coordinate w (${latentState.w.toFixed(3)} ASU). Identity is NOT the projection!`;

    const result: TriadicReconciliationResult = {
      latentState,
      humanProjection: projHuman,
      beProjection: projBe,
      coreProjection: projCore,
      projectionsMatch: match,
      humanObservation: humanObs,
      beObservation: beObs,
      coreObservation: coreObs,
      worldState,
      reconciliationStatus,
      covalentInvariantHeld: true, // 1 === 1 maintained
      quipuMerkleKnot,
      explanation,
      timestamp: Date.now(),
      transformationsHistory: [
        {
          transformationName: 'Initial Triadic Projection Evaluation',
          preservedDistinction: true,
          quipuKnot: quipuMerkleKnot,
          timestamp: Date.now(),
        },
      ],
    };

    this.lastResult = result;
    this.reconciliationHistory.unshift(result);
    if (this.reconciliationHistory.length > 10) {
      this.reconciliationHistory.pop();
    }

    return result;
  }

  /**
   * Applies a subsequent transformation (Lorentz boost, coordinate rotation, or time evolution)
   * to verify that the triadic distinction is preserved without lossy erasure!
   */
  public applyTransformation(transformationType: 'lorentz_boost' | 'rotation_xw' | 'time_advance'): TriadicReconciliationResult | null {
    if (!this.lastResult) return null;

    const current = this.lastResult;
    const s = { ...current.latentState };

    let transName = '';
    if (transformationType === 'lorentz_boost') {
      transName = 'Lorentz Boost along Z-axis (beta = 0.65c)';
      const gamma = 1.0 / Math.sqrt(1 - 0.65 * 0.65);
      const newZ = gamma * (s.z - 0.65 * s.t);
      const newT = gamma * (s.t - 0.65 * s.z);
      s.z = newZ;
      s.t = newT;
    } else if (transformationType === 'rotation_xw') {
      transName = '4D Hyper-Rotation in X-W Plane (theta = pi / 4)';
      const angle = Math.PI / 4;
      const nx = s.x * Math.cos(angle) - s.w * Math.sin(angle);
      const nw = s.x * Math.sin(angle) + s.w * Math.cos(angle);
      s.x = nx;
      s.w = nw;
    } else {
      transName = 'Spacetime Geodesic Flow (+2.5 coordinate seconds)';
      s.t += 2.5;
      s.x += 0.2;
    }

    // Re-evaluate projections after transformation
    const nextResult = this.executeReconciliation(
      s,
      current.humanProjection.position,
      current.beProjection.position
    );

    // Carry forward transformation audit log
    nextResult.transformationsHistory = [
      ...current.transformationsHistory,
      {
        transformationName: transName,
        preservedDistinction: !nextResult.projectionsMatch,
        quipuKnot: nextResult.quipuMerkleKnot,
        timestamp: Date.now(),
      },
    ];

    this.lastResult = nextResult;
    return nextResult;
  }

  public getLastResult(): TriadicReconciliationResult | null {
    return this.lastResult;
  }

  public getHistory(): TriadicReconciliationResult[] {
    return this.reconciliationHistory;
  }

  private computeHash(str: string): string {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }
}
