import { motion } from 'motion/react'
import { experience } from '@/features/experience/data'
import { PageHeader } from '@/components/ui/page-header'
import { ExperienceItem } from '@/features/experience/components/ExperienceItem'

export function Experience() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto max-w-2xl"
    >
      <PageHeader path="~/experience.ts" title="Experience" />
      <div>
        {experience.map((entry, i) => (
          <ExperienceItem key={entry.id} entry={entry} isLast={i === experience.length - 1} />
        ))}
      </div>
    </motion.div>
  )
}
