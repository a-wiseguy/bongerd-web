import { createFileRoute, Link } from '@tanstack/react-router'
import { MapPinned } from 'lucide-react'
import { Img } from '@/components/Img'
import { PageHero, Prose } from '@/components/PageHero'
import { blockMap, heading, text } from '@/lib/format'
import { blockImage, photos } from '@/lib/images'
import { pageHead } from '@/lib/seo'
import { getLocations, getPageBlocks } from '@/server/public'

export const Route = createFileRoute('/over-ons')({
  loader: async () => ({
    blocks: await getPageBlocks({ data: 'over-ons' }),
    locations: await getLocations(),
  }),
  head: (ctx) =>
    pageHead(ctx, {
      title: 'Over ons',
      description:
        'Zelfstandige HKZ-gecertificeerde apotheek met vestigingen in Kesteren, Ochten en Rhenen. Team, kwaliteit, inschrijven, huisregels en klachten.',
      path: '/over-ons',
    }),
  component: OverOns,
})

const sections = ['team', 'kwaliteit', 'inschrijven', 'huisregels', 'klachten'] as const

function OverOns() {
  const { blocks, locations } = Route.useLoaderData()
  const copy = blockMap(blocks)

  return (
    <div>
      <PageHero
        kicker="Onze apotheek"
        title={heading(copy, 'over-ons.intro', 'Over ons')}
        lead={text(copy, 'over-ons.intro')}
        image={blockImage(copy['over-ons.intro'], photos.orchard)}
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_18rem]">
        <div className="grid gap-6">
          {sections
            .filter((key) => copy[`over-ons.${key}`])
            .map((key) => (
              <section
                key={key}
                id={key}
                className="scroll-mt-28 overflow-hidden rounded-[1.8rem] border border-line bg-white"
              >
                {key === 'team' ? (
                  <Img
                    image={blockImage(copy['over-ons.team'], photos.john)}
                    sizes="(min-width: 1024px) 760px, 100vw"
                    className="h-56 w-full object-cover object-top sm:h-80"
                  />
                ) : null}
                <div className="p-6 sm:p-8">
                  <h2 className="font-serif text-3xl text-navy">{heading(copy, `over-ons.${key}`)}</h2>
                  <Prose html={text(copy, `over-ons.${key}`)} className="mt-4 max-w-3xl text-muted" />
                </div>
              </section>
            ))}
        </div>
        <aside className="h-fit rounded-[1.8rem] bg-mint p-6 lg:sticky lg:top-28">
          <h2 className="font-serif text-2xl text-navy">Vestigingen</h2>
          <ul className="mt-4 grid gap-4">
            {locations.map((loc) => (
              <li key={loc.id}>
                <p className="font-semibold text-navy">{loc.name}</p>
                <p className="text-sm text-muted">
                  {loc.address}, {loc.postal} {loc.city}
                </p>
              </li>
            ))}
          </ul>
          <Link
            to="/contact"
            className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-5 font-semibold text-navy transition hover:bg-paper"
          >
            <MapPinned className="h-4 w-4" aria-hidden />
            Contact en route
          </Link>
        </aside>
      </div>
    </div>
  )
}
