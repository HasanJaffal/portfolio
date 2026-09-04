import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Download, Mail, Wrench } from 'lucide-react'
import { profile } from '@/features/about/data'
import { skillCategories } from '@/features/skills/data'
import { resume } from '@/features/resume/data'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useWorkspace } from '@/layout/workspace-context'
import { fadeUp, staggerContainer, transitions } from '@/lib/motion'

const coreStack = skillCategories.find((c) => c.id === 'core')?.skills ?? []

const container = staggerContainer(0.06, 0.05)

export function Home() {
  const { openTerminal } = useWorkspace()

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      exit="exit"
      className="mx-auto max-w-2xl"
    >
      <motion.p variants={fadeUp} className="font-mono text-sm text-lime">
        $ whoami <span className="animate-caret-blink" aria-hidden="true">▍</span>
      </motion.p>

      <motion.h1 variants={fadeUp} className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        {profile.name}
      </motion.h1>
      <motion.p variants={fadeUp} className="mt-1 font-mono text-lg text-lime-soft">
        {profile.role}
      </motion.p>

      <motion.p variants={fadeUp} className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
        {profile.tagline}
      </motion.p>

      {coreStack.length > 0 && (
        <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-2">
          {coreStack.map((skill) => (
            <Badge key={skill} variant="lime">
              {skill}
            </Badge>
          ))}
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
        <Button variant="primary" render={<Link to="/projects" />}>
          View projects <ArrowRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" render={<Link to="/services" />}>
          <Wrench className="h-4 w-4" /> View services
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
        variants={fadeUp}
        type="button"
        onClick={openTerminal}
        whileHover={{ x: 2 }}
        transition={transitions.instant}
        className="mt-10 font-mono text-xs text-muted-dim underline-offset-4 hover:text-lime hover:underline"
      >
        or type 'help' in the terminal ↓
      </motion.button>
    </motion.div>
  )
}
