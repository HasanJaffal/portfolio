import { Menu, Search, TerminalSquare } from 'lucide-react'
import { Dialog } from '@base-ui/react/dialog'
import { useWorkspace } from '@/layout/workspace-context'
import { Explorer } from '@/features/navigation'
import { Tooltip } from '@/components/ui/tooltip'
import { Kbd } from '@/components/ui/kbd'

export function TitleBar() {
  const { toggleTerminal, setPaletteOpen, isExplorerOpen, setExplorerOpen } = useWorkspace()

  return (
    <header className="flex h-11 shrink-0 items-center gap-3 border-b border-border bg-panel px-3">
      <Dialog.Root open={isExplorerOpen} onOpenChange={setExplorerOpen}>
        <Dialog.Trigger
          aria-label="Open explorer"
          className="rounded-sm p-1.5 text-muted hover:bg-panel-hover hover:text-foreground lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-80 bg-black/60 data-starting-style:opacity-0 data-ending-style:opacity-0 transition-opacity duration-150" />
          <Dialog.Popup className="fixed inset-y-0 left-0 z-81 w-[80vw] max-w-72 border-r border-border-strong bg-panel data-starting-style:-translate-x-full data-ending-style:-translate-x-full transition-transform duration-200 ease-out">
            <Dialog.Title className="sr-only">Explorer</Dialog.Title>
            <Explorer onNavigate={() => setExplorerOpen(false)} />
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="flex items-center gap-1.5" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
      </div>

      <p className="hidden font-mono text-xs text-muted sm:block">hasan@portfolio</p>

      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        className="ml-2 flex flex-1 items-center gap-2 rounded-md border border-border-strong bg-inset px-3 py-1.5 text-left text-muted-dim hover:border-border-strong/80 hover:text-muted sm:max-w-xs"
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden font-mono text-xs sm:inline">Search commands…</span>
        <Kbd className="ml-auto hidden sm:inline-flex">⌘K</Kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <Tooltip content="Toggle terminal (ctrl + `)">
          <button
            type="button"
            onClick={toggleTerminal}
            aria-label="Toggle terminal"
            className="rounded-sm p-1.5 text-muted hover:bg-panel-hover hover:text-lime"
          >
            <TerminalSquare className="h-4 w-4" />
          </button>
        </Tooltip>
      </div>
    </header>
  )
}
