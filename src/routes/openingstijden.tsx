import { createFileRoute } from '@tanstack/react-router'
import { OpenBadge, PageHero, Prose } from '@/components/PageHero'
import { blockMap, heading, text } from '@/lib/format'
import { photos } from '@/lib/images'
import { formatClock, weekdayName } from '@/lib/hours'
import { seo } from '@/lib/seo'
import { getHoursBundle, getPageBlocks } from '@/server/public'

export const Route = createFileRoute('/openingstijden')({
  loader: async () => ({
    blocks: await getPageBlocks({ data: 'openingstijden' }),
    hours: await getHoursBundle(),
  }),
  head: () => ({
    meta: seo({
      title: 'Openingstijden',
      description:
        'Openingstijden van Apotheek De Bongerd in Kesteren, Ochten en Rhenen, plus dienstapotheek buiten openingstijden.',
    }),
  }),
  component: HoursPage,
})

function HoursPage() {
  const { blocks, hours } = Route.useLoaderData()
  const copy = blockMap(blocks)

  return (
    <div>
      <PageHero
        kicker="Wanneer kunt u terecht"
        title={heading(copy, 'openingstijden.intro', 'Openingstijden')}
        lead={text(copy, 'openingstijden.intro')}
        image={photos.storefront.src}
        imageAlt={photos.storefront.alt}
      />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-3">
        {hours.map((item) => (
          <article key={item.location.id} className="rounded-[1.8rem] border border-line bg-white p-6">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-serif text-3xl text-navy">{item.location.name}</h2>
              <OpenBadge open={item.status.open} label={item.status.label} detail="" />
            </div>
            <p className="mt-2 text-sm text-muted">{item.status.detail}</p>
            <ul className="mt-5 grid gap-2">
              {[1, 2, 3, 4, 5, 6, 0].map((weekday) => {
                const row = item.hours.find((h) => h.weekday === weekday)
                const closed = !row || row.isClosed
                return (
                  <li key={weekday} className="flex items-center justify-between border-b border-mist py-2 text-[1.05rem]">
                    <span>{weekdayName(weekday)}</span>
                    <span className="font-semibold text-navy">
                      {closed ? 'Gesloten' : `${formatClock(row.opens)}–${formatClock(row.closes)}`}
                    </span>
                  </li>
                )
              })}
            </ul>
            {item.exceptions.length > 0 ? (
              <div className="mt-5 rounded-2xl bg-mist p-4 text-sm">
                <p className="font-semibold text-navy">Afwijkende dagen</p>
                <ul className="mt-2 grid gap-1 text-muted">
                  {item.exceptions.map((ex) => (
                    <li key={ex.id}>
                      {ex.date}: {ex.isClosed ? 'gesloten' : `${formatClock(ex.opens)}–${formatClock(ex.closes)}`}
                      {ex.label ? ` · ${ex.label}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </article>
        ))}
      </div>
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <div className="grid overflow-hidden rounded-[1.8rem] bg-navy text-white lg:grid-cols-2">
          <div className="p-8">
            <h2 className="font-serif text-3xl">{heading(copy, 'openingstijden.dienst', 'Buiten openingstijden')}</h2>
            <div className="mt-4 max-w-3xl text-sky">
              <Prose text={text(copy, 'openingstijden.dienst')} />
            </div>
          </div>
          <img
            src={photos.interior.src}
            alt={photos.interior.alt}
            className="h-52 w-full object-cover lg:h-full"
          />
        </div>
      </section>
    </div>
  )
}
