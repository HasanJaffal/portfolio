import type { ComponentProps } from 'react'
import { ChevronRight } from 'lucide-react'
import { Accordion as BaseAccordion } from '@base-ui/react/accordion'
import { cn } from '@/lib/utils'

export function Accordion(props: ComponentProps<typeof BaseAccordion.Root>) {
  return <BaseAccordion.Root {...props} />
}

export function AccordionItem({ className, ...props }: ComponentProps<typeof BaseAccordion.Item>) {
  return <BaseAccordion.Item className={cn('border-t border-border first:border-t-0', className)} {...props} />
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof BaseAccordion.Trigger>) {
  return (
    <BaseAccordion.Header>
      <BaseAccordion.Trigger
        className={cn(
          'group flex w-full items-center gap-2 py-3 text-left font-mono text-xs uppercase tracking-wide text-muted hover:text-lime',
          className,
        )}
        {...props}
      >
        <ChevronRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-150 group-data-panel-open:rotate-90" />
        {children}
      </BaseAccordion.Trigger>
    </BaseAccordion.Header>
  )
}

export function AccordionPanel({ className, ...props }: ComponentProps<typeof BaseAccordion.Panel>) {
  return (
    <BaseAccordion.Panel
      className={cn(
        'overflow-hidden text-sm text-muted data-starting-style:h-0 data-ending-style:h-0 transition-[height] duration-200 ease-out',
        className,
      )}
      {...props}
    />
  )
}
