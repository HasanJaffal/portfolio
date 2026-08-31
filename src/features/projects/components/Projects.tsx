import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { projects } from '@/features/projects/data'
import { PageHeader } from '@/components/ui/page-header'
import { ProjectCard } from '@/features/projects/components/ProjectCard'

export function Projects() {
  const location = useLocation()
  const [highlighted, setHighlighted] = useState<string | null>(null)
  const refs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    const slug = location.hash.replace('#', '')
    if (!slug) return
    const node = refs.current[slug]
    if (!node) return
    node.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setHighlighted(slug)
    const timer = window.setTimeout(() => setHighlighted(null), 1800)
    return () => window.clearTimeout(timer)
  }, [location.hash])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto max-w-4xl"
    >
      <PageHeader path="~/projects/" title="Projects" />
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            highlighted={highlighted === project.slug}
            ref={(node) => {
              refs.current[project.slug] = node
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
