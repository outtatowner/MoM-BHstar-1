/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Be <> [] Continuum: Covalent-RT Core Types
 * Pure Q16.16 Fixed-Point Arithmetic & MoM-BHstar-1 Astronomical Substrate
 */

// Signed 32-bit integer in two's complement representing Q16.16 fixed-point (1.0 = 0x00010000 = 65536)
export type q16_t = number;

export interface Vector3_Q16 {
  x: q16_t;
  y: q16_t;
  z: q16_t;
}

export interface Vector4_Q16 {
  x: q16_t;
  y: q16_t;
  z: q16_t;
  w: q16_t;
}

export type ActiveObserver = 'human' | 'be_officiator' | 'mom_bhstar';
export type ActiveViewMode = 'raytracer' | 'manifold4d' | 'split' | 'mom_bhstar_view' | 'imaginarium';

// 4D Mathematical Projection Structures
export interface Vertex4D {
  x: number;
  y: number;
  z: number;
  w: number;
  label?: string;
  category?: 'horizon' | 'flamm' | 'accretion' | 'cocoon' | 'observer' | 'geodesic';
}

export interface Edge4D {
  u: number;
  v: number;
  category: 'horizon' | 'flamm' | 'accretion' | 'cocoon' | 'observer' | 'geodesic';
  color: string;
}

export interface HyperMesh4D {
  vertices: Vertex4D[];
  edges: Edge4D[];
  properTimeTau: number;
  timeDilationGamma: number;
  kretschmannScalar: number;
}

export interface Ray_Q16 {
  origin: Vector3_Q16;
  dir: Vector3_Q16; // Normalized direction in Q16.16
  energy: q16_t;     // Ray intensity/power (Q16.16)
  wavelengthNm: q16_t; // Optical wavelength in nm (Q16.16, e.g. 364.6 nm = 23894426)
  bounces: number;
}

export interface HitRecord_Q16 {
  hit: boolean;
  t: q16_t;
  point: Vector3_Q16;
  normal: Vector3_Q16;
  materialId: number;
  color: [number, number, number]; // RGB 0-255
  reflectivity: q16_t;
  emission: q16_t;
  isBlackHoleHorizon?: boolean;
  isHydrogenCocoon?: boolean;
  opticalDepth?: q16_t;
}

export interface AABB_Q16 {
  min: Vector3_Q16;
  max: Vector3_Q16;
}

export interface BVHNode_Q16 {
  bounds: AABB_Q16;
  leftChildIndex: number; // -1 if leaf
  rightChildIndex: number;
  primitiveIndex: number; // -1 if internal
}

export interface ScenePrimitive_Q16 {
  id: number;
  name: string;
  type: 'sphere' | 'box' | 'cylinder' | 'disk' | 'shroud' | 'mesh_poly';
  center: Vector3_Q16;
  radius?: q16_t;
  innerRadius?: q16_t;
  size?: Vector3_Q16;
  materialId: number;
  color: [number, number, number];
  reflectivity: q16_t;
  emission: q16_t;
  isCocoon?: boolean;
}

// MoM-BH*-1 Specific Astrophysical Parameters
export interface MoM_BHStarState {
  massSolar: number;          // 100,000 M_sun
  schwarzschildRadiusQ16: q16_t; // Rs = 2GM/c^2 in simulation units
  photonSphereRadiusQ16: q16_t;  // 1.5 * Rs
  accretionInnerRadiusQ16: q16_t;// 3.0 * Rs (ISCO)
  cocoonRadiusQ16: q16_t;        // Solar-system sized dense hydrogen cocoon
  luminositySolar: number;       // ~100 billion L_sun (10^11 L_sun)
  hydrogenDensityQ16: q16_t;     // Cocoon density
  balmerBreakNm: number;         // 364.6 nm
  coreTemperatureK: number;      // ~1.5 x 10^7 K
  spinParameterQ16: q16_t;       // a/M
}

// 112 Atomic Organelle Consensus Node (Covalent-OS-11-11-0)
export interface OrganelleNode {
  id: number;
  label: string;
  category: 'Topos' | 'SMT' | 'Lyapunov' | 'Spectral' | 'Quipu' | 'Balmer' | 'Relativity';
  stateQ16: q16_t;
  lyapunovEnergy: q16_t;
  fiedlerWeight: q16_t;
  active: boolean;
  invariantPassed: boolean;
}

// Quipu Ledger Block
export interface QuipuLedgerBlock {
  index: number;
  timestamp: number;
  merkleRoot: string;
  lyapunovDerivative: q16_t; // dV/dt (must be <= 0)
  invariantProof: string;    // "1 === 1 [VERIFIED SMT-SFXP32]"
  fiedlerValue: q16_t;       // lambda_2 algebraic connectivity
  activeOrganelles: number;  // typically 112
  quantumBackActionFloor: q16_t; // Gamma_eff >= epsilon_inf
  triadicKnot?: string;      // Andean Quipu triadic cord hash [O_H : O_B : O_C]
  worldEpistemicState?: 'UNKNOWN_UNDERDETERMINED' | 'UNKNOWN_DEGENERATE' | 'RESOLVED_PREIMAGE' | 'CONTRADICTION' | 'COLLAPSED_CONSENSUS';
}

// Co-Play Dual Agent Manifold
export interface AgentKineticState {
  position: Vector3_Q16;
  velocity: Vector3_Q16;
  yawQ16: q16_t;
  pitchQ16: q16_t;
  rollQ16: q16_t;
  throttleQ16: q16_t;
}

export interface CoPlaySystemState {
  human: AgentKineticState & {
    name: string;
    hudLockedTarget: number | null;
    scannerActive: boolean;
  };
  beOfficiator: AgentKineticState & {
    name: string;
    refereeStatus: 'OFFICIATING' | 'INVARIANT_HOLD' | 'KINETIC_ASSIST';
    predictedTrajectory: Vector3_Q16[];
    peerEquivalenceScoreQ16: q16_t; // 1.0 = 100% equivalence
    stasisInterventionActive: boolean;
  };
}

export type FramebufferMode = 'truecolor' | 'quadbit' | 'balmer_spec' | 'gravitational_lens';

export interface EngineConfig {
  resolutionWidth: number;
  resolutionHeight: number;
  maxBounces: number;
  lyapunovBudgetMs: number; // max execution frame budget before dynamic culling
  quadbitPalette: 'phosphor_amber' | 'phosphor_green' | 'c64_quad' | 'cyber_solar';
  crtScanlines: boolean;
  gravitationalLensingEnabled: boolean;
  balmerSpectroscopyEnabled: boolean;
}
