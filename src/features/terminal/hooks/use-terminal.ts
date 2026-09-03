import { useCallback, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { useWorkspace } from '@/layout/workspace-context'
import { useSound } from '@/features/audio'
import { welcomeLines, terminalHistoryStorageKey } from '@/features/terminal/data'
import { commandNames, runCommand } from '@/features/terminal/commands/registry'

export interface TerminalEntry {
  id: number
  command: string | null
  lines: string[]
  status: 'ok' | 'error'
}

let entryId = 0
const nextEntryId = () => entryId++

export function useTerminal() {
  const navigate = useNavigate()
  const location = useLocation()
  const { replayBoot } = useWorkspace()
  const { play, muted, toggleMuted } = useSound()

  const [entries, setEntries] = useState<TerminalEntry[]>(() => [
    { id: nextEntryId(), command: null, lines: welcomeLines, status: 'ok' },
  ])
  const [input, setInput] = useState('')
  const [commandHistory, setCommandHistory] = useLocalStorage<string[]>(terminalHistoryStorageKey, [])
  const [, setHistoryCursor] = useState<number | null>(null)

  const suggestions = useMemo(() => {
    const trimmed = input.trim().toLowerCase()
    if (trimmed === '') return []
    return commandNames.filter((name) => name.startsWith(trimmed) && name !== trimmed).sort()
  }, [input])

  const submit = useCallback(
    async (raw: string) => {
      const command = raw.trim()
      if (command === '') return

      setCommandHistory((prev) => [...prev.filter((c) => c !== command), command].slice(-50))
      setHistoryCursor(null)

      const result = await runCommand(command, {
        navigate,
        pathname: location.pathname,
        replayBoot,
        muted,
        toggleMuted,
      })

      if (result.type === 'clear') {
        setEntries([])
        play('command')
        return
      }

      play(result.status === 'error' ? 'error' : 'command')
      setEntries((prev) => [
        ...prev,
        { id: nextEntryId(), command, lines: result.lines, status: result.status },
      ])
    },
    [navigate, location.pathname, replayBoot, setCommandHistory, play, muted, toggleMuted],
  )

  const recall = useCallback(
    (direction: 'up' | 'down') => {
      if (commandHistory.length === 0) return
      setHistoryCursor((prev) => {
        const base = prev === null ? commandHistory.length : prev
        const next = direction === 'up' ? Math.max(0, base - 1) : Math.min(commandHistory.length, base + 1)
        setInput(next < commandHistory.length ? commandHistory[next] : '')
        return next
      })
    },
    [commandHistory],
  )

  const acceptSuggestion = useCallback((name: string) => {
    setInput(name + ' ')
  }, [])

  return {
    entries,
    input,
    setInput,
    submit,
    recall,
    suggestions,
    acceptSuggestion,
  }
}
