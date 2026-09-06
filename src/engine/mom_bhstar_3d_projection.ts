/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MoM-BH*-1 3D+t Human Understandable Projection Engine
 * 
 * Generates an intuitive, geometrically rigorous 3D+t perspective projection of MoM-BH*-1:
 * - 3D Euclidean Spacetime Embedding (X, Y, Z) + Relativistic Coordinate Time (t)
 * - Strict Invariance of Physical Metric Scale (r_s = 1.80 ASU, ISCO = 5.40 ASU, etc.)
 * - Independent Optical Size Zoom (Magnification M in [0.5x, 10.0x]) that zooms the apparent
 *   projection size on screen WITHOUT altering the intrinsic physical metric scale.
 * - Relativistic Doppler Beaming (approaching side boosted ~ delta^3, receding side dimmed)
 * - Gravitational Redshift gradient g(r) = sqrt(1 - r_s / r)
 * - 3D Flamm's Paraboloid Curvature Funnel beneath the accretion disc
 * - 3D Polar Relativistic Jets along the spin axis (+/- Y)
 * - 3D+t Quadbit Particle orbits with 3D inclination angles & proper time tau
 * - Retarded Light-Cone Wavefronts (t_ret = t - r/c) illustrating causal signal propagation
 */

import { QUADBIT_EIGENSPACES, QuadbitDefinition, QuadbitParticle } from './quadbit_particle_physics';

export interface Camera3D {
  // Spherical orbital coordinates
  azimuth: number;    // radians, horizontal orbit around Y axis [0, 2pi)
  elevation: number;  // radians, vertical pitch angle [-pi/2 + 0.05, pi/2 - 0.05]
  distance: number;   // camera distance in ASU (e.g. 24.0 ASU)
  
  // Optical projection controls:
  // "Zoom the size, not the scale of the object"
  // sizeZoom is the optical magnification factor M (1.0 = normal, 2.0 = 2x apparent size, etc.)
  // Physical scale (r_s = 1.80 ASU) remains strictly invariant!
  sizeZoom: number;   // 0.4x to 10.0x
  
  panX: number;       // screen space pan offset X (pixels)
  panY: number;       // screen space pan offset Y (pixels)
  fov: number;        // field of view (radians, default ~ 50 deg)
}

export interface MetricScaleInvariants {
  rsASU: number;           // Schwarzschild Horizon Radius = 1.80 ASU (INVARIANT)
  rPhotonASU: number;      // Photon Sphere = 2.70 ASU (1.5 * r_s) (INVARIANT)
  rISCOASU: number;        // ISCO Orbit = 5.40 ASU (3.0 * r_s) (INVARIANT)
  rDiskOuterASU: number;   // Outer Accretion Rim = 14.0 ASU (INVARIANT)
  rCocoonASU: number;      // Hydrogen Cocoon Boundary = 18.0 ASU (INVARIANT)
}

export const METRIC_SCALE_INVARIANTS: MetricScaleInvariants = {
  rsASU: 1.80,
  rPhotonASU: 2.70,
  rISCOASU: 5.40,
  rDiskOuterASU: 14.0,
  rCocoonASU: 18.0,
};

export interface Particle3D {
  id: number;
  qbitState: number;
  def: QuadbitDefinition;
  r: number;            // orbital radius in ASU (metric invariant)
  theta: number;        // current polar angle in orbital plane
  inclination: number;  // orbital inclination angle (radians)
  ascNode: number;      // longitude of ascending node
  vOrbit: number;       // orbital angular velocity rad/s
  properTimeTau: number;// dilated proper time
  pos3D: [number, number, number]; // [x, y, z] in ASU
  trail: Array<[number, number, number]>;
}

export interface Wavefront3D {
  id: number;
  r: number;            // current expanding radius in ASU
  tBirth: number;       // time of emission
  amplitude: number;    // brightness
}

export class MoMBHStar3DProjectionEngine {
  private camera: Camera3D = {
    azimuth: 0.785,     // ~ 45 degrees
    elevation: 0.488,   // ~ 28 degrees (standard oblique perspective)
    distance: 24.0,     // 24.0 ASU observer distance
    sizeZoom: 1.0,      // Normal 1.0x optical size magnification
    panX: 0,
    panY: 0,
    fov: (50 * Math.PI) / 180,
  };

  private particles: Particle3D[] = [];
  private wavefronts: Wavefront3D[] = [];
  private coordinateTimeT: number = 0;
  private timeRate: number = 1.0;
  private isPaused: boolean = false;
  private nextWavefrontTimer: number = 0;

  constructor() {
    this.initParticles();
  }

