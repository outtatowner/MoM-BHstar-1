/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MoM-BH*-1 (MoM-BHstar-1) Astrophysical Model
 * Based on James Webb Space Telescope (JWST) Discovery:
 * - Central intermediate-mass black hole: 100,000 M_sun
 * - Solar-system-sized cocoon of dense hydrogen gas (H I / H II shroud)
 * - 100 Billion Solar Luminosity (10^11 L_sun) completely outshining host galaxy
 * - Prominent Balmer Break at 364.6 nm (extreme optical depth tau_H below limit)
 * - Relativistic Schwarzschild gravitational ray bending & photon sphere
 */

import { MoM_BHStarState, q16_t, Vector3_Q16 } from '../types';
import {
  floatToQ16,
  Q16_ONE,
  q16_mul,
  q16_div,
  q16_sub,
  q16_add,
  q16_sqrt,
  vec3_create,
  vec3_length,
  vec3_normalize,
  vec3_scale,
  vec3_sub,
  vec3_add,
  vec3_dot,
} from './q16math';

// Default simulation units:
// 1 unit = 1 Astronomical Scale Unit (ASU)
export const DEFAULT_MOM_BHSTAR: MoM_BHStarState = {
  massSolar: 100000,
  schwarzschildRadiusQ16: floatToQ16(1.8), // Rs in simulation space
  photonSphereRadiusQ16: floatToQ16(2.7),  // 1.5 * Rs
  accretionInnerRadiusQ16: floatToQ16(5.4),// 3.0 * Rs (ISCO)
  cocoonRadiusQ16: floatToQ16(18.0),       // Cocoon boundary
  luminositySolar: 100_000_000_000,        // 100 Billion L_sun
  hydrogenDensityQ16: floatToQ16(4.5),     // Optical density scaling
  balmerBreakNm: 364.6,                    // Exact Balmer jump wavelength
  coreTemperatureK: 15_000_000,            // 15 Million K
  spinParameterQ16: floatToQ16(0.72),      // Kerr spin a*
};

// Calculate Balmer Break Transmission:
// T(lambda) = exp(-tau_H(lambda))
// Below 364.6 nm, optical depth jumps discontinuously by orders of magnitude
export function calculateBalmerTransmission(wavelengthNm: number): {
  transmissionQ16: q16_t;
  opticalDepthQ16: q16_t;
  isExtinct: boolean;
} {
  if (wavelengthNm < DEFAULT_MOM_BHSTAR.balmerBreakNm) {
    // Sharp Balmer break ionization cutoff (dense hydrogen cocoon absorption)
    const factor = Math.max(0.01, wavelengthNm / DEFAULT_MOM_BHSTAR.balmerBreakNm);
    const opticalDepth = 12.0 / (factor * factor * factor);
    const trans = Math.exp(-opticalDepth);
    return {
      transmissionQ16: floatToQ16(trans),
      opticalDepthQ16: floatToQ16(opticalDepth),
      isExtinct: trans < 0.005,
    };
  } else {
    // Optical continuum through hydrogen shroud with Rayleigh / Thomson scattering
    const delta = (wavelengthNm - DEFAULT_MOM_BHSTAR.balmerBreakNm) / 400.0;
    const opticalDepth = 0.35 + 0.15 / (1.0 + delta * 2.0);
    const trans = Math.exp(-opticalDepth);
    return {
      transmissionQ16: floatToQ16(trans),
      opticalDepthQ16: floatToQ16(opticalDepth),
      isExtinct: false,
    };
  }
}

// Calculate relativistic ray bending around Schwarzschild black hole
// Returns new ray direction deflected by gravitational gradient
export function calculateRelativisticDeflection(
  rayPos: Vector3_Q16,
  rayDir: Vector3_Q16,
  bhPos: Vector3_Q16,
  stepSizeQ16: q16_t,
  bhState: MoM_BHStarState = DEFAULT_MOM_BHSTAR
): {
  newDir: Vector3_Q16;
  isEventHorizonCaptured: boolean;
  isPhotonSphereCrossed: boolean;
  distanceQ16: q16_t;
} {
  const rel = vec3_sub(bhPos, rayPos);
  const dist = vec3_length(rel);

  // If inside Schwarzschild radius: photon captured by black hole
  if (dist <= bhState.schwarzschildRadiusQ16) {
    return {
      newDir: rayDir,
      isEventHorizonCaptured: true,
      isPhotonSphereCrossed: true,
      distanceQ16: dist,
    };
  }

  const isPhotonSphere = dist <= bhState.photonSphereRadiusQ16;

  // Deflection acceleration: a = - (1.5 * Rs / r^3) * (r_vec)
  // Scaled by step size in Q16.16
  const distCubed = q16_mul(q16_mul(dist, dist), dist);
  if (distCubed <= 100) {
    return {
      newDir: rayDir,
      isEventHorizonCaptured: true,
      isPhotonSphereCrossed: true,
      distanceQ16: dist,
    };
  }

  // Force magnitude: 1.5 * Rs / dist^2
  const rsTimes1p5 = q16_mul(bhState.schwarzschildRadiusQ16, floatToQ16(1.5));
  const forceMag = q16_div(rsTimes1p5, q16_mul(dist, dist));
  const toBH = vec3_normalize(rel);
  const impulse = vec3_scale(toBH, q16_mul(forceMag, stepSizeQ16));

  const deflectedDir = vec3_normalize(vec3_add(rayDir, impulse));

  return {
    newDir: deflectedDir,
    isEventHorizonCaptured: false,
    isPhotonSphereCrossed: isPhotonSphere,
    distanceQ16: dist,
  };
}

// Cocoon Volumetric Hydrogen Emission & Absorption at a given radius r
export function getCocoonHydrogenLuminosity(
  distanceFromBHQ16: q16_t,
  bhState: MoM_BHStarState = DEFAULT_MOM_BHSTAR
): {
  emissionQ16: q16_t;
  absorptionQ16: q16_t;
  temperatureK: number;
} {
  if (distanceFromBHQ16 > bhState.cocoonRadiusQ16) {
    return { emissionQ16: 0, absorptionQ16: 0, temperatureK: 2.7 };
  }

  // Heating gradient: T(r) = T_core * (R_isco / r)^(3/4)
  const normR = Math.max(0.1, distanceFromBHQ16 / bhState.cocoonRadiusQ16);
  const temp = Math.round(DEFAULT_MOM_BHSTAR.coreTemperatureK * Math.pow(0.2 / normR, 0.75));

  // Extreme 100 Billion Solar luminosity concentrated near the accretion boundary
  const emissionNorm = Math.min(1.0, 1.0 / (normR * normR * 4.0 + 0.1));
  const absorptionNorm = Math.min(1.0, 0.8 / (normR + 0.2));

  return {
    emissionQ16: floatToQ16(emissionNorm),
    absorptionQ16: floatToQ16(absorptionNorm),
    temperatureK: temp,
  };
}
