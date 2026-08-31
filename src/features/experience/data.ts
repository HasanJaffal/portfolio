// Replace these placeholder entries with your real work history.
// Every entry here is marked `placeholder: true` — the UI renders a visible
// "// TODO" marker on placeholder entries so nothing fabricated reads as fact.

export interface ExperienceEntry {
  id: string
  role: string
  company: string
  location: string
  start: string
  end: string
  summary: string
  highlights: string[]
  tech: string[]
  placeholder: boolean
}

export const experience: ExperienceEntry[] = [
  {
    id: 'role-1',
    role: 'Add role title',
    company: 'Add company name',
    location: 'Add location',
    start: 'Add start date',
    end: 'Present',
    summary: 'Add a one-line summary of scope and impact in this role.',
    highlights: [
      'Add a specific technical highlight — a system you built, a problem you solved',
      'Add another highlight',
    ],
    tech: ['Add tech'],
    placeholder: true,
  },
  {
    id: 'role-2',
    role: 'Add role title',
    company: 'Add company name',
    location: 'Add location',
    start: 'Add start date',
    end: 'Add end date',
    summary: 'Add a one-line summary of scope and impact in this role.',
    highlights: ['Add a specific technical highlight'],
    tech: ['Add tech'],
    placeholder: true,
  },
]
