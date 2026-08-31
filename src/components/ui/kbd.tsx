import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/** A small keyboard-shortcut chip, e.g. rendered as `⌘K`. */
export function Kbd({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-sm border border-border-strong bg-panel px-1 font-mono text-[10px] text-muted',
        className,
      )}
      {...props}
    />
  )
}
