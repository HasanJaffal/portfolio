/**
 * The dog, as a solid.
 *
 * She used to be a flat pixel map. A flat map can do a great deal — a wag, a
 * blink, a head tilt — but it can never *turn around*. The best a sprite can
 * manage is a mirror flip, and a mirror flip reads as a sheet of paper spinning
 * rather than as an animal pivoting on its feet. So she is a real model now: a
 * dozen or so axis-aligned boxes, rasterised every frame into a 34x32 pixel
 * buffer and blown up 2x with `image-rendering: pixelated`.
 *
 * That is the whole trick. She is genuinely three-dimensional, and the pixels
 * are a rendering choice rather than the medium — which is what buys a true
 * yaw through front-on, and a rear-up on her hind legs to paw at the cursor.
 *
 * ## Coordinate system
 *
 * `X` forward, out of her nose. `Y` up. `Z` her left. The origin sits on the
 * ground under the middle of her body, so a yaw spins her about her own middle
 * rather than swinging her around a corner.
 *
 * Yaw is `rotY`: `x' = x·cos + z·sin`, `z' = −x·sin + z·cos`. So `yaw = 0`
 * faces screen-right, `−π/2` faces the viewer, and `−π` faces screen-left. The
 * brain only ever eases *within* `[−π, 0]`, never wrapping past either end,
 * which is what forces both directions of turn through front-on.
 *
 * This file is geometry and nothing else: the boxes, the joints they hang off,
 * the camera, and the pose the brain fills in for the renderer to draw.
 */

/* ---- camera and buffer ------------------------------------------------ */

/** Orthographic, pitched down far enough to see the top of her back. */
export const cameraPitch = (25 * Math.PI) / 180

/**
 * Buffer pixels per model unit. Two-thirds of her first pass: she reads as
 * incidental set dressing at this size rather than a mascot competing with the
 * page, and the buffer below is scaled by the same two-thirds so every ratio
 * — ground clearance, centring — carries over unchanged.
 */
export const projScale = 0.88

export const canvas = {
  /** The pixel buffer she is rasterised into. */
  bufWidth: 34,
  bufHeight: 32,
  /**
   * Ground line, in buffer rows. Two rows are left below it: the near paws
   * project *under* the ground line, because a point at `z > 0` contributes
   * `−z·sinθ` to its screen height.
   */
  groundY: 30,
  /** Model `x = 0` in buffer columns. */
  originX: 17,
  /** Integer, so every model pixel lands on exactly four screen pixels. */
  scale: 2,
  width: 68,
  height: 64,
  /** How far the canvas floats above the footer's top edge, in CSS px. */
  float: 8,
} as const

/* ---- materials -------------------------------------------------------- */

/**
 * Indices into the resolved palette. Kept as plain numbers rather than a union
 * so the renderer can use them as array offsets without a lookup.
 */
export const mat = {
  fur: 0,
  ear: 1,
  muzzle: 2,
  paw: 3,
  nose: 4,
  eye: 5,
  pupil: 6,
} as const

export const materialCount = 7

/** Shade bands per material — see `renderer.ts`. */
export const shadeCount = 4

/**
 * Materials that ignore the shading bands and always draw at full brightness.
 * The nose, the whites and the pupils are *features*: if they take shading
 * they stop reading as marks on a face and turn into more shading noise.
 */
export const flatMaterials: readonly number[] = [mat.nose, mat.eye, mat.pupil]

/**
 * Where each material's colour comes from. `mix` blends the token that far
 * towards the page background — `getComputedStyle` hands back custom
 * properties unresolved, so `color-mix()` in CSS would never resolve; the two
 * ends are read separately and blended here instead.
 */
export const materialTokens: readonly { token: string; mix?: number }[] = [
  /* fur    */ { token: '--color-lime', mix: 0.18 },
  /* ear    */ { token: '--color-lime-dim' },
  /* muzzle */ { token: '--color-lime-soft' },
  /* paw    */ { token: '--color-lime-soft' },
  /* nose   */ { token: '--color-inset' },
  /* eye    */ { token: '--color-foreground' },
  /* pupil  */ { token: '--color-inset' },
]

/* ---- boxes ------------------------------------------------------------ */

export interface Box {
  /** Centre, in model units. */
  cx: number
  cy: number
  cz: number
  /** Full extent along each axis. */
  sx: number
  sy: number
  sz: number
  material: number
}

/**
 * The body. Two things carry most of the "dog": the muzzle is a pale block
 * with a dark nose capping its top-front corner, and the ears are long dark
 * slabs hanging *outside* the skull. Ears in the same tone as the head vanish
 * into it at this resolution, and short ones read as a cat within a second.
 */
export const torso: Box = { cx: -3.5, cy: 10.5, cz: 0, sx: 19, sy: 7, sz: 7.5, material: mat.fur }
export const skull: Box = { cx: 8.5, cy: 17.5, cz: 0, sx: 8.5, sy: 8.5, sz: 7.4, material: mat.fur }
export const snout: Box = { cx: 14, cy: 15.2, cz: 0, sx: 5, sy: 3.6, sz: 4.4, material: mat.muzzle }

/**
 * Sat high enough to break the line of the muzzle's top face. Buried flush it
 * would be perfectly invisible in profile: an orthographic camera culls the
 * face pointing straight down the barrel, so only what pokes *above* the snout
 * ever shows from the side.
 */
