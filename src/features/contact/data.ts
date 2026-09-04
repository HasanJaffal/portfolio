export type ContactIcon = 'mail' | 'phone' | 'whatsapp' | 'github' | 'linkedin'

export interface ContactLink {
  id: string
  label: string
  value: string
  href: string
  icon: ContactIcon
  /** Opens in a new tab. Off for `mailto:` and `tel:`, which hand off to the OS. */
  external: boolean
  /** When set, the row offers a copy-to-clipboard button for this exact string. */
  copyValue?: string
  placeholder: boolean
}

export const email = 'hasanjaffal107@gmail.com'

/**
 * One number, three renderings. `digits` is the only form wa.me accepts —
 * country code, no plus, no separators.
 */
export const phone = {
  display: '+961 71 104 458',
  e164: '+96171104458',
  digits: '96171104458',
} as const

/** Sent when someone opens WhatsApp from anywhere that isn't a service card. */
export const whatsappGreeting =
  "Hi Hassan, I came across your portfolio and I'd like to talk about a project."

/**
 * Builds a wa.me deep link with the message pre-typed. It opens the chat with
 * the text waiting in the input — WhatsApp never sends it on the visitor's
 * behalf, so they can still edit or drop it before hitting send.
 */
export function whatsappUrl(message: string = whatsappGreeting): string {
  return `https://wa.me/${phone.digits}?text=${encodeURIComponent(message)}`
}

export const contactLinks: ContactLink[] = [
  {
    id: 'email',
    label: 'Email',
    value: email,
    href: `mailto:${email}`,
    icon: 'mail',
    external: false,
    copyValue: email,
    placeholder: false,
  },
  {
    id: 'phone',
    label: 'Phone',
    value: phone.display,
    href: `tel:${phone.e164}`,
    icon: 'phone',
    external: false,
    copyValue: phone.e164,
    placeholder: false,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    value: `wa.me/${phone.digits}`,
    href: whatsappUrl(),
    icon: 'whatsapp',
    external: true,
    placeholder: false,
  },
  {
    id: 'github',
    label: 'GitHub',
    value: 'github.com/HasanJaffal',
    href: 'https://github.com/HasanJaffal',
    icon: 'github',
    external: true,
    placeholder: false,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    value: 'linkedin.com/in/hasan-jaffal',
    href: 'https://www.linkedin.com/in/hasan-jaffal/',
    icon: 'linkedin',
    external: true,
    placeholder: false,
  },
]
