import { navItems } from '@/features/navigation/data'
import { projects } from '@/features/projects/data'
import { email } from '@/features/contact/data'
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
  | 'folder-git'
  | 'cpu'
  | 'mail'
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
  group: 'navigate' | 'projects' | 'actions'
  icon: PaletteIcon
  action: PaletteActionKind
  disabled?: boolean
}

const navIconMap: Record<string, PaletteIcon> = {
  terminal: 'terminal',
  user: 'user',
  briefcase: 'briefcase',
  'folder-git': 'folder-git',
  cpu: 'cpu',
  mail: 'mail',
}

export const navigatePaletteItems: PaletteItem[] = navItems.map((item) => ({
  id: `nav-${item.id}`,
  label: `Go to ${item.label}`,
  hint: item.path,
  group: 'navigate',
  icon: navIconMap[item.icon] ?? 'terminal',
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

export const actionPaletteItems: PaletteItem[] = [
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
  ...actionPaletteItems,
]
