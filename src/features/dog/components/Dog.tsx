import { useRef } from 'react'
import { motion } from 'motion/react'
import type { RefObject } from 'react'
import { useSound } from '@/features/audio'
import { useDogBrain } from '@/features/dog/hooks/use-dog-brain'
import { canvas } from '@/features/dog/model'
import { transitions } from '@/lib/motion'

/**
 * The dog: her surface, and the wiring that hands it to the brain.
 *
 * There is almost nothing here now. She is rasterised into a 34x32 buffer every
 * frame and blown up 2x with `image-rendering: pixelated`, so the markup is one
 * canvas and one hit target — the joints that used to be SVG groups are
 * matrices inside the renderer.
 *
 * The hit target is a real button rather than the canvas itself. She is
 * optional set dressing, but she is also the only playful thing on the page,
 * and gating that behind owning a mouse would be a shame — so she is focusable,
 * has a name, and answers to Enter and Space exactly as she answers to a click.
 */

interface DogProps {
  trackRef: RefObject<HTMLDivElement | null>
  active: boolean
  reduceMotion: boolean
  hasPointer: boolean
}

export function Dog({ trackRef, active, reduceMotion, hasPointer }: DogProps) {
  const { play } = useSound()

  const root = useRef<HTMLDivElement>(null)
  const surface = useRef<HTMLCanvasElement>(null)

  const { poke } = useDogBrain({
    trackRef,
    root,
    surface,
    active,
    reduceMotion,
    hasPointer,
    onBark: () => play('bark'),
  })

  return (
    <motion.div
      ref={root}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ...transitions.slow, delay: 0.6 }}
      className="absolute left-0 will-change-transform"
      style={{ width: canvas.width, height: canvas.height, bottom: canvas.float }}
    >
      <canvas
        ref={surface}
        width={canvas.bufWidth}
        height={canvas.bufHeight}
        aria-hidden="true"
        // A canvas is a replaced element and hit-tests its whole box, so left
        // clickable it would lay a 68x64 transparent rectangle across the foot
        // of every page and quietly eat the clicks landing on it. The button
        // below is the only part of her that answers a pointer.
        className="pointer-events-none block h-full w-full"
        style={{
          imageRendering: 'pixelated',
          filter: 'drop-shadow(0 0 7px color-mix(in oklab, var(--color-lime) 32%, transparent))',
        }}
      />

      {/* Deliberately tighter than the canvas: roughly her body, so the corners
          of the box stay the page's. */}
      <button
        type="button"
        onClick={poke}
        title="Say hello"
        aria-label="Say hello to the dog"
        className="pointer-events-auto absolute bottom-1 left-1/2 h-9 w-10 -translate-x-1/2 cursor-pointer bg-transparent p-0"
      />
    </motion.div>
  )
}
