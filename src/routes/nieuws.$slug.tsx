import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { NotFound } from '@/components/NotFound'
import { PageHero, Prose } from '@/components/PageHero'
import { formatNlDate } from '@/lib/format'
import { newsImage } from '@/lib/images'
import { pageHead } from '@/lib/seo'
import { getNewsBySlug } from '@/server/public'

export const Route = createFileRoute('/nieuws/$slug')({
  loader: async ({ params }) => {
    const post = await getNewsBySlug({ data: params.slug })
    if (!post) throw notFound()
    return post
  },
  head: (ctx) => {
    const post = ctx.loaderData
    if (!post) return pageHead(ctx, { title: 'Nieuws', description: 'Nieuws van Apotheek De Bongerd.' })
    return pageHead(ctx, {
      title: post.title,
      description: post.excerpt,
      path: `/nieuws/${post.slug}`,
      image: post.imageUrl ?? undefined,
      type: 'article',
      publishedTime: new Date(post.publishedAt).toISOString(),
    })
  },
  component: NewsDetail,
  notFoundComponent: () => <NotFound title="Dit nieuwsbericht is niet (meer) beschikbaar" />,
})

function NewsDetail() {
  const post = Route.useLoaderData()
  return (
    <div>
      <PageHero
        kicker={`Nieuws · ${formatNlDate(post.publishedAt)}`}
        title={post.title}
        leadText={post.excerpt}
        image={post.imageUrl ? newsImage(post, 0) : undefined}
      />
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="overflow-hidden rounded-[1.8rem] border border-line bg-white">
          <div className="p-6 sm:p-8">
            <Prose html={post.body} />
          </div>
        </div>
        <Link
          to="/nieuws"
          className="mt-6 inline-flex min-h-12 items-center gap-2 font-semibold text-navy underline-offset-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Alle nieuwsberichten
        </Link>
      </article>
    </div>
  )
}
