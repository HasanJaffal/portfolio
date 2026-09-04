import { motion } from 'motion/react'
import { Mail } from 'lucide-react'
import { services } from '@/features/services/data'
import { email, whatsappUrl } from '@/features/contact/data'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { WhatsAppIcon } from '@/components/ui/icons'
import { ServiceCard } from '@/features/services/components/ServiceCard'
import { useHashHighlight } from '@/lib/hooks/use-hash-highlight'
import { fadeUp, staggerContainer } from '@/lib/motion'

const container = staggerContainer(0.04, 0.05)

export function Services() {
  const { highlighted, register } = useHashHighlight()

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      exit="exit"
      className="mx-auto max-w-4xl"
    >
      <motion.div variants={fadeUp}>
        <PageHeader
          path="~/services.ts"
          title="Services"
          description="Freelance work, taken on directly. Every card opens a WhatsApp chat already saying which one you are asking about."
        />
      </motion.div>

      <motion.div variants={fadeUp} className="mb-6 flex flex-wrap items-center gap-3">
        <Button
          variant="primary"
          render={<a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" />}
        >
          <WhatsAppIcon className="h-3.5 w-3.5" /> Discuss a project
        </Button>
        <Button variant="outline" render={<a href={`mailto:${email}`} />}>
          <Mail className="h-4 w-4" /> Send an email
        </Button>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            highlighted={highlighted === service.slug}
            ref={register(service.slug)}
          />
        ))}
      </div>
    </motion.div>
  )
}
