export interface CommandHelp {
  name: string
  description: string
}

export const welcomeLines: string[] = [
  'Welcome to hassan@portfolio.',
  "Type 'help' to see available commands, or use the explorer on the left.",
]

export const coreCommands: CommandHelp[] = [
  { name: 'help', description: 'list available commands' },
  { name: 'whoami', description: 'print identity' },
  { name: 'about', description: 'open ~/about' },
  { name: 'experience', description: 'open ~/experience' },
  { name: 'projects', description: 'open ~/projects' },
  { name: 'skills', description: 'open ~/skills' },
  { name: 'contact', description: 'open ~/contact' },
  { name: 'resume', description: 'open resume.pdf' },
  { name: 'ls', description: 'list sections' },
  { name: 'pwd', description: 'print current path' },
  { name: 'sound', description: 'toggle interface sound (on|off)' },
  { name: 'clear', description: 'clear the terminal' },
]

export const shortcutCommands: CommandHelp[] = [
  { name: 'github', description: 'open GitHub profile' },
  { name: 'linkedin', description: 'open LinkedIn profile' },
  { name: 'email', description: 'copy email to clipboard' },
]

export const terminalHistoryStorageKey = 'portfolio:terminal-history'
