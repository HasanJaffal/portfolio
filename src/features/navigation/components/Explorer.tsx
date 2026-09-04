import { NavLink } from 'react-router-dom'
import { motion } from 'motion/react'
import { Download, Command } from 'lucide-react'
import { navItems } from '@/features/navigation/data'
import { navIcons } from '@/features/navigation/nav-icons'
import { resume } from '@/features/resume/data'
import { useWorkspace } from '@/layout/workspace-context'
import { cn } from '@/lib/utils'
import { easeOut } from '@/lib/motion'

/**
 * The section list. Fixed to the left on a desktop layout, and lifted whole
 * into the mobile sheet — `onNavigate` is how that sheet learns to close, so
 * every row that takes you somewhere has to call it.
 */
export function Explorer({ onNavigate }: { onNavigate?: () => void }) {
  const { setPaletteOpen } = useWorkspace()

  return (
    <div className="flex h-full flex-col">
      <div className="px-3 pb-2 pt-3">
        <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted-dim">
          Explorer
        </span>
      </div>

      <nav aria-label="Sections" className="flex-1 space-y-0.5 px-2">
        {navItems.map((item) => {
          const Icon = navIcons[item.icon]
          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/'}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted transition-colors duration-100 hover:bg-panel-hover hover:text-foreground',
                  isActive && 'text-lime-soft hover:text-lime-soft',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* One indicator for the whole list: Motion slides it
                      between sections instead of cross-fading two borders. */}
                  {isActive && (
                    <motion.span
                      layoutId="explorer-active"
                      transition={{ duration: 0.24, ease: easeOut }}
                      className="absolute inset-0 -z-10 rounded-md border-l-2 border-lime bg-lime/10"
                    />
                  )}
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="flex-1 truncate">{item.label}</span>
                  <span className="hidden truncate font-mono text-[11px] text-muted-dim group-hover:text-muted lg:inline">
                    {item.fileLabel}
                  </span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="space-y-0.5 border-t border-border px-2 py-2">
        <a
          href={resume.available ? resume.url : undefined}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
          aria-disabled={!resume.available}
          title={resume.available ? 'Open resume.pdf' : resume.updatedLabel}
          className={cn(
            'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted transition-colors duration-100 hover:bg-panel-hover hover:text-foreground',
            !resume.available && 'pointer-events-none opacity-40',
          )}
        >
          <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="flex-1 truncate">resume</span>
          <span className="hidden truncate font-mono text-[11px] text-muted-dim lg:inline">resume.pdf</span>
        </a>
        <button
          type="button"
          onClick={() => {
            onNavigate?.()
            setPaletteOpen(true)
          }}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm text-muted-dim transition-colors duration-100 hover:bg-panel-hover hover:text-foreground"
        >
          <Command className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="flex-1 truncate font-mono text-xs">commands</span>
          <span className="rounded-sm border border-border-strong px-1 font-mono text-[10px]">⌘K</span>
        </button>
      </div>
    </div>
  )
}
