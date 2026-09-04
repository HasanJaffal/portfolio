// Freelance offerings. Each entry owns the WhatsApp message it opens with, so
// the chat that lands on the phone already says which service it is about —
// see `whatsappUrl` in features/contact/data.ts for how it is turned into a
// link.

export type ServiceIcon =
  | 'globe'
  | 'store'
  | 'workflow'
  | 'layers'
  | 'lightbulb'
  | 'blocks'
  | 'waypoints'
  | 'map'
  | 'database'
  | 'life-buoy'

export interface Service {
  id: string
  slug: string
  name: string
  /** One line under the title, in the same slot as a project's role. */
  summary: string
  description: string
  /** Rendered in the "What's included" accordion. */
  includes: string[]
  tech: string[]
  icon: ServiceIcon
  /** Pre-filled into WhatsApp when this card's action is used. */
  inquiry: string
  placeholder: boolean
}

function inquiry(service: string): string {
  return `Hi Hassan, I found your portfolio. I'm interested in ${service} — can we talk about it?`
}

export const services: Service[] = [
  {
    id: 'websites',
    slug: 'portfolio-website-development',
    name: 'Portfolio & Website Development',
    summary: 'Personal sites, portfolios, landing pages',
    description:
      'A fast, responsive site that loads quickly, reads well on a phone, and can be found. Built from scratch rather than assembled from a template, so nothing on the page is there because a theme shipped with it.',
    includes: [
      'Responsive layout designed mobile-first and tested on real breakpoints.',
      'Content kept as data, so copy can be edited without touching markup.',
      'SEO basics: metadata, Open Graph cards, sitemap, semantic markup.',
      'Deployed to a domain you own, with the build wired to your repository.',
    ],
    tech: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Cloudflare'],
    icon: 'globe',
    inquiry: inquiry('a portfolio or website'),
    placeholder: false,
  },
  {
    id: 'pos',
    slug: 'pos-business-systems',
    name: 'POS & Business Systems',
    summary: 'Point of sale, inventory, back office',
    description:
      'Systems for shops, restaurants and small businesses: taking a sale, tracking what is in stock, and knowing at the end of the month what actually happened. Built around how the business runs, not around a generic product you have to bend to fit.',
    includes: [
      'Sales, invoicing and receipt flows built for the counter, not the boardroom.',
      'Inventory and stock movement tracking with an auditable history.',
      'Roles and permissions so staff and owners see different things.',
      'Reporting on sales, stock and cash, exportable to a spreadsheet.',
    ],
    tech: ['.NET', 'C#', 'React', 'PostgreSQL', 'REST APIs'],
    icon: 'store',
    inquiry: inquiry('a POS or business management system'),
    placeholder: false,
  },
  {
    id: 'automation',
    slug: 'automation-integrations',
    name: 'Automation & Integrations',
    summary: 'Connect the tools, drop the manual step',
    description:
      'The work that currently happens by copying between two systems, or by someone remembering to run something every morning. I connect the services you already pay for and put the repetitive part on a schedule or a trigger.',
    includes: [
      'Third-party API integrations, including the ones with unhelpful documentation.',
      'Scheduled jobs and background workers for recurring processing.',
      'Event-driven messaging between services, so nothing polls in a loop.',
      'Retries, validation and alerting, so a failure is visible rather than silent.',
    ],
    tech: ['.NET', 'Python', 'RabbitMQ', 'REST APIs', 'Background workers'],
    icon: 'workflow',
    inquiry: inquiry('automation or integrating systems'),
    placeholder: false,
  },
  {
    id: 'full-stack',
    slug: 'full-stack-development',
    name: 'Full-Stack Development',
    summary: 'Frontend, backend and the database under both',
    description:
      'End-to-end delivery of a web application: the interface people use, the API behind it, and the schema underneath. One person across the whole stack means no contract gets lost between a frontend and a backend team.',
    includes: [
      'React and TypeScript interfaces built against your own APIs.',
      '.NET services following Clean Architecture, CQRS and the Mediator pattern.',
      'PostgreSQL schema design, migrations and query tuning.',
      'Authentication, authorization and the boring parts done properly.',
    ],
    tech: ['React', 'TypeScript', '.NET', 'ASP.NET Core', 'C#', 'PostgreSQL'],
    icon: 'layers',
    inquiry: inquiry('full-stack development work'),
    placeholder: false,
  },
  {
    id: 'consultancy',
    slug: 'software-consultancy',
    name: 'Software Consultancy',
    summary: 'A second opinion before you commit to one',
    description:
      'Sometimes the useful thing is not more code. Architecture review, a technology decision you want stress-tested, an estimate you do not trust, or a codebase you inherited and need explained before you touch it.',
    includes: [
      'Architecture and system design review, with the trade-offs written down.',
      'Technology selection grounded in your constraints, not in what is fashionable.',
      'Codebase assessment: what is load-bearing, what is risk, what to fix first.',
      'Scoping and estimation for work you plan to build with someone else.',
    ],
    tech: ['System design', 'Architecture review', 'Technical scoping'],
    icon: 'lightbulb',
    inquiry: inquiry('software consultancy'),
    placeholder: false,
  },
  {
    id: 'custom-software',
    slug: 'custom-software-development',
    name: 'Custom Software Development',
    summary: 'Built for one workflow, not a thousand',
    description:
      'For the process no off-the-shelf product models correctly. The domain gets modelled the way your business actually describes it, which is the whole reason to build rather than buy.',
    includes: [
      'Requirements worked out from how the process runs today.',
      'Domain modelling that uses your vocabulary, in the schema and the code.',
      'Iterative delivery, so you are using something well before it is finished.',
      'Handover documentation and a codebase another developer can pick up.',
    ],
    tech: ['.NET', 'C#', 'React', 'TypeScript', 'PostgreSQL', 'Clean Architecture'],
    icon: 'blocks',
    inquiry: inquiry('a custom software project'),
    placeholder: false,
  },
  {
    id: 'data-pipelines',
    slug: 'data-pipelines-etl',
    name: 'Data Pipelines & ETL',
    summary: 'Raw input in, queryable data out',
    description:
      'Moving data out of documents, exports and third-party feeds and into something you can query. This is most of my day job: scraping, transforming, embedding and loading, with each stage able to fail without taking the batch with it.',
    includes: [
      'Ingestion from documents, files, APIs and scraped sources.',
      'Transformation and normalization, including AI-assisted mapping for messy input.',
      'Loading into relational and vector stores, tuned for high-volume inserts.',
      'Per-stage validation and fault tolerance, so one bad record fails loudly and alone.',
    ],
    tech: ['Python', '.NET', 'RabbitMQ', 'PostgreSQL', 'Vector embeddings', 'ETL'],
    icon: 'waypoints',
    inquiry: inquiry('a data pipeline or ETL work'),
    placeholder: false,
  },
  {
    id: 'geospatial',
    slug: 'geospatial-mapping',
    name: 'Geospatial & Mapping Systems',
    summary: 'GIS data, stored properly and put on a map',
    description:
      'Location data arrives in whatever format its source happens to use. I normalize it into one canonical structure, store it so it can be queried spatially, and render the parts of it that people need to see.',
    includes: [
      'Ingestion of many geospatial formats into a single canonical schema.',
      'PostGIS modelling and spatial query tuning over large datasets.',
      'Interactive map interfaces wired to live data rather than static exports.',
      'End-to-end GIS workflows, from collection through storage to visualization.',
    ],
    tech: ['PostGIS', 'PostgreSQL', 'Python', '.NET', 'React', 'Map visualization'],
    icon: 'map',
    inquiry: inquiry('a geospatial or mapping system'),
    placeholder: false,
  },
  {
    id: 'databases',
    slug: 'database-design-performance',
    name: 'Database Design & Performance',
    summary: 'Schemas that survive the second year',
    description:
      'Designing a schema before the data outgrows it, or repairing one that already has. Also the specific, unglamorous work of finding out why a query that used to take milliseconds now takes forty seconds.',
    includes: [
      'Schema design and normalization for a domain that will keep changing.',
      'Index strategy and query tuning against real query plans.',
      'Safe, reversible migrations on databases that are already in production.',
      'Load and volume testing before the traffic finds the problem for you.',
    ],
    tech: ['PostgreSQL', 'PostGIS', 'SQL', 'Query optimization', 'Migrations'],
    icon: 'database',
    inquiry: inquiry('database design or performance work'),
    placeholder: false,
  },
  {
    id: 'maintenance',
    slug: 'maintenance-support',
    name: 'Maintenance & Support',
    summary: 'Keeping something running after launch',
    description:
      'Ongoing care for a system that already exists — yours or someone else\'s. Bug fixes, dependency upgrades, small features, and being the person who picks up the failure nobody else wants to debug.',
    includes: [
      'Bug investigation and fixes, with the root cause reported, not just the patch.',
      'Dependency and framework upgrades done incrementally.',
      'Small feature work and refinements on an existing codebase.',
      'Taking over and documenting a project whose original developer has moved on.',
    ],
    tech: ['.NET', 'React', 'TypeScript', 'Python', 'PostgreSQL', 'Git'],
    icon: 'life-buoy',
    inquiry: inquiry('maintenance and support for an existing project'),
    placeholder: false,
  },
]
