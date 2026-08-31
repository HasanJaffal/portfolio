// The "Core stack" category is real — it's exactly what this codebase is
// built with, so it's left unflagged. Every other category is a placeholder:
// replace the skill lists with your actual stack.

export interface SkillCategory {
  id: string
  label: string
  skills: string[]
  placeholder: boolean
}

export const skillCategories: SkillCategory[] = [
  {
    id: 'core',
    label: 'Core stack',
    skills: ['TypeScript', 'React', 'Vite', 'Tailwind CSS', 'Three.js'],
    placeholder: false,
  },
  {
    id: 'languages',
    label: 'Languages',
    skills: ['Add language', 'Add another language'],
    placeholder: true,
  },
  {
    id: 'backend',
    label: 'Backend',
    skills: ['Add backend technology'],
    placeholder: true,
  },
  {
    id: 'databases',
    label: 'Databases',
    skills: ['Add database'],
    placeholder: true,
  },
  {
    id: 'infra',
    label: 'Infrastructure & tools',
    skills: ['Add tool'],
    placeholder: true,
  },
]
