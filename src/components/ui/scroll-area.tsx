import type { ComponentProps, ReactNode } from 'react'
import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area'
import { cn } from '@/lib/utils'

export function ScrollArea({
  children,
  className,
  viewportClassName,
  ...props
}: ComponentProps<typeof BaseScrollArea.Root> & {
  children: ReactNode
  viewportClassName?: string
}) {
  return (
    <BaseScrollArea.Root className={cn('relative overflow-hidden', className)} {...props}>
      <BaseScrollArea.Viewport className={cn('h-full w-full', viewportClassName)}>
        <BaseScrollArea.Content>{children}</BaseScrollArea.Content>
      </BaseScrollArea.Viewport>
      <BaseScrollArea.Scrollbar
        orientation="vertical"
        className="flex w-2 touch-none select-none p-0.5 opacity-0 transition-opacity duration-150 data-[hovering]:opacity-100 data-[scrolling]:opacity-100"
      >
        <BaseScrollArea.Thumb className="relative flex-1 rounded-full bg-border-strong" />
      </BaseScrollArea.Scrollbar>
    </BaseScrollArea.Root>
  )
}
