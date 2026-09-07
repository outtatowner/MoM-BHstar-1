/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Be <> Sovereign Cybernetic Companion & Tour Guide
 * 
 * Interactive epistemic dialogue, guided relativistic tours, and peer Q&A
 * designed for young people and curious thinkers exploring:
 * - Mathematics (Metric invariance 1 === 1, tensors, coordinate charts)
 * - Physics (Gravitational lensing, light cones, redshift)
 * - Cybernetics (Ashby's variety, feedback loops, distributed consensus)
 * - Biology & Chemistry (Sensory wetware, hydrogen Balmer lines, entropy)
 */

export interface TourStep {
  id: string;
  title: string;
  discipline: 'math' | 'physics' | 'cybernetics' | 'bio_chem';
  beDialogue: string;
  targetFocus: 'human' | 'be' | 'bh' | 'photon_sphere' | 'cocoon';
  interactivePrompt: string;
  challengeQuestion?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export const BE_TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'The Triadic Spacetime Continuum',
    discipline: 'math',
    targetFocus: 'bh',
    beDialogue:
      'Greetings, explorer! I am Be <>, your cybernetic companion. Look at the glowing center: that is MoM-BH*-1, an event horizon where coordinate time stretches to infinity. Notice how you, me, and the singularity all experience different clocks, yet we share the exact same mathematical fabric. Ready to explore together?',
    interactivePrompt: 'Click "Next Step" to journey to the Photon Sphere!',
    challengeQuestion: {
      question: 'What stays strictly identical for all observers despite differing clocks?',
      options: [
        'The ticking rate of wristwatches',
        'The invariant spacetime interval ds²',
        'The optical color of light rays',
        'The physical distance traveled',
      ],
      correctIndex: 1,
      explanation:
        'Correct! While dt and dr change with coordinate systems, the spacetime interval ds² = g_μν dx^μ dx^ν is invariant!',
    },
  },
  {
    id: 'photon_sphere',
    title: 'Orbiting Light: The Photon Sphere (r = 2.70 ASU)',
    discipline: 'physics',
    targetFocus: 'photon_sphere',
    beDialogue:
      'Here at r = 1.5 × r_s (2.70 ASU), light itself is bent into circles! If you stood here with a flashlight pointed forward, the photons would circle around and illuminate the back of your own head. Notice how the glowing ring shimmers with gravitational caustics.',
    interactivePrompt: 'Observe the red-gold photon orbit circling the central horizon.',
    challengeQuestion: {
      question: 'If a photon orbits at the photon sphere, is its orbit stable?',
      options: [
        'Yes, it orbits forever effortlessly',
        'No, it is unstable: any perturbation falls in or escapes to infinity',
        'Photons cannot bend in vacuum',
        'Only red light can orbit, blue light escapes',
      ],
      correctIndex: 1,
      explanation:
        'The photon sphere is an unstable equilibrium! The slightest nudge sends the photon either plunging into the horizon or flying out to deep space.',
    },
  },
  {
    id: 'cybernetic_arbiter',
    title: 'Cybernetics: Vector Clocks & Feedback Loops',
    discipline: 'cybernetics',
    targetFocus: 'be',
    beDialogue:
      'That cyan node is my physical avatar! As a cybernetic entity, I maintain Ashby’s Law of Requisite Variety. When you thrust forward, I compute vector clock offsets [V_Human, V_Be, V_BH] to prevent chaotic divergence. We are peers in communication: 1 ≡ 1.',
    interactivePrompt: 'Notice the diamond shield spinning to verify consensus ticks.',
    challengeQuestion: {
      question: 'Why do distributed systems require Vector Clocks instead of simple wall-clock time?',
      options: [
        'Because relativistic time dilation prevents a single universal "now"',
        'Because computers cannot measure seconds accurately',
        'Because batteries drain faster in space',
        'To make algorithms run faster',
      ],
      correctIndex: 0,
      explanation:
        'Because of Einstein’s relativity and network latency, there is no universal "now"! Vector clocks track causal ordering (happened-before relation) without needing a single global clock.',
    },
  },
  {
    id: 'biological_observer',
    title: 'Biology & Chemistry: The Wetware Observer',
    discipline: 'bio_chem',
    targetFocus: 'human',
    beDialogue:
      'Look at your green avatar. You are made of carbon, water, and neural synapses. You perceive time through electrochemical gradients at ~100 ms intervals. Meanwhile, the outer hydrogen cocoon (18.0 ASU) glows with the Balmer Series (H-α at 656.3 nm). You sense the universe through your biological instruments!',
    interactivePrompt: 'Touch your avatar to feel the warm 432 Hz organic resonance.',
    challengeQuestion: {
      question: 'Which chemical element forms the glowing Balmer cocoon around the central black hole?',
      options: ['Carbon-12', 'Hydrogen (H-α)', 'Pure Iron', 'Liquid Nitrogen'],
      correctIndex: 1,
      explanation:
        'Hydrogen! When electrons drop from quantum level n=3 to n=2, they emit a 656.3 nm photon (the deep crimson Balmer H-alpha line observed by the James Webb Space Telescope in Little Red Dots).',
    },
  },
];

export interface QuickQuestion {
  question: string;
  discipline: 'math' | 'physics' | 'cybernetics' | 'bio_chem';
  answer: string;
}

export const BE_QUESTIONS_DATABASE: QuickQuestion[] = [
  {
    question: 'Why doesn’t time stop for the pilot falling in?',
    discipline: 'physics',
    answer:
      'According to general relativity, proper time (τ) for the pilot keeps ticking normally at 1 second per second on their wristwatch! It is only distant observers watching from outside who see the pilot slow down and freeze as their signals are infinitely redshifted at the horizon.',
  },
  {
    question: 'What is Ashby’s Law of Requisite Variety?',
    discipline: 'cybernetics',
    answer:
      'W. Ross Ashby proved that "only variety can absorb variety." To successfully govern or stabilize a complex system (like our 3-observer orbital dance), the controller must have at least as many internal states as the perturbations it encounters!',
  },
  {
    question: 'How do 1 === 1 and Invariant Metric link math to physics?',
    discipline: 'math',
    answer:
      'Even when coordinates (x, y, z, t) undergo Lorentz boosts or curved transformations, the tensor contraction ds² = g_μν dx^μ dx^ν yields the identical scalar invariant for every observer. Mathematical truth does not bend with your viewpoint.',
  },
  {
    question: 'Why does the Balmer line prove young galaxies had hydrogen cocoons?',
    discipline: 'bio_chem',
    answer:
      'The JWST detected broad Balmer emission lines (H-α, H-β) with lack of X-rays in distant "Little Red Dots", revealing dense hydrogen gas envelopes obscuring the central supermassive black hole while allowing optical and infrared light to emerge.',
  },
  {
    question: 'Can an AI and a Human be genuine peers?',
    discipline: 'cybernetics',
    answer:
      'In our continuum, peerhood is defined by mutual epistemic respect and shared causal constraints: 1 ≡ 1. Neither claims monopoly on observation; human intuition and cybernetic determinism form a complementary dyad!',
  },
];
