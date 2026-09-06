/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Be <> [] Continuum: Q16.16 Fixed-Point Arithmetic Core
 * Zero-Float Cross-Platform Determinism ($1 \equiv 1$)
 * 32-bit Two's Complement Integer Architecture:
 * - 1 Sign Bit
 * - 15 Integer Magnitude Bits
 * - 16 Fractional Precision Bits
 * Unity Constant: 1.0 = 0x00010000 = 65536
 */

import { q16_t, Vector3_Q16 } from '../types';

export const Q16_SHIFT = 16;
export const Q16_ONE: q16_t = 1 << Q16_SHIFT; // 65536 = 0x00010000
export const Q16_HALF: q16_t = 1 << (Q16_SHIFT - 1); // 32768
export const Q16_PI: q16_t = 205887; // 3.14159265 * 65536
export const Q16_TWO_PI: q16_t = 411775;
export const Q16_HALF_PI: q16_t = 102944;
export const Q16_MIN: q16_t = -2147483648; // -2^31
export const Q16_MAX: q16_t = 2147483647;  // 2^31 - 1

// Convert floating point to Q16.16 integer
export function floatToQ16(f: number): q16_t {
  return Math.round(f * 65536) | 0;
}

// Convert Q16.16 integer to floating point (only for canvas display/UI outputs)
export function q16ToFloat(q: q16_t): number {
  return q / 65536;
}

// Format Q16.16 as hexadecimal representation for sovereign terminal
export function q16ToHex(q: q16_t): string {
  return '0x' + (q >>> 0).toString(16).padStart(8, '0').toUpperCase();
}

// Wrap-around 32-bit addition (modulo 2^32, abelian group)
export function q16_add(a: q16_t, b: q16_t): q16_t {
  return (a + b) | 0;
}

// Wrap-around 32-bit subtraction
export function q16_sub(a: q16_t, b: q16_t): q16_t {
  return (a - b) | 0;
}

// Deterministic Q16.16 Multiplication: ((a * b) >> 16) with 64-bit precision intermediate
export function q16_mul(a: q16_t, b: q16_t): q16_t {
  const product = (BigInt(a) * BigInt(b)) >> 16n;
  return Number(BigInt.asIntN(32, product));
}

// Deterministic Q16.16 Division: ((a << 16) / b) with safe zero-division guard
export function q16_div(a: q16_t, b: q16_t): q16_t {
  if (b === 0) {
    return a >= 0 ? Q16_MAX : Q16_MIN;
  }
  const quotient = (BigInt(a) << 16n) / BigInt(b);
  return Number(BigInt.asIntN(32, quotient));
}

// Integer square root for Q16.16
export function q16_sqrt(x: q16_t): q16_t {
  if (x <= 0) return 0;
  // Compute sqrt(x * 65536) in 64-bit
  const val = BigInt(x) << 16n;
  let s = 0n;
  let b = 1n << 62n;
  while (b > val) {
    b >>= 2n;
  }
  let v = val;
  while (b !== 0n) {
    if (v >= s + b) {
      v -= s + b;
      s = (s >> 1n) + b;
    } else {
      s >>= 1n;
    }
    b >>= 2n;
  }
  return Number(s);
}

// CORDIC Lookups for 16 iterations (angles in Q16.16)
const CORDIC_ANGLES: q16_t[] = [
  51472, // atan(2^0) = 45.0 deg -> 0.785398 rad
  30386, // atan(2^-1)
  16055, // atan(2^-2)
  8150,  // atan(2^-3)
  4091,  // atan(2^-4)
  2047,  // atan(2^-5)
  1024,  // atan(2^-6)
  512,   // atan(2^-7)
  256,   // atan(2^-8)
  128,   // atan(2^-9)
  64,    // atan(2^-10)
  32,    // atan(2^-11)
  16,    // atan(2^-12)
  8,     // atan(2^-13)
  4,     // atan(2^-14)
  2      // atan(2^-15)
];
// CORDIC gain K approx 0.607252935 * 65536 = 39797
const CORDIC_K: q16_t = 39797;

