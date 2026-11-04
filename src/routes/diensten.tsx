import { createFileRoute } from '@tanstack/react-router'
import { PageHero } from '@/components/PageHero'
import { DienstenJumpNav, ServiceActionLink, ServiceBody } from '@/components/ServiceSections'
import { blockImage, blockMap, heading, text } from '@/lib/format'
import { photos, serviceImage } from '@/lib/images'
import { seo } from '@/lib/seo'
import { serviceHrefKind } from '@/lib/serviceHref'
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
  const hero = blockImage(copy, 'diensten.intro', photos.delivery)
  const navItems = services.map((service) => ({
    id: service.slug,
    label: service.title,
  }))

  return (
    <div>
      <PageHero
        kicker="Wat wij voor u doen"
        title={heading(copy, 'diensten.intro', 'Diensten')}
        lead={text(copy, 'diensten.intro')}
        image={hero.src}
        imageAlt={hero.alt}
      />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {services.length ? <DienstenJumpNav items={navItems} /> : null}
        <div className="grid gap-5 md:grid-cols-2">
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
                  <h2 className="font-sans text-xl font-semibold tracking-tight text-navy">{service.title}</h2>
                  <p className="mt-2 font-medium leading-relaxed text-teal">{service.summary}</p>
                  <div className="mt-4">
                    <ServiceBody body={service.body} />
                  </div>
                  {hrefKind === 'external' ? (
                    <ServiceActionLink href={service.href!} external label="Naar de aanvraag" />
                  ) : null}
                  {hrefKind === 'internal' ? (
                    <ServiceActionLink
                      href={service.href!}
                      label={service.href === '/contact' ? 'Naar contact' : `Meer over ${service.title}`}
                    />
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
