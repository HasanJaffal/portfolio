import { motion } from 'motion/react'
import { MapPin, Radio } from 'lucide-react'
import { profile } from '@/features/about/data'
import { PageHeader } from '@/components/ui/page-header'
import { TodoTag } from '@/components/ui/todo-tag'
import { fadeUp } from '@/lib/motion'

export function About() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      exit="exit"
      className="mx-auto max-w-2xl"
    >
      <PageHeader path="~/about.md" title="About" />

      <div className="mb-6 flex flex-wrap items-center gap-4 font-mono text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          {profile.locationIsPlaceholder ? <TodoTag>{profile.location}</TodoTag> : profile.location}
        </span>
        <span className="flex items-center gap-1.5">
          <Radio className="h-3.5 w-3.5 text-lime" />
          {profile.statusIsPlaceholder ? <TodoTag>{profile.status}</TodoTag> : profile.status}
        </span>
      </div>

      <div className="space-y-4 text-[15px] leading-relaxed text-foreground">
        <p>{profile.summary}</p>
      </div>
      {profile.summaryIsPlaceholder && (
        <div className="mt-4">
          <TodoTag>edit src/features/about/data.ts</TodoTag>
        </div>
      )}
    </motion.div>
  )
}
