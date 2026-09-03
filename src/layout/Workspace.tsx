import { AnimatePresence, motion } from 'motion/react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { TitleBar } from '@/layout/TitleBar'
import { useWorkspace } from '@/layout/workspace-context'
import { useGlobalHotkeys } from '@/layout/use-global-hotkeys'
import { useNavigationSound } from '@/features/audio'
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
import { DogCompanion } from '@/features/dog'
import { easeOut } from '@/lib/motion'

export function Workspace() {
  const { isTerminalOpen, isBooting } = useWorkspace()
  const location = useLocation()
  useGlobalHotkeys()
  useNavigationSound()

  return (
    // Mounted during the boot overlay too — laid out and ready — but held
    // invisible and sealed off from pointer and keyboard until the overlay
    // releases. Keeping it transparent is what lets the boot veil reveal the
    // 3D environment rather than the portfolio it is about to hand over to.
    <motion.div
      inert={isBooting}
      initial={false}
      animate={{ opacity: isBooting ? 0 : 1 }}
      transition={{ duration: 0.4, ease: easeOut }}
      className="relative z-10 flex h-dvh flex-col text-foreground"
    >
      <TitleBar />

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-56 shrink-0 border-r border-border bg-panel lg:block xl:w-64">
          <Explorer />
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <TabBar />

          {/* The window onto the environment. `bg-viewport` keeps the centre
              column settled enough to read on while staying clear at the
              margins, where the lattice does most of its work. The extra
              bottom padding is headroom for the dog, who now walks the
              footer rather than this box — without it, the last line of a
              long page would scroll up into the strip she stands in front
              of. */}
          <main className="scrollbar-thin bg-viewport relative min-h-0 flex-1 overflow-y-auto px-5 pt-8 pb-24 sm:px-8 lg:px-10">
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

      {/* The real footer: whichever bar the breakpoint shows keeps this box's
          height, and the dog is pinned `bottom-full` against it — standing on
          top of the bar rather than floating in the content above it. That
          reads as "part of the window's chrome" regardless of the terminal or
          scroll position, neither of which touch this row. */}
      <div className="relative shrink-0">
        <StatusBar />
        <MobileNav />
        <DogCompanion />
      </div>
      <CommandPalette />
    </motion.div>
  )
}
