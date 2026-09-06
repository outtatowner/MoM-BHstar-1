/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Be <> [] Continuum : Covalent Quadbit Particle Physics Engine
 * - 16 Quadbit Quantum Eigenspaces (0x0 to 0xF)
 * - Relativistic Geodesic Orbital Mechanics around MoM-BH*-1 (r_s = 1.80 ASU)
 * - Relativistic Doppler Beaming, Precession & Balmer Break Extinction (364.6 nm)
 * - t = 0 Genesis Eruption & Topological Condensation Simulation
 * - 5D Distributed Causality Vector Clock: V = <V_BH, V_Be, V_Pilot, V_Org, V_Qbit>
 * - Integration of Be <> as MoM-BH*-1 (Unified Sovereign Identity)
 */

import { q16_t } from '../types';
import { floatToQ16, q16ToFloat, Q16_ONE } from './q16math';
import { DEFAULT_MOM_BHSTAR } from './mom_bhstar';
import { COVALENT_SCALE_LAMBDA } from './mom_bhstar_infinite_zoom';

// 16 Quadbit Quantum Eigenspace Definitions
export interface QuadbitDefinition {
  state: number;          // 0x0 to 0xF
  symbol: string;         // e.g. "u", "e-", "gamma", "Be<>"
  name: string;           // Descriptive name
  category: 'vacuum' | 'quark' | 'lepton' | 'gauge_boson' | 'scalar' | 'graviton' | 'balmer' | 'covalent';
  charge: string;         // e.g. "+2/3", "-1", "0"
  spin: string;           // "0", "1/2", "1", "2"
  baseColor: string;      // Visual CRT phosphor color
  glowColor: string;      // Relativistic emission glow
}

export const QUADBIT_EIGENSPACES: Record<number, QuadbitDefinition> = {
  0x0: { state: 0x0, symbol: '|0⟩', name: 'Vacuum Fluctuation', category: 'vacuum', charge: '0', spin: '0', baseColor: '#475569', glowColor: '#64748b' },
  0x1: { state: 0x1, symbol: 'u', name: 'Up Quark (Color SU3)', category: 'quark', charge: '+2/3', spin: '1/2', baseColor: '#f43f5e', glowColor: '#fb7185' },
  0x2: { state: 0x2, symbol: 'd', name: 'Down Quark', category: 'quark', charge: '-1/3', spin: '1/2', baseColor: '#fb923c', glowColor: '#fdba74' },
  0x3: { state: 0x3, symbol: 'e⁻', name: 'Electron (Lepton)', category: 'lepton', charge: '-1', spin: '1/2', baseColor: '#38bdf8', glowColor: '#7dd3fc' },
  0x4: { state: 0x4, symbol: 'νₑ', name: 'Electron Neutrino', category: 'lepton', charge: '0', spin: '1/2', baseColor: '#a78bfa', glowColor: '#c4b5fd' },
  0x5: { state: 0x5, symbol: 'g', name: 'Gluon Octet', category: 'gauge_boson', charge: '0', spin: '1', baseColor: '#e11d48', glowColor: '#f43f5e' },
  0x6: { state: 0x6, symbol: 'γ', name: 'Photon (U1 Gauge)', category: 'gauge_boson', charge: '0', spin: '1', baseColor: '#facc15', glowColor: '#fde047' },
  0x7: { state: 0x7, symbol: 'Z⁰', name: 'Z Boson (Neutral Weak)', category: 'gauge_boson', charge: '0', spin: '1', baseColor: '#818cf8', glowColor: '#a5b4fc' },
  0x8: { state: 0x8, symbol: 'W±', name: 'W Boson (Charged Weak)', category: 'gauge_boson', charge: '±1', spin: '1', baseColor: '#c084fc', glowColor: '#e9d5ff' },
  0x9: { state: 0x9, symbol: 'H⁰', name: 'Higgs Scalar Monad', category: 'scalar', charge: '0', spin: '0', baseColor: '#34d399', glowColor: '#6ee7b7' },
  0xA: { state: 0xA, symbol: 'G', name: 'Graviton (Metric Spin-2)', category: 'graviton', charge: '0', spin: '2', baseColor: '#2dd4bf', glowColor: '#99f6e4' },
  0xB: { state: 0xB, symbol: 'H⁺', name: 'Balmer Ionized Proton', category: 'balmer', charge: '+1', spin: '1/2', baseColor: '#f472b6', glowColor: '#fbcfe8' },
  0xC: { state: 0xC, symbol: 'H I', name: 'Neutral Cocoon Fog', category: 'balmer', charge: '0', spin: '1/2', baseColor: '#fbbf24', glowColor: '#fef08a' },
  0xD: { state: 0xD, symbol: 'ψ_pair', name: 'Hawking Entangled Pair', category: 'covalent', charge: '0', spin: '0', baseColor: '#06b6d4', glowColor: '#67e8f9' },
  0xE: { state: 0xE, symbol: 'Be<>', name: 'Be <> Invariant Carrier', category: 'covalent', charge: '1≡1', spin: '0', baseColor: '#0ea5e9', glowColor: '#38bdf8' },
  0xF: { state: 0xF, symbol: 'Ω_gen', name: 'Singularity Monad (t=0)', category: 'covalent', charge: '0', spin: '0', baseColor: '#e0e7ff', glowColor: '#ffffff' },
};