export const nose: Box = { cx: 16.1, cy: 16.8, cz: 0, sx: 2.2, sy: 2, sz: 2.6, material: mat.nose }

/**
 * Mirrored on `cz`; `side` is `+1` for her left. Long, and hung well outside
 * the skull on purpose: an ear flush with the head is invisible whatever tone
 * it is, because nothing about the silhouette changes. These break the head's
 * rectangle on both sides and hang past the jaw, which is the single strongest
 * "dog" signal at this resolution — short ears read as a cat within a second.
 */
export const ear: Box = { cx: 7.5, cy: 16.5, cz: 5, sx: 3.6, sy: 9.5, sz: 2.4, material: mat.ear }

export const tailUpper: Box = {
  cx: -15,
  cy: 16,
  cz: 0,
  sx: 2.2,
  sy: 5.5,
  sz: 2.2,
  material: mat.fur,
}
export const tailTip: Box = {
  cx: -16.2,
  cy: 20.5,
  cz: 0,
  sx: 2,
  sy: 4.5,
  sz: 2,
  material: mat.fur,
}

/* ---- eyes ------------------------------------------------------------- */

/**
 * **The splay is load-bearing.** Each eye is a thin plate, and a plate rotated
 * to sit on the cheek rather than flat on the front of the face is the only
 * arrangement that survives every yaw. Flat plates are both perpendicular to
 * the camera when she stands exactly side-on, both get back-face culled, and
 * she has no eyes at all at the one angle she spends most of her time in.
 *
 * Splayed, side-on shows the near eye and correctly hides the far one, and
 * front-on shows both. The plates also sit slightly proud of the cheek so they
 * sort in front of the skull's flank rather than behind it.
 */
export const eye = {
  cx: 12.2,
  cy: 18.9,
  cz: 3,
  sx: 1.2,
  sy: 3.2,
  sz: 3.2,
  /** Radians about Y, about the plate's own centre. Negated for her left eye. */
  splay: 0.5,
  /** Pupil, placed along the plate's *local* +X so it rides on the splayed face. */
  pupil: { out: 0.75, sx: 0.8, sy: 1.8, sz: 1.8 },
  /** How far a pupil may slide across its plate, in model units. */
  travel: 0.62,
} as const

/* ---- legs ------------------------------------------------------------- */

/** Hip sockets. Order is front-left, front-right, hind-left, hind-right. */
export const hips: readonly { x: number; z: number }[] = [
  { x: 2, z: 2.4 },
  { x: 2, z: -2.4 },
  { x: -10.5, z: 2.4 },
  { x: -10.5, z: -2.4 },
]

export const hipY = 7

/** Both measured from the hip's `x`/`z`; the joint supplies the rest. */
export const legShank = { cy: 4.4, sx: 2.6, sy: 5.2, sz: 2.6 } as const
export const legPaw = { cy: 0.9, sx: 2.9, sy: 1.8, sz: 2.9 } as const

/* ---- joints ----------------------------------------------------------- */

/**
 * Every pivot is a point she could actually hinge about, which is most of why
 * the poses read as an animal rather than as a rig: she rears about her hind
 * feet, sits about her front ones, and each leg swings from its own socket.
 */
export const pivots = {
  /** Hind feet. `rotZ(+α)` lifts her front end off the floor. */
  rear: { x: -10.5, y: 0, z: 0 },
  /** Front feet. `rotZ(+β)` drops her back end onto the floor. */
  sit: { x: 2, y: 0, z: 0 },
  /** Base of the neck. */
  head: { x: 5, y: 15, z: 0 },
  /** The top of each ear, so they hinge rather than slide. */
  ear: { x: 7.5, y: 21.25, z: 5 },
  /** Root of the tail, at the back of the spine. */
  tail: { x: -13, y: 13, z: 0 },
} as const

/* ---- pose ------------------------------------------------------------- */

/**
 * Everything the brain decides and the renderer draws. One mutable object,
 * reused every frame — this is a hot path and a fresh pose per frame would be
 * 60 short-lived allocations a second for no reason.
 */
export interface DogPose {
  /** Body yaw, radians, always within `[−π, 0]`. */
  yaw: number
  /** Bank into a turn, radians about her own forward axis. */
  roll: number
  /** Lunge along her nose, model units. Rearing shifts her forward too. */
  shift: number
  /** Rear-up, radians about the hind feet. */
  rear: number
  /** Sit, radians about the front feet. */
  sit: number
  /** Breathing, footfalls and hops, model units. */
  lift: number
  headYaw: number
  headPitch: number
  earLeft: number
  earRight: number
  tailYaw: number
  /** Positive brings the tail upright. */
  tailLift: number
  /** Swing per leg, radians; positive throws the paw forward. Matches `hips`. */
  legs: number[]
  /** 0 open, 1 shut. */
  blink: number
  /** Residual gaze the head does not cover, −1..1. */
  lookX: number
  lookY: number
}

export function createPose(): DogPose {
  return {
    yaw: -Math.PI,
    roll: 0,
    shift: 0,
    rear: 0,
    sit: 0,
    lift: 0,
    headYaw: 0,
    headPitch: 0,
    earLeft: 0,
    earRight: 0,
    tailYaw: 0,
    tailLift: 0,
    legs: [0, 0, 0, 0],
    blink: 0,
    lookX: 0,
    lookY: 0,
  }
}
