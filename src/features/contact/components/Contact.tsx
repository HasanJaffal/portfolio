import { useState } from 'react'
import { motion } from 'motion/react'
import { Mail, Phone, GitBranch, Link2, Copy, Check } from 'lucide-react'
import {
  contactLinks,
  email,
  whatsappUrl,
  type ContactIcon,
  type ContactLink,
} from '@/features/contact/data'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { TodoTag } from '@/components/ui/todo-tag'
import { WhatsAppIcon, type IconComponent } from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import { fadeUp, staggerContainer } from '@/lib/motion'

const iconMap: Record<ContactIcon, IconComponent> = {
  mail: Mail,
  phone: Phone,
  whatsapp: WhatsAppIcon,
  github: GitBranch,
  linkedin: Link2,
}

const container = staggerContainer(0.05, 0.05)

export function Contact() {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  async function handleCopy(link: ContactLink) {
    if (!link.copyValue) return
    try {
      await navigator.clipboard.writeText(link.copyValue)
      setCopiedId(link.id)
      window.setTimeout(() => setCopiedId(null), 1400)
    } catch {
      // clipboard unavailable — the mailto:/tel: link still works
    }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      exit="exit"
      className="mx-auto max-w-xl"
    >
      <motion.div variants={fadeUp}>
        <PageHeader
          path="~/contact.ts"
          title="Get in touch"
          description="WhatsApp gets the fastest reply. Email, phone and the rest are below."
        />
      </motion.div>

      <motion.div variants={fadeUp} className="mb-6 flex flex-wrap items-center gap-3">
        <Button
          variant="primary"
          render={<a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" />}
        >
          <WhatsAppIcon className="h-3.5 w-3.5" /> Message on WhatsApp
        </Button>
        <Button variant="outline" render={<a href={`mailto:${email}`} />}>
          <Mail className="h-4 w-4" /> Send an email
        </Button>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="divide-y divide-border rounded-lg border border-border bg-panel/80"
      >
        {contactLinks.map((link) => {
          const Icon = iconMap[link.icon]
          const copied = copiedId === link.id
          return (
            <div key={link.id} className="flex items-center gap-3 px-4 py-3.5">
              <Icon
                className={cn('shrink-0 text-lime', link.icon === 'whatsapp' ? 'h-3.5 w-3.5' : 'h-4 w-4')}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] uppercase tracking-wide text-muted-dim">{link.label}</p>
                {link.placeholder ? (
                  <TodoTag className="mt-0.5">edit src/features/contact/data.ts</TodoTag>
                ) : (
                  <a
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className="truncate text-sm text-foreground hover:text-lime"
                  >
                    {link.value}
                  </a>
                )}
              </div>
              {!link.placeholder && link.copyValue && (
                <button
                  type="button"
                  onClick={() => handleCopy(link)}
                  aria-label={`Copy ${link.label.toLowerCase()}`}
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
      </motion.div>
    </motion.div>
  )
}
