/**
 * One shared pointer reading for the whole feature.
 *
 * The dog samples the pointer every frame, but a `pointermove` listener per
 * component would mean re-rendering React on a stream of events that never
 * belongs in state. This keeps a single passive listener alive for as long as
 * anything is watching, and hands back a plain snapshot on demand.
 *
 * Mouse and touch reach her by the same door, but they mean different things.
 * A mouse *hovers*: wherever it stopped is still where the visitor is looking,
 * so it stays live for as long as it is on the page. A finger only exists
 * while it is down — reading the last tap as an ongoing presence is what
 * would leave her staring at a spot nobody is at any more — so contact opens
 * the reading and lifting closes it again the same frame.
 *
 * A flick is the one gesture that has no mouse equivalent worth the name, and
 * on a touchscreen it is the obvious thing to try on a dog. It is recognised
 * here rather than in the brain, because it needs the raw event stream:
 * `takeSwipe` hands the brain a finished gesture and forgets it.
 */

export interface PointerSnapshot {
  x: number
  y: number
  /** `performance.now()` of the last real movement. */
  movedAt: number
  /** False until the pointer has actually moved once — touch may never set it. */
  seen: boolean
}

export interface Swipe {
  /** Where the flick let go, in client coordinates. */
  x: number
  y: number
  /** Where it started, so the brain can ask whether the path came near her. */
  originX: number
  originY: number
  /** Release velocity, px/s. Signed, so the brain knows which way it went. */
  vx: number
  vy: number
}

/** Release speed a flick has to beat to count as a swipe, px/s. */
const swipeSpeed = 420
/** …and how far it has to have travelled, px. Rules out a jittery tap. */
const swipeTravel = 34
/** A gesture that stopped moving this long before lifting is a drag, not a flick. */
const swipeStaleMs = 90
/** Gap between samples above which the velocity estimate restarts. */
const sampleGapMs = 100
/** A swipe nobody has collected within this long is dropped. */
const swipeShelfLifeMs = 250

const state: PointerSnapshot = { x: 0, y: 0, movedAt: 0, seen: false }
let watchers = 0

/** The gesture currently in contact, if any. `id` is the browser's pointerId. */
let gesture: {
  id: number
  originX: number
  originY: number
  lastX: number
  lastY: number
  lastAt: number
  vx: number
  vy: number
} | null = null

let pending: Swipe | null = null
let pendingAt = 0

function handleMove(event: PointerEvent) {
  // A mouse is present wherever it rests, so hovering alone is enough to make
  // it the thing she is watching. Anything else has to be in contact.
  if (event.pointerType === 'mouse' || gesture?.id === event.pointerId) {
    state.x = event.clientX
    state.y = event.clientY
    state.movedAt = performance.now()
    state.seen = true
  }

  if (!gesture || gesture.id !== event.pointerId) return

  const now = performance.now()
  const dt = (now - gesture.lastAt) / 1000
  if (dt > 0) {
    const vx = (event.clientX - gesture.lastX) / dt
    const vy = (event.clientY - gesture.lastY) / dt
    // Weighted towards the newest sample: what matters for a flick is how fast
    // it was going when it let go, not its average over the whole drag. A long
    // enough gap means the finger stopped, so the estimate starts over.
    const carry = now - gesture.lastAt > sampleGapMs ? 0 : 0.4
    gesture.vx = vx * (1 - carry) + gesture.vx * carry
    gesture.vy = vy * (1 - carry) + gesture.vy * carry
  }
  gesture.lastX = event.clientX
  gesture.lastY = event.clientY
  gesture.lastAt = now
}

function handleDown(event: PointerEvent) {
  const now = performance.now()
  gesture = {
    id: event.pointerId,
    originX: event.clientX,
    originY: event.clientY,
    lastX: event.clientX,
    lastY: event.clientY,
    lastAt: now,
    vx: 0,
    vy: 0,
  }
  // A tap is worth noticing on its own: she looks at where it landed even if
  // the finger never moves.
  state.x = event.clientX
  state.y = event.clientY
  state.movedAt = now
  state.seen = true
}

function handleUp(event: PointerEvent) {
  const g = gesture
  if (!g || g.id !== event.pointerId) return
  gesture = null

  const now = performance.now()
  const travel = Math.hypot(event.clientX - g.originX, event.clientY - g.originY)
  const stalled = now - g.lastAt > swipeStaleMs
  if (!stalled && travel > swipeTravel && Math.hypot(g.vx, g.vy) > swipeSpeed) {
    pending = {
      x: event.clientX,
      y: event.clientY,
      originX: g.originX,
      originY: g.originY,
      vx: g.vx,
      vy: g.vy,
    }
    pendingAt = now
  }

  // The finger is gone, so there is nothing left to watch. Her attention and
  // reach are both eased rather than switched, so this reads as losing
  // interest over the next second rather than as a light going out.
  if (event.pointerType !== 'mouse') state.seen = false
}

function handleLeave() {
  state.seen = false
}

/** Starts the listeners if they aren't running; call the result to release them. */
export function watchPointer(): () => void {
  if (watchers === 0) {
    // All passive: she observes gestures, and must never be the reason a
    // scroll or a tap on the bar underneath her fails to go through.
    window.addEventListener('pointermove', handleMove, { passive: true })
    window.addEventListener('pointerdown', handleDown, { passive: true })
    window.addEventListener('pointerup', handleUp, { passive: true })
    window.addEventListener('pointercancel', handleUp, { passive: true })
    document.addEventListener('pointerleave', handleLeave)
  }
  watchers++

  return () => {
    watchers--
    if (watchers > 0) return
    window.removeEventListener('pointermove', handleMove)
    window.removeEventListener('pointerdown', handleDown)
    window.removeEventListener('pointerup', handleUp)
    window.removeEventListener('pointercancel', handleUp)
    document.removeEventListener('pointerleave', handleLeave)
    state.seen = false
    gesture = null
    pending = null
  }
}

export function readPointer(): PointerSnapshot {
  return state
}

/**
 * Hands over the last flick and forgets it, so one gesture can only ever
 * provoke one reaction. Anything she was too busy to collect — the loop is
 * parked while the terminal is open — goes stale rather than firing late.
 */
export function takeSwipe(): Swipe | null {
  const swipe = pending
  pending = null
  if (!swipe || performance.now() - pendingAt > swipeShelfLifeMs) return null
  return swipe
}
