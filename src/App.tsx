import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AudioProvider } from '@/features/audio'
import { BootSequence } from '@/features/boot'
import { SceneLayer, type SceneStage } from '@/features/scene'
import { WorkspaceProvider } from '@/layout/WorkspaceProvider'
import { useWorkspace } from '@/layout/workspace-context'
import { Workspace } from '@/layout/Workspace'

/**
 * Three layers, bottom to top: the running Three.js environment, the
 * workspace, and — only during the opening — the boot overlay.
 *
 * The workspace is mounted from the first frame rather than swapped in when
 * the boot finishes. By the time the overlay fades it is already laid out
 * behind it, so the hand-off is a veil lifting instead of one screen
 * replacing another. `Workspace` marks itself `inert` while booting, so
 * nothing behind the overlay can be clicked or tabbed into.
 */
function AppShell() {
  const { isBooting, finishBoot } = useWorkspace()
  const [bootStage, setBootStage] = useState<SceneStage>('cold')

  return (
    <>
      <SceneLayer stage={isBooting ? bootStage : 'idle'} />
      <Workspace />
      <AnimatePresence>
        {isBooting && <BootSequence onDone={finishBoot} onStage={setBootStage} />}
      </AnimatePresence>
    </>
  )
}

function App() {
  return (
    <TooltipProvider>
      <AudioProvider>
        <WorkspaceProvider>
          <AppShell />
        </WorkspaceProvider>
      </AudioProvider>
    </TooltipProvider>
  )
}

export default App
