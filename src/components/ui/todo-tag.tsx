import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Marks placeholder content as exactly that — styled like an inline code
 * comment so it reads as an intentional TODO rather than broken content.
 * Used anywhere feature data has `placeholder: true`.
 */
export function TodoTag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm border border-dashed border-lime-dim/70 bg-lime/5 px-1.5 py-0.5 font-mono text-[10px] italic leading-none text-muted-dim',
        className,
      )}
    >
      <span className="text-lime-dim not-italic">//</span> TODO {children}
    </span>
  )
}
