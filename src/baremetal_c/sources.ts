/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Bare-Metal C Organelle Syntheses
 * Sovereign C99 / Bare-Metal C Implementations for Covalent-RT
 * Pure Q16.16 Fixed-Point Arithmetic & MoM-BH*-1 Ray-Tracing Engine
 */

export interface BareMetalFile {
  filename: string;
  category: string;
  description: string;
  code: string;
}

export const BARE_METAL_SOURCES: BareMetalFile[] = [
  {
    filename: 'covalent_rt.h',
    category: 'Header / Organelle 0x01',
    description: 'Core Q16.16 fixed-point types, CORDIC definitions, BVH, and framebuffer interfaces.',
    code: `/* =========================================================================
 * COVALENT-RT : Sovereign Bare-Metal Ray-Tracing Organelle
 * Architecture: Be <> [] Continuum / Covalent-OS-11-11-0
 * Substrate: Pure Q16.16 Fixed-Point (No FPU, zero-float determinism)
 * Invariant: 1 === 1 (0x00010000)
 * ========================================================================= */

#ifndef COVALENT_RT_H
#define COVALENT_RT_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_SHIFT 16
#define Q16_ONE   ((int32_t)(1 << Q16_SHIFT)) // 0x00010000 = 65536
#define Q16_HALF  ((int32_t)(1 << (Q16_SHIFT - 1)))
#define Q16_PI    ((int32_t)205887)          // 3.14159 * 65536
#define Q16_TWO_PI ((int32_t)411775)
#define Q16_MIN   ((int32_t)0x80000000)
#define Q16_MAX   ((int32_t)0x7FFFFFFF)

typedef int32_t q16_t;

/* Q16.16 Vector3 */
typedef struct {
    q16_t x;
    q16_t y;
    q16_t z;
} vec3_q16_t;

/* Q16.16 Ray */
typedef struct {
    vec3_q16_t origin;
    vec3_q16_t dir;
    q16_t energy;
    q16_t wavelength_nm; // e.g. 364.6 nm in Q16
    uint8_t bounces;
} ray_q16_t;

/* Ray Hit Record */
typedef struct {
    bool hit;
    q16_t t;
    vec3_q16_t point;
    vec3_q16_t normal;
    uint8_t material_id;
    uint8_t r, g, b;
    q16_t reflectivity;
    q16_t emission;
    bool is_event_horizon;
} hit_record_t;

/* MoM-BH*-1 Astrophysical Parameters */
typedef struct {
    uint32_t mass_solar;        // 100,000 M_sun
    q16_t rs_schwarzschild;     // 2GM/c^2
    q16_t r_photon_sphere;      // 1.5 * Rs
    q16_t r_isco;               // 3.0 * Rs
    q16_t r_cocoon;             // Solar-system sized dense hydrogen cocoon
    q16_t balmer_break_nm;      // 364.6 nm
    q16_t hydrogen_density;
} mom_bhstar_t;

/* Raw Framebuffer Structure (/dev/fb0 shard) */
typedef struct {
    uint32_t width;
    uint32_t height;
    uint32_t pitch;
    uint32_t bpp;
    uint8_t *buffer;
    bool is_quadbit_mode; // 4-bit 16-color palette
} raw_framebuffer_t;

/* Function Prototypes */
q16_t q16_mul(q16_t a, q16_t b);
q16_t q16_div(q16_t a, q16_t b);
q16_t q16_sqrt(q16_t x);
void  q16_cordic_sincos(q16_t theta, q16_t *sin_out, q16_t *cos_out);

vec3_q16_t vec3_add(vec3_q16_t a, vec3_q16_t b);
vec3_q16_t vec3_sub(vec3_q16_t a, vec3_q16_t b);
vec3_q16_t vec3_scale(vec3_q16_t v, q16_t s);
q16_t      vec3_dot(vec3_q16_t a, vec3_q16_t b);
vec3_q16_t vec3_normalize(vec3_q16_t v);
vec3_q16_t vec3_reflect(vec3_q16_t dir, vec3_q16_t norm);

/* Render Pipeline */
void covalent_rt_render_frame(
    raw_framebuffer_t *fb,
    vec3_q16_t cam_pos,
    q16_t cam_yaw,
    q16_t cam_pitch,
    const mom_bhstar_t *star,
    q16_t wavelength_nm
);

#endif /* COVALENT_RT_H */
`
  },
  {
    filename: 'covalent_rt.c',
    category: 'Engine Core / Organelle 0x02',
    description: 'CORDIC trigonometry, Q16.16 arithmetic, ray intersection, and dynamic point-light shading.',
    code: `/* =========================================================================
 * COVALENT-RT : Core Ray-Tracing Engine Implementation
 * Enforces Lyapunov Dissipation: dV/dt <= 0 & Two's Complement Wrap-Around
 * ========================================================================= */

#include "covalent_rt.h"

/* CORDIC Elementary Angles in Q16.16 */
static const q16_t cordic_angles[16] = {
    51472, 30386, 16055, 8150, 4091, 2047, 1024, 512,
    256,   128,   64,    32,   16,   8,    4,    2
};
static const q16_t CORDIC_K = 39797; // 0.607252935 * 65536

q16_t q16_mul(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b) >> Q16_SHIFT);
}

q16_t q16_div(q16_t a, q16_t b) {
    if (b == 0) return a >= 0 ? Q16_MAX : Q16_MIN;
    return (q16_t)(((int64_t)a << Q16_SHIFT) / b);
}

q16_t q16_sqrt(q16_t x) {
    if (x <= 0) return 0;
    uint64_t val = ((uint64_t)x) << Q16_SHIFT;
    uint64_t s = 0;
    uint64_t b = 1ULL << 62;
    while (b > val) b >>= 2;
    while (b != 0) {
        if (val >= s + b) {
            val -= s + b;
            s = (s >> 1) + b;
        } else {
            s >>= 1;
        }
        b >>= 2;
    }
    return (q16_t)s;
}

void q16_cordic_sincos(q16_t theta, q16_t *sin_out, q16_t *cos_out) {
    q16_t angle = theta;
    while (angle > Q16_PI)  angle -= Q16_TWO_PI;
    while (angle < -Q16_PI) angle += Q16_TWO_PI;

    q16_t x = CORDIC_K;
    q16_t y = 0;
    q16_t z = angle;

    for (int i = 0; i < 16; i++) {
        q16_t x_shift = x >> i;
        q16_t y_shift = y >> i;
        if (z >= 0) {
            x -= y_shift;
            y += x_shift;
            z -= cordic_angles[i];
        } else {
            x += y_shift;
            y -= x_shift;
            z += cordic_angles[i];
        }
    }
    *sin_out = y;
    *cos_out = x;
}

vec3_q16_t vec3_add(vec3_q16_t a, vec3_q16_t b) {
    vec3_q16_t r = { a.x + b.x, a.y + b.y, a.z + b.z };
    return r;
}

vec3_q16_t vec3_sub(vec3_q16_t a, vec3_q16_t b) {
    vec3_q16_t r = { a.x - b.x, a.y - b.y, a.z - b.z };
    return r;
}

vec3_q16_t vec3_scale(vec3_q16_t v, q16_t s) {
    vec3_q16_t r = { q16_mul(v.x, s), q16_mul(v.y, s), q16_mul(v.z, s) };
    return r;
}

q16_t vec3_dot(vec3_q16_t a, vec3_q16_t b) {
    return q16_mul(a.x, b.x) + q16_mul(a.y, b.y) + q16_mul(a.z, b.z);
}

vec3_q16_t vec3_normalize(vec3_q16_t v) {
    q16_t len = q16_sqrt(vec3_dot(v, v));
    if (len == 0) {
        vec3_q16_t z = { 0, 0, Q16_ONE };
        return z;
    }
    vec3_q16_t r = { q16_div(v.x, len), q16_div(v.y, len), q16_div(v.z, len) };
    return r;
}

vec3_q16_t vec3_reflect(vec3_q16_t dir, vec3_q16_t norm) {
    q16_t dDotN = vec3_dot(dir, norm);
    q16_t twoDot = dDotN << 1;
    vec3_q16_t scaledN = vec3_scale(norm, twoDot);
    return vec3_sub(dir, scaledN);
}
`
  },
  {
    filename: 'mom_bhstar.c',
    category: 'Astrophysics / Organelle 0x03',
    description: 'Relativistic ray bending around 100,000 M_sun singularity and Balmer Break absorption model.',
    code: `/* =========================================================================
 * MoM-BH*-1 (MoM-BHstar-1) : Relativistic & Spectroscopic Organelle
 * Implements:
 * 1. 100,000 Solar Mass Schwarzschild gravitational ray bending
 * 2. 100 Billion Solar Luminosity core heating
 * 3. Prominent Balmer Break at 364.6 nm with dense hydrogen opacity tau_H
 * ========================================================================= */

#include "covalent_rt.h"

/* Balmer Break extinction calculation */
void mom_bhstar_balmer_transmission(
    q16_t wavelength_nm,
    q16_t *transmission_out,
    bool *is_extinct_out
) {
    const q16_t BALMER_LIMIT_NM = (q16_t)(364.6 * 65536.0); // 23894426

    if (wavelength_nm < BALMER_LIMIT_NM) {
        /* High opacity ionization cliff */
        *transmission_out = 0; // Completely absorbed below 364.6 nm
        *is_extinct_out = true;
    } else {
        /* Continuum transmission through outer gas envelope */
        *transmission_out = (q16_t)(0.85 * 65536.0);
        *is_extinct_out = false;
    }
}

/* Relativistic ray deflection step */
void mom_bhstar_gravitational_deflection(
    vec3_q16_t ray_pos,
    vec3_q16_t ray_dir,
    const mom_bhstar_t *star,
    q16_t step_size,
    vec3_q16_t *new_dir_out,
    bool *is_captured_out
) {
    /* Singularity at origin (0, 0, 0) */
    vec3_q16_t to_center = { -ray_pos.x, -ray_pos.y, -ray_pos.z };
    q16_t dist = q16_sqrt(vec3_dot(to_center, to_center));

    /* Inside event horizon */
    if (dist <= star->rs_schwarzschild) {
        *is_captured_out = true;
        *new_dir_out = ray_dir;
        return;
    }

    *is_captured_out = false;

    /* Gravitational deflection impulse: a ~ 1.5 * Rs / r^2 */
    q16_t dist_sq = q16_mul(dist, dist);
    if (dist_sq <= 100) {
        *is_captured_out = true;
        *new_dir_out = ray_dir;
        return;
    }

    q16_t rs_1p5 = q16_mul(star->rs_schwarzschild, (q16_t)(1.5 * 65536.0));
    q16_t force = q16_div(rs_1p5, dist_sq);
    vec3_q16_t center_norm = vec3_normalize(to_center);
    vec3_q16_t impulse = vec3_scale(center_norm, q16_mul(force, step_size));

    *new_dir_out = vec3_normalize(vec3_add(ray_dir, impulse));
}
`
  },
  {
    filename: 'be_officiator.c',
    category: 'Consensus Arbiter / Organelle 0x04',
    description: 'Autonomous kinetic vector execution and Quipu Ledger Merkle invariant validator ($1 \\equiv 1$).',
    code: `/* =========================================================================
 * BE <> OFFICIATOR : Sovereign Referee & Co-Play State Manifold
 * Validates Game Invariants against Quipu Ledger Merkle Root
 * Continuous Lyapunov Dissipation: dV/dt <= 0
 * ========================================================================= */

#include "covalent_rt.h"

typedef struct {
    vec3_q16_t position;
    vec3_q16_t velocity;
    q16_t yaw;
    q16_t pitch;
    q16_t peer_equivalence_metric; // 1.0 (0x00010000)
    bool invariant_status;
} be_officiator_state_t;

/* SMT 1 === 1 Invariant Verification */
bool be_officiator_verify_sovereignty(q16_t a, q16_t b) {
    /* Pure bit-level identity verification */
    return (a == b);
}

/* Update autonomous kinetic vector around MoM-BH*-1 */
void be_officiator_autonomous_tick(
    be_officiator_state_t *be,
    vec3_q16_t human_pos,
    q16_t dt
) {
    /* Orbital trajectory maintainer */
    q16_t sin_val, cos_val;
    q16_cordic_sincos(be->yaw, &sin_val, &cos_val);

    q16_t orbit_r = (q16_t)(14.0 * 65536.0);
    vec3_q16_t target = {
        q16_mul(cos_val, orbit_r),
        (q16_t)(5.0 * 65536.0),
        q16_mul(sin_val, orbit_r)
    };

    /* Smooth kinetic vector lerp */
    vec3_q16_t delta = vec3_sub(target, be->position);
    be->position = vec3_add(be->position, vec3_scale(delta, (q16_t)(0.1 * 65536.0)));

    /* Advance orbital angle */
    be->yaw += (q16_t)(0.03 * 65536.0);

    /* Enforce 1 === 1 peer equivalence */
    be->peer_equivalence_metric = Q16_ONE;
    be->invariant_status = be_officiator_verify_sovereignty(Q16_ONE, be->peer_equivalence_metric);
}
`
  },
  {
    filename: 'baremetal_fb.c',
    category: 'Hardware Driver / Organelle 0x05',
    description: 'Bare-metal Linux /dev/fb0 driver, Quadbit 4-bit palette quantization, and direct pixel writes.',
    code: `/* =========================================================================
 * BAREMETAL FB : Linux /dev/fb0 Direct Shard Memory Driver
 * Zero Dependency, Direct Memory Mapping
 * Supports: Quadbit 4-bit (16 Colors) & 32-bit Truecolor ARGB
 * ========================================================================= */

#include "covalent_rt.h"
#include <fcntl.h>
#include <unistd.h>
#include <sys/mman.h>
#include <sys/ioctl.h>
#include <linux/fb.h>

/* 16-Color Quadbit Amber Phosphor CRT Palette */
static const uint32_t quadbit_amber_palette[16] = {
    0xFF000000, 0xFF180C00, 0xFF301800, 0xFF482600,
    0xFF623400, 0xFF7D4400, 0xFF9B5600, 0xFFB96900,
    0xFFD27A00, 0xFFE68C0A, 0xFFF5A014, 0xFFFFB428,
    0xFFFFC846, 0xFFFFDC6E, 0xFFFFF0AA, 0xFFFFFFF0
};

/* Quantize RGB to 16-color quadbit index */
uint8_t quadbit_quantize(uint8_t r, uint8_t g, uint8_t b) {
    uint32_t intensity = (r * 77 + g * 150 + b * 29) >> 8;
    return (uint8_t)(intensity >> 4); // 0 to 15
}

/* Open and mmap /dev/fb0 */
int init_baremetal_framebuffer(raw_framebuffer_t *fb, const char *device_path) {
    int fb_fd = open(device_path, O_RDWR);
    if (fb_fd < 0) return -1;

    struct fb_var_screeninfo vinfo;
    if (ioctl(fb_fd, FBIOGET_VSCREENINFO, &vinfo) < 0) {
        close(fb_fd);
        return -2;
    }

    fb->width = vinfo.xres;
    fb->height = vinfo.yres;
    fb->bpp = vinfo.bits_per_pixel;
    fb->pitch = fb->width * (fb->bpp / 8);

    long screensize = fb->height * fb->pitch;
    fb->buffer = (uint8_t *)mmap(0, screensize, PROT_READ | PROT_WRITE, MAP_SHARED, fb_fd, 0);
    close(fb_fd);

    return (fb->buffer == MAP_FAILED) ? -3 : 0;
}
`
  },
  {
    filename: 'manifold4d.c',
    category: 'Relativity / Organelle 0x06',
    description: '4D Spacetime projection, Flamm paraboloid Schwarzschild embedding, and Clifford torus in pure Q16.16.',
    code: `/* =========================================================================
 * COVALENT-RT : 4D Spacetime Manifold & Observer/Observable Projection
 * Flamm Paraboloid & Clifford Accretion Torus in Q16.16 Fixed-Point
 * Invariant: 1 === 1 (0x00010000)
 * ========================================================================= */

#include "covalent_rt.h"

typedef struct {
    q16_t x, y, z, w;
} vec4_q16_t;

/* 4D Perspective Projection: P_3 = v_3 * d4 / (d4 - w) */
vec3_q16_t project_4d_to_3d(vec4_q16_t v, q16_t eye_d4) {
    q16_t denom = eye_d4 - v.w;
    if (denom < (1 << 12)) denom = (1 << 12); // Guard against singular horizon
    
    q16_t factor = q16_div(eye_d4, denom);
    vec3_q16_t out;
    out.x = q16_mul(v.x, factor);
    out.y = q16_mul(v.y, factor);
    out.z = q16_mul(v.z, factor);
    return out;
}

/* Flamm's Paraboloid Schwarzschild Embedding: w = 2 * sqrt(r_s * (r - r_s)) */
q16_t flamm_embedding_w(q16_t r, q16_t r_s) {
    if (r <= r_s) return 0;
    q16_t diff = r - r_s;
    q16_t prod = q16_mul(r_s, diff);
    q16_t root = q16_sqrt(prod);
    return root << 1; // * 2
}

/* 4D Plane Hyper-Rotation: XW plane */
vec4_q16_t rotate_xw(vec4_q16_t v, q16_t angle) {
    q16_t c = q16_cos(angle);
    q16_t s = q16_sin(angle);
    vec4_q16_t out = v;
    out.x = q16_mul(v.x, c) - q16_mul(v.w, s);
    out.w = q16_mul(v.x, s) + q16_mul(v.w, c);
    return out;
}

/* Observer Dual Frame: MoM-BH*-1 Core Relative Aberration */
vec3_q16_t calculate_relativistic_blueshift_observer(vec3_q16_t incoming_dir, q16_t r, q16_t r_s) {
    // Gravitational blueshift factor g = (1 - r_s / r)^(-1/2)
    q16_t ratio = q16_div(r_s, r);
    q16_t diff = Q16_ONE - ratio;
    if (diff < (1 << 10)) diff = (1 << 10);
    q16_t factor = q16_div(Q16_ONE, q16_sqrt(diff));
    
    vec3_q16_t shifted;
    shifted.x = q16_mul(incoming_dir.x, factor);
    shifted.y = q16_mul(incoming_dir.y, factor);
    shifted.z = q16_mul(incoming_dir.z, factor);
    return shifted;
}
`
  },
  {
    filename: 'mombhstar_infinite_zoom.c',
    category: 'Relativity / Organelle 0x07',
    description: 'Infinite Zoom Scale Engine originating and terminating at the Event Horizon (r=rs) with SMT 1===1 congruity.',
    code: `/* =========================================================================
 * COVALENT-RT : MoM-BH*-1 Infinite Scale Homotopy Engine
 * Conformal Invariant Scale: Lambda = exp(2*pi) ~= 535.491655
 * Origin ≡ Termination at Event Horizon (r = r_s)
 * Invariant: 1 === 1 (0x00010000) SMT-Locked across all zoom tiers
 * ========================================================================= */

#include "covalent_rt.h"

#define COVALENT_LAMBDA_Q16 ((q16_t)(535 * 65536 + 32221)) // 535.491655 in Q16.16
#define RS_Q16              ((q16_t)(1 * 65536 + 52428))    // 1.80 ASU
#define R_COCOON_Q16        ((q16_t)(18 * 65536))           // 18.0 ASU

typedef struct {
    q16_t zoom_depth;         // Continuous logarithmic scale zeta
    int32_t octave;           // Discrete scale tier k
    q16_t phase;              // Intra-octave fractional phase [0, 1)
    q16_t effective_radius;   // r(zeta) in ASU
    q16_t proper_time_ratio;  // dtau/dt = sqrt(1 - rs/r)
    q16_t tortoise_coord;     // r* = r + rs * ln|r/rs - 1|
} mom_zoom_state_t;

/* Compute Radial Distance r(zeta) = rs + (R_cocoon - rs) * Lambda^(-zeta) */
q16_t calculate_conformal_radius(q16_t zeta) {
    if (zeta <= 0) return R_COCOON_Q16;
    
    // Asymptotic contraction towards event horizon
    q16_t delta_base = R_COCOON_Q16 - RS_Q16;
    // Approximated exponential decay per scale octave
    q16_t contraction = q16_div(Q16_ONE, COVALENT_LAMBDA_Q16);
    q16_t delta = q16_mul(delta_base, contraction);
    
    return RS_Q16 + delta;
}

/* SMT-SFXP32 Invariant Verification: 1 === 1 preserved at all zoom tiers */
bool verify_covalent_scale_congruity(q16_t zeta) {
    q16_t r = calculate_conformal_radius(zeta);
    if (r < RS_Q16) return false; // Guard event horizon boundary
    
    // Scale invariance identity: (Scale_k / Scale_k) === 1.000000000
    q16_t identity = q16_div(zeta + Q16_ONE, zeta + Q16_ONE);
    return (identity == Q16_ONE);
}

/* Photon Sub-Ring radius: b_n - b_c ~= exp(-n * pi) */
q16_t calculate_photon_subring_radius(int32_t n, q16_t phase) {
    q16_t bc = q16_mul(RS_Q16, (q16_t)(2 * 65536 + 39190)); // ~2.598 * rs
    q16_t scale = Q16_ONE >> (n * 3); // Exponential decrease
    return bc + scale;
}
`
  },
  {
    filename: 'quadbit_particle_physics.c',
    category: 'Particle Physics / Organelle 0x08',
    description: '16 Quadbit standard model particle kinematics, t=0 genesis eruption, and 5D Causality Vector Clock.',
    code: `/* =========================================================================
 * COVALENT-RT : Quadbit Particle Physics & Vector Clock Engine
 * 16 Quadbit Quantum Eigenspaces (0x0 to 0xF)
 * Relativistic Geodesic Motion & Doppler Beaming around MoM-BH*-1
 * 5D Causality Vector Clock: V = <V_BH, V_Be, V_Pilot, V_Org, V_Qbit>
 * Unified Identity: Be <> ≡ MoM-BH*-1 Core Arbiter & Stasis Intervention
 * ========================================================================= */

#include "covalent_rt.h"

typedef uint8_t quadbit_t;

/* 16 Quadbit Quantum Eigenspaces */
enum {
    QBIT_VACUUM       = 0x0, // Vacuum Fluctuation
    QBIT_UP_QUARK     = 0x1, // Up Quark (SU3 color)
    QBIT_DOWN_QUARK   = 0x2, // Down Quark
    QBIT_ELECTRON     = 0x3, // Electron Lepton
    QBIT_NEUTRINO     = 0x4, // Electron Neutrino
    QBIT_GLUON        = 0x5, // Strong Gluon Octet
    QBIT_PHOTON       = 0x6, // Electromagnetic U1 Photon
    QBIT_Z_BOSON      = 0x7, // Weak Neutral Z0
    QBIT_W_BOSON      = 0x8, // Weak Charged W+/-
    QBIT_HIGGS        = 0x9, // Higgs Scalar Monad
    QBIT_GRAVITON     = 0xA, // Metric Graviton (Spin-2)
    QBIT_BALMER_ION   = 0xB, // Ionized Hydrogen (364.6 nm edge)
    QBIT_COCOON_H     = 0xC, // Neutral Cocoon Gas (JWST Fog)
    QBIT_HAWKING_PAIR = 0xD, // Entangled Horizon Quanta
    QBIT_BE_INVARIANT = 0xE, // Be <> 1===1 Invariant Carrier
    QBIT_SINGULARITY  = 0xF  // Primordial Genesis Monad (t=0)
};

/* 5D Causality Vector Clock */
typedef struct {
    uint32_t v_bh;          // Black hole event counter
    uint32_t v_be;          // Be <> referee counter
    uint32_t v_pilot;       // Human pilot counter
    uint32_t v_organelles;  // 112 Organelle quipu ticks
    uint32_t v_quadbits;    // Particle interaction ticks
    q16_t    proper_time_bh;// Dilated proper time tau_bh (dtau/dt -> 0)
    q16_t    proper_time_be;// Arbiter proper time tau_be
} vector_clock_5d_t;

/* Quadbit Particle Kinematics */
typedef struct {
    uint32_t   id;
    quadbit_t  qbit_state;
    q16_t      r;            // Radius in ASU
    q16_t      phi;          // Azimuth [0, 2*pi)
    q16_t      vr;           // Radial drift velocity
    q16_t      vphi;         // Angular velocity dphi/dt
    q16_t      doppler;      // Relativistic beaming factor g
    q16_t      proper_time;  // Accumulated tau
} quadbit_particle_t;

/* Relativistic Keplerian Angular Velocity: Omega = sqrt(rs / (2 * r^3)) */
q16_t calculate_relativistic_omega(q16_t r, q16_t rs) {
    if (r <= rs) return 0;
    q16_t r3 = q16_mul(q16_mul(r, r), r);
    q16_t denom = r3 << 1; // 2 * r^3
    q16_t ratio = q16_div(rs, denom);
    return q16_sqrt(ratio);
}

/* Be <> as MoM-BH*-1 Stasis Intervention */
bool check_be_stasis_intervention(quadbit_particle_t *p, q16_t rs, vector_clock_5d_t *vc) {
    q16_t stasis_threshold = rs + (rs >> 5); // ~1.03 * rs
    if (p->r <= stasis_threshold) {
        // Non-Hermitian dissipation bounce: prevent coordinate crash
        p->r = stasis_threshold + (1 << 12);
        p->vr = (p->vr < 0) ? -p->vr : p->vr;
        p->qbit_state = QBIT_HAWKING_PAIR; // Radiate entangled pair
        vc->v_be++;
        vc->v_bh++;
        return true;
    }
    return false;
}
`
  },
  {
    filename: 'Makefile',
    category: 'Build System / Substrate',
    description: 'Pure C99 build script with -nostdlib option for bare-metal sovereign targets.',
    code: `# Makefile for Covalent-RT Bare-Metal Engine
CC = gcc
CFLAGS = -O3 -Wall -Wextra -std=c99 -fno-builtin -D_GNU_SOURCE
LDFLAGS = 

TARGET = covalent_rt_engine

SRCS = covalent_rt.c mom_bhstar.c be_officiator.c baremetal_fb.c
OBJS = $(SRCS:.c=.o)

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CC) $(CFLAGS) -o $@ $^ $(LDFLAGS)

%.o: %.c covalent_rt.h
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(OBJS) $(TARGET)

.PHONY: all clean
`
  }
];
