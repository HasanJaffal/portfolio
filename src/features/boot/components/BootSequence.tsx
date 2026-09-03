import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { bootLines, bootTimings, renderLinkLineIndex, type BootPhase } from '@/features/boot/data'
import { BootLog } from '@/features/boot/components/BootLog'
import { BootMeter } from '@/features/boot/components/BootMeter'
import { useSound } from '@/features/audio'
import type { SceneStage } from '@/features/scene'
import { usePrefersReducedMotion } from '@/lib/hooks/use-media-query'
import { easeOut, transitions } from '@/lib/motion'

/**
 * The opening sequence.
 *
 * It advances on its own timers from a black screen to a mounted terminal in
 * roughly 2.4 seconds and then gets out of the way. There is deliberately no
 * "press enter to continue": clicking or pressing a key jumps to the end, but
 * doing nothing reaches the same place just as reliably.
 *
 * The overlay is translucent and fades further with each phase, so the 3D
 * environment — which is already running underneath — is revealed *through*
 * the boot log rather than replacing it. `onStage` is what drives that.
 */

/** Overlay opacity per phase: the reveal, in one place. */
const veilOpacity: Record<BootPhase, number> = { cold: 1, post: 0.88, ready: 0.34 }

export function BootSequence({
  onDone,
  onStage,
}: {
  onDone: () => void
  onStage: (stage: SceneStage) => void
}) {
  const reduceMotion = usePrefersReducedMotion()
  const { play } = useSound()
  // Reduced motion starts where the sequence would have ended: the log is
  // already complete, and all that is left is a brief hold.
  const [phase, setPhase] = useState<BootPhase>(reduceMotion ? 'ready' : 'cold')
  const [visibleCount, setVisibleCount] = useState(reduceMotion ? bootLines.length : 0)
  const finishedRef = useRef(false)

  // Latest-callback refs, so the timers below depend only on the sequence's
  // own state. Without this, any re-render that changed `onDone`, `onStage`
  // or `play` would tear down and restart the pending timeout — pushing the
  // opening back by a full step each time, which is exactly how a boot screen
  // ends up looking like it has hung.
  const latestRef = useRef({ onDone, onStage, play })
  useEffect(() => {
    latestRef.current = { onDone, onStage, play }
  })

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    latestRef.current.onStage('idle')
    latestRef.current.onDone()
  }, [])

  /* Reduced motion: one short beat, then straight through. */
  useEffect(() => {
    if (!reduceMotion) return
    const timer = window.setTimeout(finish, bootTimings.reducedMs)
    return () => window.clearTimeout(timer)
  }, [reduceMotion, finish])

  /* cold → post */
  useEffect(() => {
    if (reduceMotion || phase !== 'cold') return
    const timer = window.setTimeout(() => setPhase('post'), bootTimings.coldMs)
    return () => window.clearTimeout(timer)
  }, [reduceMotion, phase])

  /* Stream the log, one line per timer. */
  useEffect(() => {
    if (reduceMotion || phase !== 'post' || visibleCount >= bootLines.length) return
    const timer = window.setTimeout(() => {
      setVisibleCount((count) => count + 1)
      latestRef.current.play('boot-line')
    }, bootLines[visibleCount].delayMs)
    return () => window.clearTimeout(timer)
  }, [reduceMotion, phase, visibleCount])

  /* Last line landed → prompt. */
  useEffect(() => {
    if (reduceMotion || phase !== 'post' || visibleCount < bootLines.length) return
    const timer = window.setTimeout(() => {
      setPhase('ready')
      latestRef.current.play('boot-ready')
    }, bootTimings.readyMs)
    return () => window.clearTimeout(timer)
  }, [reduceMotion, phase, visibleCount])

  /* Prompt held → hand over to the workspace. */
  useEffect(() => {
    if (reduceMotion || phase !== 'ready') return
    const timer = window.setTimeout(finish, bootTimings.holdMs)
    return () => window.clearTimeout(timer)
  }, [reduceMotion, phase, finish])

  /* Drive the environment behind the overlay. */
  useEffect(() => {
    const { onStage: stage } = latestRef.current
    if (phase === 'cold') stage('cold')
    else if (phase === 'post' && visibleCount <= renderLinkLineIndex) stage('wake')
    else stage('live')
  }, [phase, visibleCount])

  /* Any interaction skips ahead. Nothing *requires* one. */
  useEffect(() => {
    window.addEventListener('keydown', finish)
    window.addEventListener('pointerdown', finish)
    return () => {
      window.removeEventListener('keydown', finish)
      window.removeEventListener('pointerdown', finish)
    }
  }, [finish])

  const progress = visibleCount / bootLines.length

  return (
    <motion.div
      role="status"
      aria-label="Booting portfolio"
      exit={{ opacity: 0, scale: 1.015 }}
      transition={{ duration: 0.34, ease: easeOut }}
      className="fixed inset-0 z-100 flex flex-col justify-center px-6 font-mono sm:px-16"
    >
      {/* The veil: black at first, then increasingly see-through. */}
      <motion.div
        className="absolute inset-0 -z-10 bg-inset"
        initial={false}
        animate={{ opacity: veilOpacity[phase] }}
        transition={transitions.slow}
      />
      <div className="scanlines pointer-events-none absolute inset-0 -z-10 opacity-60" aria-hidden="true" />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={transitions.fast}
        className="mx-auto w-full max-w-xl"
      >
        <BootLog visibleCount={visibleCount} reduceMotion={reduceMotion} />

        {phase === 'ready' ? (
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transitions.fast}
            className="mt-4 text-[13px] text-foreground text-glow"
          >
            hasan@portfolio:~$ <span className="animate-caret-blink">▍</span>
          </motion.p>
        ) : (
          <p className="mt-4 text-[13px] text-lime" aria-hidden="true">
            <span className="animate-caret-blink">▍</span>
          </p>
        )}

        {!reduceMotion && <BootMeter progress={progress} />}
      </motion.div>

      <button
        type="button"
        onClick={finish}
        className="absolute bottom-6 right-6 text-xs text-muted-dim underline-offset-4 transition-colors hover:text-lime hover:underline"
      >
        skip
      </button>
    </motion.div>
  )
}
