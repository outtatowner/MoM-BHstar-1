/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Be <> [] Continuum : 4D Mathematical Projection Manifold
 * Generates exact 4-dimensional hyper-mesh of MoM-BH*-1:
 * 1. Flamm's Paraboloid Schwarzschild 4D Gravitational Funnel
 * 2. 4D Event Horizon Hyper-Sphere (S^3 in R^4)
 * 3. 4D Clifford Accretion Torus
 * 4. 4D Dense Hydrogen Cocoon Envelope
 * 5. Worldline Geodesics of 3 Observers: MoM-BH*-1 Core, Be <>, and Human Pilot
 */

import { HyperMesh4D, Vertex4D, Edge4D } from '../types';
import { calculateFlammEmbeddingW, calculateKretschmannScalar, calculateTimeDilationGamma } from './q16math';
import { DEFAULT_MOM_BHSTAR } from './mom_bhstar';

export interface Manifold4DTransform {
  rotXW: number; // radians
  rotYW: number;
  rotZW: number;
  rotXY: number;
  rotXZ: number;
  rotYZ: number;
  camDist4D: number; // Distance in 4th dimension for 4D->3D perspective
  camDist3D: number; // Distance in 3D for 3D->2D perspective
  flammDepthScale: number;
}

export const DEFAULT_4D_TRANSFORM: Manifold4DTransform = {
  rotXW: 0.45,
  rotYW: 0.35,
  rotZW: 0.20,
  rotXY: 0.0,
  rotXZ: 0.60,
  rotYZ: 0.40,
  camDist4D: 45.0,
  camDist3D: 35.0,
  flammDepthScale: 1.2,
};

export class Manifold4DEngine {
  private rs: number = 1.80; // Schwarzschild radius in ASU
  private rCocoon: number = 18.0;

