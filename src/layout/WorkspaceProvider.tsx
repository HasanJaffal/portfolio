import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { useSound } from '@/features/audio'
import { bootStorageKey } from '@/features/boot/data'
import { WorkspaceContext, type WorkspaceContextValue } from '@/layout/workspace-context'

/**
 * Workspace state, and the sounds that belong to it.
 *
 * Panels announce themselves here rather than in the components that open
 * them, because every one of them has several entry points — the terminal
 * alone opens from the title bar, the command palette, a hotkey and the home
 * page. Owning the sound at the state transition means each of those gets it
 * once, and identically, without a single call site having to remember.
 */
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { play } = useSound()
  const [bootSeen, setBootSeen] = useLocalStorage(bootStorageKey, false)
  const [isBooting, setIsBooting] = useState(!bootSeen)
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)
  const [isPaletteOpen, setIsPaletteOpen] = useState(false)
  const [isExplorerOpen, setIsExplorerOpen] = useState(false)

  const finishBoot = useCallback(() => {
    setBootSeen(true)
    setIsBooting(false)
  }, [setBootSeen])

  const replayBoot = useCallback(() => {
    setIsBooting(true)
  }, [])

  const openTerminal = useCallback(() => {
    if (!isTerminalOpen) play('panel-open')
    setIsTerminalOpen(true)
  }, [isTerminalOpen, play])

  const closeTerminal = useCallback(() => {
    if (isTerminalOpen) play('panel-close')
    setIsTerminalOpen(false)
  }, [isTerminalOpen, play])

  const toggleTerminal = useCallback(() => {
    play(isTerminalOpen ? 'panel-close' : 'panel-open')
    setIsTerminalOpen((open) => !open)
  }, [isTerminalOpen, play])

  const setPaletteOpen = useCallback(
    (open: boolean) => {
      if (open !== isPaletteOpen) play(open ? 'panel-open' : 'panel-close')
      setIsPaletteOpen(open)
    },
    [isPaletteOpen, play],
  )

  const setExplorerOpen = useCallback(
    (open: boolean) => {
      if (open !== isExplorerOpen) play(open ? 'panel-open' : 'panel-close')
      setIsExplorerOpen(open)
    },
    [isExplorerOpen, play],
  )

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
    [
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
    ],
  )

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}
