import { useState, type MouseEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { navItems } from '@/features/navigation/data'
import { cn } from '@/lib/utils'
import { easeOut, transitions } from '@/lib/motion'

interface Tab {
  path: string
  label: string
}

const homeTab: Tab = { path: '/', label: 'home.tsx' }

function tabForPath(pathname: string): Tab {
  const item = navItems.find((n) => n.path === pathname)
  return item ? { path: item.path, label: item.fileLabel } : homeTab
}

export function TabBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [tabs, setTabs] = useState<Tab[]>(() => [tabForPath(location.pathname)])
  const [trackedPathname, setTrackedPathname] = useState(location.pathname)

  // Record newly-visited sections as open tabs. This adjusts state during
  // render in response to a route change rather than in an effect — see
  // https://react.dev/learn/you-might-not-need-an-effect
  if (location.pathname !== trackedPathname) {
    setTrackedPathname(location.pathname)
    const item = navItems.find((n) => n.path === location.pathname)
    if (item) {
      setTabs((prev) =>
        prev.some((t) => t.path === item.path) ? prev : [...prev, { path: item.path, label: item.fileLabel }],
      )
    }
  }

  function closeTab(path: string, e: MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
    setTabs((prev) => {
      const filtered = prev.filter((t) => t.path !== path)
      if (path === location.pathname) {
        navigate(filtered.at(-1)?.path ?? '/')
      }
      return filtered.length > 0 ? filtered : [homeTab]
    })
  }

  return (
    <div className="scrollbar-thin relative z-10 hidden shrink-0 overflow-x-auto border-b border-border bg-background lg:flex">
      <AnimatePresence initial={false}>
      {tabs.map((tab) => {
        const isActive = tab.path === location.pathname
        return (
          <motion.a
            key={tab.path}
            href={tab.path}
            layout
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={transitions.fast}
            onClick={(e) => {
              e.preventDefault()
              navigate(tab.path)
            }}
            className={cn(
              'group relative flex shrink-0 items-center gap-2 overflow-hidden border-r border-border px-3 py-2 font-mono text-xs text-muted-dim',
              isActive ? 'bg-panel text-foreground' : 'hover:bg-panel-hover hover:text-muted',
            )}
          >
            {isActive && (
              <motion.span
                layoutId="tab-active"
                transition={{ duration: 0.24, ease: easeOut }}
                className="absolute inset-x-0 top-0 h-0.5 bg-lime"
              />
            )}
            {tab.label}
            <button
              type="button"
              onClick={(e) => closeTab(tab.path, e)}
              aria-label={`Close ${tab.label}`}
              className="rounded-sm p-0.5 opacity-0 hover:bg-border-strong group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </motion.a>
        )
      })}
      </AnimatePresence>
    </div>
  )
}
