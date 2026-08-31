// The email address is real. GitHub and LinkedIn are left as placeholders —
// add your real profile URLs and flip `placeholder` to false.

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
    value: 'Add GitHub username',
    href: '#',
    icon: 'github',
    placeholder: true,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    value: 'Add LinkedIn profile URL',
    href: '#',
    icon: 'linkedin',
    placeholder: true,
  },
]
