// `core` drives the badge row on the home page as well as the Skills page,
// so keep it to the handful of things worth leading with.

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
    skills: ['C#', '.NET', 'React', 'TypeScript', 'Python', 'PostgreSQL'],
    placeholder: false,
  },
  {
    id: 'languages',
    label: 'Languages',
    skills: ['C#', 'TypeScript', 'JavaScript', 'Python', 'SQL'],
    placeholder: false,
  },
  {
    id: 'backend',
    label: 'Backend',
    skills: [
      '.NET / ASP.NET Core',
      'Clean Architecture',
      'CQRS & Mediator',
      'Microservices',
      'RabbitMQ',
      'Background workers',
      'REST APIs',
    ],
    placeholder: false,
  },
  {
    id: 'frontend',
    label: 'Frontend',
    skills: ['React', 'TypeScript', 'Redux', 'Material UI', 'Ag-Grid', 'Map visualization'],
    placeholder: false,
  },
  {
    id: 'databases',
    label: 'Data & storage',
    skills: [
      'PostgreSQL',
      'PostGIS',
      'ETL pipelines',
      'Vector embeddings & RAG',
      'Geospatial data modelling',
      'Schema design for scale',
    ],
    placeholder: false,
  },
  {
    id: 'infra',
    label: 'Practices & tools',
    skills: [
      'System design',
      'Agile / SCRUM',
      'Git',
      'ML service integration',
      'Data processing',
    ],
    placeholder: false,
  },
]
