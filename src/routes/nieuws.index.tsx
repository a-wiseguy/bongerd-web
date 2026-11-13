import { createFileRoute, Link } from '@tanstack/react-router'
import { Img } from '@/components/Img'
import { PageHero } from '@/components/PageHero'
import { blockMap, formatNlDate, heading, text } from '@/lib/format'
import { newsImage } from '@/lib/images'
import { pageHead } from '@/lib/seo'
import { getPageBlocks, getPublishedNews } from '@/server/public'

export const Route = createFileRoute('/nieuws/')({
  loader: async () => ({
    blocks: await getPageBlocks({ data: 'nieuws' }),
    posts: await getPublishedNews(),
  }),
  head: (ctx) =>
    pageHead(ctx, {
      title: 'Nieuws',
      description: 'Nieuws en mededelingen van Apotheek De Bongerd.',
      path: '/nieuws',
    }),
  component: NewsList,
})

function NewsList() {
  const { blocks, posts } = Route.useLoaderData()
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
      </div>
    </div>
  )
}
