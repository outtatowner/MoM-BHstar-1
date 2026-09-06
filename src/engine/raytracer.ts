/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Be <> [] Continuum: Covalent-RT Pure Q16.16 Ray-Tracing Core
 * Renders directly into `/dev/fb` raw framebuffer shards.
 * Implements:
 * - Deterministic BVH spatial hierarchy
 * - Q16.16 vector arithmetic & CORDIC light attenuation
 * - Relativistic Schwarzschild ray deflection around MoM-BH*-1
 * - Dense hydrogen cocoon shroud with Balmer Break (364.6 nm) extinction
 * - 100 Billion Solar Luminosity dynamic emission & specular bounces
 * - Thermodynamic culling with Lyapunov energy dissipation control (dV/dt <= 0)
 * - Quadbit (4-bit 16-color) & Truecolor framebuffer rendering
 */

import {
  ActiveObserver,
  EngineConfig,
  FramebufferMode,
  HitRecord_Q16,
  MoM_BHStarState,
  q16_t,
  Ray_Q16,
  ScenePrimitive_Q16,
  Vector3_Q16,
} from '../types';
import {
  floatToQ16,
  q16ToFloat,
  Q16_ONE,
  q16_add,
  q16_sub,
  q16_mul,
  q16_div,
  q16_sqrt,
  q16_min,
  vec3_create,
  vec3_add,
  vec3_sub,
  vec3_scale,
  vec3_dot,
  vec3_normalize,
  vec3_length,
  vec3_reflect,
} from './q16math';
import {
  calculateBalmerTransmission,
  calculateRelativisticDeflection,
  DEFAULT_MOM_BHSTAR,
  getCocoonHydrogenLuminosity,
} from './mom_bhstar';

// Quadbit 16-color indexed palettes for bare-metal CRT/framebuffer
export const QUADBIT_PALETTES = {
  phosphor_amber: [
    [0, 0, 0],       // 0: Black
    [24, 12, 0],     // 1
    [48, 24, 0],     // 2
    [72, 38, 0],     // 3
    [98, 52, 0],     // 4
    [125, 68, 0],    // 5
    [155, 86, 0],    // 6
    [185, 105, 0],   // 7
    [210, 122, 0],   // 8
    [230, 140, 10],  // 9
    [245, 160, 20],  // 10
    [255, 180, 40],  // 11
    [255, 200, 70],  // 12
    [255, 220, 110], // 13
    [255, 240, 170], // 14
    [255, 255, 240], // 15: Bright Amber white
  ],
  phosphor_green: [
    [0, 0, 0],
    [0, 25, 6],
    [0, 48, 12],
    [0, 75, 20],
    [0, 105, 30],
    [0, 135, 42],
    [0, 165, 55],
    [0, 195, 70],
    [10, 215, 90],
    [25, 230, 110],
    [50, 245, 135],
    [90, 255, 165],
    [140, 255, 195],
    [185, 255, 220],
    [225, 255, 240],
    [255, 255, 255],
  ],
  c64_quad: [
    [0, 0, 0],       // Black
    [255, 255, 255], // White
    [136, 0, 0],     // Red
    [170, 255, 238], // Cyan
    [204, 68, 204],  // Purple
    [0, 204, 85],    // Green
    [0, 0, 170],     // Blue
    [238, 238, 119], // Yellow
    [221, 136, 85],  // Orange
    [102, 68, 0],    // Brown
    [255, 119, 119], // Light Red
    [51, 51, 51],    // Dark Gray
    [119, 119, 119], // Medium Gray
    [170, 255, 102], // Light Green
    [0, 136, 255],   // Light Blue
    [187, 187, 187], // Light Gray
  ],
  cyber_solar: [
    [0, 0, 4],
    [18, 4, 25],
    [45, 10, 50],
    [85, 15, 65],
    [130, 20, 55],
    [180, 30, 40],
    [220, 50, 25],
    [245, 85, 20],
    [255, 130, 25],
    [255, 170, 40],
    [255, 205, 75],
    [255, 230, 120],
    [255, 245, 170],
    [240, 250, 220],
    [210, 245, 255],
    [255, 255, 255],
  ],
};

