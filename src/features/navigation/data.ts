export type NavIcon = 'terminal' | 'user' | 'briefcase' | 'folder-git' | 'cpu' | 'mail'

export interface NavItem {
  id: string
  label: string
  path: string
  fileLabel: string
  icon: NavIcon
  shortcut: string
}

export const navItems: NavItem[] = [
  { id: 'home', label: 'home', path: '/', fileLabel: 'home.tsx', icon: 'terminal', shortcut: 'g h' },
  { id: 'about', label: 'about', path: '/about', fileLabel: 'about.md', icon: 'user', shortcut: 'g a' },
  {
    id: 'experience',
    label: 'experience',
    path: '/experience',
    fileLabel: 'experience.ts',
    icon: 'briefcase',
    shortcut: 'g e',
  },
  {
    id: 'projects',
    label: 'projects',
    path: '/projects',
    fileLabel: 'projects/',
    icon: 'folder-git',
    shortcut: 'g p',
  },
  { id: 'skills', label: 'skills', path: '/skills', fileLabel: 'skills.json', icon: 'cpu', shortcut: 'g s' },
  { id: 'contact', label: 'contact', path: '/contact', fileLabel: 'contact.ts', icon: 'mail', shortcut: 'g c' },
]
