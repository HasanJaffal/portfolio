import { useState } from 'react'
import { motion } from 'motion/react'
import { Mail, GitBranch, Link2, Copy, Check } from 'lucide-react'
import { contactLinks, type ContactLink } from '@/features/contact/data'
import { PageHeader } from '@/components/ui/page-header'
import { TodoTag } from '@/components/ui/todo-tag'
import { cn } from '@/lib/utils'

const iconMap: Record<ContactLink['icon'], typeof Mail> = {
  mail: Mail,
  github: GitBranch,
  linkedin: Link2,
}

export function Contact() {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  async function handleCopy(link: ContactLink) {
    if (link.icon !== 'mail') return
    try {
      await navigator.clipboard.writeText(link.value)
      setCopiedId(link.id)
      window.setTimeout(() => setCopiedId(null), 1400)
    } catch {
      // clipboard unavailable — the mailto: link still works
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto max-w-xl"
    >
      <PageHeader path="~/contact.ts" title="Get in touch" description="Reach out directly, or find me on the platforms below." />

      <div className="divide-y divide-border rounded-lg border border-border bg-panel">
        {contactLinks.map((link) => {
          const Icon = iconMap[link.icon]
          const copied = copiedId === link.id
          return (
            <div key={link.id} className="flex items-center gap-3 px-4 py-3.5">
              <Icon className="h-4 w-4 shrink-0 text-lime" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] uppercase tracking-wide text-muted-dim">{link.label}</p>
                {link.placeholder ? (
                  <TodoTag className="mt-0.5">edit src/features/contact/data.ts</TodoTag>
                ) : (
                  <a
                    href={link.href}
                    target={link.icon === 'mail' ? undefined : '_blank'}
                    rel={link.icon === 'mail' ? undefined : 'noopener noreferrer'}
                    className="truncate text-sm text-foreground hover:text-lime"
                  >
                    {link.value}
                  </a>
                )}
              </div>
              {!link.placeholder && link.icon === 'mail' && (
                <button
                  type="button"
                  onClick={() => handleCopy(link)}
                  aria-label="Copy email address"
                  className={cn(
                    'shrink-0 rounded-md border border-border-strong p-2 text-muted hover:border-lime/60 hover:text-lime',
                  )}
                >
                  {copied ? <Check className="h-4 w-4 text-lime" /> : <Copy className="h-4 w-4" />}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