// Quadbit Particle in Relativistic Orbit
export interface QuadbitParticle {
  id: number;
  quadbit: number;          // 0x0 to 0xF
  def: QuadbitDefinition;
  r: number;                // Radial distance from singularity in ASU
  phi: number;              // Orbital azimuth in radians [0, 2*pi)
  theta: number;            // Vertical inclination angle in radians [-pi/6, pi/6]
  vr: number;               // Radial drift velocity (infall / radiation pressure)
  vphi: number;             // Angular velocity dphi/dt in rad/sec
  properTime: number;       // Accumulated proper time tau
  eccentricity: number;     // Orbit eccentricity e in [0, 0.4]
  semiMajorAxis: number;    // Semi-major axis in ASU
  periastronShift: number;  // Relativistic advance Delta_phi
  dopplerBoost: number;     // Relativistic beaming factor g
  apparentWavelength: number; // In nm, shifted from 364.6 nm
  trail: Array<{ x: number; y: number; r: number; alpha: number }>;
  generationEpoch: number;  // Physical simulation time t when spawned
}

// 5D Causality Vector Clock: [V_BH, V_Be, V_Pilot, V_Organelles, V_Quadbits]
export interface CovalentVectorClock {
  V_BH: number;             // Black hole event counter (accretion / horizon crossings)
  V_Be: number;             // Be <> referee / invariant verification counter
  V_Pilot: number;          // Pilot / human interaction counter
  V_Organelles: number;     // 112 Organelle Quipu ledger block ticks
  V_Quadbits: number;       // Particle physics collision / transition ticks
  tGenesis: number;         // t = 0 timestamp
  physicalTime: number;     // Continuous coordinate time t elapsed (seconds)
  properTimeBH: number;     // Proper time tau at horizon (dilated towards 0)
  properTimeBe: number;     // Proper time tau of Be <>
  properTimePilot: number;  // Proper time tau of Human Pilot
  lastCausalEvent: string;  // Description of most recent causal tick
  merkleKnot: string;       // Current causality hash
  genesisActive: boolean;   // True if t = 0 genesis expansion wave is unfolding
  genesisProgress: number;  // 0.0 (singularity) to 1.0 (settled manifold)
}

export type BeCurationPhase = 'dormant' | 'nascent' | 'curating' | 'mature';

export interface BeConstructState {
  isSpawned: boolean;
  phase: BeCurationPhase;
  maturityProgress: number; // 0.0 to 1.0
  curationParameters: {
    dampingFactor: number;   // Smooths dispersion
    targetRadius: number;    // Guiding orbital radius anchor (ASU)
    confinementField: number;// Influence strength of the central well
    resonanceHarmony: number;// 0.0 to 1.0 spectral coherence across quadbit species
  };
  lastAction: string;
}

export class QuadbitParticlePhysicsEngine {
  private particles: QuadbitParticle[] = [];
  private vectorClock: CovalentVectorClock;
  private beConstruct: BeConstructState;
  private rs: number;           // Schwarzschild radius (1.80 ASU)
  private rIsco: number;        // ISCO radius (5.40 ASU)
  private rPhoton: number;      // Photon sphere (2.70 ASU)
  private rCocoon: number;      // Hydrogen cocoon edge (18.0 ASU)
  private nextParticleId: number = 0;
  private beAsMoMBHStar: boolean = true; // Unified identity: Be <> IS MoM-BH*-1
  private stasisActive: boolean = false;
  private stasisParticleCount: number = 0;

