import type { ReactNode } from 'react'

export function PageHeader({
  path,
  title,
  description,
}: {
  path: string
  title: ReactNode
  description?: ReactNode
}) {
  return (
    <header className="mb-8">
      <p className="mb-2 font-mono text-xs text-muted-dim">{path}</p>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1>
      {description && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{description}</p>}
    </header>
  )
}