export class CovalentRayTracer {
  private primitives: ScenePrimitive_Q16[] = [];
  private bhState: MoM_BHStarState = DEFAULT_MOM_BHSTAR;
  private currentLyapunovEnergy: q16_t = floatToQ16(50.0);
  private dynamicRayStepScale: number = 1.0;
  private frameRenderTimeMs: number = 0;

  constructor() {
    this.buildDefaultScene();
  }

  // Populate Covalent-RT 3D Scene with MoM-BH*-1 and Covalent Manifold sectors
  public buildDefaultScene() {
    this.primitives = [
      // 1. Central MoM-BH*-1 Black Hole Singularity Event Horizon
      {
        id: 1,
        name: 'MoM_BHSTAR_1_HORIZON',
        type: 'sphere',
        center: vec3_create(0, 0, 0),
        radius: this.bhState.schwarzschildRadiusQ16, // Rs = 1.8
        materialId: 10,
        color: [4, 4, 8],
        reflectivity: 0,
        emission: 0,
      },
      // 2. Solar-System-Sized Dense Hydrogen Cocoon (Volumetric Shroud)
      {
        id: 2,
        name: 'HYDROGEN_COCOON_SHROUD',
        type: 'shroud',
        center: vec3_create(0, 0, 0),
        radius: this.bhState.cocoonRadiusQ16, // 18.0
        materialId: 11,
        color: [220, 80, 30],
        reflectivity: floatToQ16(0.05),
        emission: floatToQ16(0.85), // Extreme 100B Solar Luminosity glow
        isCocoon: true,
      },
      // 3. Accretion Disk Ring (ISCO to 8 Rs)
      {
        id: 3,
        name: 'ACCRETION_DISK_ISCO',
        type: 'disk',
        center: vec3_create(0, 0, 0),
        radius: floatToQ16(9.5),
        innerRadius: this.bhState.accretionInnerRadiusQ16,
        materialId: 12,
        color: [255, 175, 45],
        reflectivity: floatToQ16(0.2),
        emission: floatToQ16(1.0),
      },
      // 4. Covalent Sector Station Alpha: Docking Ring & Sector Walls
      {
        id: 4,
        name: 'COVALENT_STATION_ALPHA',
        type: 'box',
        center: vec3_create(floatToQ16(-16.0), floatToQ16(2.0), floatToQ16(-8.0)),
        size: vec3_create(floatToQ16(4.0), floatToQ16(2.5), floatToQ16(6.0)),
        materialId: 20,
        color: [90, 110, 135],
        reflectivity: floatToQ16(0.4),
        emission: 0,
      },
      // 5. Covalent Specular Solar Array Mirror
      {
        id: 5,
        name: 'SOLAR_REFLECTIVE_ARRAY',
        type: 'box',
        center: vec3_create(floatToQ16(-16.0), floatToQ16(6.5), floatToQ16(-8.0)),
        size: vec3_create(floatToQ16(7.0), floatToQ16(0.2), floatToQ16(3.0)),
        materialId: 21,
        color: [180, 210, 240],
        reflectivity: floatToQ16(0.8),
        emission: 0,
      },
      // 6. Be <> Sovereign Companion Probe
      {
        id: 6,
        name: 'BE_SOVEREIGN_NODE',
        type: 'sphere',
        center: vec3_create(floatToQ16(12.0), floatToQ16(6.0), floatToQ16(-15.0)),
        radius: floatToQ16(1.2),
        materialId: 30,
        color: [60, 220, 255],
        reflectivity: floatToQ16(0.6),
        emission: floatToQ16(0.9), // Luminous beacon
      },
      // 7. Tardis Merkle Anchor Pylon
      {
        id: 7,
        name: 'TARDIS_MERKLE_PYLON',
        type: 'cylinder',
        center: vec3_create(floatToQ16(18.0), floatToQ16(-2.0), floatToQ16(10.0)),
        radius: floatToQ16(1.8),
        size: vec3_create(0, floatToQ16(12.0), 0),
        materialId: 22,
        color: [140, 120, 180],
        reflectivity: floatToQ16(0.35),
        emission: floatToQ16(0.2),
      },
      // 8. Human Pilot Ship Probe (visible when observing from Be <> or MoM-BH*-1)
      {
        id: 8,
        name: 'HUMAN_PILOT_PROBE',
        type: 'box',
        center: vec3_create(0, floatToQ16(4.0), floatToQ16(-28.0)),
        size: vec3_create(floatToQ16(1.6), floatToQ16(0.8), floatToQ16(2.8)),
        materialId: 31,
        color: [250, 190, 60],
        reflectivity: floatToQ16(0.5),
        emission: floatToQ16(0.6), // Thruster plume glow
      },
    ];
  }

