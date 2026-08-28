import { createFileRoute, Link } from '@tanstack/react-router'
import { PageHero, Prose } from '@/components/PageHero'
import { blockMap, heading, text } from '@/lib/format'
import { photos } from '@/lib/images'
import { seo } from '@/lib/seo'
import { getLocations, getPageBlocks } from '@/server/public'

export const Route = createFileRoute('/over-ons')({
  loader: async () => ({
    blocks: await getPageBlocks({ data: 'over-ons' }),
    locations: await getLocations(),
  }),
  head: () => ({
    meta: seo({
      title: 'Over ons',
      description:
        'Zelfstandige HKZ-gecertificeerde apotheek met vestigingen in Kesteren, Ochten en Rhenen. Team, kwaliteit, inschrijven, huisregels en klachten.',
    }),
  }),
  component: OverOns,
})

function OverOns() {
  const { blocks, locations } = Route.useLoaderData()
  const copy = blockMap(blocks)
  const keys = ['intro', 'team', 'kwaliteit', 'inschrijven', 'huisregels', 'klachten'] as const

  return (
    <div>
      <PageHero
        kicker="Onze apotheek"
        title={heading(copy, 'over-ons.intro', 'Over ons')}
        lead={text(copy, 'over-ons.intro')}
        image={photos.orchard.src}
        imageAlt={photos.orchard.alt}
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_18rem]">
        <div className="grid gap-8">
          {keys
            .filter((key) => key !== 'intro')
            .map((key) => (
              <section key={key} className="rounded-[1.8rem] border border-line bg-white p-6 sm:p-8">
                {key === 'team' ? (
                  <img
                    src={photos.john.src}
                    alt={photos.john.alt}
                    className="mb-6 h-56 w-full rounded-[1.4rem] object-cover sm:h-72"
                  />
                ) : null}
                {key === 'kwaliteit' ? (
                  <img
                    src={photos.interior.src}
                    alt={photos.interior.alt}
                    className="mb-6 h-56 w-full rounded-[1.4rem] object-cover sm:h-72"
                  />
                ) : null}
                <h2 className="font-serif text-3xl text-navy">{heading(copy, `over-ons.${key}`)}</h2>
                <div className="mt-4 text-muted">
                  <Prose text={text(copy, `over-ons.${key}`)} />
                </div>
              </section>
            ))}
        </div>
        <aside className="h-fit rounded-[1.8rem] bg-mint p-6">
          <h2 className="font-serif text-2xl text-navy">Vestigingen</h2>
          <ul className="mt-4 grid gap-4">
            {locations.map((loc) => (
              <li key={loc.id}>
                <p className="font-semibold text-navy">{loc.name}</p>
                <p className="text-sm text-muted">
                  {loc.address}, {loc.city}
                </p>
              </li>
            ))}
          </ul>
          <Link to="/contact" className="mt-6 inline-flex min-h-12 items-center font-semibold text-teal">
            Contact en route
          </Link>
        </aside>
      </div>
    </div>
  )
}
