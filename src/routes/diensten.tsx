import { createFileRoute } from '@tanstack/react-router'
import { PageHero, Prose } from '@/components/PageHero'
import { blockMap, heading, text } from '@/lib/format'
import { photos, serviceImage } from '@/lib/images'
import { seo } from '@/lib/seo'
import { getPageBlocks, getPublishedServices } from '@/server/public'

export const Route = createFileRoute('/diensten')({
  loader: async () => ({
    blocks: await getPageBlocks({ data: 'diensten' }),
    services: await getPublishedServices(),
  }),
  head: () => ({
    meta: seo({
      title: 'Diensten',
      description:
        'Herhaalrecepten, bezorgdienst, afhaalautomaat, baxterrollen, medicatiebegeleiding en meer bij Apotheek De Bongerd.',
    }),
  }),
  component: ServicesPage,
})

function ServicesPage() {
  const { blocks, services } = Route.useLoaderData()
  const copy = blockMap(blocks)

  return (
    <div>
      <PageHero
        kicker="Wat wij voor u doen"
        title={heading(copy, 'diensten.intro', 'Diensten')}
        lead={text(copy, 'diensten.intro')}
        image={photos.delivery.src}
        imageAlt={photos.delivery.alt}
      />
      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-10 sm:px-6 md:grid-cols-2">
        {services.map((service) => {
          const photo = serviceImage(service.slug)
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
                  <Prose text={service.body} />
                </div>
                {service.href ? (
                  service.href.startsWith('http') ? (
                    <a
                      href={service.href}
                      className="mt-5 inline-flex min-h-12 items-center font-semibold text-navy"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Naar de aanvraag
                    </a>
                  ) : (
                    <a href={service.href} className="mt-5 inline-flex min-h-12 items-center font-semibold text-navy">
                      Verder
                    </a>
                  )
                ) : null}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
