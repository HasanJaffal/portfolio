export interface ContactLink {
  id: string
  label: string
  value: string
  href: string
  icon: 'mail' | 'github' | 'linkedin'
  placeholder: boolean
}

export const email = 'hasanjaffal107@gmail.com'

export const contactLinks: ContactLink[] = [
  {
    id: 'email',
    label: 'Email',
    value: email,
    href: `mailto:${email}`,
    icon: 'mail',
    placeholder: false,
  },
  {
    id: 'github',
    label: 'GitHub',
    value: 'github.com/HasanJaffal',
    href: 'https://github.com/HasanJaffal',
    icon: 'github',
    placeholder: false,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    value: 'linkedin.com/in/hasan-jaffal',
    href: 'https://www.linkedin.com/in/hasan-jaffal/',
    icon: 'linkedin',
    placeholder: false,
  },
]
