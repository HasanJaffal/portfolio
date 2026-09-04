import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * The rail shared by the experience and education timelines: one marker per
 * entry, and a hairline running down to the next one. `current` fills the
 * marker and rings it, which is how an ongoing entry reads as ongoing.
 */
export function TimelineItem({
  current = false,
  isLast,
  children,
}: {
  current?: boolean
  isLast: boolean
  children: ReactNode
}) {
  return (
    <div className="relative flex gap-4 pb-8">
      <div className="flex flex-col items-center">
        <span
          className={cn(
            'mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full',
            current
              ? 'bg-lime shadow-[0_0_0_3px_var(--color-lime-dim)]'
              : 'border-2 border-border-strong bg-panel',
          )}
        />
        {!isLast && <span className="mt-1 w-px flex-1 bg-border" />}
      </div>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
