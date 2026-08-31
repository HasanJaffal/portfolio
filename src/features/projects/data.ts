// Replace these placeholder projects with your real work. Both the Projects
// page and the terminal's `projects` command read from this single file —
// update it once and both surfaces stay in sync.

export interface Project {
  id: string
  slug: string
  name: string
  description: string
  role: string
  highlights: string[]
  tech: string[]
  githubUrl?: string
  demoUrl?: string
  status: 'active' | 'maintained' | 'archived'
  placeholder: boolean
}

export const projects: Project[] = [
  {
    id: 'project-1',
    slug: 'project-one',
    name: 'Add project name',
    description:
      'Add a one- or two-sentence description of what this project does and why it exists.',
    role: 'Add your role',
    highlights: [
      'Add a technical highlight — an architecture decision, a performance win, an interesting problem solved',
    ],
    tech: ['Add tech'],
    status: 'active',
    placeholder: true,
  },
  {
    id: 'project-2',
    slug: 'project-two',
    name: 'Add project name',
    description: 'Add a one- or two-sentence description of this project.',
    role: 'Add your role',
    highlights: ['Add a technical highlight'],
    tech: ['Add tech'],
    status: 'active',
    placeholder: true,
  },
  {
    id: 'project-3',
    slug: 'project-three',
    name: 'Add project name',
    description: 'Add a one- or two-sentence description of this project.',
    role: 'Add your role',
    highlights: ['Add a technical highlight'],
    tech: ['Add tech'],
    status: 'archived',
    placeholder: true,
  },
]
