import { createFileRoute, Link } from '@tanstack/react-router'
import { PageHero } from '@/components/PageHero'
import { blockMap, formatNlDate, heading, text } from '@/lib/format'
import { photos } from '@/lib/images'
import { seo } from '@/lib/seo'
import { getPageBlocks, getPublishedNews } from '@/server/public'

export const Route = createFileRoute('/nieuws')({
  loader: async () => ({
    blocks: await getPageBlocks({ data: 'nieuws' }),
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
  const { blocks, posts } = Route.useLoaderData()
  const copy = blockMap(blocks)

  return (
    <div>
      <PageHero
        kicker="Actueel"
        title={heading(copy, 'nieuws.intro', 'Nieuws')}
        lead={text(copy, 'nieuws.intro')}
        image={photos.orchard.src}
        imageAlt={photos.orchard.alt}
      />
      <div className="mx-auto grid max-w-3xl gap-4 px-4 py-10 sm:px-6">
        {posts.length === 0 ? <p className="text-muted">Er zijn nu geen berichten.</p> : null}
        {posts.map((post, index) => (
          <Link
            key={post.id}
            to="/nieuws/$slug"
            params={{ slug: post.slug }}
            className="overflow-hidden rounded-[1.8rem] border border-line bg-white"
          >
            <img
              src={index % 2 === 0 ? photos.storefront.src : photos.interior.src}
              alt={index % 2 === 0 ? photos.storefront.alt : photos.interior.alt}
              className="h-40 w-full object-cover"
            />
            <div className="p-6">
              <p className="text-sm text-muted">{formatNlDate(post.publishedAt)}</p>
              <h2 className="mt-1 font-serif text-3xl text-navy">{post.title}</h2>
              <p className="mt-2 text-muted">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
