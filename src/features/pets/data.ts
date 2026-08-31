/**
 * The pets.
 *
 * Each one is a closed outline in normalised space — roughly -1..1, origin at
 * the middle of the animal, facing right. They are drawn as a lit polyline
 * with a node at every vertex, deliberately the same construction as the
 * network in the background, so a pet reads as something that walked out of
 * the environment rather than a sprite pasted over it.
 *
 * They live along the floor of the content area, not in the 3D layer: a pet
 * is a character you can look at and poke, and that only works if it is in
 * front of the page at a legible size.
 */

export type PetSpecies = 'cat' | 'fox' | 'bird' | 'deer' | 'whale' | 'moth'

export type Outline = readonly (readonly [number, number])[]

export type Gait =
  /** Feet on the floor, legs swinging, body bobbing on each step. */
  | 'walk'
  /** Hovers well above the floor with a fast wingbeat. */
  | 'fly'
  /** Drifts above the floor with a long, slow roll. */
  | 'swim'

export interface PetShape {
  species: PetSpecies
  label: string
  outline: Outline
  /** On-screen height in px. Widths follow from each outline's proportions. */
  size: number
  gait: Gait
  /** Travel speed in px per second. */
  speed: number
  /** How far above the floor line the body sits, as a fraction of `size`. */
  hover: number
  /**
   * Vertices below this normalised y are treated as legs and swung through
   * the step cycle. Ignored for gaits that never touch the floor.
   */
  legThreshold: number
}

const cat: Outline = [
  [0.42, 0.22], [0.34, 0.34], [0.28, 0.42], [0.34, 0.72], [0.16, 0.46],
  [0.02, 0.74], [-0.04, 0.44], [-0.14, 0.34], [-0.2, 0.2], [-0.4, 0.02],
  [-0.56, -0.22], [-0.68, -0.34], [-0.84, -0.3], [-0.92, -0.1], [-0.84, 0.1],
  [-0.7, 0.14], [-0.76, 0.02], [-0.8, -0.12], [-0.72, -0.26], [-0.58, -0.32],
  [-0.52, -0.54], [-0.28, -0.6], [-0.06, -0.56], [0.3, -0.58], [0.34, -0.44],
  [0.36, -0.1], [0.4, 0.06],
]

const fox: Outline = [
  [0.92, 0.02], [0.74, 0.14], [0.62, 0.18], [0.56, 0.26], [0.62, 0.6],
  [0.44, 0.3], [0.34, 0.58], [0.28, 0.28], [0.14, 0.2], [-0.1, 0.22],
  [-0.38, 0.18], [-0.52, 0.24], [-0.74, 0.34], [-0.96, 0.28], [-0.86, 0.1],
  [-0.62, 0.02], [-0.48, -0.06], [-0.44, -0.34], [-0.4, -0.52], [-0.28, -0.5],
  [-0.26, -0.24], [-0.04, -0.2], [0.18, -0.24], [0.22, -0.52], [0.34, -0.5],
  [0.34, -0.18], [0.44, -0.04], [0.62, 0],
]

const bird: Outline = [
  [0.78, 0.06], [0.62, 0.14], [0.5, 0.2], [0.38, 0.2], [0.22, 0.26],
  [0.02, 0.52], [-0.22, 0.46], [-0.1, 0.2], [-0.28, 0.14], [-0.62, 0.26],
  [-0.78, 0.16], [-0.6, 0.02], [-0.34, -0.02], [-0.16, -0.1], [-0.1, -0.26],
  [-0.02, -0.12], [0.14, -0.14], [0.34, -0.1], [0.52, -0.02], [0.62, 0],
]

const deer: Outline = [
  [0.86, 0.28], [0.72, 0.42], [0.66, 0.66], [0.76, 0.62], [0.7, 0.84],
  [0.6, 0.6], [0.54, 0.44], [0.46, 0.68], [0.38, 0.6], [0.44, 0.82],
  [0.36, 0.52], [0.3, 0.36], [0.22, 0.46], [0.1, 0.4], [0.2, 0.32],
  [0.02, 0.12], [-0.14, -0.06], [-0.26, -0.1], [-0.48, -0.08], [-0.66, -0.1],
  [-0.74, -0.02], [-0.7, -0.14], [-0.68, -0.34], [-0.66, -0.62], [-0.56, -0.62],
  [-0.54, -0.36], [-0.46, -0.24], [-0.2, -0.28], [0.02, -0.26], [0, -0.62],
  [0.1, -0.62], [0.14, -0.28], [0.22, -0.14], [0.34, 0.1], [0.48, 0.26],
  [0.62, 0.3], [0.74, 0.22],
]

const whale: Outline = [
  [-0.78, 0.3], [-0.56, 0.08], [-0.3, 0.2], [0.02, 0.26], [0.34, 0.22],
  [0.58, 0.1], [0.68, -0.04], [0.56, -0.16], [0.28, -0.24], [0.0, -0.26],
  [-0.14, -0.34], [-0.3, -0.3], [-0.24, -0.2], [-0.44, -0.14], [-0.58, -0.1],
  [-0.8, -0.28], [-0.66, -0.02],
]

const moth: Outline = [
  [0.0, 0.36], [0.16, 0.64], [0.05, 0.36], [0.1, 0.26], [0.3, 0.44],
  [0.62, 0.36], [0.72, 0.06], [0.56, -0.2], [0.3, -0.34], [0.12, -0.2],
  [0.06, -0.36], [0.0, -0.46], [-0.06, -0.36], [-0.12, -0.2], [-0.3, -0.34],
  [-0.56, -0.2], [-0.72, 0.06], [-0.62, 0.36], [-0.3, 0.44], [-0.1, 0.26],
  [-0.05, 0.36], [-0.16, 0.64],
]

export const petShapes: Record<PetSpecies, PetShape> = {
  cat: { species: 'cat', label: 'cat', outline: cat, size: 74, gait: 'walk', speed: 46, hover: 0, legThreshold: -0.4 },
  fox: { species: 'fox', label: 'fox', outline: fox, size: 68, gait: 'walk', speed: 62, hover: 0, legThreshold: -0.3 },
  deer: { species: 'deer', label: 'deer', outline: deer, size: 96, gait: 'walk', speed: 54, hover: 0, legThreshold: -0.34 },
  bird: { species: 'bird', label: 'bird', outline: bird, size: 46, gait: 'fly', speed: 96, hover: 1.1, legThreshold: -1 },
  moth: { species: 'moth', label: 'moth', outline: moth, size: 34, gait: 'fly', speed: 74, hover: 1.6, legThreshold: -1 },
  whale: { species: 'whale', label: 'whale', outline: whale, size: 120, gait: 'swim', speed: 30, hover: 1.3, legThreshold: -1 },
}

export const petSpecies = Object.keys(petShapes) as PetSpecies[]

export function isPetSpecies(value: string): value is PetSpecies {
  return Object.hasOwn(petShapes, value)
}

/**
 * How far above the bottom of the content area the pets' feet land. Enough
 * clearance that a walking pet is never half-tucked behind the status bar.
 */
export const petFloorInset = 14

/** Seconds before the first pet wanders in, and the gap between them after. */
export const petSchedule = {
  firstMs: [7_000, 13_000],
  intervalMs: [26_000, 58_000],
} as const
