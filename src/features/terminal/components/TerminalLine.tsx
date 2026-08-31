import type { TerminalEntry } from '@/features/terminal/hooks/use-terminal'

export function TerminalLine({ entry }: { entry: TerminalEntry }) {
  return (
    <div className="mb-2 font-mono text-[13px] leading-relaxed last:mb-0">
      {entry.command !== null && (
        <div className="flex gap-2">
          <span className="shrink-0 text-lime">hasan@portfolio:~$</span>
          <span className="break-all text-foreground">{entry.command}</span>
        </div>
      )}
      {entry.lines.map((line, i) => (
        <div key={i} className="whitespace-pre-wrap wrap-break-word pl-0 text-muted">
          {line}
        </div>
      ))}
    </div>
  )
}
