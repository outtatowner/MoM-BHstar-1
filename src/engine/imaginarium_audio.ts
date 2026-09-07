/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Be <> [] Continuum : Imaginarium Harmonizer Web Audio Synthesizer
 * 
 * Generates interactive polyphonic, microtonal, and relativistic auditory feedback:
 * - 3 Observer Triad Harmonic Chords (Human: warm 432 Hz organic cello, Be <>: crystalline 528 Hz bell, MoM-BH*-1: 54 Hz infrasound gravitational hum)
 * - Balmer Spectrum Sonification (H-alpha 656.3nm -> 437.5Hz, H-beta 486.1nm -> 590Hz, etc.)
 * - Relativistic Gravitational Redshift dynamic pitch bending: f_obs = f_0 * sqrt(1 - rs/r)
 * - Quadbit Eigenspace orbital chimes on passage
 */

class ImaginariumHarmonizerEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private masterGain: GainNode | null = null;
  
  // Observer persistent drones
  private bhDroneOsc1: OscillatorNode | null = null;
  private bhDroneOsc2: OscillatorNode | null = null;
  private bhDroneGain: GainNode | null = null;
  
  private beDroneOsc: OscillatorNode | null = null;
  private beDroneGain: GainNode | null = null;

  private humanDroneOsc: OscillatorNode | null = null;
  private humanDroneGain: GainNode | null = null;

  private initAudio() {
    if (this.ctx) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0.0 : 0.28, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // 1. MoM-BH*-1 Infrasound / Deep Gravity Bass (Sub-octave 54Hz + 108Hz harmonic)
      this.bhDroneOsc1 = this.ctx.createOscillator();
      this.bhDroneOsc2 = this.ctx.createOscillator();
      this.bhDroneGain = this.ctx.createGain();
      
      this.bhDroneOsc1.type = 'sine';
      this.bhDroneOsc1.frequency.setValueAtTime(54.0, this.ctx.currentTime); // Deep cosmic fundamental
      this.bhDroneOsc2.type = 'triangle';
      this.bhDroneOsc2.frequency.setValueAtTime(108.0, this.ctx.currentTime); // First overtone
      
      this.bhDroneGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.bhDroneOsc1.connect(this.bhDroneGain);
      this.bhDroneOsc2.connect(this.bhDroneGain);
      this.bhDroneGain.connect(this.masterGain);
      this.bhDroneOsc1.start();
      this.bhDroneOsc2.start();

      // 2. Be <> Sovereign Arbiter Crystalline Bell (528 Hz Solfeggio / Cybernetic Resonator)
      this.beDroneOsc = this.ctx.createOscillator();
      this.beDroneGain = this.ctx.createGain();
      this.beDroneOsc.type = 'sine';
      this.beDroneOsc.frequency.setValueAtTime(528.0, this.ctx.currentTime);
      this.beDroneGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      this.beDroneOsc.connect(this.beDroneGain);
      this.beDroneGain.connect(this.masterGain);
      this.beDroneOsc.start();

      // 3. Human Pilot Warm 432 Hz Harmonic (Biological warmth, gentle saw filtered)
      this.humanDroneOsc = this.ctx.createOscillator();
      this.humanDroneGain = this.ctx.createGain();
      this.humanDroneOsc.type = 'triangle';
      this.humanDroneOsc.frequency.setValueAtTime(216.0, this.ctx.currentTime); // 432 / 2
      this.humanDroneGain.gain.setValueAtTime(0.22, this.ctx.currentTime);
      this.humanDroneOsc.connect(this.humanDroneGain);
      this.humanDroneGain.connect(this.masterGain);
      this.humanDroneOsc.start();

    } catch (e) {
      console.warn('AudioContext not allowed yet without user gesture', e);
    }
  }

  public toggleMute(): boolean {
    if (!this.ctx) {
      this.initAudio();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0.0 : 0.28;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
    return !this.isMuted;
  }

  public getIsPlaying(): boolean {
    return !this.isMuted;
  }

  /**
   * Modulate pitch based on distance to event horizon r_s
   * Illustrates gravitational redshift to curious learners:
   * As r -> r_s, frequency drops smoothly: f = f_0 * sqrt(1 - rs/r)
   */
  public updateRelativisticFrequencies(radiusASU: number, rsASU: number = 1.8) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const factor = Math.max(0.12, Math.sqrt(Math.max(0.01, 1 - rsASU / Math.max(radiusASU, rsASU * 1.01))));

    if (this.bhDroneOsc1) {
      this.bhDroneOsc1.frequency.setTargetAtTime(54.0 * factor, now, 0.1);
    }
    if (this.bhDroneOsc2) {
      this.bhDroneOsc2.frequency.setTargetAtTime(108.0 * factor, now, 0.1);
    }
    if (this.beDroneOsc) {
      // Be <> oscillates in cybernetic phase
      this.beDroneOsc.frequency.setTargetAtTime(528.0 * (0.9 + 0.2 * Math.sin(now * 1.5)), now, 0.1);
    }
  }

  /**
   * Trigger interactive resonant bell chime when clicking or triggering an observer,
   * lens ring, or quadbit in the Imaginarium.
   */
  public playObserverChime(type: 'human' | 'be' | 'bh' | 'light' | 'math') {
    if (!this.ctx) {
      this.initAudio();
    }
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    let baseFreq = 440;
    if (type === 'human') baseFreq = 432; // Biological A
    else if (type === 'be') baseFreq = 528; // Cybernetic transform
    else if (type === 'bh') baseFreq = 162; // Deep cosmic chord
    else if (type === 'light') baseFreq = 864; // High photonic sparkle
    else if (type === 'math') baseFreq = 648; // Golden ratio overtone

    osc.type = type === 'bh' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.8);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 1.25);
  }
}

export const harmonizer = new ImaginariumHarmonizerEngine();
