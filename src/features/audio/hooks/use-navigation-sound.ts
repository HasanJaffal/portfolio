import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useSound } from '@/features/audio/audio-context'

/**
 * Plays the navigation blip whenever the route changes — once, in one place,
 * instead of on every link in the app. That covers the explorer, the tab bar,
 * the mobile nav, the command palette, terminal commands, the `g`-chords and
 * the browser's own back button.
 */
export function useNavigationSound(): void {
  const { play } = useSound()
  const { pathname } = useLocation()
  const previous = useRef<string | null>(null)

  useEffect(() => {
    // Skip the first run: arriving on a page isn't a navigation.
    if (previous.current !== null && previous.current !== pathname) play('navigate')
    previous.current = pathname
  }, [pathname, play])
}