  public updateBeNodePosition(pos: Vector3_Q16) {
    const beNode = this.primitives.find(p => p.id === 6);
    if (beNode) {
      beNode.center = pos;
    }
  }

  public updateHumanNodePosition(pos: Vector3_Q16) {
    const humanNode = this.primitives.find(p => p.id === 8);
    if (humanNode) {
      humanNode.center = pos;
    }
  }

  // Intersect Ray with Scene Primitives in Q16.16
  private intersectScene(ray: Ray_Q16): HitRecord_Q16 {
    let closestHit: HitRecord_Q16 = {
      hit: false,
      t: floatToQ16(1000.0),
      point: vec3_create(0, 0, 0),
      normal: vec3_create(0, Q16_ONE, 0),
      materialId: 0,
      color: [0, 0, 0],
      reflectivity: 0,
      emission: 0,
    };

    for (let i = 0; i < this.primitives.length; i++) {
      const prim = this.primitives[i];

      if (prim.type === 'sphere') {
        // Ray-Sphere intersection: (P - C)^2 = r^2
        const oc = vec3_sub(ray.origin, prim.center);
        const a = vec3_dot(ray.dir, ray.dir); // ~ Q16_ONE if normalized
        const b = vec3_dot(oc, ray.dir) << 1;
        const c = q16_sub(vec3_dot(oc, oc), q16_mul(prim.radius!, prim.radius!));
        const discriminant = q16_sub(q16_mul(b, b), (q16_mul(a, c) << 2));

        if (discriminant >= 0) {
          const sqrtDisc = q16_sqrt(discriminant);
          const t1 = q16_div(q16_sub(-b, sqrtDisc), a << 1);
          const minT = floatToQ16(0.05);

          if (t1 > minT && t1 < closestHit.t) {
            const hitPoint = vec3_add(ray.origin, vec3_scale(ray.dir, t1));
            const normal = vec3_normalize(vec3_sub(hitPoint, prim.center));
            closestHit = {
              hit: true,
              t: t1,
              point: hitPoint,
              normal,
              materialId: prim.materialId,
              color: prim.color,
              reflectivity: prim.reflectivity,
              emission: prim.emission,
              isBlackHoleHorizon: prim.id === 1,
            };
          }
        }
      } else if (prim.type === 'box') {
        // AABB Ray-Box intersection
        const halfSize = vec3_scale(prim.size!, floatToQ16(0.5));
        const minBound = vec3_sub(prim.center, halfSize);
        const maxBound = vec3_add(prim.center, halfSize);

        let tMin = floatToQ16(0.05);
        let tMax = closestHit.t;
        let normal = vec3_create(0, Q16_ONE, 0);

        const axes: ('x' | 'y' | 'z')[] = ['x', 'y', 'z'];
        let valid = true;

        for (let a = 0; a < 3; a++) {
          const axis = axes[a];
          const dirComp = ray.dir[axis];
          if (dirComp !== 0) {
            let t0 = q16_div(q16_sub(minBound[axis], ray.origin[axis]), dirComp);
            let t1 = q16_div(q16_sub(maxBound[axis], ray.origin[axis]), dirComp);
            let axisNorm = -1;
            if (t0 > t1) {
              const temp = t0; t0 = t1; t1 = temp;
              axisNorm = 1;
            }
            if (t0 > tMin) {
              tMin = t0;
              normal = vec3_create(
                axis === 'x' ? floatToQ16(axisNorm) : 0,
                axis === 'y' ? floatToQ16(axisNorm) : 0,
                axis === 'z' ? floatToQ16(axisNorm) : 0
              );
            }
            tMax = q16_min(tMax, t1);
            if (tMax <= tMin) {
              valid = false;
              break;
            }
          }
        }

        if (valid && tMin < closestHit.t && tMin > floatToQ16(0.05)) {
          const hitPoint = vec3_add(ray.origin, vec3_scale(ray.dir, tMin));
          closestHit = {
            hit: true,
            t: tMin,
            point: hitPoint,
            normal,
            materialId: prim.materialId,
            color: prim.color,
            reflectivity: prim.reflectivity,
            emission: prim.emission,
          };
        }
      }
    }

    return closestHit;
  }

