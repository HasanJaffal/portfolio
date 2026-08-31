import type { ExperienceEntry } from '@/features/experience/data'
import { Badge } from '@/components/ui/badge'
import { TodoTag } from '@/components/ui/todo-tag'

export function ExperienceItem({ entry, isLast }: { entry: ExperienceEntry; isLast: boolean }) {
  return (
    <div className="relative flex gap-4 pb-8">
      <div className="flex flex-col items-center">
        <span
          className={
            entry.end === 'Present'
              ? 'mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-lime shadow-[0_0_0_3px_var(--color-lime-dim)]'
              : 'mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-border-strong bg-panel'
          }
        />
        {!isLast && <span className="mt-1 w-px flex-1 bg-border" />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="text-base font-semibold text-foreground">
            {entry.role} <span className="font-normal text-muted">· {entry.company}</span>
          </h3>
          <span className="shrink-0 font-mono text-xs text-muted-dim">
            {entry.start} — {entry.end}
          </span>
        </div>
        <p className="mt-1 font-mono text-xs text-muted-dim">{entry.location}</p>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{entry.summary}</p>

        {entry.highlights.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {entry.highlights.map((h) => (
              <li key={h} className="flex gap-2 text-sm text-muted">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-lime-dim" />
                {h}
              </li>
            ))}
          </ul>
        )}

        {entry.tech.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {entry.tech.map((t) => (
              <Badge key={t} variant="outline">
                {t}
              </Badge>
            ))}
          </div>
        )}

        {entry.placeholder && (
          <div className="mt-3">
            <TodoTag>edit src/features/experience/data.ts</TodoTag>
          </div>
        )}
      </div>
    </div>
  )
}
