import { motion } from 'motion/react'
import { experience } from '@/features/experience/data'
import { PageHeader } from '@/components/ui/page-header'
import { ExperienceItem } from '@/features/experience/components/ExperienceItem'
import { fadeUp } from '@/lib/motion'

export function Experience() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      exit="exit"
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
