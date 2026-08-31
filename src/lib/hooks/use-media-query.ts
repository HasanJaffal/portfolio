import { useSyncExternalStore } from 'react'

/**
 * Subscribes to a CSS media query and returns whether it currently matches.
 * SSR-safe (falls back to `false` when `window.matchMedia` is unavailable).
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false),
    () => false,
  )
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/** Tailwind's `lg` breakpoint (1024px) — the point the desktop workspace chrome kicks in. */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}
