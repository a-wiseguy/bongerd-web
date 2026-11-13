import { createFileRoute, Link } from '@tanstack/react-router'
import { ExternalLink, ImageOff, Plus } from 'lucide-react'
import { btnClass } from '@/components/AdminShell'
import { newsStatus, StatusPill } from '@/components/admin/StatusPill'
import { formatNlDateTime } from '@/lib/format'
import { thumbnailUrl } from '@/lib/images'
import { pageHead } from '@/lib/seo'
import { getAdminNews } from '@/server/admin'

export const Route = createFileRoute('/beheer/nieuws/')({
  loader: () => getAdminNews(),
  head: (ctx) => pageHead(ctx, { title: 'Nieuws · Beheer', description: 'Nieuwsberichten beheren.', noindex: true }),
  component: NewsAdminList,
})

function NewsAdminList() {
  const posts = Route.useLoaderData()

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-navy">Nieuws</h1>
          <p className="mt-2 text-muted">Berichten op de nieuwspagina en de homepage (nieuwste drie).</p>
        </div>
        <Link to="/beheer/nieuws/$id" params={{ id: 'nieuw' }} className={`${btnClass} inline-flex items-center gap-2`}>
          <Plus className="h-4 w-4" aria-hidden />
          Nieuw bericht
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="mt-6 rounded-[1.5rem] border border-dashed border-line bg-white px-6 py-10 text-center">
          <p className="font-serif text-2xl text-navy">Nog geen berichten</p>
          <p className="mt-2 text-muted">Schrijf het eerste bericht met de knop hierboven.</p>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-line overflow-hidden rounded-[1.5rem] border border-line bg-white">
          {posts.map((post) => {
            const status = newsStatus(post)
            return (
              <li key={post.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 hover:bg-paper">
                {post.imageUrl ? (
                  <img src={thumbnailUrl(post.imageUrl)} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover" />
                ) : (
                  <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-mist text-muted">
                    <ImageOff className="h-4 w-4" aria-hidden />
                  </span>
                )}
                <div className="min-w-0 flex-1 basis-52">
                  <Link
                    to="/beheer/nieuws/$id"
                    params={{ id: post.id }}
                    className="font-semibold text-navy underline-offset-4 hover:underline"
                  >
                    {post.title}
                  </Link>
                  <p className="text-sm text-muted">
                    {status.tone === 'scheduled' ? 'Verschijnt ' : ''}
                    {formatNlDateTime(post.publishedAt)}
                  </p>
                </div>
                <StatusPill tone={status.tone}>{status.label}</StatusPill>
                {status.live ? (
                  <a
                    href={`/nieuws/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-navy underline-offset-4 hover:underline"
                  >
                    Bekijk
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    <span className="sr-only"> “{post.title}” op de site (nieuw tabblad)</span>
                  </a>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