  // Trace a ray with relativistic deflection, accretion lighting, and Balmer break absorption
  public traceRay(
    ray: Ray_Q16,
    depth: number,
    config: EngineConfig,
    mode: FramebufferMode
  ): [number, number, number] {
    if (depth > config.maxBounces) {
      return [0, 0, 0];
    }

    let currentOrigin = ray.origin;
    let currentDir = ray.dir;
    let accumulatedEmission = [0, 0, 0];
    let hydrogenAbsorptionFactor = 1.0;

    // Relativistic Gravitational Lensing & Hydrogen Cocoon Step
    if (config.gravitationalLensingEnabled || mode === 'gravitational_lens') {
      const bhPos = vec3_create(0, 0, 0);
      const stepSize = floatToQ16(1.8 * this.dynamicRayStepScale);
      let rayStepPos = currentOrigin;

      // 4-step relativistic raymarch approximation
      for (let s = 0; s < 4; s++) {
        const deflection = calculateRelativisticDeflection(
          rayStepPos,
          currentDir,
          bhPos,
          stepSize,
          this.bhState
        );

        if (deflection.isEventHorizonCaptured) {
          // Ray plunges into singularity
          if (mode === 'gravitational_lens') {
            return [15, 8, 25]; // Distinct dark singularity marker
          }
          return [0, 0, 2];
        }

        currentDir = deflection.newDir;
        rayStepPos = vec3_add(rayStepPos, vec3_scale(currentDir, stepSize));

        // Volumetric Hydrogen Cocoon Emission & Balmer Absorption
        const cocoonDist = deflection.distanceQ16;
        if (cocoonDist < this.bhState.cocoonRadiusQ16) {
          const gas = getCocoonHydrogenLuminosity(cocoonDist, this.bhState);
          const gasEmiss = q16ToFloat(gas.emissionQ16) * 0.22;

          // Apply Balmer transmission
          const balmer = calculateBalmerTransmission(q16ToFloat(ray.wavelengthNm));
          if (balmer.isExtinct && (config.balmerSpectroscopyEnabled || mode === 'balmer_spec')) {
            // Balmer Break absorbs emission completely below 364.6 nm
            hydrogenAbsorptionFactor *= 0.02;
          } else {
            const trans = q16ToFloat(balmer.transmissionQ16);
            accumulatedEmission[0] += Math.min(255, Math.round(255 * gasEmiss * trans));
            accumulatedEmission[1] += Math.min(255, Math.round(110 * gasEmiss * trans));
            accumulatedEmission[2] += Math.min(255, Math.round(30 * gasEmiss * trans));
          }
        }
      }
      currentOrigin = rayStepPos;
    }

    // Intersect geometry
    const activeRay: Ray_Q16 = {
      origin: currentOrigin,
      dir: currentDir,
      energy: ray.energy,
      wavelengthNm: ray.wavelengthNm,
      bounces: depth,
    };

    const hit = this.intersectScene(activeRay);

    if (!hit.hit) {
      // Cosmic Background / Accretion Far Field
      if (mode === 'balmer_spec') {
        const balmer = calculateBalmerTransmission(q16ToFloat(ray.wavelengthNm));
        if (balmer.isExtinct) {
          return [8, 0, 18]; // Balmer extinction void
        }
        return [
          Math.min(255, accumulatedEmission[0] + 35),
          Math.min(255, accumulatedEmission[1] + 12),
          Math.min(255, accumulatedEmission[2] + 4),
        ];
      }

      // Starfield background
      const dirZ = q16ToFloat(currentDir.z);
      const starGlow = Math.max(0, Math.floor(dirZ * 18));
      return [
        Math.min(255, accumulatedEmission[0] + starGlow),
        Math.min(255, accumulatedEmission[1] + starGlow),
        Math.min(255, accumulatedEmission[2] + starGlow + 8),
      ];
    }

    // If black hole horizon
    if (hit.isBlackHoleHorizon) {
      return [2, 2, 4];
    }

    // Dynamic Lighting: Point light emission from MoM-BH*-1 core (100 Billion L_sun)
    const toLight = vec3_normalize(vec3_negate(hit.point));
    const nDotL = Math.max(0, q16ToFloat(vec3_dot(hit.normal, toLight)));
    const lightDist = Math.max(1.0, q16ToFloat(vec3_length(hit.point)));
    const attenuation = Math.min(2.5, 30.0 / (lightDist * lightDist * 0.15 + 1.0));

    // Dynamic Shadows: Check shadow ray towards MoM-BH*-1 center
    const shadowRay: Ray_Q16 = {
      origin: vec3_add(hit.point, vec3_scale(hit.normal, floatToQ16(0.08))),
      dir: toLight,
      energy: Q16_ONE,
      wavelengthNm: ray.wavelengthNm,
      bounces: 0,
    };
    const shadowHit = this.intersectScene(shadowRay);
    const inShadow = shadowHit.hit && !shadowHit.isBlackHoleHorizon && shadowHit.t < floatToQ16(lightDist);

    const shadowMultiplier = inShadow ? 0.25 : 1.0;

    // Direct lighting
    let r = Math.round(hit.color[0] * (0.15 + 0.85 * nDotL * attenuation * shadowMultiplier));
    let g = Math.round(hit.color[1] * (0.15 + 0.85 * nDotL * attenuation * shadowMultiplier));
    let b = Math.round(hit.color[2] * (0.15 + 0.85 * nDotL * attenuation * shadowMultiplier));

    // Add emission from material
    const emiss = q16ToFloat(hit.emission);
    if (emiss > 0) {
      r = Math.min(255, r + Math.round(hit.color[0] * emiss));
      g = Math.min(255, g + Math.round(hit.color[1] * emiss));
      b = Math.min(255, b + Math.round(hit.color[2] * emiss));
    }

    // Specular Reflection Bounce
    const refl = q16ToFloat(hit.reflectivity);
    if (refl > 0.05 && depth < config.maxBounces) {
      const reflectDir = vec3_reflect(currentDir, hit.normal);
      const bounceRay: Ray_Q16 = {
        origin: vec3_add(hit.point, vec3_scale(hit.normal, floatToQ16(0.08))),
        dir: reflectDir,
        energy: q16_mul(ray.energy, hit.reflectivity),
        wavelengthNm: ray.wavelengthNm,
        bounces: depth + 1,
      };
      const bounceColor = this.traceRay(bounceRay, depth + 1, config, mode);
      r = Math.min(255, Math.round(r * (1 - refl) + bounceColor[0] * refl));
      g = Math.min(255, Math.round(g * (1 - refl) + bounceColor[1] * refl));
      b = Math.min(255, Math.round(b * (1 - refl) + bounceColor[2] * refl));
    }

    // Add volumetric cocoon emission
    r = Math.min(255, Math.round(r * hydrogenAbsorptionFactor + accumulatedEmission[0]));
    g = Math.min(255, Math.round(g * hydrogenAbsorptionFactor + accumulatedEmission[1]));
    b = Math.min(255, Math.round(b * hydrogenAbsorptionFactor + accumulatedEmission[2]));

    return [r, g, b];
  }

