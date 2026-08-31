import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { bootLines } from '@/features/boot/data'
import { usePrefersReducedMotion } from '@/lib/hooks/use-media-query'

export function BootSequence({ onDone }: { onDone: () => void }) {
  const reduceMotion = usePrefersReducedMotion()
  const [visibleCount, setVisibleCount] = useState(reduceMotion ? bootLines.length : 0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (reduceMotion) return
    if (visibleCount >= bootLines.length) return
    const timer = window.setTimeout(() => {
      setVisibleCount((c) => c + 1)
    }, bootLines[visibleCount].delayMs)
    return () => window.clearTimeout(timer)
  }, [visibleCount, reduceMotion])

  const finish = useCallback(() => {
    setDone((prev) => {
      if (prev) return prev
      window.setTimeout(onDone, 180)
      return true
    })
  }, [onDone])

  useEffect(() => {
    function handleSkip(e: KeyboardEvent | MouseEvent) {
      if (e instanceof KeyboardEvent && e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Escape') return
      finish()
    }
    window.addEventListener('keydown', handleSkip)
    window.addEventListener('click', handleSkip)
    return () => {
      window.removeEventListener('keydown', handleSkip)
      window.removeEventListener('click', handleSkip)
    }
  }, [finish])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-100 flex flex-col justify-center bg-inset px-6 font-mono text-sm text-lime sm:px-16"
        >
          <div className="mx-auto w-full max-w-xl space-y-1.5">
            {bootLines.slice(0, visibleCount).map((line, i) => (
              <motion.p
                key={line.text}
                initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className={i === bootLines.length - 1 ? 'text-lime-soft' : 'text-muted'}
              >
                {line.text}
              </motion.p>
            ))}
            {visibleCount >= bootLines.length && (
              <p className="pt-2 text-foreground">
                hasan@portfolio:~$ <span className="animate-caret-blink">▍</span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={finish}
            className="absolute bottom-6 right-6 font-mono text-xs text-muted-dim underline-offset-4 hover:text-lime hover:underline"
          >
            skip [enter]
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
