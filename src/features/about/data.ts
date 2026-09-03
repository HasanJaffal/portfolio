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
  tagline:
    'Full-stack engineer. I build data pipelines, geospatial systems and the services that hold them together.',
  location: 'Beirut, Lebanon',
  locationIsPlaceholder: false,
  summary:
    'I am a software engineer with over two years of experience building full-stack systems. Most of my work lives on the backend and in the data layer: ETL pipelines that take documents and geospatial data from raw input all the way to something queryable, .NET and Python services talking to each other over RabbitMQ, and PostgreSQL and PostGIS schemas built to survive real volume. On the front of it, React and TypeScript.',
  summaryIsPlaceholder: false,
  status: 'Open to opportunities',
  statusIsPlaceholder: false,
}

/**
 * Rendered as separate paragraphs under the summary on ~/about.
 * Keep these short; the page is an introduction, not a CV.
 */
export const summaryParagraphs: string[] = [
  'I also do the parts that are not written on a job description. I run the team SCRUM process, I own system design decisions across services, and when something breaks in a way nobody wants to touch, I am usually the one who picks it up.',
  'I studied Computer Science and English Literature at the Lebanese University. The second degree is not a detour. A lot of this job is reading a vague problem carefully and then writing down precisely what should happen.',
]
