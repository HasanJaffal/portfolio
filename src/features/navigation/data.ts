export type NavIcon =
  | 'terminal'
  | 'user'
  | 'briefcase'
  | 'graduation-cap'
  | 'folder-git'
  | 'wrench'
  | 'cpu'
  | 'mail'

export interface NavItem {
  id: string
  label: string
  path: string
  fileLabel: string
  icon: NavIcon
  shortcut: string
  /**
   * Sits directly in the mobile bottom bar. Everything else is one tap away
   * behind "more" — see `MobileNav`. Keep this to four, which is what fits a
   * small phone at a comfortable tap size.
   */
  primary: boolean
}

export const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'home',
    path: '/',
    fileLabel: 'home.tsx',
    icon: 'terminal',
    shortcut: 'g h',
    primary: true,
  },
  {
    id: 'about',
    label: 'about',
    path: '/about',
    fileLabel: 'about.md',
    icon: 'user',
    shortcut: 'g a',
    primary: false,
  },
  {
    id: 'experience',
    label: 'experience',
    path: '/experience',
    fileLabel: 'experience.ts',
    icon: 'briefcase',
    shortcut: 'g e',
    primary: false,
  },
  {
    id: 'education',
    label: 'education',
    path: '/education',
    fileLabel: 'education.ts',
    icon: 'graduation-cap',
    shortcut: 'g d',
    primary: false,
  },
  {
    id: 'projects',
    label: 'projects',
    path: '/projects',
    fileLabel: 'projects/',
    icon: 'folder-git',
    shortcut: 'g p',
    primary: true,
  },
  {
    id: 'services',
    label: 'services',
    path: '/services',
    fileLabel: 'services.ts',
    icon: 'wrench',
    shortcut: 'g v',
    primary: true,
  },
  {
    id: 'skills',
    label: 'skills',
    path: '/skills',
    fileLabel: 'skills.json',
    icon: 'cpu',
    shortcut: 'g s',
    primary: false,
  },
  {
    id: 'contact',
    label: 'contact',
    path: '/contact',
    fileLabel: 'contact.ts',
    icon: 'mail',
    shortcut: 'g c',
    primary: true,
  },
]

export const primaryNavItems: NavItem[] = navItems.filter((item) => item.primary)

/** True for the item the given pathname is currently on. Paths are exact. */
export function isNavItemActive(item: NavItem, pathname: string): boolean {
  return item.path === pathname
}