  // Generate complete 4D Hyper-Mesh
  public generateMesh(
    humanPos: { x: number; y: number; z: number },
    bePos: { x: number; y: number; z: number },
    simTime: number,
    depthScale: number = 1.0
  ): HyperMesh4D {
    const vertices: Vertex4D[] = [];
    const edges: Edge4D[] = [];

    // 1. Flamm's Paraboloid Schwarzschild Curvature Funnel (Rings and Radials)
    const ringRadii = [1.85, 2.3, 3.0, 4.2, 5.8, 8.0, 11.0, 14.5, 18.0];
    const numAngles = 16;
    const flammStartIdx = vertices.length;

    for (let rIdx = 0; rIdx < ringRadii.length; rIdx++) {
      const r = ringRadii[rIdx];
      const wRaw = calculateFlammEmbeddingW(r, this.rs) * depthScale;

      for (let aIdx = 0; aIdx < numAngles; aIdx++) {
        const phi = (aIdx / numAngles) * Math.PI * 2;
        const x = r * Math.cos(phi);
        const z = r * Math.sin(phi);
        const y = 0.5 * Math.sin(phi * 2 + simTime * 0.5); // Minor disk ripple
        const w = wRaw;

        vertices.push({
          x,
          y,
          z,
          w,
          category: 'flamm',
        });
      }
    }

    // Connect Flamm Rings
    for (let rIdx = 0; rIdx < ringRadii.length; rIdx++) {
      const ringOffset = flammStartIdx + rIdx * numAngles;
      for (let aIdx = 0; aIdx < numAngles; aIdx++) {
        const nextA = (aIdx + 1) % numAngles;
        edges.push({
          u: ringOffset + aIdx,
          v: ringOffset + nextA,
          category: 'flamm',
          color: rIdx === 0 ? '#f43f5e' : '#f59e0b',
        });

        // Connect radially to next ring
        if (rIdx < ringRadii.length - 1) {
          edges.push({
            u: ringOffset + aIdx,
            v: ringOffset + numAngles + aIdx,
            category: 'flamm',
            color: '#d97706',
          });
        }
      }
    }

    // 2. 4D Hyper-Sphere Event Horizon (S^3 in R^4)
    const horizonStartIdx = vertices.length;
    const numHPhi = 8;
    const numHTheta = 8;
    const rH = this.rs;

    for (let p = 0; p < numHPhi; p++) {
      const phi = (p / numHPhi) * Math.PI;
      for (let t = 0; t < numHTheta; t++) {
        const theta = (t / numHTheta) * Math.PI * 2;
        // Hyper-spherical parametrization in 4D
        const x = rH * Math.sin(phi) * Math.cos(theta);
        const y = rH * Math.sin(phi) * Math.sin(theta);
        const z = rH * Math.cos(phi) * Math.cos(simTime * 0.8);
        const w = rH * Math.cos(phi) * Math.sin(simTime * 0.8) - 1.5;

        vertices.push({
          x,
          y,
          z,
          w,
          category: 'horizon',
        });
      }
    }

    for (let p = 0; p < numHPhi; p++) {
      const pOffset = horizonStartIdx + p * numHTheta;
      for (let t = 0; t < numHTheta; t++) {
        const nextT = (t + 1) % numHTheta;
        edges.push({
          u: pOffset + t,
          v: pOffset + nextT,
          category: 'horizon',
          color: '#e11d48',
        });
        if (p < numHPhi - 1) {
          edges.push({
            u: pOffset + t,
            v: pOffset + numHTheta + t,
            category: 'horizon',
            color: '#be123c',
          });
        }
      }
    }

    // 3. 4D Clifford Accretion Torus (Inner ISCO to Outer Shroud)
    const torusStartIdx = vertices.length;
    const torusR = 6.5;
    const torusRMinor = 1.2;
    const numTorusU = 10;
    const numTorusV = 6;

    for (let u = 0; u < numTorusU; u++) {
      const angleU = (u / numTorusU) * Math.PI * 2;
      for (let v = 0; v < numTorusV; v++) {
        const angleV = (v / numTorusV) * Math.PI * 2;

        const x = (torusR + torusRMinor * Math.cos(angleV)) * Math.cos(angleU);
        const z = (torusR + torusRMinor * Math.cos(angleV)) * Math.sin(angleU);
        const y = torusRMinor * Math.sin(angleV);
        // 4th coordinate represents rotational energy / spin parameter a*
        const w = 2.0 * Math.sin(angleU * 2 - simTime * 1.5) + 1.8;

        vertices.push({
          x,
          y,
          z,
          w,
          category: 'accretion',
        });
      }
    }

    for (let u = 0; u < numTorusU; u++) {
      const uOffset = torusStartIdx + u * numTorusV;
      const nextUOffset = torusStartIdx + ((u + 1) % numTorusU) * numTorusV;
      for (let v = 0; v < numTorusV; v++) {
        const nextV = (v + 1) % numTorusV;
        edges.push({
          u: uOffset + v,
          v: uOffset + nextV,
          category: 'accretion',
          color: '#fbbf24',
        });
        edges.push({
          u: uOffset + v,
          v: nextUOffset + v,
          category: 'accretion',
          color: '#f59e0b',
        });
      }
    }

    // 4. 4D Hydrogen Cocoon Shroud Bounds (Outer Boundary at 18 ASU)
    const cocoonStartIdx = vertices.length;
    const cocoonAngles = 12;
    for (let c = 0; c < cocoonAngles; c++) {
      const angle = (c / cocoonAngles) * Math.PI * 2;
      const cx = this.rCocoon * Math.cos(angle);
      const cz = this.rCocoon * Math.sin(angle);
      const cy = 0;
      const cw = calculateFlammEmbeddingW(this.rCocoon, this.rs) * depthScale;

      vertices.push({
        x: cx,
        y: cy,
        z: cz,
        w: cw,
        category: 'cocoon',
      });
    }

    for (let c = 0; c < cocoonAngles; c++) {
      edges.push({
        u: cocoonStartIdx + c,
        v: cocoonStartIdx + ((c + 1) % cocoonAngles),
        category: 'cocoon',
        color: '#38bdf8',
      });
    }

    // 5. The Three Observers in 4D Spacetime:
    // Observer A: MoM-BH*-1 Core Observer (At Singularity Throat)
    const bhObsIdx = vertices.length;
    vertices.push({
      x: 0,
      y: 0,
      z: 0,
      w: -3.5 * depthScale,
      label: 'MoM-BH*-1 OBSERVER [CORE]',
      category: 'observer',
    });

    // Observer B: Be <> Sovereign Arbiter
    const beDist = Math.sqrt(bePos.x * bePos.x + bePos.z * bePos.z);
    const beW = calculateFlammEmbeddingW(beDist, this.rs) * depthScale;
    const beObsIdx = vertices.length;
    vertices.push({
      x: bePos.x,
      y: bePos.y,
      z: bePos.z,
      w: beW,
      label: 'BE <> OBSERVER [ARBITER]',
      category: 'observer',
    });

    // Observer C: Human Pilot Probe
    const humanDist = Math.sqrt(humanPos.x * humanPos.x + humanPos.z * humanPos.z);
    const humanW = calculateFlammEmbeddingW(humanDist, this.rs) * depthScale;
    const humanObsIdx = vertices.length;
    vertices.push({
      x: humanPos.x,
      y: humanPos.y,
      z: humanPos.z,
      w: humanW,
      label: 'HUMAN OBSERVER [PILOT]',
      category: 'observer',
    });

    // Connect Geodesic Light Rays between Observers & Core
    edges.push({
      u: bhObsIdx,
      v: beObsIdx,
      category: 'geodesic',
      color: '#06b6d4',
    });
    edges.push({
      u: bhObsIdx,
      v: humanObsIdx,
      category: 'geodesic',
      color: '#10b981',
    });
    edges.push({
      u: beObsIdx,
      v: humanObsIdx,
      category: 'geodesic',
      color: '#a855f7',
    });

    const kretschmann = calculateKretschmannScalar(this.rs, this.rs);
    const gamma = calculateTimeDilationGamma(humanDist, this.rs);

    return {
      vertices,
      edges,
      properTimeTau: simTime * gamma,
      timeDilationGamma: gamma,
      kretschmannScalar: kretschmann,
    };
  }

