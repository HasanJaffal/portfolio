import { useRef } from 'react'
import { Dog } from '@/features/dog/components/Dog'
import { canvas } from '@/features/dog/model'
import { useWorkspace } from '@/layout/workspace-context'
import { useMediaQuery, usePrefersReducedMotion } from '@/lib/hooks/use-media-query'

/**
 * The dog's place in the workspace: standing on the footer.
 *
 * `bottom-full` pins her track's bottom edge to the *top* edge of whichever
 * bar her parent (the footer row in `Workspace`) is currently showing — the
 * status bar on desktop, the mobile nav below it — with no measurement or
 * breakpoint-specific offset needed. Whichever bar is on screen sets that
 * row's height, and she stands right on top of it either way.
 *
 * The strip itself is inert — `pointer-events-none` — and only her own hit
 * target opts back in, so she can never swallow a click meant for the bar
 * underneath her. This is the whole integration surface. Everything else
 * about the dog lives under `features/dog`.
 */

export function DogCompanion() {
  const trackRef = useRef<HTMLDivElement>(null)
  const { isBooting } = useWorkspace()
  const reduceMotion = usePrefersReducedMotion()

  // Coarse pointers have no cursor to follow, so she looks around on her own
  // and reacts to taps instead. Everything else about her is unchanged.
  const hasPointer = useMediaQuery('(hover: hover) and (pointer: fine)')

  return (
    <div
      ref={trackRef}
      className="pointer-events-none absolute inset-x-0 bottom-full z-20"
      style={{ height: canvas.height + canvas.float }}
    >
      <Dog
        trackRef={trackRef}
        active={!isBooting}
        reduceMotion={reduceMotion}
        hasPointer={hasPointer}
      />
    </div>
  )
}
