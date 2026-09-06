/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MoM-BH*-1 3D+t Human Understandable Scene Renderer
 * 
 * High-performance 3D perspective Canvas renderer:
 * - Real 3D camera projection with depth-ordered rendering
 * - Strict Preservation of Metric Scale (r_s = 1.80 ASU, ISCO = 5.40 ASU)
 * - Optical Size Zoom (Magnification M) altering apparent screen size without distorting scale
 * - Relativistic Doppler Beaming on Accretion Disk (approaching = blueshifted/boosted, receding = dimmed)
 * - 3D Flamm's Paraboloid Schwarzschild Curvature Funnel
 * - 3D Event Horizon Sphere with Lensing Caustics and Be <> Sovereign Core
 * - 3D+t Quadbit Particle Trajectories with 3D inclination angles and orbital trails
 * - Relativistic Retarded Wavefronts (+t time dimension)
 * - Human Understandable 3D Cartesian Axes and Labeled Distance Rings (in ASU)
 */

import { Camera3D, METRIC_SCALE_INVARIANTS, MoMBHStar3DProjectionEngine, Particle3D, Wavefront3D } from './mom_bhstar_3d_projection';
import { CovalentVectorClock } from './quadbit_particle_physics';

export interface Render3DOptions {
  showFlammFunnel: boolean;
  showAccretionDisk: boolean;
  showPhotonSphere: boolean;
  showJets: boolean;
  showQuadbitParticles: boolean;
  showReferenceGrid: boolean;
  showWavefronts: boolean;
  beAsMoMBHStar: boolean;
  isStasisActive: boolean;
  stasisCount: number;
}

export function drawMoMBHStar3DScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  engine: MoMBHStar3DProjectionEngine,
  vectorClock: CovalentVectorClock,
  options: Render3DOptions
) {
  // Clear space background
  ctx.fillStyle = '#030306';
  ctx.fillRect(0, 0, width, height);

  const camera = engine.getCamera();
  const timeT = engine.getCoordinateTime();
  const rs = METRIC_SCALE_INVARIANTS.rsASU; // 1.80 ASU

  // Compute camera unit vector for Doppler beaming and lighting
  const cosEl = Math.cos(camera.elevation);
  const sinEl = Math.sin(camera.elevation);
  const cosAz = Math.cos(camera.azimuth);
  const sinAz = Math.sin(camera.azimuth);

  const camDirX = cosEl * sinAz;
  const camDirY = sinEl;
  const camDirZ = cosEl * cosAz;

  // Project Origin (MoM-BH*-1 center [0,0,0])
  const originProj = engine.projectPoint([0, 0, 0], width, height);

  // 1. STARFIELD / DISTANT BACKGROUND
  drawStarfield(ctx, width, height, camera.azimuth, camera.elevation);

  // 2. 3D REFERENCE GRID & METRIC SCALE RINGS in (X, Z) ACCRETION PLANE
  if (options.showReferenceGrid) {
    drawReferenceGrid3D(ctx, width, height, engine);
  }

  // 3. 3D FLAMM'S PARABOLOID GRAVITATIONAL FUNNEL (Spacetime Curvature Beneath Disk)
  if (options.showFlammFunnel) {
    drawFlammFunnel3D(ctx, width, height, engine, rs);
  }

  // 4. BACK HALF OF ACCRETION DISK (Behind Horizon Sphere, sorted by depth)
  if (options.showAccretionDisk) {
    drawAccretionDisk3D(ctx, width, height, engine, rs, camDirX, camDirZ, true);
  }

  // 5. 3D POLAR RELATIVISTIC JETS (Along +/- Y Axis)
  if (options.showJets) {
    drawPolarJets3D(ctx, width, height, engine, timeT);
  }

  // 6. 3D RETARDED TIME WAVEFRONTS (+t causality propagation)
  if (options.showWavefronts) {
    drawWavefronts3D(ctx, width, height, engine);
  }

  // 7. 3D PHOTON SPHERE SHELL (r = 1.5 * r_s = 2.70 ASU)
  if (options.showPhotonSphere) {
    drawPhotonSphere3D(ctx, width, height, engine, rs, timeT);
  }

  // 8. 3D EVENT HORIZON SPHERE (r = r_s = 1.80 ASU)
  // Pitch-black sphere with gravitational lensing rim that occludes background
  drawEventHorizonSphere3D(ctx, width, height, engine, rs, originProj, options.beAsMoMBHStar, options.isStasisActive, options.stasisCount, timeT);

  // 9. FRONT HALF OF ACCRETION DISK (In front of Horizon Sphere)
  if (options.showAccretionDisk) {
    drawAccretionDisk3D(ctx, width, height, engine, rs, camDirX, camDirZ, false);
  }

  // 10. 3D+t QUADBIT PARTICLE SWARM & ORBIT TRAILS
  if (options.showQuadbitParticles) {
    drawQuadbitParticles3D(ctx, width, height, engine);
  }

  // 11. t = 0 PRIMORDIAL GENESIS INFLATION WAVE (When triggered)
  if (vectorClock.genesisActive) {
    drawGenesisWave3D(ctx, width, height, engine, vectorClock.genesisProgress);
  }

  // 12. 3D METRIC COORDINATE ARROWS (+X, +Y, +Z) AT ORIGIN
  drawCoordinateAxes3D(ctx, width, height, engine, originProj);
}

