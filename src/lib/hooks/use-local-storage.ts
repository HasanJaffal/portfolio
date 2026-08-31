import { useCallback, useState } from 'react'

/**
 * Persisted `useState`. Reads once on mount; every update is written straight
 * through to `localStorage`. Safe to use in environments where storage is
 * unavailable (private browsing, etc.) — read/write failures are swallowed
 * and the value simply behaves as in-memory state for that session.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored !== null ? (JSON.parse(stored) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = next instanceof Function ? next(prev) : next
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved))
        } catch {
          // storage unavailable — value still updates in memory
        }
        return resolved
      })
    },
    [key],
  )

  return [value, set] as const
}
