import { motion } from 'motion/react'
import { education } from '@/features/education/data'
import { PageHeader } from '@/components/ui/page-header'
import { EducationItem } from '@/features/education/components/EducationItem'
import { fadeUp } from '@/lib/motion'

export function Education() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      exit="exit"
      className="mx-auto max-w-2xl"
    >
      <PageHeader path="~/education.ts" title="Education" />
      <div>
        {education.map((entry, i) => (
          <EducationItem key={entry.id} entry={entry} isLast={i === education.length - 1} />
        ))}
      </div>
    </motion.div>
  )
}