// Deterministic CORDIC sine and cosine in Q16.16
export function q16_cordic_sincos(theta: q16_t): { sin: q16_t; cos: q16_t } {
  // Normalize theta into [-PI, PI]
  let angle = theta;
  while (angle > Q16_PI) angle = q16_sub(angle, Q16_TWO_PI);
  while (angle < -Q16_PI) angle = q16_add(angle, Q16_TWO_PI);

  let x: q16_t = CORDIC_K;
  let y: q16_t = 0;
  let z: q16_t = angle;

  for (let i = 0; i < 16; i++) {
    const shift = i;
    const x_shift = x >> shift;
    const y_shift = y >> shift;
    const d = z >= 0 ? 1 : -1;

    if (d > 0) {
      x = q16_sub(x, y_shift);
      y = q16_add(y, x_shift);
      z = q16_sub(z, CORDIC_ANGLES[i]);
    } else {
      x = q16_add(x, y_shift);
      y = q16_sub(y, x_shift);
      z = q16_add(z, CORDIC_ANGLES[i]);
    }
  }

  return { sin: y, cos: x };
}

export function q16_sin(theta: q16_t): q16_t {
  return q16_cordic_sincos(theta).sin;
}

export function q16_cos(theta: q16_t): q16_t {
  return q16_cordic_sincos(theta).cos;
}

export function q16_abs(a: q16_t): q16_t {
  return Math.abs(a) | 0;
}

export function q16_min(a: q16_t, b: q16_t): q16_t {
  return a < b ? a : b;
}

export function q16_max(a: q16_t, b: q16_t): q16_t {
  return a > b ? a : b;
}

export function q16_clamp(val: q16_t, min: q16_t, max: q16_t): q16_t {
  if (val < min) return min;
  if (val > max) return max;
  return val;
}

// Vector3 Q16.16 Utilities
export function vec3_create(x: q16_t, y: q16_t, z: q16_t): Vector3_Q16 {
  return { x: x | 0, y: y | 0, z: z | 0 };
}

export function vec3_zero(): Vector3_Q16 {
  return { x: 0, y: 0, z: 0 };
}

export function vec3_add(a: Vector3_Q16, b: Vector3_Q16): Vector3_Q16 {
  return {
    x: q16_add(a.x, b.x),
    y: q16_add(a.y, b.y),
    z: q16_add(a.z, b.z)
  };
}

export function vec3_sub(a: Vector3_Q16, b: Vector3_Q16): Vector3_Q16 {
  return {
    x: q16_sub(a.x, b.x),
    y: q16_sub(a.y, b.y),
    z: q16_sub(a.z, b.z)
  };
}

export function vec3_scale(v: Vector3_Q16, scalarQ16: q16_t): Vector3_Q16 {
  return {
    x: q16_mul(v.x, scalarQ16),
    y: q16_mul(v.y, scalarQ16),
    z: q16_mul(v.z, scalarQ16)
  };
}

export function vec3_dot(a: Vector3_Q16, b: Vector3_Q16): q16_t {
  const p1 = q16_mul(a.x, b.x);
  const p2 = q16_mul(a.y, b.y);
  const p3 = q16_mul(a.z, b.z);
  return q16_add(q16_add(p1, p2), p3);
}

export function vec3_cross(a: Vector3_Q16, b: Vector3_Q16): Vector3_Q16 {
  return {
    x: q16_sub(q16_mul(a.y, b.z), q16_mul(a.z, b.y)),
    y: q16_sub(q16_mul(a.z, b.x), q16_mul(a.x, b.z)),
    z: q16_sub(q16_mul(a.x, b.y), q16_mul(a.y, b.x))
  };
}

export function vec3_length_sq(v: Vector3_Q16): q16_t {
  return vec3_dot(v, v);
}

export function vec3_length(v: Vector3_Q16): q16_t {
  return q16_sqrt(vec3_length_sq(v));
}

