import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { GitBranch, Check } from 'lucide-react'

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000 * 30)
    return () => window.clearInterval(id)
  }, [])
  return now
}

export function StatusBar() {
  const location = useLocation()
  const now = useClock()
  const path = location.pathname === '/' ? '~' : `~${location.pathname}`
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <footer className="hidden h-6 shrink-0 items-center gap-4 border-t border-border bg-panel px-3 font-mono text-[11px] text-muted-dim lg:flex">
      <span className="flex items-center gap-1.5">
        <GitBranch className="h-3 w-3" /> main
      </span>
      <span className="hidden sm:inline">{path}</span>
      <span className="ml-auto hidden items-center gap-1.5 text-lime sm:flex">
        <Check className="h-3 w-3" /> ready
      </span>
      <span>{time}</span>
    </footer>
  )
}
