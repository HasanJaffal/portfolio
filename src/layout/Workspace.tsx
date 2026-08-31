import { AnimatePresence } from 'motion/react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { TitleBar } from '@/layout/TitleBar'
import { useWorkspace } from '@/layout/workspace-context'
import { useGlobalHotkeys } from '@/layout/use-global-hotkeys'
import { Explorer, TabBar, MobileNav, NotFound } from '@/features/navigation'
import { StatusBar } from '@/features/status-bar'
import { Terminal } from '@/features/terminal'
import { CommandPalette } from '@/features/command-palette'
import { Home } from '@/features/home'
import { About } from '@/features/about'
import { Experience } from '@/features/experience'
import { Projects } from '@/features/projects'
import { Skills } from '@/features/skills'
import { Contact } from '@/features/contact'

export function Workspace() {
  const { isTerminalOpen } = useWorkspace()
  const location = useLocation()
  useGlobalHotkeys()

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <TitleBar />

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-56 shrink-0 border-r border-border bg-panel lg:block xl:w-64">
          <Explorer />
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <TabBar />

          <main className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-5 py-8 sm:px-8 lg:px-10">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/experience" element={<Experience />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/skills" element={<Skills />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </main>

          <AnimatePresence>{isTerminalOpen && <Terminal />}</AnimatePresence>
        </div>
      </div>

      <StatusBar />
      <MobileNav />
      <CommandPalette />
    </div>
  )
}
