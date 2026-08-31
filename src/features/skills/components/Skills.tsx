import { motion } from 'motion/react'
import { skillCategories } from '@/features/skills/data'
import { PageHeader } from '@/components/ui/page-header'
import { SkillCategoryCard } from '@/features/skills/components/SkillCategoryCard'

export function Skills() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto max-w-3xl"
    >
      <PageHeader path="~/skills.json" title="Skills & tech stack" />
      <div className="grid gap-4 sm:grid-cols-2">
        {skillCategories.map((category) => (
          <SkillCategoryCard key={category.id} category={category} />
        ))}
      </div>
    </motion.div>
  )
}
