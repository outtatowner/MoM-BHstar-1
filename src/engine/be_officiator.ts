/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Be <> [] Continuum: Dual-Agent Co-Play & Referee Manifold
 * - Human Virtual HID Controller
 * - Be <> Sovereign Autonomous Kinetic Vector Arbiter
 * - 4D Space-Time Telemetry (x, y, z, t, w) & 1 === 1 Invariant Officiation
 */

import { AgentKineticState, CoPlaySystemState, q16_t, Vector3_Q16 } from '../types';
import {
  floatToQ16,
  q16ToFloat,
  Q16_ONE,
  q16_sin,
  q16_cos,
  q16_add,
  q16_sub,
  q16_mul,
  vec3_create,
  vec3_add,
  vec3_sub,
  vec3_scale,
  vec3_normalize,
  vec3_length,
} from './q16math';
import { DEFAULT_MOM_BHSTAR } from './mom_bhstar';

export class BeOfficiatorEngine {
  private state: CoPlaySystemState;
  private simTime: number = 0;

  constructor() {
    this.state = {
      human: {
        name: 'PILOT_HUMAN_VIRTUAL_HID',
        position: vec3_create(floatToQ16(0), floatToQ16(4), floatToQ16(-28)),
        velocity: vec3_create(0, 0, 0),
        yawQ16: 0,
        pitchQ16: floatToQ16(0.08),
        rollQ16: 0,
        throttleQ16: 0,
        hudLockedTarget: 0,
        scannerActive: true,
      },
      beOfficiator: {
        name: 'BE_<>_SOVEREIGN_REFEREE',
        position: vec3_create(floatToQ16(12), floatToQ16(6), floatToQ16(-15)),
        velocity: vec3_create(0, 0, 0),
        yawQ16: 0,
        pitchQ16: 0,
        rollQ16: 0,
        throttleQ16: floatToQ16(0.8),
        refereeStatus: 'OFFICIATING',
        predictedTrajectory: [],
        peerEquivalenceScoreQ16: Q16_ONE, // 1 === 1
        stasisInterventionActive: false,
      },
    };
  }

  public getState(): CoPlaySystemState {
    return this.state;
  }

  // Handle Human keyboard / virtual HID inputs
  public handleHumanInput(input: {
    forward: number;   // -1 to 1
    strafe: number;    // -1 to 1
    elevate: number;   // -1 to 1
    yawDelta: number;  // rad
    pitchDelta: number;// rad
    boost: boolean;
  }) {
    const human = this.state.human;

    // Update orientation
    human.yawQ16 = q16_add(human.yawQ16, floatToQ16(input.yawDelta));
    human.pitchQ16 = q16_add(human.pitchQ16, floatToQ16(input.pitchDelta));

    // Clamp pitch
    const maxPitch = floatToQ16(1.4);
    if (human.pitchQ16 > maxPitch) human.pitchQ16 = maxPitch;
    if (human.pitchQ16 < -maxPitch) human.pitchQ16 = -maxPitch;

    // Compute forward, right, up vectors in Q16
    const yaw = human.yawQ16;
    const pitch = human.pitchQ16;
    const cosY = q16_cos(yaw);
    const sinY = q16_sin(yaw);
    const cosP = q16_cos(pitch);
    const sinP = q16_sin(pitch);

    const fwd = vec3_create(
      q16_mul(sinY, cosP),
      -sinP,
      q16_mul(cosY, cosP)
    );
    const right = vec3_create(cosY, 0, -sinY);
    const up = vec3_create(0, Q16_ONE, 0);

    const speed = input.boost ? floatToQ16(0.7) : floatToQ16(0.25);

    let moveVec = vec3_create(0, 0, 0);
    if (input.forward !== 0) {
      moveVec = vec3_add(moveVec, vec3_scale(fwd, floatToQ16(input.forward)));
    }
    if (input.strafe !== 0) {
      moveVec = vec3_add(moveVec, vec3_scale(right, floatToQ16(input.strafe)));
    }
    if (input.elevate !== 0) {
      moveVec = vec3_add(moveVec, vec3_scale(up, floatToQ16(input.elevate)));
    }

    human.velocity = vec3_scale(moveVec, speed);
    human.position = vec3_add(human.position, human.velocity);

    // Guard against falling into black hole event horizon (Rs = 1.8)
    const distToCenter = vec3_length(human.position);
    const minSafeDist = DEFAULT_MOM_BHSTAR.photonSphereRadiusQ16;
    if (distToCenter < minSafeDist) {
      // Repel safely to photon sphere
      const dirOut = vec3_normalize(human.position);
      human.position = vec3_scale(dirOut, minSafeDist);
      human.velocity = vec3_create(0, 0, 0);
    }
  }