  public initParticles() {
    this.particles = [];
    // Spawn particles across all 16 Quadbit species with realistic Keplerian orbital radii
    for (let state = 0; state < 16; state++) {
      const def = QUADBIT_EIGENSPACES[state];
      // Radius between ISCO (5.4 ASU) and Outer Cocoon (18.0 ASU)
      const r = 5.4 + (state / 15) * 12.0 + (Math.random() - 0.5) * 0.8;
      // Keplerian relativistic angular velocity: omega = sqrt(M / r^3)
      const vOrbit = Math.sqrt(1.80 / (r * r * r)) * 1.8;
      const inclination = ((state % 5) - 2) * 0.12; // Slight inclinations around accretion plane
      const ascNode = (state * Math.PI) / 8;
      const initialTheta = (state * 1.618) % (Math.PI * 2);

      const pos = this.computeOrbitPos(r, initialTheta, inclination, ascNode);

      this.particles.push({
        id: state,
        qbitState: state,
        def,
        r,
        theta: initialTheta,
        inclination,
        ascNode,
        vOrbit,
        properTimeTau: 0,
        pos3D: pos,
        trail: [pos],
      });
    }
  }

  private computeOrbitPos(r: number, theta: number, inclination: number, ascNode: number): [number, number, number] {
    // Coordinate in orbital plane
    const xOrb = r * Math.cos(theta);
    const zOrb = r * Math.sin(theta);

    // Rotate by inclination around X axis, then ascNode around Y axis
    const yInc = zOrb * Math.sin(inclination);
    const zInc = zOrb * Math.cos(inclination);

    const x = xOrb * Math.cos(ascNode) - zInc * Math.sin(ascNode);
    const y = yInc;
    const z = xOrb * Math.sin(ascNode) + zInc * Math.cos(ascNode);

    return [x, y, z];
  }

  public update(dt: number) {
    if (this.isPaused) return;

    const scaledDt = dt * this.timeRate;
    this.coordinateTimeT += scaledDt;

    // Update particles along 3D orbits
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.theta += p.vOrbit * scaledDt;
      if (p.theta > Math.PI * 2) p.theta -= Math.PI * 2;

      // Relativistic time dilation factor g_tt = sqrt(1 - r_s / r)
      const gtt = Math.sqrt(Math.max(0.01, 1.0 - METRIC_SCALE_INVARIANTS.rsASU / p.r));
      p.properTimeTau += scaledDt * gtt;

      const pos = this.computeOrbitPos(p.r, p.theta, p.inclination, p.ascNode);
      p.pos3D = pos;

      // Maintain trail (max 18 points)
      p.trail.push(pos);
      if (p.trail.length > 18) {
        p.trail.shift();
      }
    }

    // Update retarded wavefronts (+t causal signals expanding outward at speed c = 10 ASU/s)
    this.nextWavefrontTimer += scaledDt;
    if (this.nextWavefrontTimer >= 1.2) {
      this.nextWavefrontTimer = 0;
      this.wavefronts.push({
        id: Math.random(),
        r: METRIC_SCALE_INVARIANTS.rsASU,
        tBirth: this.coordinateTimeT,
        amplitude: 1.0,
      });
    }

