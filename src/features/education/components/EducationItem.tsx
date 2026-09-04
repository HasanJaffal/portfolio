import type { EducationEntry } from '@/features/education/data'
import { Badge } from '@/components/ui/badge'
import { TodoTag } from '@/components/ui/todo-tag'
import { TimelineItem } from '@/components/ui/timeline'

export function EducationItem({ entry, isLast }: { entry: EducationEntry; isLast: boolean }) {
  return (
    <TimelineItem isLast={isLast}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-base font-semibold text-foreground">
          {entry.degree} <span className="font-normal text-muted">· {entry.institution}</span>
        </h3>
        <span className="shrink-0 font-mono text-xs text-muted-dim">
          {entry.start} to {entry.end}
        </span>
      </div>
      <p className="mt-1 font-mono text-xs text-muted-dim">{entry.location}</p>

      <div className="mt-3">
        {entry.placeholder ? (
          <TodoTag>edit src/features/education/data.ts</TodoTag>
        ) : (
          <Badge variant="lime">{entry.status}</Badge>
        )}
      </div>
    </TimelineItem>
  )
}
