import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function NotFound() {
  const location = useLocation()

  return (
    <div className="mx-auto flex h-full max-w-xl flex-col justify-center px-6 font-mono text-sm">
      <p className="text-danger">bash: cd: {location.pathname}: No such file or directory</p>
      <p className="mt-2 text-muted">
        That path doesn't exist in this filesystem.{' '}
        <Link to="/" className="text-lime underline-offset-4 hover:underline">
          cd ~
        </Link>{' '}
        to go home.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex w-fit items-center gap-2 rounded-md border border-border-strong px-4 py-2 text-foreground hover:border-lime/60 hover:text-lime"
      >
        <ArrowLeft className="h-4 w-4" /> Back home
      </Link>
    </div>
  )
}
