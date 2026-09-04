import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { Menu } from 'lucide-react'
import { navItems, primaryNavItems, isNavItemActive } from '@/features/navigation/data'
import { navIcons } from '@/features/navigation/nav-icons'
import { useWorkspace } from '@/layout/workspace-context'
import { cn } from '@/lib/utils'
import { easeOut } from '@/lib/motion'

const cellClass =
  'relative flex min-h-12 flex-col items-center justify-center gap-0.5 py-1.5 text-muted-dim transition-colors'

/** The sliding lime rule. One shared id, so it travels between cells. */
function ActiveRule() {
  return (
    <motion.span
      layoutId="mobile-nav-active"
      transition={{ duration: 0.24, ease: easeOut }}
      className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-lime"
    />
  )
}

/**
 * The phone-sized navigator. Eight sections will not fit across a 360px bar
 * at a tap size anyone can hit — the labels alone stop fitting past five — so
 * the four that matter most sit in the bar and the rest are one tap away in
 * the explorer drawer, which is the same drawer the title bar's menu button
 * opens and already lists every section plus the resume and the palette.
 *
 * The fifth cell is not a dead "more" button. When the section you are on is
 * one of the four behind it, the cell takes on that section's icon, label and
 * active rule, so the bar always names where you are.
 */
export function MobileNav() {
  const location = useLocation()
  const { setExplorerOpen } = useWorkspace()

  const overflowActive = navItems.find(
    (item) => !item.primary && isNavItemActive(item, location.pathname),
  )
  const MoreIcon = overflowActive ? navIcons[overflowActive.icon] : Menu

  return (
    <nav
      aria-label="Sections"
      className="relative z-10 grid shrink-0 grid-cols-5 border-t border-border bg-panel pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {primaryNavItems.map((item) => {
        const Icon = navIcons[item.icon]
        return (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => cn(cellClass, isActive && 'text-lime')}
          >
            {({ isActive }) => (
              <>
                {isActive && <ActiveRule />}
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="font-mono text-[9px] uppercase tracking-wide">{item.label}</span>
              </>
            )}
          </NavLink>
        )
      })}

      <button
        type="button"
        onClick={() => setExplorerOpen(true)}
        aria-haspopup="dialog"
        aria-label={
          overflowActive ? `${overflowActive.label} — open all sections` : 'Open all sections'
        }
        className={cn(cellClass, overflowActive && 'text-lime')}
      >
        {overflowActive && <ActiveRule />}
        <MoreIcon className="h-5 w-5" aria-hidden="true" />
        <span className="font-mono text-[9px] uppercase tracking-wide">
          {overflowActive ? overflowActive.label : 'more'}
        </span>
      </button>
    </nav>
  )
}
