/**
 * Tuning for the Three.js environment.
 *
 * The scene is mounted once, at the app root, and never unmounts — the boot
 * sequence and the portfolio are two views onto the *same* running space,
 * which is what makes the hand-off between them feel continuous rather than
 * like one screen replacing another. It is also why the background is
 * identical on every route: there is only ever one of it, sitting behind the
 * whole app, and navigating never disturbs it.
 *
 * `SceneStage` is how the rest of the app tells the environment which view is
 * currently on top.
 */

export type SceneStage =
  /** Before anything: a black screen. */
  | 'cold'
  /** POST messages are streaming; the lattice ghosts in behind them. */
  | 'wake'
  /** The render link is up. Full brightness — the one showy moment. */
  | 'live'
  /** The portfolio is in front. The environment settles into the background. */
  | 'idle'

/** Opacity of the whole canvas layer per stage. */
export const stageOpacity: Record<SceneStage, number> = {
  cold: 0,
  wake: 0.5,
  live: 1,
  idle: 1,
}

/**
 * How animated and how bright the environment is per stage, 0–1. Layers lerp
 * toward this rather than reading it directly, so stage changes glide instead
 * of snapping.
 */
export const stageEnergy: Record<SceneStage, number> = {
  cold: 0,
  wake: 0.32,
  live: 1,
  idle: 0.72,
}

export const sceneColors = {
  lime: '#a3e635',
  limeSoft: '#cbf28a',
  limeDim: '#4d6b1a',
  /** Matches `--color-background` so fogged geometry dissolves into the page. */
  fog: '#0a0b0d',
} as const

/**
 * Half-extents of the slab the lattice fills: x, y, z.
 *
 * These are sized to the camera frustum at the back plane, which is why the
 * value is per-tier rather than global: a phone's frustum is roughly a third
 * as wide as a desktop's, and reusing the desktop figure there would leave
 * the viewport showing a thin, near-empty slice of a very wide field.
 */
export const networkSpread = {
  wide: [13, 7.5, 9],
  narrow: [4.5, 8, 7],
} as const satisfies Record<string, readonly [number, number, number]>
/** Nodes closer together than this get wired to each other. */
export const networkLinkDistance = 2.5
/** Links per node, capped so dense pockets never fill in as a solid mass. */
export const networkMaxDegree = 3
