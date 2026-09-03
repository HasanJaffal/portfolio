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
    id: 'aiaec',
    role: 'Software Engineer',
    company: 'AIAEC',
    location: 'Beirut, Lebanon',
    start: '02.2025',
    end: 'Present',
    summary:
      'Full-stack work across internal platforms and client products: .NET services, React frontends, and the data pipelines underneath both.',
    highlights: [
      'Designed and built end-to-end ETL pipelines for documents, covering scraping, transformation, embedding and loading into vector and relational stores.',
      'Built a geospatial ingestion layer that accepts many input formats and normalizes them into one canonical structure, using AI-assisted mapping for messy sources.',
      'Owned end-to-end GIS workflows, from data collection through storage, querying and map visualization.',
      'Built event-driven microservices on RabbitMQ with background workers, validation and fault tolerance.',
      'Migrated legacy Python services to .NET, introducing Clean Architecture and clear abstraction layers.',
      'Designed and optimized PostgreSQL and PostGIS schemas for large geospatial datasets and high-volume inserts.',
      'Applied CQRS and the Mediator pattern to keep read and write paths separate as the domain grew.',
      'Integrated backend services with external ML systems for retrieval and normalization.',
      'Run the team SCRUM process, including planning, estimation and delivery.',
      'Own system design decisions across services, and take on the failures nobody else wants to debug.',
    ],
    tech: [
      'C#',
      '.NET',
      'ASP.NET Core',
      'React',
      'TypeScript',
      'Python',
      'PostgreSQL',
      'PostGIS',
      'RabbitMQ',
      'CQRS',
      'Clean Architecture',
    ],
    placeholder: false,
  },
  {
    id: 'smartsoft',
    role: 'Frontend Developer (Internship)',
    company: 'SmartSoft',
    location: 'Tyre, Lebanon',
    start: '06.2023',
    end: '10.2023',
    summary:
      'Five-month internship building the interfaces and data-heavy screens of an ERP product.',
    highlights: [
      'Built user-facing interfaces for an ERP product in React and TypeScript.',
      'Managed global application state with Redux.',
      'Integrated with an ASP.NET Core backend, working with the API team on contracts.',
      'Used Ag-Grid to organize, filter and sort large fetched datasets.',
      'Implemented client-side navigation with React Router and built the UI on Material UI.',
    ],
    tech: ['React', 'TypeScript', 'Redux', 'Material UI', 'Ag-Grid', 'React Router', 'Axios'],
    placeholder: false,
  },
]