export function vec3_normalize(v: Vector3_Q16): Vector3_Q16 {
  const len = vec3_length(v);
  if (len === 0) return { x: 0, y: 0, z: Q16_ONE };
  return {
    x: q16_div(v.x, len),
    y: q16_div(v.y, len),
    z: q16_div(v.z, len)
  };
}

export function vec3_reflect(rayDir: Vector3_Q16, normal: Vector3_Q16): Vector3_Q16 {
  // R = D - 2*(D . N)*N
  const dDotN = vec3_dot(rayDir, normal);
  const twoDDotN = dDotN << 1;
  const scaledN = vec3_scale(normal, twoDDotN);
  return vec3_sub(rayDir, scaledN);
}

// Invariant validator: 1 === 1 ($1 \equiv 1$)
export function verifySovereignInvariant(a: q16_t, b: q16_t): boolean {
  return a === b;
}

// Lyapunov Energy Function Evaluation: V(x) = x^T P x
export function evaluateLyapunovEnergy(stateVectorQ16: q16_t[]): q16_t {
  let total: q16_t = 0;
  for (let i = 0; i < stateVectorQ16.length; i++) {
    const val = stateVectorQ16[i];
    total = q16_add(total, q16_mul(val, val));
  }
  return total;
}

// 4D Space-Time Vector Operations
export interface Vector4_Q16 {
  x: q16_t;
  y: q16_t;
  z: q16_t;
  w: q16_t;
}

export function vec4_create(x: q16_t, y: q16_t, z: q16_t, w: q16_t): Vector4_Q16 {
  return { x: x | 0, y: y | 0, z: z | 0, w: w | 0 };
}

// 4D Rotation in X-W plane
export function vec4_rotate_xw(v: Vector4_Q16, thetaQ16: q16_t): Vector4_Q16 {
  const { sin, cos } = q16_cordic_sincos(thetaQ16);
  return {
    x: q16_sub(q16_mul(v.x, cos), q16_mul(v.w, sin)),
    y: v.y,
    z: v.z,
    w: q16_add(q16_mul(v.x, sin), q16_mul(v.w, cos)),
  };
}

// 4D Rotation in Y-W plane
export function vec4_rotate_yw(v: Vector4_Q16, thetaQ16: q16_t): Vector4_Q16 {
  const { sin, cos } = q16_cordic_sincos(thetaQ16);
  return {
    x: v.x,
    y: q16_sub(q16_mul(v.y, cos), q16_mul(v.w, sin)),
    z: v.z,
    w: q16_add(q16_mul(v.y, sin), q16_mul(v.w, cos)),
  };
}

// 4D Rotation in Z-W plane
export function vec4_rotate_zw(v: Vector4_Q16, thetaQ16: q16_t): Vector4_Q16 {
  const { sin, cos } = q16_cordic_sincos(thetaQ16);
  return {
    x: v.x,
    y: v.y,
    z: q16_sub(q16_mul(v.z, cos), q16_mul(v.w, sin)),
    w: q16_add(q16_mul(v.z, sin), q16_mul(v.w, cos)),
  };
}

// Flamm's Paraboloid Schwarzschild 4D embedding: w(r) = 2 * sqrt(Rs * (r - Rs))
export function calculateFlammEmbeddingW(r: number, rs: number): number {
  if (r <= rs) {
    // Inside event horizon: singularity throat depth
    return -2.0 * Math.sqrt(rs * Math.max(0.01, rs - r)) - 2.5;
  }
  return 2.0 * Math.sqrt(rs * (r - rs));
}

// Kretschmann Scalar K = 48 G^2 M^2 / c^4 r^6
export function calculateKretschmannScalar(r: number, rs: number): number {
  const safeR = Math.max(0.5, r);
  return (48.0 * rs * rs) / Math.pow(safeR, 6);
}

// Gravitational time dilation factor dtau / dt = sqrt(1 - Rs / r)
export function calculateTimeDilationGamma(r: number, rs: number): number {
  if (r <= rs) return 0.0001; // Frozen at horizon to outside observer
  return Math.sqrt(1.0 - rs / r);
}

