import { profile } from '@/features/about/data'
import { contactLinks, email } from '@/features/contact/data'
import { resume } from '@/features/resume/data'
import { coreCommands, shortcutCommands } from '@/features/terminal/data'

export interface TerminalContext {
  navigate: (path: string) => void
  pathname: string
  replayBoot: () => void
}

export type CommandResult = { type: 'lines'; lines: string[] } | { type: 'clear' }

function lines(...ls: string[]): CommandResult {
  return { type: 'lines', lines: ls }
}

function openSection(path: string, label: string, ctx: TerminalContext): CommandResult {
  ctx.navigate(path)
  return lines(`Opening ~${label}...`)
}

function openExternalLink(id: 'github' | 'linkedin'): CommandResult {
  const link = contactLinks.find((entry) => entry.id === id)
  if (!link || link.placeholder) {
    return lines(`${id} link not set — edit src/features/contact/data.ts`)
  }
  window.open(link.href, '_blank', 'noopener,noreferrer')
  return lines(`Opening ${link.label}...`)
}

async function copyEmail(): Promise<CommandResult> {
  try {
    await navigator.clipboard.writeText(email)
    return lines(`Copied email to clipboard: ${email}`)
  } catch {
    return lines(`Email: ${email}`, '(clipboard unavailable — copy it manually)')
  }
}

type CommandHandler = (args: string[], ctx: TerminalContext) => CommandResult | Promise<CommandResult>

const commands: Record<string, CommandHandler> = {
  help: () => {
    const pad = (name: string) => name.padEnd(10, ' ')
    return lines(
      ...coreCommands.map((c) => `  ${pad(c.name)} ${c.description}`),
      '',
      'shortcuts:',
      ...shortcutCommands.map((c) => `  ${pad(c.name)} ${c.description}`),
    )
  },
  whoami: () => lines(profile.name, profile.role),
  about: (_args, ctx) => openSection('/about', '/about', ctx),
  experience: (_args, ctx) => openSection('/experience', '/experience', ctx),
  projects: (_args, ctx) => openSection('/projects', '/projects', ctx),
  skills: (_args, ctx) => openSection('/skills', '/skills', ctx),
  contact: (_args, ctx) => openSection('/contact', '/contact', ctx),
  resume: () => {
    if (!resume.available) {
      return lines('resume.pdf not found — check back soon.')
    }
    window.open(resume.url, '_blank', 'noopener,noreferrer')
    return lines('Opening resume.pdf...')
  },
  ls: () => lines('about/  experience/  projects/  skills/  contact/  resume.pdf'),
  pwd: (_args, ctx) => lines(ctx.pathname === '/' ? '~' : `~${ctx.pathname}`),
  github: () => openExternalLink('github'),
  linkedin: () => openExternalLink('linkedin'),
  email: () => copyEmail(),
  sudo: () => lines('Nice try. This terminal runs unprivileged.'),
  boot: (_args, ctx) => {
    ctx.replayBoot()
    return lines('Replaying boot sequence...')
  },
}

export async function runCommand(input: string, ctx: TerminalContext): Promise<CommandResult> {
  const trimmed = input.trim()
  if (trimmed === '') return { type: 'lines', lines: [] }
  const [name, ...args] = trimmed.split(/\s+/)
  const key = name.toLowerCase()
  if (key === 'clear') return { type: 'clear' }
  const handler = commands[key]
  if (!handler) {
    return lines(`command not found: ${name}`, "type 'help' for a list of commands")
  }
  return handler(args, ctx)
}

export const commandNames: string[] = [
  ...Object.keys(commands),
  'clear',
]
