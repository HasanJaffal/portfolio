import { motion } from 'motion/react'
import { skillCategories } from '@/features/skills/data'
import { PageHeader } from '@/components/ui/page-header'
import { SkillCategoryCard } from '@/features/skills/components/SkillCategoryCard'
import { fadeUp } from '@/lib/motion'

export function Skills() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      exit="exit"
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