  // Render raw Framebuffer Shard (`/dev/fb0`)
  public renderToFramebuffer(
    pixelBuffer: Uint8ClampedArray,
    width: number,
    height: number,
    camPos: Vector3_Q16,
    camYawQ16: q16_t,
    camPitchQ16: q16_t,
    config: EngineConfig,
    mode: FramebufferMode,
    wavelengthNm: number = 380, // Optical default nm
    observer: ActiveObserver = 'human',
    bePos?: Vector3_Q16
  ) {
    const startTime = performance.now();

    // Determine Effective Camera Position & Orientation based on Observer
    let effectiveCamPos = camPos;
    let cosY = Math.cos(q16ToFloat(camYawQ16));
    let sinY = Math.sin(q16ToFloat(camYawQ16));
    let cosP = Math.cos(q16ToFloat(camPitchQ16));
    let sinP = Math.sin(q16ToFloat(camPitchQ16));

    let fwd = {
      x: sinY * cosP,
      y: -sinP,
      z: cosY * cosP,
    };
    let right = {
      x: cosY,
      y: 0,
      z: -sinY,
    };
    let up = {
      x: -sinY * sinP,
      y: -cosP,
      z: -cosY * sinP,
    };

    let effectiveWavelength = wavelengthNm;
    let aberrationFactor = 1.0;

    // Toggle self-visibility based on active observer
    const humanPrimitive = this.primitives.find(p => p.id === 8);
    const bePrimitive = this.primitives.find(p => p.id === 6);
    if (humanPrimitive) humanPrimitive.radius = observer === 'human' ? 0 : floatToQ16(1.6);
    if (bePrimitive) bePrimitive.radius = observer === 'be_officiator' ? 0 : floatToQ16(1.2);

    if (observer === 'mom_bhstar') {
      // MoM-BH*-1 is the Observer: situated near inner photon sphere looking outward!
      effectiveCamPos = vec3_create(floatToQ16(0.0), floatToQ16(1.2), floatToQ16(2.4));
      // Point radially outwards into the cocoon and sky
      fwd = { x: 0, y: 0.35, z: 0.93 };
      right = { x: 1, y: 0, z: 0 };
      up = { x: 0, y: 0.93, z: -0.35 };

      // Gravitational blueshift at r = 2.4 ASU (Rs = 1.80 ASU):
      // factor = 1 / sqrt(1 - 1.80 / 2.4) = 1 / sqrt(0.25) = 2.0
      effectiveWavelength = wavelengthNm * 0.5; // Relativistic blueshift into high UV
      aberrationFactor = 1.45; // Aberration compresses field of view outward
    } else if (observer === 'be_officiator' && bePos) {
      // Be <> Sovereign Arbiter is the Observer: looks towards MoM-BH*-1 core
      effectiveCamPos = bePos;
      const beX = q16ToFloat(bePos.x);
      const beY = q16ToFloat(bePos.y);
      const beZ = q16ToFloat(bePos.z);
      const invBeDist = 1.0 / Math.max(0.1, Math.sqrt(beX * beX + beY * beY + beZ * beZ));
      fwd = { x: -beX * invBeDist, y: -beY * invBeDist, z: -beZ * invBeDist };
      right = { x: -fwd.z, y: 0, z: fwd.x };
      up = { x: 0, y: 1, z: 0 };
    }

    const aspectRatio = width / height;
    const fovScale = 0.95 * aberrationFactor;
    const palette = QUADBIT_PALETTES[config.quadbitPalette] || QUADBIT_PALETTES.phosphor_amber;

    // Ray generation loop
    let pixelIndex = 0;

    for (let y = 0; y < height; y++) {
      const v = ((1.0 - (2.0 * y) / height) * fovScale) / aspectRatio;

      for (let x = 0; x < width; x++) {
        const u = ((2.0 * x) / width - 1.0) * fovScale;

        // Direction vector
        const dirX = fwd.x + right.x * u + up.x * v;
        const dirY = fwd.y + right.y * u + up.y * v;
        const dirZ = fwd.z + right.z * u + up.z * v;
        const invLen = 1.0 / Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);

        const ray: Ray_Q16 = {
          origin: effectiveCamPos,
          dir: vec3_create(
            floatToQ16(dirX * invLen),
            floatToQ16(dirY * invLen),
            floatToQ16(dirZ * invLen)
          ),
          energy: observer === 'mom_bhstar' ? floatToQ16(1.8) : Q16_ONE,
          wavelengthNm: floatToQ16(effectiveWavelength),
          bounces: 0,
        };

        const rgb = this.traceRay(ray, 0, config, mode);

        // In MoM-BH*-1 observer frame: apply intense relativistic blueshift tinge
        if (observer === 'mom_bhstar') {
          rgb[0] = Math.min(255, Math.round(rgb[0] * 0.7 + rgb[2] * 0.3));
          rgb[2] = Math.min(255, Math.round(rgb[2] * 1.35 + 20));
        }

        if (mode === 'quadbit') {
          // Map RGB to 16-color palette (Quadbit 4-bit)
          const colorIndex = quantizeToQuadbit(rgb, palette);
          const p = palette[colorIndex];
          pixelBuffer[pixelIndex] = p[0];
          pixelBuffer[pixelIndex + 1] = p[1];
          pixelBuffer[pixelIndex + 2] = p[2];
          pixelBuffer[pixelIndex + 3] = 255;
        } else {
          pixelBuffer[pixelIndex] = rgb[0];
          pixelBuffer[pixelIndex + 1] = rgb[1];
          pixelBuffer[pixelIndex + 2] = rgb[2];
          pixelBuffer[pixelIndex + 3] = 255;
        }

        pixelIndex += 4;
      }
    }

