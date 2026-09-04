import { motion } from 'motion/react'
import { projects } from '@/features/projects/data'
import { PageHeader } from '@/components/ui/page-header'
import { ProjectCard } from '@/features/projects/components/ProjectCard'
import { useHashHighlight } from '@/lib/hooks/use-hash-highlight'
import { fadeUp } from '@/lib/motion'

export function Projects() {
  const { highlighted, register } = useHashHighlight()

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      exit="exit"
      className="mx-auto max-w-4xl"
    >
      <PageHeader path="~/projects/" title="Projects" />
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            highlighted={highlighted === project.slug}
            ref={register(project.slug)}
          />
        ))}
      </div>
    </motion.div>
  )
}
