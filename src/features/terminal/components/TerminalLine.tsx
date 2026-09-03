import { motion } from 'motion/react'
import type { TerminalEntry } from '@/features/terminal/hooks/use-terminal'
import { transitions } from '@/lib/motion'
import { cn } from '@/lib/utils'

export function TerminalLine({ entry }: { entry: TerminalEntry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitions.instant}
      className="mb-2 font-mono text-[13px] leading-relaxed last:mb-0"
    >
      {entry.command !== null && (
        <div className="flex gap-2">
          <span className="shrink-0 text-lime">hassan@portfolio:~$</span>
          <span className="break-all text-foreground">{entry.command}</span>
        </div>
      )}
      {entry.lines.map((line, i) => (
        <div
          key={i}
          className={cn(
            'whitespace-pre-wrap wrap-break-word pl-0',
            entry.status === 'error' ? 'text-danger' : 'text-muted',
          )}
        >
          {line}
        </div>
      ))}
    </motion.div>
  )
}
