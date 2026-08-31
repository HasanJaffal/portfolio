export interface BootLine {
  text: string
  delayMs: number
}

export const bootLines: BootLine[] = [
  { text: 'INITIALIZING PORTFOLIO...', delayMs: 120 },
  { text: 'LOADING PROFILE...', delayMs: 260 },
  { text: 'LOADING PROJECTS...', delayMs: 220 },
  { text: 'LOADING EXPERIENCE...', delayMs: 220 },
  { text: 'MOUNTING FILESYSTEM...', delayMs: 200 },
  { text: 'SYSTEM READY.', delayMs: 260 },
]

export const bootStorageKey = 'portfolio:boot-seen'