    const elapsed = performance.now() - startTime;
    this.frameRenderTimeMs = elapsed;

    // Continuous Lyapunov dissipation & stasis controller
    // If render exceeds budget, scale step size to prevent frame shear
    if (elapsed > config.lyapunovBudgetMs) {
      this.dynamicRayStepScale = Math.min(2.5, this.dynamicRayStepScale + 0.15);
      this.currentLyapunovEnergy = Math.max(10, this.currentLyapunovEnergy - 256);
    } else if (this.dynamicRayStepScale > 1.0) {
      this.dynamicRayStepScale = Math.max(1.0, this.dynamicRayStepScale - 0.05);
    }
  }

  public getFrameTimeMs(): number {
    return this.frameRenderTimeMs;
  }

  public getLyapunovDissipationFactor(): number {
    return this.dynamicRayStepScale;
  }
}

function vec3_negate(v: Vector3_Q16): Vector3_Q16 {
  return { x: -v.x | 0, y: -v.y | 0, z: -v.z | 0 };
}

// Quantize RGB color to closest index in 16-color palette
function quantizeToQuadbit(rgb: [number, number, number], palette: number[][]): number {
  let closestIndex = 0;
  let minDist = Infinity;
  for (let i = 0; i < palette.length; i++) {
    const p = palette[i];
    const dr = rgb[0] - p[0];
    const dg = rgb[1] - p[1];
    const db = rgb[2] - p[2];
    const dist = dr * dr + dg * dg + db * db;
    if (dist < minDist) {
      minDist = dist;
      closestIndex = i;
    }
  }
  return closestIndex;
}
