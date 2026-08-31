// Edit this file with your real identity and bio. Fields flagged
// `isPlaceholder: true` render with a visible "// TODO" marker in the UI
// until you replace them — see components/ui/todo-tag.tsx.

export interface Profile {
  name: string
  role: string
  tagline: string
  location: string
  locationIsPlaceholder: boolean
  summary: string
  summaryIsPlaceholder: boolean
  status: string
  statusIsPlaceholder: boolean
}

export const profile: Profile = {
  name: 'Hasan Jaffal',
  role: 'Software Engineer',
  tagline: 'Building software, systems & products.',
  location: 'Add your city / country',
  locationIsPlaceholder: true,
  summary:
    'Add a short bio here — a few sentences on what you build, how you think about engineering, and what you care about. This paragraph is the first thing a visitor reads after the headline, so write it in your own voice rather than a generic description.',
  summaryIsPlaceholder: true,
  status: 'Add current availability (e.g. "Open to new roles")',
  statusIsPlaceholder: true,
}
