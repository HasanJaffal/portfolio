/**
 * The opening.
 *
 * The sequence runs itself end to end — nothing here waits on the visitor.
 * Pressing a key or clicking only *shortens* it; the portfolio arrives on
 * its own in well under three seconds either way.
 */

export type BootPhase =
  /** Black. A cursor, and nothing else yet. */
  | 'cold'
  /** POST log streaming. */
  | 'post'
  /** Everything mounted; the prompt appears and the overlay lets go. */
  | 'ready'

export interface BootLine {
  /** Kernel-style timestamp. Cosmetic — the real timing is `delayMs`. */
  stamp: string
  label: string
  /** Right-hand column. Empty for the banner line. */
  result: string
  tone: 'banner' | 'ok' | 'accent'
  /** Gap after the previous line. */
  delayMs: number
}

export const bootLines: BootLine[] = [
  { stamp: '0.000000', label: 'hasan-os kernel 6.1.4 (tty0)', result: '', tone: 'banner', delayMs: 90 },
  { stamp: '0.041231', label: 'mounting /dev/portfolio', result: 'ok', tone: 'ok', delayMs: 150 },
  { stamp: '0.118904', label: 'probing render device', result: 'webgl2', tone: 'accent', delayMs: 120 },
  { stamp: '0.240117', label: 'loading profile', result: 'ok', tone: 'ok', delayMs: 170 },
  { stamp: '0.318442', label: 'loading projects', result: 'ok', tone: 'ok', delayMs: 110 },
  { stamp: '0.402990', label: 'loading experience', result: 'ok', tone: 'ok', delayMs: 110 },
  { stamp: '0.511265', label: 'spawning terminal', result: 'ok', tone: 'ok', delayMs: 150 },
  { stamp: '0.664881', label: 'establishing render link', result: 'ok', tone: 'accent', delayMs: 210 },
  { stamp: '0.781034', label: 'wildlife daemon', result: 'idle', tone: 'accent', delayMs: 190 },
]

/**
 * The line at which the environment comes up to full brightness. Tying the
 * reveal to "establishing render link" is the point of the whole sequence:
 * the log claims a thing happened, and it visibly happens.
 */
export const renderLinkLineIndex = 7

export const bootTimings = {
  /** Black-screen beat before the log starts. */
  coldMs: 320,
  /** Pause between the last log line and the prompt. */
  readyMs: 240,
  /** How long the prompt sits there before the overlay releases. */
  holdMs: 420,
  /** Everything above, collapsed, when the visitor prefers reduced motion. */
  reducedMs: 420,
} as const

export const bootStorageKey = 'portfolio:boot-seen'
