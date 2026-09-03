import { createContext, useContext } from 'react'
import type { SoundName } from '@/features/audio/data'

export interface SoundContextValue {
  /** Fire a sound. Always safe: no-ops when muted, blocked or unsupported. */
  play: (name: SoundName) => void
  muted: boolean
  toggleMuted: () => void
}

export const SoundContext = createContext<SoundContextValue | null>(null)

export function useSound(): SoundContextValue {
  const ctx = useContext(SoundContext)
  if (!ctx) throw new Error('useSound must be used within an AudioProvider')
  return ctx
}
