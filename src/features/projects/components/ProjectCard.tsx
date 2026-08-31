import { forwardRef } from 'react'
import { GitBranch, ExternalLink } from 'lucide-react'
import type { Project } from '@/features/projects/data'
import { Badge } from '@/components/ui/badge'
import { TodoTag } from '@/components/ui/todo-tag'
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

const statusLabel: Record<Project['status'], string> = {
  active: 'active',
  maintained: 'maintained',
  archived: 'archived',
}

export const ProjectCard = forwardRef<HTMLDivElement, { project: Project; highlighted?: boolean }>(
  function ProjectCard({ project, highlighted }, ref) {
    return (
      <div
        ref={ref}
        id={project.slug}
        className={cn(
          'flex flex-col rounded-lg border border-border bg-panel/80 p-5 transition-colors duration-300 scroll-mt-20',
          highlighted && 'border-lime/60',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-foreground">{project.name}</h3>
          <Badge variant={project.status === 'active' ? 'lime' : 'default'}>{statusLabel[project.status]}</Badge>
        </div>

        <p className="mt-1 font-mono text-xs text-muted-dim">{project.role}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">{project.description}</p>

        {project.tech.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.tech.map((t) => (
              <Badge key={t} variant="outline">
                {t}
              </Badge>
            ))}
          </div>
        )}

        {project.highlights.length > 0 && (
          <Accordion className="mt-1">
            <AccordionItem value="highlights">
              <AccordionTrigger>Highlights</AccordionTrigger>
              <AccordionPanel>
                <ul className="space-y-1.5 pb-3">
                  {project.highlights.map((h) => (
                    <li key={h} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-lime-dim" />
                      {h}
                    </li>
                  ))}
                </ul>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border pt-3">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-mono text-xs text-muted hover:text-lime"
            >
              <GitBranch className="h-3.5 w-3.5" /> source
            </a>
          )}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-mono text-xs text-muted hover:text-lime"
            >
              <ExternalLink className="h-3.5 w-3.5" /> live demo
            </a>
          )}
          {project.placeholder && <TodoTag>edit src/features/projects/data.ts</TodoTag>}
        </div>
      </div>
    )
  },
)
