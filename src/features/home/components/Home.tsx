import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Download, Mail } from 'lucide-react'
import { profile } from '@/features/about/data'
import { skillCategories } from '@/features/skills/data'
import { resume } from '@/features/resume/data'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useWorkspace } from '@/layout/workspace-context'

const coreStack = skillCategories.find((c) => c.id === 'core')?.skills ?? []

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

export function Home() {
  const { openTerminal } = useWorkspace()

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="mx-auto max-w-2xl">
      <motion.p variants={item} className="font-mono text-sm text-lime">
        $ whoami
      </motion.p>

      <motion.h1 variants={item} className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        {profile.name}
      </motion.h1>
      <motion.p variants={item} className="mt-1 font-mono text-lg text-lime-soft">
        {profile.role}
      </motion.p>

      <motion.p variants={item} className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
        {profile.tagline}
      </motion.p>

      {coreStack.length > 0 && (
        <motion.div variants={item} className="mt-6 flex flex-wrap gap-2">
          {coreStack.map((skill) => (
            <Badge key={skill} variant="lime">
              {skill}
            </Badge>
          ))}
        </motion.div>
      )}

      <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
        <Button variant="primary" render={<Link to="/projects" />}>
          View projects <ArrowRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" render={<Link to="/contact" />}>
          <Mail className="h-4 w-4" /> Contact
        </Button>
        <Button
          variant="ghost"
          disabled={!resume.available}
          render={
            resume.available ? (
              <a href={resume.url} target="_blank" rel="noopener noreferrer" />
            ) : undefined
          }
          title={resume.available ? undefined : resume.updatedLabel}
        >
          <Download className="h-4 w-4" /> Resume
        </Button>
      </motion.div>

      <motion.button
        variants={item}
        type="button"
        onClick={openTerminal}
        className="mt-10 font-mono text-xs text-muted-dim underline-offset-4 hover:text-lime hover:underline"
      >
        or type 'help' in the terminal ↓
      </motion.button>
    </motion.div>
  )
}
