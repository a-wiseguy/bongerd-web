import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { ArrowDown, ArrowUp, ExternalLink, Plus } from 'lucide-react'
import { useState } from 'react'
import { btnClass } from '@/components/AdminShell'
import { StatusPill } from '@/components/admin/StatusPill'
import { staffErrorMessage } from '@/lib/formErrors'
import { pageHead } from '@/lib/seo'
import { getAdminServices, moveService } from '@/server/admin'

export const Route = createFileRoute('/beheer/diensten/')({
  loader: () => getAdminServices(),
  head: (ctx) => pageHead(ctx, { title: 'Diensten · Beheer', description: 'Diensten beheren.', noindex: true }),
  component: ServicesAdminList,
})

const moveBtn =
  'inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-navy hover:bg-mist disabled:opacity-30'

function ServicesAdminList() {
  const items = Route.useLoaderData()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const move = async (id: string, direction: 'up' | 'down') => {
    setBusy(true)
    setError('')
    try {
      await moveService({ data: { id, direction } })
      await router.invalidate()
    } catch (err) {
      setError(staffErrorMessage(err, 'Verplaatsen mislukt. Probeer het opnieuw.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-navy">Diensten</h1>
          <p className="mt-2 text-muted">De volgorde hier is de volgorde op de site. De eerste zes staan op de homepage.</p>
        </div>
        <Link to="/beheer/diensten/$id" params={{ id: 'nieuw' }} className={`${btnClass} inline-flex items-center gap-2`}>
          <Plus className="h-4 w-4" aria-hidden />
          Nieuwe dienst
        </Link>
      </div>
      {error ? (
        <p role="alert" className="mt-4 text-sm font-semibold text-closed">
          {error}
        </p>
      ) : null}

      {items.length === 0 ? (
        <div className="mt-6 rounded-[1.5rem] border border-dashed border-line bg-white px-6 py-10 text-center">
          <p className="font-serif text-2xl text-navy">Nog geen diensten</p>
        </div>
      ) : (
        <ol className="mt-6 divide-y divide-line overflow-hidden rounded-[1.5rem] border border-line bg-white" aria-busy={busy || undefined}>
          {items.map((item, index) => (
            <li key={item.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 hover:bg-paper">
              <span className="w-6 text-right text-sm font-semibold tabular-nums text-muted">{index + 1}</span>
              <div className="min-w-0 flex-1 basis-52">
                <Link
                  to="/beheer/diensten/$id"
                  params={{ id: item.id }}
                  className="font-semibold text-navy underline-offset-4 hover:underline"
                >
                  {item.title}
                </Link>
                <p className="truncate text-sm text-muted">{item.summary}</p>
              </div>
              <StatusPill tone={item.published ? 'online' : 'draft'}>{item.published ? 'Online' : 'Verborgen'}</StatusPill>
              {item.published ? (
                <a
                  href={`/diensten#${item.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-navy underline-offset-4 hover:underline"
                >
                  Bekijk
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  <span className="sr-only"> “{item.title}” op de site (nieuw tabblad)</span>
                </a>
              ) : null}
              <span className="flex gap-1">
                <button
                  type="button"
                  className={moveBtn}
                  disabled={busy || index === 0}
                  onClick={() => move(item.id, 'up')}
                >
                  <ArrowUp className="h-4 w-4" aria-hidden />
                  <span className="sr-only">{item.title} omhoog</span>
                </button>
                <button
                  type="button"
                  className={moveBtn}
                  disabled={busy || index === items.length - 1}
                  onClick={() => move(item.id, 'down')}
                >
                  <ArrowDown className="h-4 w-4" aria-hidden />
                  <span className="sr-only">{item.title} omlaag</span>
                </button>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
