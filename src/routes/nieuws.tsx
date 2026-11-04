import { createFileRoute, Link } from '@tanstack/react-router'
import { formatNlDate } from '@/lib/format'
import { newsImage, photos } from '@/lib/images'
import { seo } from '@/lib/seo'
import { getPublishedNews } from '@/server/public'

export const Route = createFileRoute('/nieuws')({
  loader: async () => ({
    posts: await getPublishedNews(),
  }),
  head: () => ({
    meta: seo({
      title: 'Nieuws',
      description: 'Nieuws en mededelingen van Apotheek De Bongerd.',
    }),
  }),
  component: NewsList,
})

function NewsList() {
  const { posts } = Route.useLoaderData()

  return (
    <div className="mx-auto grid max-w-3xl gap-4 px-4 py-8 sm:px-6 sm:py-10">
      {posts.length === 0 ? (
        <div className="rounded-[1.8rem] border border-dashed border-line bg-white px-6 py-10 text-center">
          <p className="font-serif text-2xl text-navy">Geen berichten</p>
          <p className="mt-2 text-muted">Er staan nu geen nieuwsberichten op de site.</p>
        </div>
      ) : null}
      {posts.map((post, index) => {
        const photo = newsImage(post, index % 2 === 0 ? photos.storefront : photos.interior)
        return (
          <Link
            key={post.id}
            to="/nieuws/$slug"
            params={{ slug: post.slug }}
            className="card-link overflow-hidden rounded-[1.8rem] border border-line bg-white shadow-card"
          >
            <img src={photo.src} alt={photo.alt} className="h-40 w-full object-cover" />
            <div className="p-6">
              <p className="text-sm text-muted">{formatNlDate(post.publishedAt)}</p>
              <h2 className="mt-1 font-serif text-3xl text-navy">{post.title}</h2>
              <p className="mt-2 text-muted">{post.excerpt}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
