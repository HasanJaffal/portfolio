import { useRef } from 'react'
import { Dog } from '@/features/dog/components/Dog'
import { canvas } from '@/features/dog/model'
import { useWorkspace } from '@/layout/workspace-context'
import { usePrefersReducedMotion } from '@/lib/hooks/use-media-query'

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
  const { isBooting, isTerminalOpen } = useWorkspace()
  const reduceMotion = usePrefersReducedMotion()

  // The terminal slides up out of the same footer she stands on, so while it
  // is open she is either hidden behind it or crowding the prompt. She steps
  // off — faded out and frozen mid-stride rather than unmounted, so she comes
  // back exactly where she left off instead of respawning.
  const onStage = !isBooting && !isTerminalOpen

  return (
    <div
      ref={trackRef}
      className="pointer-events-none absolute inset-x-0 bottom-full z-20"
      style={{ height: canvas.height + canvas.float }}
    >
      <Dog trackRef={trackRef} active={onStage} visible={onStage} reduceMotion={reduceMotion} />
    </div>
  )
}
