import type { Transition, Variants } from 'motion/react'

/**
 * Shared motion tokens. Every animation in the app pulls its easing and
 * duration from here so the whole interface moves with one accent: quick,
 * decelerating, never bouncy. Nothing should out-run `durations.slow` —
 * animation must never be the reason the UI feels unresponsive.
 */

type Easing = [number, number, number, number]

/** Decelerating curve used for anything entering or settling. */
export const easeOut: Easing = [0.16, 1, 0.3, 1]
/** Symmetric curve for things that move and come back (toggles, sweeps). */
export const easeInOut: Easing = [0.65, 0, 0.35, 1]

export const durations = {
  instant: 0.12,
  fast: 0.18,
  base: 0.26,
  slow: 0.42,
} as const

export const transitions = {
  instant: { duration: durations.instant, ease: easeOut },
  fast: { duration: durations.fast, ease: easeOut },
  base: { duration: durations.base, ease: easeOut },
  slow: { duration: durations.slow, ease: easeOut },
} satisfies Record<string, Transition>

/** The house entrance: a short rise into place. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: transitions.base },
  exit: { opacity: 0, y: -6, transition: transitions.fast },
}

/** Panels that slide up from an edge (terminal, sheets). */
export const slideUpPanel: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: transitions.base },
  exit: { opacity: 0, y: 16, transition: transitions.fast },
}

/**
 * Parent variant for a staggered list. Children opt in by using `fadeUp`
 * (or any variant sharing the `hidden`/`show` names).
 */
export function staggerContainer(staggerChildren = 0.05, delayChildren = 0.04): Variants {
  return {
    hidden: {},
    show: { transition: { staggerChildren, delayChildren } },
    exit: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
  }
}
