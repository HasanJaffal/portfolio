import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { createAudioEngine } from '@/features/audio/audio-engine'
import { audioMutedStorageKey, type SoundName } from '@/features/audio/data'
import { SoundContext, type SoundContextValue } from '@/features/audio/audio-context'

/**
 * Owns the single `AudioEngine` for the app and the persisted mute
 * preference. The engine's `AudioContext` is only constructed once the
 * visitor has actually interacted with the page, which is what browser
 * autoplay policy asks for — sounds requested before then are dropped.
 */
export function AudioProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useLocalStorage(audioMutedStorageKey, false)
  // Lazy state, not a ref: the engine is created exactly once per provider
  // and never replaced, and building it allocates nothing until unlocked.
  const [engine] = useState(createAudioEngine)

  useEffect(() => {
    engine.setMuted(muted)
  }, [engine, muted])

  useEffect(() => {
    const unlock = () => engine.unlock()
    // `pointerdown`/`keydown` both count as activation gestures. We keep
    // listening (rather than `once`) so a context suspended later — by a
    // backgrounded tab, say — is resumed on the next interaction.
    window.addEventListener('pointerdown', unlock, { passive: true })
    window.addEventListener('keydown', unlock)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
      engine.dispose()
    }
  }, [engine])

  const play = useCallback((name: SoundName) => engine.play(name), [engine])
  const toggleMuted = useCallback(() => {
    setMuted((prev) => {
      // Unmuting is itself a gesture — make sure the context is live so the
      // confirmation blip below is audible.
      if (prev) engine.unlock()
      engine.setMuted(!prev)
      if (prev) engine.play('toggle')
      return !prev
    })
  }, [engine, setMuted])

  const value = useMemo<SoundContextValue>(
    () => ({ play, muted, toggleMuted }),
    [play, muted, toggleMuted],
  )

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}
