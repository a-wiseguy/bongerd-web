import { createFileRoute } from '@tanstack/react-router'
import { PageHero, Prose } from '@/components/PageHero'
import { blockImage, blockMap, heading, text } from '@/lib/format'
import { photos, serviceImage } from '@/lib/images'
import { pageHead } from '@/lib/seo'
import { serviceHrefKind } from '@/lib/serviceHref'
import { getPageBlocks, getPublishedServices } from '@/server/public'

export const Route = createFileRoute('/diensten')({
  loader: async () => ({
    blocks: await getPageBlocks({ data: 'diensten' }),
    services: await getPublishedServices(),
  }),
  head: (ctx) =>
    pageHead(ctx, {
      title: 'Diensten',
      description:
        'Herhaalrecepten, bezorgdienst, afhaalautomaat, baxterrollen, medicatiebegeleiding en meer bij Apotheek De Bongerd.',
      path: '/diensten',
    }),
  component: ServicesPage,
})

function ServicesPage() {
  const { blocks, services } = Route.useLoaderData()
  const copy = blockMap(blocks)
  const hero = blockImage(copy, 'diensten.intro', photos.delivery)

  return (
    <div>
      <PageHero
        kicker="Wat wij voor u doen"
        title={heading(copy, 'diensten.intro', 'Diensten')}
        lead={text(copy, 'diensten.intro')}
        image={hero.src}
        imageAlt={hero.alt}
      />
      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-10 sm:px-6 md:grid-cols-2">
        {services.length === 0 ? (
          <div className="rounded-[1.8rem] border border-dashed border-line bg-white px-6 py-10 text-center md:col-span-2">
            <p className="font-serif text-2xl text-navy">Geen diensten</p>
            <p className="mt-2 text-muted">Er staan nu geen diensten op de site.</p>
          </div>
        ) : null}
        {services.map((service) => {
          const photo = serviceImage(service.slug, { src: service.imageUrl, alt: service.imageAlt })
          const hrefKind = service.href ? serviceHrefKind(service.href) : 'invalid'
          return (
            <article
              id={service.slug}
              key={service.id}
              className="scroll-mt-28 overflow-hidden rounded-[1.8rem] border border-line bg-white"
            >
              <img src={photo.src} alt={photo.alt} className="h-44 w-full object-cover" />
              <div className="p-6 sm:p-8">
                <h2 className="font-serif text-3xl text-navy">{service.title}</h2>
                <p className="mt-2 font-medium text-teal">{service.summary}</p>
                <div className="mt-4 text-muted">
                  <Prose html={service.body} />
                </div>
                {hrefKind === 'external' ? (
                  <a
                    href={service.href!}
                    className="mt-5 inline-flex min-h-12 items-center font-semibold text-navy underline-offset-4 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Naar de aanvraag
                    <span className="sr-only">, opent in een nieuw tabblad</span>
                  </a>
                ) : null}
                {hrefKind === 'internal' ? (
                  <a href={service.href!} className="mt-5 inline-flex min-h-12 items-center font-semibold text-navy underline-offset-4 hover:underline">
                    {service.href === '/contact' ? 'Naar contact' : `Meer over ${service.title}`}
                  </a>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