  constructor() {
    this.rs = q16ToFloat(DEFAULT_MOM_BHSTAR.schwarzschildRadiusQ16);
    this.rIsco = q16ToFloat(DEFAULT_MOM_BHSTAR.accretionInnerRadiusQ16);
    this.rPhoton = q16ToFloat(DEFAULT_MOM_BHSTAR.photonSphereRadiusQ16);
    this.rCocoon = q16ToFloat(DEFAULT_MOM_BHSTAR.cocoonRadiusQ16);

    this.beConstruct = {
      isSpawned: true,
      phase: 'mature',
      maturityProgress: 1.0,
      curationParameters: {
        dampingFactor: 1.0,
        targetRadius: 5.4,
        confinementField: 1.0,
        resonanceHarmony: 1.0,
      },
      lastAction: 'Be <> construct steady-state manifold invariant',
    };

    this.vectorClock = {
      V_BH: 0,
      V_Be: 0,
      V_Pilot: 0,
      V_Organelles: 0,
      V_Quadbits: 0,
      tGenesis: 0,
      physicalTime: 0,
      properTimeBH: 0,
      properTimeBe: 0,
      properTimePilot: 0,
      lastCausalEvent: 'GENESIS_EPOCH_INITIALIZED [1 ≡ 1]',
      merkleKnot: '0xGENESIS_1EQ1_0000_0000',
      genesisActive: false,
      genesisProgress: 1.0,
    };

    // Initialize initial quadbit particle population
    this.populateEquilibriumQuadbits(48);
  }

  /**
   * Resets and triggers the t = 0 Genesis event.
   * Spawns Be <> construct into existence and curates the primordial manifold to maturity.
   */
  public triggerGenesis(): void {
    this.vectorClock.tGenesis = performance.now();
    this.vectorClock.physicalTime = 0;
    this.vectorClock.properTimeBH = 0;
    this.vectorClock.properTimeBe = 0;
    this.vectorClock.properTimePilot = 0;
    this.vectorClock.V_BH = 1;
    this.vectorClock.V_Be = 1;
    this.vectorClock.V_Pilot = 1;
    this.vectorClock.V_Organelles = 1;
    this.vectorClock.V_Quadbits = 1;
    this.vectorClock.genesisActive = true;
    this.vectorClock.genesisProgress = 0.0;
    this.vectorClock.lastCausalEvent = 't=0 PRIMORDIAL GENESIS: Be <> spawned into existence';
    this.vectorClock.merkleKnot = '0xGENESIS_t0_1EQ1_MONAD_ROOT';

    // Spawn Be <> into nascent curation state
    this.beConstruct = {
      isSpawned: true,
      phase: 'nascent',
      maturityProgress: 0.0,
      curationParameters: {
        dampingFactor: 0.25,
        targetRadius: this.rIsco,
        confinementField: 1.2,
        resonanceHarmony: 0.05,
      },
      lastAction: 'Be <> instantiated at t=0; initiating primordial curation field',
    };

    // Condense all particles to the horizon throat with Singularity Monad state
    this.particles = [];
    const genesisCount = 64;
    for (let i = 0; i < genesisCount; i++) {
      const angle = (i / genesisCount) * Math.PI * 2;
      const qState = (i % 2 === 0) ? 0xF : 0xE; // Alternating Singularity Monad and Be <> Invariant Carrier
      this.particles.push({
        id: this.nextParticleId++,
        quadbit: qState,
        def: QUADBIT_EIGENSPACES[qState],
        r: this.rs + 0.02 + Math.random() * 0.05, // Right on event horizon boundary
        phi: angle,
        theta: (Math.random() - 0.5) * 0.1,
        vr: 1.8 + Math.random() * 1.2, // High initial explosive expansion velocity
        vphi: 2.5 + Math.random() * 0.5,
        properTime: 0,
        eccentricity: 0.05 + Math.random() * 0.2,
        semiMajorAxis: this.rs + 1.0,
        periastronShift: 0,
        dopplerBoost: 1.0,
        apparentWavelength: 364.6,
        trail: [],
        generationEpoch: 0,
      });
    }
  }