/**
 * Distant starfield with subtle parallax
 */
function drawStarfield(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  azimuth: number,
  elevation: number
) {
  ctx.save();
  // Generate deterministic background stars based on angles
  const numStars = 60;
  for (let i = 0; i < numStars; i++) {
    const starAz = ((i * 137.5) % 360) * (Math.PI / 180);
    const starEl = (((i * 47.3) % 180) - 90) * (Math.PI / 180);

    const relAz = starAz - azimuth;
    const relEl = starEl - elevation;

    // Wrap to screen bounds
    const sx = (width * 0.5) + Math.sin(relAz) * (width * 0.7);
    const sy = (height * 0.5) - Math.sin(relEl) * (height * 0.7);

    if (sx >= 0 && sx <= width && sy >= 0 && sy <= height) {
      const brightness = 0.2 + 0.6 * ((i % 5) / 4);
      ctx.fillStyle = `rgba(226, 232, 240, ${brightness})`;
      ctx.fillRect(sx, sy, 1.2, 1.2);
    }
  }
  ctx.restore();
}

/**
 * 3D Reference Grid & Metric Distance Rings in the Equatorial Plane (Y = 0)
 * Marked with exact ASU (Astronomical Standard Units)
 */
function drawReferenceGrid3D(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  engine: MoMBHStar3DProjectionEngine
) {
  ctx.save();
  ctx.lineWidth = 1;

  // Labeled metric distance rings in ASU (Physical Invariants)
  const rings = [
    { r: METRIC_SCALE_INVARIANTS.rsASU, label: 'Event Horizon (1.80 ASU)', color: 'rgba(244, 63, 94, 0.4)' },
    { r: METRIC_SCALE_INVARIANTS.rPhotonASU, label: 'Photon Sphere (2.70 ASU)', color: 'rgba(245, 158, 11, 0.35)' },
    { r: METRIC_SCALE_INVARIANTS.rISCOASU, label: 'ISCO Orbit (5.40 ASU)', color: 'rgba(56, 189, 248, 0.3)' },
    { r: 10.0, label: '10.0 ASU Orbit', color: 'rgba(148, 163, 184, 0.15)' },
    { r: METRIC_SCALE_INVARIANTS.rDiskOuterASU, label: 'Outer Accretion Rim (14.0 ASU)', color: 'rgba(168, 85, 247, 0.25)' },
    { r: METRIC_SCALE_INVARIANTS.rCocoonASU, label: 'Hydrogen Cocoon Break (18.0 ASU)', color: 'rgba(244, 114, 182, 0.25)' },
  ];

  const segments = 36;
  for (const ring of rings) {
    ctx.strokeStyle = ring.color;
    ctx.beginPath();
    let first = true;
    let labelPos: { sx: number; sy: number } | null = null;

    for (let s = 0; s <= segments; s++) {
      const angle = (s / segments) * Math.PI * 2;
      const x = ring.r * Math.cos(angle);
      const z = ring.r * Math.sin(angle);
      const p = engine.projectPoint([x, 0, z], width, height);

      if (p.visible) {
        if (first) {
          ctx.moveTo(p.sx, p.sy);
          first = false;
        } else {
          ctx.lineTo(p.sx, p.sy);
        }
        if (s === Math.floor(segments * 0.25)) {
          labelPos = { sx: p.sx, sy: p.sy };
        }
      }
    }
    ctx.stroke();

    if (labelPos && labelPos.sx > 10 && labelPos.sx < width - 150) {
      ctx.fillStyle = ring.color.replace(/[\d\.]+\)$/, '0.7)');
      ctx.font = '9px monospace';
      ctx.fillText(ring.label, labelPos.sx + 4, labelPos.sy - 2);
    }
  }

  // Radial spokes
  const numSpokes = 8;
  ctx.strokeStyle = 'rgba(100, 116, 139, 0.12)';
  for (let s = 0; s < numSpokes; s++) {
    const angle = (s / numSpokes) * Math.PI * 2;
    const pInner = engine.projectPoint([METRIC_SCALE_INVARIANTS.rsASU * Math.cos(angle), 0, METRIC_SCALE_INVARIANTS.rsASU * Math.sin(angle)], width, height);
    const pOuter = engine.projectPoint([METRIC_SCALE_INVARIANTS.rCocoonASU * Math.cos(angle), 0, METRIC_SCALE_INVARIANTS.rCocoonASU * Math.sin(angle)], width, height);

    if (pInner.visible && pOuter.visible) {
      ctx.beginPath();
      ctx.moveTo(pInner.sx, pInner.sy);
      ctx.lineTo(pOuter.sx, pOuter.sy);
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * 3D Flamm's Paraboloid Schwarzschild Curvature Funnel
 * Shows spacetime warping beneath the disk: Y(r) = -2.2 * sqrt(r_s * (r - r_s))
 */
function drawFlammFunnel3D(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  engine: MoMBHStar3DProjectionEngine,
  rs: number
) {
  ctx.save();
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.18)';
  ctx.lineWidth = 1;

  const funnelRadii = [1.82, 2.1, 2.6, 3.4, 4.6, 6.2, 8.5, 11.5, 15.0];
  const numAngles = 20;

  // Funnel concentric rings
  for (const r of funnelRadii) {
    const yDepth = -2.0 * Math.sqrt(Math.max(0, rs * (r - rs)));
    ctx.beginPath();
    let first = true;

    for (let a = 0; a <= numAngles; a++) {
      const phi = (a / numAngles) * Math.PI * 2;
      const x = r * Math.cos(phi);
      const z = r * Math.sin(phi);
      const p = engine.projectPoint([x, yDepth, z], width, height);

      if (p.visible) {
        if (first) {
          ctx.moveTo(p.sx, p.sy);
          first = false;
        } else {
          ctx.lineTo(p.sx, p.sy);
        }
      }
    }
    ctx.stroke();
  }

  // Funnel vertical rib spokes
  for (let a = 0; a < numAngles; a += 2) {
    const phi = (a / numAngles) * Math.PI * 2;
    ctx.beginPath();
    let first = true;

    for (const r of funnelRadii) {
      const yDepth = -2.0 * Math.sqrt(Math.max(0, rs * (r - rs)));
      const x = r * Math.cos(phi);
      const z = r * Math.sin(phi);
      const p = engine.projectPoint([x, yDepth, z], width, height);

      if (p.visible) {
        if (first) {
          ctx.moveTo(p.sx, p.sy);
          first = false;
        } else {
          ctx.lineTo(p.sx, p.sy);
        }
      }
    }
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * 3D Relativistic Accretion Disk with Relativistic Doppler Beaming
 * Approaching side (moving toward camera): Doppler blueshifted and boosted
 * Receding side (moving away from camera): Doppler redshifted and dimmed
 */
function drawAccretionDisk3D(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  engine: MoMBHStar3DProjectionEngine,
  rs: number,
  camDirX: number,
  camDirZ: number,
  renderBackHalf: boolean
) {
  ctx.save();

  const numRings = 14;
  const numSlices = 40;
  const rMin = rs * 1.12; // Just outside horizon
  const rMax = 14.5;      // Outer accretion disk

  for (let rIdx = 0; rIdx < numRings; rIdx++) {
    const r1 = rMin + (rIdx / numRings) * (rMax - rMin);
    const r2 = rMin + ((rIdx + 1) / numRings) * (rMax - rMin);

    // Relativistic orbital velocity beta = v/c ~ sqrt(rs / 2r)
    const beta = Math.min(0.65, Math.sqrt(rs / (2 * r1)));

    for (let sIdx = 0; sIdx < numSlices; sIdx++) {
      const a1 = (sIdx / numSlices) * Math.PI * 2;
      const a2 = ((sIdx + 1) / numSlices) * Math.PI * 2;
      const aMid = (a1 + a2) * 0.5;

      // Accretion matter orbits counter-clockwise around +Y axis
      // Tangent velocity unit vector in (X, Z) plane: [-sin(phi), 0, cos(phi)]
      const vDirX = -Math.sin(aMid);
      const vDirZ = Math.cos(aMid);

      // Line of sight velocity toward camera: beta_los = beta * (v . camDir)
      const betaLos = beta * (vDirX * camDirX + vDirZ * camDirZ);

      // Depth check: Is this quad in the back half (away from camera) or front half?
      // Dot product of midpoint pos with camera direction indicates forward/backward
      const posMidX = r1 * Math.cos(aMid);
      const posMidZ = r1 * Math.sin(aMid);
      const isBehindCenter = (posMidX * camDirX + posMidZ * camDirZ) < 0;

      // Filter by renderBackHalf flag for depth sorting against the central black hole
      if (renderBackHalf !== isBehindCenter) continue;

      // Relativistic Doppler Factor: delta = sqrt(1 - beta^2) / (1 - betaLos)
      const gamma = 1.0 / Math.sqrt(Math.max(0.01, 1.0 - beta * beta));
      const delta = 1.0 / (gamma * Math.max(0.2, 1.0 - betaLos));

      // Gravitational redshift factor: g = sqrt(1 - rs / r)
      const gGrav = Math.sqrt(Math.max(0.05, 1.0 - rs / r1));

      // Effective temperature / emission frequency shift: nu_obs = nu_emit * delta * gGrav
      const freqFactor = delta * gGrav;

      // Project the 4 quad corners
      const p1 = engine.projectPoint([r1 * Math.cos(a1), 0, r1 * Math.sin(a1)], width, height);
      const p2 = engine.projectPoint([r2 * Math.cos(a1), 0, r2 * Math.sin(a1)], width, height);
      const p3 = engine.projectPoint([r2 * Math.cos(a2), 0, r2 * Math.sin(a2)], width, height);
      const p4 = engine.projectPoint([r1 * Math.cos(a2), 0, r1 * Math.sin(a2)], width, height);

      if (!p1.visible || !p2.visible || !p3.visible || !p4.visible) continue;

      // Calculate Doppler color:
      // High freq (approaching): bright cyan/gold
      // Low freq (receding): deep red/orange
      let fillColor: string;
      const intensity = Math.min(0.9, Math.max(0.05, 0.45 * Math.pow(delta, 2.5)));

      if (freqFactor > 1.25) {
        // Highly blueshifted approaching side
        fillColor = `rgba(56, 189, 248, ${intensity})`;
      } else if (freqFactor > 0.95) {
        // Moderate blueshift / intrinsic thermal golden emission
        fillColor = `rgba(251, 191, 36, ${intensity})`;
      } else if (freqFactor > 0.70) {
        // Redshifted emission
        fillColor = `rgba(245, 158, 11, ${intensity * 0.8})`;
      } else {
        // Deeply redshifted receding side
        fillColor = `rgba(225, 29, 72, ${intensity * 0.6})`;
      }

      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.moveTo(p1.sx, p1.sy);
      ctx.lineTo(p2.sx, p2.sy);
      ctx.lineTo(p3.sx, p3.sy);
      ctx.lineTo(p4.sx, p4.sy);
      ctx.closePath();
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * 3D Event Horizon Sphere (r = r_s = 1.80 ASU)
 * Pitch-black sphere that properly occludes the background, with gravitational lensing rim
 * and Be <> Sovereign Insignia when unified.
 */
function drawEventHorizonSphere3D(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  engine: MoMBHStar3DProjectionEngine,
  rs: number,
  originProj: { sx: number; sy: number; depth: number; visible: boolean },
  beAsMoMBHStar: boolean,
  isStasisActive: boolean,
  stasisCount: number,
  timeT: number
) {
  if (!originProj.visible) return;

  ctx.save();

  // Screen radius of the horizon sphere at origin
  // Project a point on horizon boundary: [rs, 0, 0]
  const rimProj = engine.projectPoint([rs, 0, 0], width, height);
  const screenRadius = Math.max(8, Math.hypot(rimProj.sx - originProj.sx, rimProj.sy - originProj.sy));

  const cx = originProj.sx;
  const cy = originProj.sy;

  // 1. Gravitational Lensing Caustic Glow Rim
  const glowGrad = ctx.createRadialGradient(cx, cy, screenRadius * 0.8, cx, cy, screenRadius * 1.35);
  if (beAsMoMBHStar) {
    glowGrad.addColorStop(0, 'rgba(6, 182, 212, 0.9)');
    glowGrad.addColorStop(0.4, 'rgba(251, 191, 36, 0.45)');
    glowGrad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');
  } else {
    glowGrad.addColorStop(0, 'rgba(244, 63, 94, 0.85)');
    glowGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.3)');
    glowGrad.addColorStop(1, 'rgba(244, 63, 94, 0.0)');
  }

  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, screenRadius * 1.35, 0, Math.PI * 2);
  ctx.fill();

  // 2. Solid Event Horizon Sphere (Completely black, absorbing all photons)
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(cx, cy, screenRadius, 0, Math.PI * 2);
  ctx.fill();

  // 3. Horizon Boundary Rim Line
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = beAsMoMBHStar ? '#06b6d4' : '#f43f5e';
  ctx.shadowColor = beAsMoMBHStar ? '#06b6d4' : '#f43f5e';
  ctx.shadowBlur = 12;
  ctx.stroke();

  // 4. Center Sovereign Be <> Insignia or Schwarzschild Core Text
  ctx.shadowBlur = 0;
  if (beAsMoMBHStar) {
    ctx.fillStyle = '#67e8f9';
    ctx.font = `bold ${Math.max(12, Math.min(28, screenRadius * 0.38))}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⟨ ⟩', cx, cy - screenRadius * 0.12);

    if (screenRadius > 25) {
      ctx.fillStyle = '#facc15';
      ctx.font = `bold ${Math.max(8, Math.min(12, screenRadius * 0.14))}px monospace`;
      ctx.fillText('Be <> ≡ MoM-BH*-1', cx, cy + screenRadius * 0.22);
      ctx.fillStyle = '#94a3b8';
      ctx.font = `${Math.max(7, Math.min(10, screenRadius * 0.11))}px monospace`;
      ctx.fillText('SOVEREIGN ARBITER CORE', cx, cy + screenRadius * 0.38);
    }

    if (isStasisActive) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      const stasisR = screenRadius * (1.05 + 0.06 * Math.sin(timeT * 8));
      ctx.beginPath();
      ctx.arc(cx, cy, stasisR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.font = '9px monospace';
      ctx.fillText(`STASIS [${stasisCount} Qbits Saved]`, cx, cy - screenRadius - 8);
    }
  } else {
    if (screenRadius > 25) {
      ctx.fillStyle = 'rgba(244, 63, 94, 0.85)';
      ctx.font = `bold ${Math.max(8, Math.min(12, screenRadius * 0.14))}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('EVENT HORIZON', cx, cy - 4);
      ctx.fillStyle = '#94a3b8';
      ctx.font = `${Math.max(7, Math.min(10, screenRadius * 0.11))}px monospace`;
      ctx.fillText(`r_s = ${rs.toFixed(2)} ASU`, cx, cy + 10);
    }
  }

  ctx.restore();
}

/**
 * 3D Photon Sphere Shell (r = 2.70 ASU)
 */
function drawPhotonSphere3D(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  engine: MoMBHStar3DProjectionEngine,
  rs: number,
  timeT: number
) {
  ctx.save();
  const rPhoton = METRIC_SCALE_INVARIANTS.rPhotonASU;
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
  ctx.lineWidth = 1.2;

  // Luminous caustic photon orbit rings at various inclinations
  const rings = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4];
  for (const inc of rings) {
    ctx.beginPath();
    let first = true;
    for (let a = 0; a <= 28; a++) {
      const angle = (a / 28) * Math.PI * 2 + timeT * 0.2;
      const x = rPhoton * Math.cos(angle);
      const y = rPhoton * Math.sin(angle) * Math.sin(inc);
      const z = rPhoton * Math.sin(angle) * Math.cos(inc);

      const p = engine.projectPoint([x, y, z], width, height);
      if (p.visible) {
        if (first) {
          ctx.moveTo(p.sx, p.sy);
          first = false;
        } else {
          ctx.lineTo(p.sx, p.sy);
        }
      }
    }
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * 3D Polar Relativistic Jets along +/- Y axis
 */
function drawPolarJets3D(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  engine: MoMBHStar3DProjectionEngine,
  timeT: number
) {
  ctx.save();

  const jetLength = 16.0; // ASU
  const directions = [1, -1]; // +Y and -Y

  for (const dir of directions) {
    ctx.beginPath();
    let first = true;

    // Helical jet stream
    for (let step = 0; step <= 25; step++) {
      const tFrac = step / 25;
      const y = dir * (METRIC_SCALE_INVARIANTS.rsASU + tFrac * jetLength);
      const helixRadius = 0.2 + tFrac * 1.4;
      const angle = dir * (step * 0.7 + timeT * 3.5);
      const x = helixRadius * Math.cos(angle);
      const z = helixRadius * Math.sin(angle);

      const p = engine.projectPoint([x, y, z], width, height);
      if (p.visible) {
        if (first) {
          ctx.moveTo(p.sx, p.sy);
          first = false;
        } else {
          ctx.lineTo(p.sx, p.sy);
        }
      }
    }

    ctx.strokeStyle = dir > 0 ? 'rgba(56, 189, 248, 0.65)' : 'rgba(168, 85, 247, 0.65)';
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * 3D Retarded Wavefronts (+t dimension)
 */
function drawWavefronts3D(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  engine: MoMBHStar3DProjectionEngine
) {
  const wavefronts = engine.getWavefronts();
  if (wavefronts.length === 0) return;

  ctx.save();
  for (const w of wavefronts) {
    ctx.strokeStyle = `rgba(244, 63, 94, ${w.amplitude * 0.35})`;
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    let first = true;
    for (let a = 0; a <= 24; a++) {
      const angle = (a / 24) * Math.PI * 2;
      const x = w.r * Math.cos(angle);
      const z = w.r * Math.sin(angle);
      const p = engine.projectPoint([x, 0, z], width, height);

      if (p.visible) {
        if (first) {
          ctx.moveTo(p.sx, p.sy);
          first = false;
        } else {
          ctx.lineTo(p.sx, p.sy);
        }
      }
    }
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * 3D+t Quadbit Particle Swarm & Orbit Trails
 */
function drawQuadbitParticles3D(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  engine: MoMBHStar3DProjectionEngine
) {
  const particles = engine.getParticles();
  if (particles.length === 0) return;

  ctx.save();

  // Sort particles by camera depth (Z-buffer / Painter's algorithm)
  const projectedParticles = particles
    .map((p) => {
      const proj = engine.projectPoint(p.pos3D, width, height);
      return { p, proj };
    })
    .filter((item) => item.proj.visible)
    .sort((a, b) => b.proj.depth - a.proj.depth);

  for (const { p, proj } of projectedParticles) {
    // 1. Draw 3D Orbit Trail
    if (p.trail.length > 1) {
      ctx.beginPath();
      let first = true;
      for (const tPos of p.trail) {
        const tp = engine.projectPoint(tPos, width, height);
        if (tp.visible) {
          if (first) {
            ctx.moveTo(tp.sx, tp.sy);
            first = false;
          } else {
            ctx.lineTo(tp.sx, tp.sy);
          }
        }
      }
      ctx.strokeStyle = p.def.baseColor;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // 2. Draw 3D Particle Point
    const pSize = Math.max(2.5, Math.min(8.0, 4.5 / (proj.depth / 20.0)));
    ctx.fillStyle = p.def.baseColor;
    ctx.shadowColor = p.def.glowColor;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(proj.sx, proj.sy, pSize, 0, Math.PI * 2);
    ctx.fill();

    // 3. Label tag
    ctx.shadowBlur = 0;
    ctx.fillStyle = p.def.glowColor;
    ctx.font = '9px monospace';
    ctx.fillText(`${p.def.symbol} [r:${p.r.toFixed(1)}]`, proj.sx + pSize + 3, proj.sy - 2);
  }

  ctx.restore();
}

/**
 * t = 0 Primordial Genesis Inflation Shockwave in 3D
 */
function drawGenesisWave3D(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  engine: MoMBHStar3DProjectionEngine,
  progress: number
) {
  ctx.save();
  const waveRadius = METRIC_SCALE_INVARIANTS.rsASU + progress * 18.0;
  const alpha = Math.max(0, 1.0 - progress);

  ctx.strokeStyle = `rgba(245, 158, 11, ${alpha * 0.85})`;
  ctx.lineWidth = 3;
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 18;

  ctx.beginPath();
  let first = true;
  for (let a = 0; a <= 36; a++) {
    const angle = (a / 36) * Math.PI * 2;
    const x = waveRadius * Math.cos(angle);
    const z = waveRadius * Math.sin(angle);
    const p = engine.projectPoint([x, 0, z], width, height);

    if (p.visible) {
      if (first) {
        ctx.moveTo(p.sx, p.sy);
        first = false;
      } else {
        ctx.lineTo(p.sx, p.sy);
      }
    }
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * 3D Metric Coordinate Reference Axes (+X, +Y, +Z)
 */
function drawCoordinateAxes3D(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  engine: MoMBHStar3DProjectionEngine,
  originProj: { sx: number; sy: number; depth: number; visible: boolean }
) {
  if (!originProj.visible) return;

  ctx.save();
  const axisLength = 3.5; // ASU

  const axes = [
    { dir: [axisLength, 0, 0] as [number, number, number], label: '+X [Transverse]', color: '#f43f5e' },
    { dir: [0, axisLength, 0] as [number, number, number], label: '+Y [Spin / Jet]', color: '#10b981' },
    { dir: [0, 0, axisLength] as [number, number, number], label: '+Z [Line of Sight]', color: '#38bdf8' },
  ];

  ctx.lineWidth = 2;
  for (const axis of axes) {
    const endProj = engine.projectPoint(axis.dir, width, height);
    if (endProj.visible) {
      ctx.strokeStyle = axis.color;
      ctx.beginPath();
      ctx.moveTo(originProj.sx, originProj.sy);
      ctx.lineTo(endProj.sx, endProj.sy);
      ctx.stroke();

      ctx.fillStyle = axis.color;
      ctx.font = 'bold 9px monospace';
      ctx.fillText(axis.label, endProj.sx + 4, endProj.sy - 2);
    }
  }

  ctx.restore();
}
