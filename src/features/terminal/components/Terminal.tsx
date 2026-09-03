import { useEffect, useRef, type KeyboardEvent } from 'react'
import { motion } from 'motion/react'
import { TerminalSquare, X } from 'lucide-react'
import { useWorkspace } from '@/layout/workspace-context'
import { useTerminal } from '@/features/terminal/hooks/use-terminal'
import { TerminalLine } from '@/features/terminal/components/TerminalLine'
import { useSound } from '@/features/audio'
import { usePrefersReducedMotion } from '@/lib/hooks/use-media-query'
import { slideUpPanel, transitions } from '@/lib/motion'

export function Terminal() {
  const { closeTerminal } = useWorkspace()
  const { entries, input, setInput, submit, recall, suggestions, acceptSuggestion } = useTerminal()
  const outputRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const reduceMotion = usePrefersReducedMotion()
  const { play } = useSound()

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight })
  }, [entries])

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    // A key striking the switch. Enter is left out: submitting plays the
    // accept or reject tone instead, which would otherwise double up.
    if (e.key !== 'Enter' && !e.metaKey && !e.ctrlKey && !e.altKey) play('keypress')

    if (e.key === 'Enter') {
      const value = input
      setInput('')
      void submit(value)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      recall('up')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      recall('down')
    } else if (e.key === 'Tab') {
      if (suggestions.length > 0) {
        e.preventDefault()
        acceptSuggestion(suggestions[0])
      }
    } else if (e.key === 'Escape') {
      closeTerminal()
    }
  }

  return (
    <motion.section
      variants={slideUpPanel}
      initial={reduceMotion ? false : 'hidden'}
      animate="show"
      exit={reduceMotion ? undefined : 'exit'}
      className="flex h-[45vh] max-h-80 flex-col overflow-hidden border-t border-border bg-inset sm:h-65"
      role="region"
      aria-label="Terminal"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-1.5">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-muted">
          <TerminalSquare className="h-3.5 w-3.5 text-lime" aria-hidden="true" />
          Terminal
        </div>
        <button
          type="button"
          onClick={closeTerminal}
          aria-label="Close terminal"
          className="rounded-sm p-1 text-muted hover:bg-panel-hover hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div ref={outputRef} className="scrollbar-thin flex-1 overflow-y-auto px-3 py-2">
        {entries.map((entry) => (
          <TerminalLine key={entry.id} entry={entry} />
        ))}
      </div>

      {suggestions.length > 0 && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={transitions.fast}
          className="flex shrink-0 flex-wrap gap-1.5 overflow-hidden border-t border-border px-3 py-1.5"
        >
          {suggestions.slice(0, 6).map((name) => (
            <motion.button
              key={name}
              whileHover={{ y: -1 }}
              transition={transitions.instant}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                acceptSuggestion(name)
                inputRef.current?.focus()
              }}
              className="rounded-sm border border-border-strong px-1.5 py-0.5 font-mono text-[11px] text-muted-dim hover:border-lime/50 hover:text-lime"
            >
              {name}
            </motion.button>
          ))}
        </motion.div>
      )}

      <div className="flex shrink-0 items-center gap-2 border-t border-border px-3 py-2">
        <span className="shrink-0 font-mono text-[13px] text-lime">hassan@portfolio:~$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          aria-label="Terminal command input"
          className="w-full bg-transparent font-mono text-[13px] text-foreground caret-lime outline-none"
        />
      </div>
    </motion.section>
  )
}
