/**
 * One shared pointer reading for the whole feature.
 *
 * The dog samples the cursor every frame, but a `pointermove` listener per
 * component would mean re-rendering React on a stream of events that never
 * belongs in state. This keeps a single passive listener alive for as long as
 * anything is watching, and hands back a plain snapshot on demand.
 */

export interface PointerSnapshot {
  x: number
  y: number
  /** `performance.now()` of the last real movement. */
  movedAt: number
  /** False until the pointer has actually moved once — touch may never set it. */
  seen: boolean
}

const state: PointerSnapshot = { x: 0, y: 0, movedAt: 0, seen: false }
let watchers = 0

function handleMove(event: PointerEvent) {
  // Touch and pen produce points too, but only while in contact, which would
  // leave the dog staring at wherever the last tap landed. Mice only.
  if (event.pointerType !== 'mouse') return
  state.x = event.clientX
  state.y = event.clientY
  state.movedAt = performance.now()
  state.seen = true
}

function handleLeave() {
  state.seen = false
}

/** Starts the listener if it isn't running; call the result to release it. */
export function watchPointer(): () => void {
  if (watchers === 0) {
    window.addEventListener('pointermove', handleMove, { passive: true })
    document.addEventListener('pointerleave', handleLeave)
  }
  watchers++

  return () => {
    watchers--
    if (watchers > 0) return
    window.removeEventListener('pointermove', handleMove)
    document.removeEventListener('pointerleave', handleLeave)
    state.seen = false
  }
}

export function readPointer(): PointerSnapshot {
  return state
}
