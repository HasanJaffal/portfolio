import { motion } from 'motion/react'
import { easeOut } from '@/lib/motion'

/**
 * A block meter tracking the log. It reaches 100% exactly as the last line
 * lands, so the sequence never looks like it is waiting on something.
 */
export function BootMeter({ progress }: { progress: number }) {
  return (
    <div className="mt-6 flex items-center gap-3" aria-hidden="true">
      <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-border">
        <motion.div
          className="h-full origin-left bg-lime"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress }}
          transition={{ duration: 0.24, ease: easeOut }}
          style={{ width: '100%' }}
        />
      </div>
      <span className="w-10 shrink-0 text-right font-mono text-[11px] tabular-nums text-muted-dim">
        {Math.round(progress * 100)}%
      </span>
    </div>
  )
}
