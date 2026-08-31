import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { bootStorageKey } from '@/features/boot/data'
import { WorkspaceContext, type WorkspaceContextValue } from '@/layout/workspace-context'

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [bootSeen, setBootSeen] = useLocalStorage(bootStorageKey, false)
  const [isBooting, setIsBooting] = useState(!bootSeen)
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)
  const [isPaletteOpen, setPaletteOpen] = useState(false)
  const [isExplorerOpen, setExplorerOpen] = useState(false)

  const finishBoot = useCallback(() => {
    setBootSeen(true)
    setIsBooting(false)
  }, [setBootSeen])

  const replayBoot = useCallback(() => {
    setIsBooting(true)
  }, [])

  const openTerminal = useCallback(() => setIsTerminalOpen(true), [])
  const closeTerminal = useCallback(() => setIsTerminalOpen(false), [])
  const toggleTerminal = useCallback(() => setIsTerminalOpen((open) => !open), [])

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      isBooting,
      finishBoot,
      replayBoot,
      isTerminalOpen,
      openTerminal,
      closeTerminal,
      toggleTerminal,
      isPaletteOpen,
      setPaletteOpen,
      isExplorerOpen,
      setExplorerOpen,
    }),
    [isBooting, finishBoot, replayBoot, isTerminalOpen, openTerminal, closeTerminal, toggleTerminal, isPaletteOpen, isExplorerOpen],
  )

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}
