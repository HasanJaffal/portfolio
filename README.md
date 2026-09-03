# hassanjaffal.com

Personal portfolio for Hasan Jaffal, software engineer. A terminal-inspired
workspace: an explorer sidebar, a working command palette, a real command
shell, a WebGL background, and a boot sequence on first visit.

Live at [hassanjaffal.com](https://hassanjaffal.com).

## Stack

React 19, TypeScript, Vite, Tailwind CSS v4, React Router, Motion, Three.js
via React Three Fiber, and Base UI primitives. The React Compiler is enabled.

## Running it

```bash
npm install
npm run dev      # dev server
npm run build    # typecheck + production build to dist/
npm run preview  # serve the built output
npm run lint
```

## Where the content lives

All copy is data, not markup. Each feature owns a `data.ts` and both the page
and the terminal read from it, so editing one file updates every surface.

| File | Holds |
| --- | --- |
| `src/features/about/data.ts` | Name, role, tagline, location, status, bio |
| `src/features/experience/data.ts` | Work history |
| `src/features/projects/data.ts` | Projects, also feeds the `projects` command |
| `src/features/skills/data.ts` | Skill categories, `core` drives the home page badges |
| `src/features/contact/data.ts` | Email, GitHub, LinkedIn |
| `src/features/resume/data.ts` | Resume availability and `public/resume.pdf` |
| `src/features/terminal/data.ts` | Terminal welcome text and command help |
| `src/features/boot/data.ts` | Boot sequence lines and timings |

Entries carrying a `placeholder` (or `*IsPlaceholder`) flag render a visible
`// TODO` marker in the UI, so unfinished content is never mistaken for fact.
Everything currently ships with those flags set to `false`.

## Deployment

Built as a static site and served from Cloudflare Workers via `wrangler deploy`.

- Build command: `npm run build`
- Output directory: `dist`

Client-side routing is handled by the Workers Assets setting
`not_found_handling: "single-page-application"`, which serves `index.html` for
any path that does not match a file. Without it, `/projects` would 404 on a
direct hit or a refresh.

Do not add a `public/_redirects` file for this. Workers Assets strips `/index`
and `.html` when matching, so the usual `/*  /index.html  200` SPA rule matches
its own target and the deploy is rejected with "Infinite loop detected in this
rule". The `not_found_handling` setting already covers that case.

`index.html` carries the canonical URL and the Open Graph and Twitter tags.
`public/og.png` is the 1200x630 share card, and `public/sitemap.xml` and
`public/robots.txt` point at the same domain. All four hardcode
`https://hassanjaffal.com`, so update them together if the domain changes.
