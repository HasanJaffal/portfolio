import { createContext, useContext } from 'react'

export interface WorkspaceContextValue {
  isBooting: boolean
  finishBoot: () => void
  replayBoot: () => void
  isTerminalOpen: boolean
  openTerminal: () => void
  closeTerminal: () => void
  toggleTerminal: () => void
  isPaletteOpen: boolean
  setPaletteOpen: (open: boolean) => void
  isExplorerOpen: boolean
  setExplorerOpen: (open: boolean) => void
}

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used within a WorkspaceProvider')
  return ctx
}
