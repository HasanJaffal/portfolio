import { Terminal, User, Briefcase, GraduationCap, FolderGit2, Wrench, Cpu, Mail } from 'lucide-react'
import type { IconComponent } from '@/components/ui/icons'
import type { NavIcon } from '@/features/navigation/data'

/** One map, so the sidebar, the bottom bar and the palette never drift apart. */
export const navIcons: Record<NavIcon, IconComponent> = {
  terminal: Terminal,
  user: User,
  briefcase: Briefcase,
  'graduation-cap': GraduationCap,
  'folder-git': FolderGit2,
  wrench: Wrench,
  cpu: Cpu,
  mail: Mail,
}