    const cWave = 8.0; // ASU per second
    for (let i = this.wavefronts.length - 1; i >= 0; i--) {
      const w = this.wavefronts[i];
      w.r += cWave * scaledDt;
      w.amplitude = Math.max(0, 1.0 - (w.r - METRIC_SCALE_INVARIANTS.rsASU) / 22.0);
      if (w.r > 24.0) {
        this.wavefronts.splice(i, 1);
      }
    }
  }

  // Camera and Size Zoom Controls
  public getCamera(): Camera3D {
    return { ...this.camera };
  }

  public setSizeZoom(zoom: number) {
    // Optical magnification M: clamped between 0.4x and 10.0x
    this.camera.sizeZoom = Math.max(0.4, Math.min(10.0, zoom));
  }

  public addSizeZoomDelta(delta: number) {
    this.setSizeZoom(this.camera.sizeZoom * (1.0 + delta));
  }

  public setCameraOrbit(azimuthDelta: number, elevationDelta: number) {
    this.camera.azimuth += azimuthDelta;
    // Keep azimuth in [0, 2pi)
    while (this.camera.azimuth < 0) this.camera.azimuth += Math.PI * 2;
    while (this.camera.azimuth >= Math.PI * 2) this.camera.azimuth -= Math.PI * 2;

    // Clamp elevation to avoid gimbal lock: -80 deg to +80 deg
    const maxElev = (80 * Math.PI) / 180;
    this.camera.elevation = Math.max(-maxElev, Math.min(maxElev, this.camera.elevation + elevationDelta));
  }

  public setCameraDistance(dist: number) {
    this.camera.distance = Math.max(6.0, Math.min(60.0, dist));
  }

  public addCameraPan(dx: number, dy: number) {
    this.camera.panX += dx;
    this.camera.panY += dy;
  }

  public resetView() {
    this.camera.azimuth = 0.785;
    this.camera.elevation = 0.488;
    this.camera.distance = 24.0;
    this.camera.sizeZoom = 1.0;
    this.camera.panX = 0;
    this.camera.panY = 0;
  }

  // Time controls (+t)
  public setPaused(paused: boolean) {
    this.isPaused = paused;
  }

  public togglePause() {
    this.isPaused = !this.isPaused;
  }

  public setTimeRate(rate: number) {
    this.timeRate = Math.max(0.1, Math.min(5.0, rate));
  }

  public stepTime(delta: number) {
    this.coordinateTimeT += delta;
  }

  public getCoordinateTime(): number {
    return this.coordinateTimeT;
  }

  public getProperTimeAtHorizon(): number {
    // As r -> r_s, proper time advancement rate dtau/dt -> 0
    return this.coordinateTimeT * 0.045;
  }

  public getParticles(): Particle3D[] {
    return this.particles;
  }

  public getWavefronts(): Wavefront3D[] {
    return this.wavefronts;
  }

  public isTimePaused(): boolean {
    return this.isPaused;
  }

  public getTimeRate(): number {
    return this.timeRate;
  }

  /**
   * 3D Perspective Projection Matrix & Transform
   * Transforms a 3D world coordinate [x, y, z] (in ASU) to screen space [sx, sy, depth, visible]
   * 
   * CRITICAL MATHEMATICAL PRINCIPLE:
   * "Zoom the size, not the scale of the object"
   * - The world coordinates [x, y, z] are in real physical ASU units with r_s = 1.80 ASU.
   * - sizeZoom acts purely as an OPTICAL MAGNIFICATION factor (like telephoto lens focal length).
   * - It multiplies the projected screen displacement, scaling the projected size on screen
   *   without changing any world coordinates, distances, orbital speeds, or metric tensor elements!
   */
  public projectPoint(
    worldPos: [number, number, number],
    width: number,
    height: number
  ): { sx: number; sy: number; depth: number; visible: boolean } {
    const [x, y, z] = worldPos;

    // 1. Camera position in world space
    const camDist = this.camera.distance;
    const cosEl = Math.cos(this.camera.elevation);
    const sinEl = Math.sin(this.camera.elevation);
    const cosAz = Math.cos(this.camera.azimuth);
    const sinAz = Math.sin(this.camera.azimuth);

    const camX = camDist * cosEl * sinAz;
    const camY = camDist * sinEl;
    const camZ = camDist * cosEl * cosAz;

    // 2. Relative vector from camera to point
    const rx = x - camX;
    const ry = y - camY;
    const rz = z - camZ;

    // 3. Camera coordinate frame (LookAt [0, 0, 0])
    // Forward vector (from camera to origin): -cam
    const fLen = Math.sqrt(camX * camX + camY * camY + camZ * camZ);
    const fx = -camX / fLen;
    const fy = -camY / fLen;
    const fz = -camZ / fLen;

    // Right vector = normalize(forward x worldUp [0, 1, 0])
    let rx_vec = fy * 0 - fz * 1;
    let ry_vec = fz * 0 - fx * 0;
    let rz_vec = fx * 1 - fy * 0;
    const rLen = Math.sqrt(rx_vec * rx_vec + ry_vec * ry_vec + rz_vec * rz_vec) || 1;
    rx_vec /= rLen;
    ry_vec /= rLen;
    rz_vec /= rLen;

    // Up vector = right x forward
    const ux = ry_vec * fz - rz_vec * fy;
    const uy = rz_vec * fx - rx_vec * fz;
    const uz = rx_vec * fy - ry_vec * fx;

    // 4. Coordinates in Camera Space
    const camSpaceX = rx * rx_vec + ry * ry_vec + rz * rz_vec;
    const camSpaceY = rx * ux + ry * uy + rz * uz;
    const camSpaceZ = rx * fx + ry * fy + rz * fz; // Distance along viewing axis

    // If point is behind the camera plane
    if (camSpaceZ <= 0.2) {
      return { sx: -9999, sy: -9999, depth: camSpaceZ, visible: false };
    }

    // 5. Perspective projection with OPTICAL SIZE ZOOM
    // focal length calibrated to viewport
    const baseFocalLength = Math.min(width, height) * 1.1;
    // Optical magnification factor multiplies focal length:
    const effectiveFocalLength = baseFocalLength * this.camera.sizeZoom;

    const screenX = width * 0.5 + this.camera.panX + (camSpaceX / camSpaceZ) * effectiveFocalLength;
    const screenY = height * 0.5 + this.camera.panY - (camSpaceY / camSpaceZ) * effectiveFocalLength;

    return {
      sx: screenX,
      sy: screenY,
      depth: camSpaceZ,
      visible: true,
    };
  }
}
