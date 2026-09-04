import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Deep links into a grid of cards. Scrolls to whichever card the current
 * `#hash` names and marks it for a moment, so arriving from the command
 * palette both lands on the right card and says which one it was.
 *
 * Register each card with `register(slug)` as its `ref`, and pass
 * `highlighted === slug` down so the card can style itself.
 */
export function useHashHighlight(highlightMs = 1800) {
  const location = useLocation()
  const [highlighted, setHighlighted] = useState<string | null>(null)
  const nodes = useRef<Record<string, HTMLElement | null>>({})

  useEffect(() => {
    const slug = location.hash.replace('#', '')
    if (!slug) return
    const node = nodes.current[slug]
    if (!node) return
    node.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setHighlighted(slug)
    const timer = window.setTimeout(() => setHighlighted(null), highlightMs)
    return () => window.clearTimeout(timer)
  }, [location.hash, highlightMs])

  function register(slug: string) {
    return (node: HTMLElement | null) => {
      nodes.current[slug] = node
    }
  }

  return { highlighted, register }
}
