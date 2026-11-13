import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Img } from '@/components/Img'
import { PageHero } from '@/components/PageHero'
import { blockMap, formatNlDate, heading, text } from '@/lib/format'
import { newsImage } from '@/lib/images'
import { pageHead } from '@/lib/seo'
import { getPageBlocks, getPublishedNews } from '@/server/public'

export const Route = createFileRoute('/nieuws/')({
  validateSearch: (search: Record<string, unknown>): { pagina?: number } => {
    const page = Number(search.pagina)
    // explicit undefined: router merges raw params under the validated ones
    return { pagina: Number.isInteger(page) && page > 1 ? Math.min(page, 10_000) : undefined }
  },
  loaderDeps: ({ search }) => ({ page: search.pagina ?? 1 }),
  loader: async ({ deps }) => {
    const [blocks, news] = await Promise.all([
      getPageBlocks({ data: 'nieuws' }),
      getPublishedNews({ data: { page: deps.page } }),
    ])
    if (deps.page > news.pageCount) throw notFound()
    return { blocks, ...news }
  },
  head: (ctx) => {
    const page = ctx.loaderData?.page ?? 1
    return pageHead(ctx, {
      title: page > 1 ? `Nieuws – pagina ${page}` : 'Nieuws',
      description: 'Nieuws en mededelingen van Apotheek De Bongerd.',
      path: page > 1 ? `/nieuws?pagina=${page}` : '/nieuws',
    })
  },
  component: NewsList,
})

function NewsList() {
  const { blocks, posts, page, pageCount } = Route.useLoaderData()
  const copy = blockMap(blocks)

  return (
    <div>
      <PageHero kicker="Actueel" title={heading(copy, 'nieuws.intro', 'Nieuws')} lead={text(copy, 'nieuws.intro')} />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {posts.length === 0 ? (
          <div className="rounded-[1.8rem] border border-dashed border-line bg-white px-6 py-10 text-center">
            <p className="font-serif text-2xl text-navy">Nog geen nieuws</p>
            <p className="mt-2 text-muted">Er staan op dit moment geen nieuwsberichten op de site.</p>
          </div>
        ) : (
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <li key={post.id}>
                <Link
                  to="/nieuws/$slug"
                  params={{ slug: post.slug }}
                  className="card-link group flex h-full flex-col overflow-hidden rounded-[1.8rem] border border-line bg-white shadow-card"
                >
                  <Img
                    image={newsImage(post, index)}
                    decorative
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="h-44 w-full object-cover"
                  />
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-sm font-semibold text-teal">
                      <time dateTime={new Date(post.publishedAt).toISOString()}>{formatNlDate(post.publishedAt)}</time>
                    </p>
                    <h2 className="mt-1 font-serif text-3xl leading-tight text-navy group-hover:underline group-hover:underline-offset-4">
                      {post.title}
                    </h2>
                    <p className="mt-2 text-muted">{post.excerpt}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {pageCount > 1 ? <Pagination page={page} pageCount={pageCount} /> : null}
      </div>
    </div>
  )
}

const pagerLink =
  'inline-flex min-h-12 items-center gap-2 rounded-full border border-line bg-white px-5 font-semibold text-navy hover:bg-mist'

function Pagination({ page, pageCount }: { page: number; pageCount: number }) {
  return (
    <nav aria-label="Paginering nieuws" className="mt-10 flex flex-wrap items-center justify-between gap-3">
      {page > 1 ? (
        <Link to="/nieuws" search={page > 2 ? { pagina: page - 1 } : {}} className={pagerLink} rel="prev">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Nieuwere berichten
        </Link>
      ) : (
        <span />
      )}
      <p className="text-sm font-semibold text-muted">
        Pagina {page} van {pageCount}
      </p>
      {page < pageCount ? (
        <Link to="/nieuws" search={{ pagina: page + 1 }} className={pagerLink} rel="next">
          Oudere berichten
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}