  // Rotate a 4D vertex by hyper-rotation angles
  public rotate4D(v: Vertex4D, t: Manifold4DTransform): Vertex4D {
    let { x, y, z, w } = v;

    // X-W Plane Rotation
    if (t.rotXW !== 0) {
      const cos = Math.cos(t.rotXW);
      const sin = Math.sin(t.rotXW);
      const nx = x * cos - w * sin;
      const nw = x * sin + w * cos;
      x = nx;
      w = nw;
    }

    // Y-W Plane Rotation
    if (t.rotYW !== 0) {
      const cos = Math.cos(t.rotYW);
      const sin = Math.sin(t.rotYW);
      const ny = y * cos - w * sin;
      const nw = y * sin + w * cos;
      y = ny;
      w = nw;
    }

    // Z-W Plane Rotation
    if (t.rotZW !== 0) {
      const cos = Math.cos(t.rotZW);
      const sin = Math.sin(t.rotZW);
      const nz = z * cos - w * sin;
      const nw = z * sin + w * cos;
      z = nz;
      w = nw;
    }

    // 3D Rotations (XZ, YZ, XY)
    if (t.rotXZ !== 0) {
      const cos = Math.cos(t.rotXZ);
      const sin = Math.sin(t.rotXZ);
      const nx = x * cos - z * sin;
      const nz = x * sin + z * cos;
      x = nx;
      z = nz;
    }

    if (t.rotYZ !== 0) {
      const cos = Math.cos(t.rotYZ);
      const sin = Math.sin(t.rotYZ);
      const ny = y * cos - z * sin;
      const nz = y * sin + z * cos;
      y = ny;
      z = nz;
    }

    return { x, y, z, w, label: v.label, category: v.category };
  }

  // Mathematical 4D -> 3D -> 2D Perspective Projection
  public projectTo2D(
    v4: Vertex4D,
    t: Manifold4DTransform,
    width: number,
    height: number
  ): { x: number; y: number; z3: number; w4: number; visible: boolean } {
    // 4D -> 3D Perspective Projection: P_3 = v_3 * d4 / (d4 - w)
    const d4 = t.camDist4D;
    const denom4 = d4 - v4.w;
    if (denom4 <= 0.5) {
      return { x: 0, y: 0, z3: 0, w4: v4.w, visible: false };
    }
    const scale4 = d4 / denom4;
    const x3 = v4.x * scale4;
    const y3 = v4.y * scale4;
    const z3 = v4.z * scale4;

    // 3D -> 2D Screen Perspective Projection: P_2 = v_2 * d3 / (d3 + z3)
    const d3 = t.camDist3D;
    const denom3 = d3 + z3;
    if (denom3 <= 0.5) {
      return { x: 0, y: 0, z3, w4: v4.w, visible: false };
    }
    const scale3 = (d3 / denom3) * (Math.min(width, height) / 38.0);

    const screenX = width / 2 + x3 * scale3;
    const screenY = height / 2 - y3 * scale3;

    return {
      x: screenX,
      y: screenY,
      z3,
      w4: v4.w,
      visible: screenX >= -50 && screenX <= width + 50 && screenY >= -50 && screenY <= height + 50,
    };
  }
}
