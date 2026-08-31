import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { navItems } from '@/features/navigation/data'
import { useWorkspace } from '@/layout/workspace-context'

const chordTargets = new Map(navItems.map((item) => [item.shortcut.split(' ')[1], item.path]))

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
}

/**
 * Wires up workspace-wide keyboard shortcuts:
 * - Cmd/Ctrl+K → command palette
 * - Ctrl+` → toggle terminal panel
 * - "g" then a letter (e.g. "g p") → jump to a section, GitHub-style
 */
export function useGlobalHotkeys() {
  const { setPaletteOpen, toggleTerminal } = useWorkspace()
  const navigate = useNavigate()
  const chordArmed = useRef(false)
  const chordTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMeta = e.metaKey || e.ctrlKey

      if (isMeta && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(true)
        return
      }

      if (e.ctrlKey && e.key === '`') {
        e.preventDefault()
        toggleTerminal()
        return
      }

      if (isEditableTarget(e.target)) return

      if (chordArmed.current) {
        chordArmed.current = false
        window.clearTimeout(chordTimer.current)
        const path = chordTargets.get(e.key.toLowerCase())
        if (path) {
          e.preventDefault()
          navigate(path)
        }
        return
      }

      if (e.key.toLowerCase() === 'g' && !isMeta) {
        chordArmed.current = true
        chordTimer.current = window.setTimeout(() => {
          chordArmed.current = false
        }, 700)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.clearTimeout(chordTimer.current)
    }
  }, [setPaletteOpen, toggleTerminal, navigate])
}
