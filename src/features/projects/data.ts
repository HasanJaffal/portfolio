// Professional work. Product and client names are withheld, so these are
// described by what they do and how they were built rather than by brand.

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
    id: 'etl-platform',
    slug: 'document-geospatial-etl',
    name: 'Document & Geospatial ETL Platform',
    description:
      'An internal platform that turns unstructured documents and raw geospatial files into queryable, structured data. Two pipelines share one backbone: documents go from scraping to transformation to embedding to loading, and geo data arrives in whatever format the source happens to use and leaves in a single canonical structure.',
    role: 'Lead engineer on the pipeline architecture',
    highlights: [
      'Designed the document pipeline end to end: scraping, transformation, embedding, and loading into vector and relational stores.',
      'Built a geo ingestion layer that accepts many input formats and normalizes them into one concrete schema, rather than one importer per format.',
      'Used AI for the parts that resist rules, normalizing inconsistent values and mapping unknown source fields onto the target schema.',
      'Split the work across microservices coordinated over RabbitMQ, with background workers so long ingestion jobs never block a request.',
      'Added validation and fault tolerance at each stage so a single malformed source file fails loudly and in isolation instead of poisoning a batch.',
      'Tuned PostgreSQL and PostGIS for high-volume inserts on large geospatial datasets.',
    ],
    tech: [
      '.NET',
      'C#',
      'Python',
      'RabbitMQ',
      'PostgreSQL',
      'PostGIS',
      'Vector embeddings',
      'Microservices',
    ],
    status: 'active',
    placeholder: false,
  },
  {
    id: 'rag-mapping-platform',
    slug: 'rag-chat-mapping-platform',
    name: 'RAG Chat & Interactive Mapping Platform',
    description:
      'A domain-specific platform where users ask questions in natural language and get answers grounded in a private document corpus, alongside interactive maps that render the spatial side of the same data.',
    role: 'Full-stack engineer',
    highlights: [
      'Built retrieval-augmented generation over a private corpus so answers stay grounded in in-house documents.',
      'Implemented the interactive map layer and wired it to the same underlying geospatial data the chat draws on.',
      'Integrated the backend with external ML services for embedding and retrieval.',
      'Built the frontend in React and TypeScript against .NET APIs.',
    ],
    tech: ['React', 'TypeScript', '.NET', 'C#', 'Python', 'RAG', 'PostGIS', 'Map visualization'],
    status: 'active',
    placeholder: false,
  },
  {
    id: 'pm-platform',
    slug: 'project-management-platform',
    name: 'Project Management Platform',
    description:
      'A project management tool built for a specific industry rather than for general use, which meant modelling the domain properly instead of shipping another generic board with tasks on it.',
    role: 'Full-stack engineer',
    highlights: [
      'Built features across the stack, from database schema and .NET APIs through to the React interface.',
      'Followed Clean Architecture, applying CQRS and the Mediator pattern to keep read and write paths separate.',
      'Worked directly against domain requirements to model workflows that generic tooling could not express.',
    ],
    tech: ['React', 'TypeScript', '.NET', 'ASP.NET Core', 'C#', 'PostgreSQL', 'CQRS'],
    status: 'maintained',
    placeholder: false,
  },
]
