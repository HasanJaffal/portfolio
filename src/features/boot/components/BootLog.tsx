import { motion } from 'motion/react'
import { bootLines } from '@/features/boot/data'
import { transitions } from '@/lib/motion'
import { cn } from '@/lib/utils'

const toneClass = {
  banner: 'text-lime-soft',
  ok: 'text-muted',
  accent: 'text-lime',
} as const

/** Width of the dotted leader between a label and its result. */
const labelColumn = 30

export function BootLog({ visibleCount, reduceMotion }: { visibleCount: number; reduceMotion: boolean }) {
  return (
    // Height is reserved for the whole log so the block below it never
    // shifts as lines arrive — a boot screen that jitters reads as broken.
    <div className="min-h-52 space-y-1" aria-hidden="true">
      {bootLines.slice(0, visibleCount).map((line) => (
        <motion.p
          key={line.stamp}
          initial={reduceMotion ? false : { opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={transitions.instant}
          className={cn('flex gap-2 whitespace-pre text-[12px] sm:text-[13px]', toneClass[line.tone])}
        >
          <span className="text-muted-dim">[{line.stamp}]</span>
          <span className="min-w-0 truncate">
            {line.result === ''
              ? line.label
              : `${line.label} ${'.'.repeat(Math.max(3, labelColumn - line.label.length))}`}
          </span>
          {line.result !== '' && <span className="text-lime">{line.result}</span>}
        </motion.p>
      ))}
    </div>
  )
}
