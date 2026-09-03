import { NavLink } from 'react-router-dom'
import { motion } from 'motion/react'
import { Terminal, User, Briefcase, FolderGit2, Cpu, Mail } from 'lucide-react'
import { navItems, type NavIcon } from '@/features/navigation/data'
import { cn } from '@/lib/utils'
import { easeOut } from '@/lib/motion'

const iconMap: Record<NavIcon, typeof Terminal> = {
  terminal: Terminal,
  user: User,
  briefcase: Briefcase,
  'folder-git': FolderGit2,
  cpu: Cpu,
  mail: Mail,
}

export function MobileNav() {
  return (
    <nav
      aria-label="Sections"
      className="relative z-10 grid shrink-0 grid-cols-6 border-t border-border bg-panel pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {navItems.map((item) => {
        const Icon = iconMap[item.icon]
        return (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              cn(
                'relative flex min-h-12 flex-col items-center justify-center gap-0.5 py-1.5 text-muted-dim transition-colors',
                isActive && 'text-lime',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="mobile-nav-active"
                    transition={{ duration: 0.24, ease: easeOut }}
                    className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-lime"
                  />
                )}
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="font-mono text-[9px] uppercase tracking-wide">{item.label}</span>
              </>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}
