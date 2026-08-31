/**
 * Every sound in the portfolio is synthesised at runtime from these specs —
 * there are no audio files. That keeps the payload at zero bytes, makes the
 * palette tunable in one place, and gives everything the same character.
 *
 * The palette is modelled on the Atari TIA: square waves, a low buzzy
 * register, and pitch sweeps that climb in audible steps rather than gliding,
 * because the chip could only address a coarse set of dividers. That stepping
 * is most of what makes a sweep read as "console" instead of "synth" — see
 * `steps` below.
 */

export type SoundName =
  | 'keypress'
  | 'command'
  | 'error'
  | 'panel-open'
  | 'panel-close'
  | 'navigate'
  | 'select'
  | 'toggle'
  | 'boot-line'
  | 'boot-ready'
  | 'creature'

export interface Voice {
  /** Oscillator shape, or `noise` for a filtered white-noise burst. */
  type: OscillatorType | 'noise'
  /** Starting frequency in Hz. For `noise` voices this is ignored. */
  freq: number
  /** Sweep target in Hz; omit for a steady tone. */
  freqEnd?: number
  /**
   * Quantise the sweep into this many held pitches instead of gliding. The
   * TIA had no portamento — everything arpeggiated — so this is what gives
   * the sweeps their staircase.
   */
  steps?: number
  /** Peak gain, 0–1, relative to the master bus. */
  gain: number
  attackMs: number
  decayMs: number
  /** Offset from the start of the sound, for two-note blips and arpeggios. */
  delayMs?: number
  /** Random detune spread in cents, so repeats never sound machine-stamped. */
  jitterCents?: number
  /** Low-pass cutoff in Hz. `noise` voices only. */
  cutoff?: number
}

export interface SoundSpec {
  voices: Voice[]
  /** Minimum gap between two plays of this sound, in ms. */
  throttleMs: number
}

export const soundSpecs: Record<SoundName, SoundSpec> = {
  /* A chunky key contact: a low square thud under a noise tick. */
  keypress: {
    throttleMs: 18,
    voices: [
      { type: 'square', freq: 196, gain: 0.09, attackMs: 1, decayMs: 34, jitterCents: 60 },
      { type: 'noise', freq: 0, gain: 0.08, attackMs: 1, decayMs: 20, cutoff: 3800 },
    ],
  },
  /* Enter: a four-step climb. The shell accepting the line. */
  command: {
    throttleMs: 60,
    voices: [
      { type: 'square', freq: 330, freqEnd: 659, steps: 4, gain: 0.17, attackMs: 1, decayMs: 110 },
      { type: 'square', freq: 165, freqEnd: 330, steps: 4, gain: 0.08, attackMs: 1, decayMs: 110 },
    ],
  },
  /* Rejected input: the classic descending buzz. */
  error: {
    throttleMs: 120,
    voices: [
      { type: 'square', freq: 233, freqEnd: 82, steps: 6, gain: 0.19, attackMs: 1, decayMs: 300 },
      { type: 'sawtooth', freq: 116, freqEnd: 41, steps: 6, gain: 0.1, attackMs: 1, decayMs: 300 },
    ],
  },
  /* Panels ratchet up… */
  'panel-open': {
    throttleMs: 90,
    voices: [
      { type: 'square', freq: 165, freqEnd: 587, steps: 5, gain: 0.16, attackMs: 1, decayMs: 150 },
      { type: 'noise', freq: 0, gain: 0.05, attackMs: 2, decayMs: 70, cutoff: 2200 },
    ],
  },
  /* …and ratchet back down. */
  'panel-close': {
    throttleMs: 90,
    voices: [
      { type: 'square', freq: 587, freqEnd: 165, steps: 5, gain: 0.15, attackMs: 1, decayMs: 140 },
    ],
  },
  /* Route change: a two-note console blip. */
  navigate: {
    throttleMs: 110,
    voices: [
      { type: 'square', freq: 392, gain: 0.13, attackMs: 1, decayMs: 60, jitterCents: 25 },
      { type: 'square', freq: 587, gain: 0.12, attackMs: 1, decayMs: 80, delayMs: 60, jitterCents: 25 },
    ],
  },
  /* Generic button press: one short step up. */
  select: {
    throttleMs: 70,
    voices: [
      { type: 'square', freq: 294, freqEnd: 440, steps: 2, gain: 0.13, attackMs: 1, decayMs: 70 },
    ],
  },
  /* A switch flipping. */
  toggle: {
    throttleMs: 80,
    voices: [
      { type: 'square', freq: 262, gain: 0.14, attackMs: 1, decayMs: 45 },
      { type: 'square', freq: 392, gain: 0.13, attackMs: 1, decayMs: 60, delayMs: 55 },
    ],
  },
  /* One line of POST output. Short and dry — it repeats a lot. */
  'boot-line': {
    throttleMs: 40,
    voices: [
      { type: 'square', freq: 740, gain: 0.075, attackMs: 1, decayMs: 22, jitterCents: 110 },
      { type: 'noise', freq: 0, gain: 0.05, attackMs: 1, decayMs: 18, cutoff: 4200 },
    ],
  },
  /* System ready: a major arpeggio, the one flourish in the palette. */
  'boot-ready': {
    throttleMs: 400,
    voices: [
      { type: 'square', freq: 262, gain: 0.15, attackMs: 1, decayMs: 130 },
      { type: 'square', freq: 330, gain: 0.15, attackMs: 1, decayMs: 130, delayMs: 90 },
      { type: 'square', freq: 392, gain: 0.15, attackMs: 1, decayMs: 130, delayMs: 180 },
      { type: 'square', freq: 523, gain: 0.16, attackMs: 1, decayMs: 420, delayMs: 270 },
      { type: 'square', freq: 131, gain: 0.08, attackMs: 1, decayMs: 520, delayMs: 270 },
    ],
  },
  /* Something moved in the dark: a fast warbling chirp. */
  creature: {
    throttleMs: 300,
    voices: [
      { type: 'square', freq: 880, freqEnd: 1568, steps: 4, gain: 0.12, attackMs: 1, decayMs: 90, jitterCents: 150 },
      { type: 'square', freq: 1568, freqEnd: 988, steps: 3, gain: 0.1, attackMs: 1, decayMs: 110, delayMs: 100, jitterCents: 150 },
    ],
  },
}

export const audioMutedStorageKey = 'portfolio:audio-muted'