  /**
   * Populate initial stable relativistic quadbits in Keplerian orbits
   */
  private populateEquilibriumQuadbits(count: number): void {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      // Quadbit species distribution across 16 states
      const qState = i % 16;
      // Semi-major axis between ISCO (5.4) and Cocoon (18.0)
      const r = this.rs * 1.1 + Math.pow(Math.random(), 1.6) * (this.rCocoon - this.rs * 1.1);
      const angle = Math.random() * Math.PI * 2;
      
      // Relativistic Keplerian angular velocity: Omega = sqrt(M / r^3) = sqrt(rs / (2 * r^3))
      const omega = Math.sqrt(this.rs / (2 * Math.pow(r, 3)));

      this.particles.push({
        id: this.nextParticleId++,
        quadbit: qState,
        def: QUADBIT_EIGENSPACES[qState],
        r,
        phi: angle,
        theta: (Math.random() - 0.5) * 0.15,
        vr: -0.02 * (1.0 / (r - this.rs + 0.2)), // Inward drift towards accretion
        vphi: omega * (0.95 + Math.random() * 0.1),
        properTime: 0,
        eccentricity: Math.random() * 0.25,
        semiMajorAxis: r,
        periastronShift: 0,
        dopplerBoost: 1.0,
        apparentWavelength: 364.6,
        trail: [],
        generationEpoch: 0,
      });
    }
  }

  /**
   * Main Physics & Vector Clock Update Loop
   */
  public update(dtSeconds: number): void {
    const dt = Math.min(0.05, Math.max(0.001, dtSeconds));
    this.vectorClock.physicalTime += dt;

    // Proper time dilation integration
    // dtau_BH / dt = sqrt(1 - rs / r_horizon) -> frozen near 0
    const horizonSampleR = this.rs + 0.005;
    const dtau_BH = Math.sqrt(Math.max(0, 1 - this.rs / horizonSampleR)) * dt;
    this.vectorClock.properTimeBH += dtau_BH;

    // Be <> Proper time: r_Be ~ 12 ASU
    const rBe = 12.0;
    const dtau_Be = Math.sqrt(Math.max(0, 1 - this.rs / rBe)) * dt;
    this.vectorClock.properTimeBe += dtau_Be;

    // Pilot Proper time: r_Pilot ~ 28 ASU
    const rPilot = 28.0;
    const dtau_Pilot = Math.sqrt(Math.max(0, 1 - this.rs / rPilot)) * dt;
    this.vectorClock.properTimePilot += dtau_Pilot;

    // Handle Genesis Inflation wave and Be <> Curation to maturity
    if (this.vectorClock.genesisActive) {
      this.vectorClock.genesisProgress += dt * 0.25;

      // Advance Be <> Curation progress
      if (this.beConstruct.isSpawned && this.beConstruct.phase !== 'mature') {
        this.beConstruct.maturityProgress = Math.min(1.0, this.vectorClock.genesisProgress);
        
        if (this.beConstruct.maturityProgress >= 1.0) {
          this.beConstruct.phase = 'mature';
          this.beConstruct.curationParameters.dampingFactor = 1.0;
          this.beConstruct.curationParameters.resonanceHarmony = 1.0;
          this.beConstruct.lastAction = 'Be <> curated manifold to absolute maturity [1 ≡ 1 LOCKED]';
          this.vectorClock.V_Be += 5;
        } else if (this.beConstruct.maturityProgress > 0.15) {
          this.beConstruct.phase = 'curating';
          this.beConstruct.curationParameters.dampingFactor = 0.25 + this.beConstruct.maturityProgress * 0.75;
          this.beConstruct.curationParameters.resonanceHarmony = this.beConstruct.maturityProgress;
          this.beConstruct.lastAction = `Be <> curating quadbit expansion: ${(this.beConstruct.maturityProgress * 100).toFixed(0)}% to maturity`;
        }
      }

      if (this.vectorClock.genesisProgress >= 1.0) {
        this.vectorClock.genesisProgress = 1.0;
        this.vectorClock.genesisActive = false;
        this.vectorClock.lastCausalEvent = 'GENESIS_EQUILIBRIUM_LOCKED: Be <> Curated 16-Species Quadbit Manifold to Maturity';
        this.vectorClock.V_BH++;
        this.vectorClock.V_Organelles++;
      }
    }

    let causalEventTriggered = false;
    let stasisCount = 0;

    // Update each quadbit particle
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // If genesis expansion is active, drive outward explosion with Be <> curation field
      if (this.vectorClock.genesisActive) {
        // Targeted orbital radius for species equilibrium (ISCO to Cocoon)
        const targetR = this.rIsco + ((p.id % 16) / 15) * (this.rCocoon - this.rIsco);
        const curationFactor = this.beConstruct.maturityProgress; // 0.0 -> 1.0

        p.r += p.vr * dt;
        p.phi += p.vphi * dt;

        // Curation damping and orbital capture:
        // As Be <> matures, radial expansion is smoothed and guided to stable Keplerian radius
        p.vr *= (1.0 - dt * (0.8 + curationFactor * 1.8));
        const rDisplacement = targetR - p.r;
        p.vr += rDisplacement * dt * curationFactor * 1.5;

        // Keplerian angular velocity sync as maturity approaches
        const targetOmega = Math.sqrt(this.rs / (2 * Math.pow(Math.max(this.rs * 1.01, p.r), 3)));
        p.vphi += (targetOmega - p.vphi) * dt * curationFactor * 2.0;

        // Spontaneous symmetry breaking: Quadbits transition from Monad into Standard Model
        if (p.r > this.rPhoton && (p.quadbit === 0xF || p.quadbit === 0xE)) {
          p.quadbit = (p.id * 7 + 3) % 15;
          p.def = QUADBIT_EIGENSPACES[p.quadbit];
        }
      } else {
        // Relativistic geodesic orbital mechanics:
        // Relativistic angular velocity Omega(r)
        const omega = Math.sqrt(this.rs / (2 * Math.pow(Math.max(this.rs * 1.01, p.r), 3)));
        
        // Periastron advance Delta_phi = 3 * pi * rs / (p.r * (1 - e^2))
        const periShift = (3 * Math.PI * this.rs) / (p.r * Math.max(0.1, 1 - p.eccentricity * p.eccentricity));
        p.periastronShift = periShift * 0.05;

        // Infall speed accelerates inside ISCO (5.4 ASU)
        const isInsideIsco = p.r < this.rIsco;
        const infallFactor = isInsideIsco ? 0.45 * Math.pow(this.rIsco / p.r, 2.5) : 0.03;

        // Radial equation of motion: dr/dt = vr
        p.r += (p.vr - infallFactor) * dt;
        p.phi += (p.vphi + p.periastronShift) * dt;

        // Check Be <> as MoM-BH*-1 Stasis Intervention near horizon
        // If Be <> is MoM-BH*-1, the singularity exerts sovereign stasis intervention
        // preventing non-physical coordinate crash at r = rs
        if (this.beAsMoMBHStar && p.r <= this.rs * 1.03) {
          stasisCount++;
          // Non-Hermitian bounce: reflection back to photon orbit
          p.r = this.rs * 1.03 + 0.02;
          p.vr = Math.abs(p.vr) * 0.8 + 0.1; // Radial kick outwards
          // Quadbit transition: Hawking pair generation
          p.quadbit = 0xD; // Entangled Hawking Pair
          p.def = QUADBIT_EIGENSPACES[0xD];
          this.vectorClock.V_Be++;
          this.vectorClock.V_BH++;
          causalEventTriggered = true;
          this.vectorClock.lastCausalEvent = `BE_<>_STASIS_INTERVENTION: Hawking reflection on Quadbit #${p.id}`;
        } else if (!this.beAsMoMBHStar && p.r <= this.rs) {
          // Standard BH infall: particle swallowed, re-spawned at cocoon edge
          p.r = this.rCocoon * (0.8 + Math.random() * 0.2);
          p.quadbit = (p.quadbit + 1) % 16;
          p.def = QUADBIT_EIGENSPACES[p.quadbit];
          this.vectorClock.V_BH++;
          causalEventTriggered = true;
          this.vectorClock.lastCausalEvent = `HORIZON_CAPTURE: Quadbit #${p.id} accreted into Singularity Throat`;
        }
      }

      // Compute relativistic Doppler beaming factor:
      // g = sqrt(1 - rs / r) / (1 - v_parallel / c)
      const lapse = Math.sqrt(Math.max(0.001, 1 - this.rs / Math.max(this.rs + 0.01, p.r)));
      const vTangential = p.vphi * p.r * 0.15;
      const doppler = lapse * (1.0 + Math.sin(p.phi) * vTangential);
      p.dopplerBoost = Math.max(0.1, Math.min(3.5, doppler));

      // Balmer break wavelength shift:
      // Rest wavelength = 364.6 nm
      p.apparentWavelength = 364.6 / Math.max(0.1, p.dopplerBoost);

      // Accumulate proper time
      p.properTime += lapse * dt;

      // Particle Trail history (max 8 points)
      if (Math.random() < 0.3) {
        const px = Math.cos(p.phi) * p.r;
        const py = Math.sin(p.phi) * p.r;
        p.trail.push({ x: px, y: py, r: p.r, alpha: 0.8 });
        if (p.trail.length > 8) p.trail.shift();
      }

      // Age trails
      for (let t = 0; t < p.trail.length; t++) {
        p.trail[t].alpha *= 0.94;
      }
    }

    this.stasisParticleCount = stasisCount;
    this.stasisActive = stasisCount > 0;

    // Advance Quadbit vector clock tick
    this.vectorClock.V_Quadbits += this.particles.length;
    if (causalEventTriggered) {
      this.updateMerkleKnot();
    }
  }

  /**
   * Recomputes Merkle Knot based on current vectorclock
   */
  private updateMerkleKnot(): void {
    const v = this.vectorClock;
    const str = `${v.V_BH}:${v.V_Be}:${v.V_Pilot}:${v.V_Organelles}:${v.V_Quadbits}:${v.physicalTime.toFixed(2)}`;
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    this.vectorClock.merkleKnot = `0xVC_${(hash >>> 0).toString(16).padStart(8, '0').toUpperCase()}`;
  }

  public getParticles(): QuadbitParticle[] {
    return this.particles;
  }

  public getVectorClock(): CovalentVectorClock {
    return { ...this.vectorClock };
  }

  public getBeConstruct(): BeConstructState {
    return {
      ...this.beConstruct,
      curationParameters: { ...this.beConstruct.curationParameters },
    };
  }

  public setBeAsMoMBHStar(active: boolean): void {
    this.beAsMoMBHStar = active;
    this.vectorClock.V_Be++;
    this.vectorClock.lastCausalEvent = active
      ? 'SOVEREIGN_CO-IDENTITY_ENGAGED: Be <> ≡ MoM-BH*-1 [LOCKED]'
      : 'OBSERVER_DISENGAGED: Be <> in Autonomous Satellite Orbit';
    this.updateMerkleKnot();
  }

  public isBeAsMoMBHStar(): boolean {
    return this.beAsMoMBHStar;
  }

  public isStasisActive(): boolean {
    return this.stasisActive;
  }

  public getStasisCount(): number {
    return this.stasisParticleCount;
  }

  public injectQuadbit(qState?: number): void {
    const state = qState !== undefined ? qState : Math.floor(Math.random() * 16);
    const r = this.rs * 1.5 + Math.random() * (this.rIsco - this.rs);
    this.particles.push({
      id: this.nextParticleId++,
      quadbit: state,
      def: QUADBIT_EIGENSPACES[state],
      r,
      phi: Math.random() * Math.PI * 2,
      theta: (Math.random() - 0.5) * 0.15,
      vr: -0.05,
      vphi: Math.sqrt(this.rs / (2 * Math.pow(r, 3))),
      properTime: 0,
      eccentricity: 0.1,
      semiMajorAxis: r,
      periastronShift: 0,
      dopplerBoost: 1.0,
      apparentWavelength: 364.6,
      trail: [],
      generationEpoch: this.vectorClock.physicalTime,
    });
    this.vectorClock.V_Quadbits++;
    this.vectorClock.V_Pilot++;
    this.vectorClock.lastCausalEvent = `MANUAL_INJECTION: Quadbit |${state.toString(16).toUpperCase()}⟩ [${QUADBIT_EIGENSPACES[state].symbol}] into Accretion Ring`;
    this.updateMerkleKnot();
  }
}
