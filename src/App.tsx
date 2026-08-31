import { AnimatePresence } from 'motion/react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { WorkspaceProvider } from '@/layout/WorkspaceProvider'
import { useWorkspace } from '@/layout/workspace-context'
import { Workspace } from '@/layout/Workspace'
import { BootSequence } from '@/features/boot'

function AppShell() {
  const { isBooting, finishBoot } = useWorkspace()

  return (
    <>
      <AnimatePresence>{isBooting && <BootSequence onDone={finishBoot} />}</AnimatePresence>
      {!isBooting && <Workspace />}
    </>
  )
}

function App() {
  return (
    <TooltipProvider>
      <WorkspaceProvider>
        <AppShell />
      </WorkspaceProvider>
    </TooltipProvider>
  )
}

export default App
