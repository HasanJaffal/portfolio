import { navItems } from '@/features/navigation/data'
import { projects } from '@/features/projects/data'
import { services } from '@/features/services/data'
import { email, phone, whatsappUrl } from '@/features/contact/data'
import { resume } from '@/features/resume/data'

export type PaletteActionKind =
  | { type: 'navigate'; path: string }
  | { type: 'external'; href: string }
  | { type: 'copy'; value: string }
  | { type: 'toggle-terminal' }
  | { type: 'replay-boot' }

export type PaletteIcon =
  | 'terminal'
  | 'user'
  | 'briefcase'
  | 'graduation-cap'
  | 'folder-git'
  | 'wrench'
  | 'cpu'
  | 'mail'
  | 'phone'
  | 'whatsapp'
  | 'download'
  | 'github'
  | 'linkedin'
  | 'copy'
  | 'rotate-ccw'
  | 'code'

export interface PaletteItem {
  id: string
  label: string
  hint?: string
  group: 'navigate' | 'projects' | 'services' | 'actions'
  icon: PaletteIcon
  action: PaletteActionKind
  disabled?: boolean
}

export const navigatePaletteItems: PaletteItem[] = navItems.map((item) => ({
  id: `nav-${item.id}`,
  label: `Go to ${item.label}`,
  hint: item.path,
  group: 'navigate',
  // `NavIcon` is a subset of `PaletteIcon`, so this needs no mapping table.
  icon: item.icon,
  action: { type: 'navigate', path: item.path },
}))

export const projectPaletteItems: PaletteItem[] = projects.map((project) => ({
  id: `project-${project.id}`,
  label: project.name,
  hint: 'open project',
  group: 'projects',
  icon: 'code',
  action: { type: 'navigate', path: `/projects#${project.slug}` },
}))

export const servicePaletteItems: PaletteItem[] = services.map((service) => ({
  id: `service-${service.id}`,
  label: service.name,
  hint: service.summary,
  group: 'services',
  icon: 'wrench',
  action: { type: 'navigate', path: `/services#${service.slug}` },
}))

export const actionPaletteItems: PaletteItem[] = [
  {
    id: 'action-whatsapp',
    label: 'Message on WhatsApp',
    hint: phone.display,
    group: 'actions',
    icon: 'whatsapp',
    action: { type: 'external', href: whatsappUrl() },
  },
  {
    id: 'action-resume',
    label: 'Open resume',
    hint: resume.available ? 'resume.pdf' : 'not yet available',
    group: 'actions',
    icon: 'download',
    action: { type: 'external', href: resume.url },
    disabled: !resume.available,
  },
  {
    id: 'action-copy-email',
    label: 'Copy email address',
    hint: email,
    group: 'actions',
    icon: 'copy',
    action: { type: 'copy', value: email },
  },
  {
    id: 'action-copy-phone',
    label: 'Copy phone number',
    hint: phone.display,
    group: 'actions',
    icon: 'phone',
    action: { type: 'copy', value: phone.e164 },
  },
  {
    id: 'action-toggle-terminal',
    label: 'Toggle terminal',
    hint: 'ctrl + `',
    group: 'actions',
    icon: 'terminal',
    action: { type: 'toggle-terminal' },
  },
  {
    id: 'action-replay-boot',
    label: 'Replay boot sequence',
    group: 'actions',
    icon: 'rotate-ccw',
    action: { type: 'replay-boot' },
  },
]

export const allPaletteItems: PaletteItem[] = [
  ...navigatePaletteItems,
  ...projectPaletteItems,
  ...servicePaletteItems,
  ...actionPaletteItems,
]
