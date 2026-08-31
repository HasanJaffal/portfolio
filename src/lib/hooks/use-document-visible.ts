import { useSyncExternalStore } from 'react'

/**
 * Whether the tab is currently visible. Used to park the render loop when
 * the page is in the background instead of burning GPU on nobody.
 */
export function useDocumentVisible(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      document.addEventListener('visibilitychange', onChange)
      return () => document.removeEventListener('visibilitychange', onChange)
    },
    () => document.visibilityState === 'visible',
    () => true,
  )
}