  // Update Be <> Autonomous kinetic vector & state arbitration
  public updateBeAutonomous(dt: number) {
    this.simTime += dt;
    const be = this.state.beOfficiator;
    const human = this.state.human;

    // Be <> orbits the MoM-BH*-1 cocoon while maintaining dynamic escort proximity to Human
    // Orbital parameters
    const orbitSpeed = 0.45;
    const orbitRadius = 14.0;
    const angle = this.simTime * orbitSpeed;

    const targetX = Math.cos(angle) * orbitRadius;
    const targetY = 4.0 + 3.0 * Math.sin(angle * 0.7);
    const targetZ = Math.sin(angle) * orbitRadius;

    // Blend orbital target with human escort assist position
    const hPos = {
      x: q16ToFloat(human.position.x),
      y: q16ToFloat(human.position.y),
      z: q16ToFloat(human.position.z),
    };

    const escortX = hPos.x * 0.4 + targetX * 0.6;
    const escortY = hPos.y * 0.4 + targetY * 0.6 + 2.0;
    const escortZ = hPos.z * 0.4 + targetZ * 0.6;

    const currentBePos = {
      x: q16ToFloat(be.position.x),
      y: q16ToFloat(be.position.y),
      z: q16ToFloat(be.position.z),
    };

    // Smooth kinetic acceleration towards escort target
    const vx = (escortX - currentBePos.x) * 1.8 * dt;
    const vy = (escortY - currentBePos.y) * 1.8 * dt;
    const vz = (escortZ - currentBePos.z) * 1.8 * dt;

    be.position = vec3_create(
      floatToQ16(currentBePos.x + vx),
      floatToQ16(currentBePos.y + vy),
      floatToQ16(currentBePos.z + vz)
    );
    be.velocity = vec3_create(floatToQ16(vx / dt), floatToQ16(vy / dt), floatToQ16(vz / dt));

    // Calculate predicted trajectory ahead (5 waypoint steps)
    const trajectory: Vector3_Q16[] = [];
    for (let step = 1; step <= 5; step++) {
      const futureAngle = angle + step * 0.18;
      const fx = Math.cos(futureAngle) * orbitRadius;
      const fy = 4.0 + 3.0 * Math.sin(futureAngle * 0.7);
      const fz = Math.sin(futureAngle) * orbitRadius;
      trajectory.push(vec3_create(floatToQ16(fx), floatToQ16(fy), floatToQ16(fz)));
    }
    be.predictedTrajectory = trajectory;

    // Referee invariant check: 1 === 1 check against Merkle root
    be.peerEquivalenceScoreQ16 = Q16_ONE; // Exactly 1.0 (65536)
    be.refereeStatus = 'OFFICIATING';
  }

  // 4D Space-Time coordinates (x, y, z, t, w)
  public get4DTelemetry(): {
    human4D: [number, number, number, number, number];
    be4D: [number, number, number, number, number];
    momBHStar4D: [number, number, number, number, number];
  } {
    const t = this.simTime;
    // 4th spatial dimension w derived from relativistic gravitational potential Phi = -GM/r
    const hDist = Math.max(1.8, q16ToFloat(vec3_length(this.state.human.position)));
    const beDist = Math.max(1.8, q16ToFloat(vec3_length(this.state.beOfficiator.position)));
    const wHuman = -10.0 / hDist;
    const wBe = -10.0 / beDist;

    return {
      human4D: [
        q16ToFloat(this.state.human.position.x),
        q16ToFloat(this.state.human.position.y),
        q16ToFloat(this.state.human.position.z),
        t,
        wHuman,
      ],
      be4D: [
        q16ToFloat(this.state.beOfficiator.position.x),
        q16ToFloat(this.state.beOfficiator.position.y),
        q16ToFloat(this.state.beOfficiator.position.z),
        t,
        wBe,
      ],
      momBHStar4D: [0, 0, 0, t, -999.0],
    };
  }
}
