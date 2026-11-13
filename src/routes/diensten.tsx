import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { Img } from '@/components/Img'
import { PageHero, Prose } from '@/components/PageHero'
import { blockMap, heading, text } from '@/lib/format'
import { serviceImage } from '@/lib/images'
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

const linkClass =
  'mt-5 inline-flex min-h-12 items-center gap-2 rounded-full bg-navy px-5 font-semibold text-white transition hover:bg-navy-deep'

function ServicesPage() {
  const { blocks, services } = Route.useLoaderData()
  const copy = blockMap(blocks)

  return (
    <div>
      <PageHero
        kicker="Wat wij voor u doen"
        title={heading(copy, 'diensten.intro', 'Diensten')}
        lead={text(copy, 'diensten.intro')}
      >
        {services.length > 1 ? (
          <nav aria-label="Diensten op deze pagina" className="mt-8">
            <ul className="flex flex-wrap gap-2">
              {services.map((service) => (
                <li key={service.id}>
                  <a
                    href={`#${service.slug}`}
                    className="inline-flex min-h-11 items-center rounded-full border border-line bg-white px-4 text-base font-semibold text-navy transition hover:border-navy"
                  >
                    {service.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </PageHero>
      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-10 sm:px-6 md:grid-cols-2">
        {services.length === 0 ? (
          <div className="rounded-[1.8rem] border border-dashed border-line bg-white px-6 py-10 text-center md:col-span-2">
            <p className="font-serif text-2xl text-navy">Nog geen diensten</p>
            <p className="mt-2 text-muted">
              Vragen over wat wij voor u kunnen doen?{' '}
              <Link to="/contact" className="font-semibold text-navy underline underline-offset-4">
                Neem contact op
              </Link>
              .
            </p>
          </div>
        ) : null}
        {services.map((service) => {
          const hrefKind = service.href ? serviceHrefKind(service.href) : 'invalid'
          return (
            <article
              id={service.slug}
              key={service.id}
              className="flex scroll-mt-28 flex-col overflow-hidden rounded-[1.8rem] border border-line bg-white"
            >
              <Img
                image={serviceImage(service.slug, { src: service.imageUrl, alt: service.imageAlt })}
                decorative
                sizes="(min-width: 768px) 50vw, 100vw"
                className="h-48 w-full object-cover"
              />
              <div className="flex flex-1 flex-col p-6 sm:p-8">
                <h2 className="font-serif text-3xl text-navy">{service.title}</h2>
                <p className="mt-2 font-semibold text-teal">{service.summary}</p>
                <Prose html={service.body} className="mt-4 text-muted" />
                <div className="mt-auto">
                  {hrefKind === 'external' ? (
                    <a href={service.href!} className={linkClass} target="_blank" rel="noopener noreferrer">
                      Direct aanvragen
                      <ExternalLink className="h-4 w-4" aria-hidden />
                      <span className="sr-only"> (opent in een nieuw tabblad)</span>
                    </a>
                  ) : null}
                  {hrefKind === 'internal' ? (
                    <a href={service.href!} className={linkClass}>
                      {service.href === '/contact' ? 'Neem contact op' : `Meer over ${service.title.toLowerCase()}`}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
