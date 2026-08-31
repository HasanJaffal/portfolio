import { useState } from 'react'
import { Command } from 'cmdk'
import { useNavigate } from 'react-router-dom'
import { Dialog } from '@base-ui/react/dialog'
import {
  Terminal as TerminalIcon,
  User,
  Briefcase,
  FolderGit2,
  Cpu,
  Mail,
  Download,
  GitBranch,
  Link2,
  Copy,
  RotateCcw,
  Code2,
  Check,
  Search,
} from 'lucide-react'
import { useWorkspace } from '@/layout/workspace-context'
import { useSound } from '@/features/audio'
import { navigatePaletteItems, projectPaletteItems, actionPaletteItems, type PaletteItem, type PaletteIcon } from '@/features/command-palette/data'
import { Kbd } from '@/components/ui/kbd'

const iconMap: Record<PaletteIcon, typeof TerminalIcon> = {
  terminal: TerminalIcon,
  user: User,
  briefcase: Briefcase,
  'folder-git': FolderGit2,
  cpu: Cpu,
  mail: Mail,
  download: Download,
  github: GitBranch,
  linkedin: Link2,
  copy: Copy,
  'rotate-ccw': RotateCcw,
  code: Code2,
}

const groups: { id: PaletteItem['group']; label: string; items: PaletteItem[] }[] = [
  { id: 'navigate', label: 'Navigate', items: navigatePaletteItems },
  { id: 'projects', label: 'Projects', items: projectPaletteItems },
  { id: 'actions', label: 'Actions', items: actionPaletteItems },
]

export function CommandPalette() {
  const { isPaletteOpen, setPaletteOpen, toggleTerminal, replayBoot } = useWorkspace()
  const { play } = useSound()
  const navigate = useNavigate()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  function runItem(item: PaletteItem) {
    if (item.disabled) return
    switch (item.action.type) {
      case 'navigate':
        navigate(item.action.path)
        setPaletteOpen(false)
        break
      case 'external':
        play('select')
        window.open(item.action.href, '_blank', 'noopener,noreferrer')
        setPaletteOpen(false)
        break
      case 'copy':
        play('select')
        void navigator.clipboard
          .writeText(item.action.value)
          .then(() => {
            setCopiedId(item.id)
            window.setTimeout(() => setCopiedId(null), 1200)
          })
          .catch(() => {
            // clipboard unavailable — the value is still visible as the item's hint
          })
        break
      case 'toggle-terminal':
        toggleTerminal()
        setPaletteOpen(false)
        break
      case 'replay-boot':
        replayBoot()
        setPaletteOpen(false)
        break
    }
  }

  return (
    <Dialog.Root open={isPaletteOpen} onOpenChange={setPaletteOpen}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-90 bg-black/60 backdrop-blur-[2px] data-starting-style:opacity-0 data-ending-style:opacity-0 transition-opacity duration-150" />
        <Dialog.Popup
          aria-label="Command palette"
          className="fixed left-1/2 top-[18vh] z-91 w-[min(560px,92vw)] -translate-x-1/2 overflow-hidden rounded-lg border border-border-strong bg-panel shadow-2xl data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 transition-all duration-150"
        >
          <Command label="Command palette" className="flex max-h-[60vh] flex-col">
            <div className="flex items-center gap-2 border-b border-border px-3">
              <Search className="h-4 w-4 shrink-0 text-muted-dim" aria-hidden="true" />
              <Command.Input
                autoFocus
                placeholder="Type a command or search…"
                className="w-full bg-transparent py-3 font-mono text-sm text-foreground placeholder:text-muted-dim outline-none"
              />
              <Kbd className="shrink-0">esc</Kbd>
            </div>
            <Command.List className="scrollbar-thin overflow-y-auto p-2">
              <Command.Empty className="px-3 py-6 text-center font-mono text-xs text-muted-dim">
                No matching command.
              </Command.Empty>
              {groups.map((group) =>
                group.items.length === 0 ? null : (
                  <Command.Group
                    key={group.id}
                    heading={group.label}
                    className="mb-1 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:font-mono **:[[cmdk-group-heading]]:text-[10px] **:[[cmdk-group-heading]]:uppercase **:[[cmdk-group-heading]]:tracking-wide **:[[cmdk-group-heading]]:text-muted-dim"
                  >
                    {group.items.map((item) => {
                      const Icon = iconMap[item.icon]
                      const copied = copiedId === item.id
                      return (
                        <Command.Item
                          key={item.id}
                          value={`${item.label} ${item.hint ?? ''}`}
                          onSelect={() => runItem(item)}
                          disabled={item.disabled}
                          className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-foreground data-[selected=true]:bg-lime/10 data-[selected=true]:text-lime-soft data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-40"
                        >
                          <Icon className="h-4 w-4 shrink-0 text-muted group-data-[selected=true]:text-lime" aria-hidden="true" />
                          <span className="flex-1 truncate">{item.label}</span>
                          {copied ? (
                            <span className="flex items-center gap-1 font-mono text-[11px] text-lime">
                              <Check className="h-3 w-3" /> copied
                            </span>
                          ) : (
                            item.hint && (
                              <span className="shrink-0 font-mono text-[11px] text-muted-dim">{item.hint}</span>
                            )
                          )}
                        </Command.Item>
                      )
                    })}
                  </Command.Group>
                ),
              )}
            </Command.List>
          </Command>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
