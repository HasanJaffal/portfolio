import type { SkillCategory } from '@/features/skills/data'
import { Badge } from '@/components/ui/badge'
import { TodoTag } from '@/components/ui/todo-tag'

export function SkillCategoryCard({ category }: { category: SkillCategory }) {
  return (
    <div className="rounded-lg border border-border bg-panel p-5">
      <h3 className="font-mono text-xs uppercase tracking-wide text-muted-dim">{category.label}</h3>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {category.skills.map((skill, i) => (
          <Badge key={`${category.id}-${i}-${skill}`} variant={category.placeholder ? 'outline' : 'lime'}>
            {skill}
          </Badge>
        ))}
      </div>
      {category.placeholder && (
        <div className="mt-3">
          <TodoTag>edit src/features/skills/data.ts</TodoTag>
        </div>
      )}
    </div>
  )
}
