import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { PageHero, Prose } from '@/components/PageHero'
import { formatNlDate } from '@/lib/format'
import { photos } from '@/lib/images'
import { seo } from '@/lib/seo'
import { getNewsBySlug } from '@/server/public'

export const Route = createFileRoute('/nieuws/$slug')({
  loader: async ({ params }) => {
    const post = await getNewsBySlug({ data: params.slug })
    if (!post) throw notFound()
    return post
  },
  head: ({ loaderData }) => ({
    meta: seo({
      title: loaderData?.title ?? 'Nieuws',
      description: loaderData?.excerpt ?? 'Nieuws van Apotheek De Bongerd.',
    }),
  }),
  component: NewsDetail,
})

function NewsDetail() {
  const post = Route.useLoaderData()
  return (
    <div>
      <PageHero
        kicker={formatNlDate(post.publishedAt)}
        title={post.title}
        lead={post.excerpt}
        image={photos.storefront.src}
        imageAlt={photos.storefront.alt}
      />
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="overflow-hidden rounded-[1.8rem] border border-line bg-white">
          <img src={photos.interior.src} alt={photos.interior.alt} className="h-48 w-full object-cover sm:h-64" />
          <div className="p-6 sm:p-8">
            <Prose text={post.body} />
          </div>
        </div>
        <Link to="/nieuws" className="mt-6 inline-flex min-h-12 items-center font-semibold text-navy">
          Terug naar nieuws
        </Link>
      </article>
    </div>
  )
}
