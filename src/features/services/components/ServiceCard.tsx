import { forwardRef } from 'react'
import { motion } from 'motion/react'
import {
  Globe,
  Store,
  Workflow,
  Layers,
  Lightbulb,
  Blocks,
  Waypoints,
  Map,
  Database,
  LifeBuoy,
} from 'lucide-react'
import type { Service, ServiceIcon } from '@/features/services/data'
import { whatsappUrl } from '@/features/contact/data'
import { Badge } from '@/components/ui/badge'
import { TodoTag } from '@/components/ui/todo-tag'
import { WhatsAppIcon, type IconComponent } from '@/components/ui/icons'
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import { fadeUp } from '@/lib/motion'

const iconMap: Record<ServiceIcon, IconComponent> = {
  globe: Globe,
  store: Store,
  workflow: Workflow,
  layers: Layers,
  lightbulb: Lightbulb,
  blocks: Blocks,
  waypoints: Waypoints,
  map: Map,
  database: Database,
  'life-buoy': LifeBuoy,
}

export const ServiceCard = forwardRef<HTMLDivElement, { service: Service; highlighted?: boolean }>(
  function ServiceCard({ service, highlighted }, ref) {
    const Icon = iconMap[service.icon]

    return (
      <motion.div
        ref={ref}
        variants={fadeUp}
        id={service.slug}
        className={cn(
          'flex h-full scroll-mt-20 flex-col rounded-lg border border-border bg-panel/80 p-5 transition-colors duration-300 hover:border-lime/40',
          highlighted && 'border-lime/60',
        )}
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 rounded-md border border-border-strong bg-lime/5 p-2 text-lime">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-foreground">{service.name}</h3>
            <p className="mt-0.5 font-mono text-xs text-muted-dim">{service.summary}</p>
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted">{service.description}</p>

        {service.tech.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {service.tech.map((t) => (
              <Badge key={t} variant="outline">
                {t}
              </Badge>
            ))}
          </div>
        )}

        {service.includes.length > 0 && (
          <Accordion className="mt-1">
            <AccordionItem value="includes">
              <AccordionTrigger>What's included</AccordionTrigger>
              <AccordionPanel>
                <ul className="space-y-1.5 pb-3">
                  {service.includes.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-lime-dim" />
                      {item}
                    </li>
                  ))}
                </ul>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        )}

        {/* `mt-auto` pins this to the bottom, so every card in a row ends its
            action strip on the same line however long the copy above runs. */}
        <div className="mt-auto flex flex-wrap items-center gap-4 border-t border-border pt-3">
          <a
            href={whatsappUrl(service.inquiry)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-mono text-xs text-muted hover:text-lime"
          >
            <WhatsAppIcon className="h-3.5 w-3.5" aria-hidden="true" /> request on WhatsApp
          </a>
          {service.placeholder && <TodoTag>edit src/features/services/data.ts</TodoTag>}
        </div>
      </motion.div>
    )
  },
)
