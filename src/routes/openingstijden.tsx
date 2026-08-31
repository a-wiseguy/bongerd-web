import { createFileRoute } from '@tanstack/react-router'
import { OpenBadge, PageHero, Prose } from '@/components/PageHero'
import { blockImage, blockMap, formatNlDate, heading, text } from '@/lib/format'
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
  const hero = blockImage(copy, 'openingstijden.intro', photos.storefront)

  return (
    <div>
      <PageHero
        kicker="Wanneer kunt u terecht"
        title={heading(copy, 'openingstijden.intro', 'Openingstijden')}
        lead={text(copy, 'openingstijden.intro')}
        image={hero.src}
        imageAlt={hero.alt}
      />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-3">
        {hours.map((item) => (
          <article key={item.location.id} className="rounded-[1.8rem] border border-line bg-white p-6">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-serif text-3xl text-navy">{item.location.name}</h2>
              <OpenBadge open={item.status.open} label={item.status.label} detail="" />
            </div>
            <p className="mt-2 text-sm text-muted">{item.status.detail}</p>
            <table className="mt-5 w-full text-[1.05rem]">
              <caption className="sr-only">Openingstijden {item.location.name}</caption>
              <thead>
                <tr className="border-b border-mist text-left">
                  <th scope="col" className="py-2 font-semibold text-navy">
                    Dag
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold text-navy">
                    Tijd
                  </th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 0].map((weekday) => {
                  const row = item.hours.find((h) => h.weekday === weekday)
                  const closed = !row || row.isClosed
                  return (
                    <tr key={weekday} className="border-b border-mist">
                      <th scope="row" className="py-2 font-medium text-ink">
                        {weekdayName(weekday)}
                      </th>
                      <td className="py-2 text-right font-semibold text-navy">
                        {closed ? (
                          'Gesloten'
                        ) : (
                          <time dateTime={`${formatClock(row.opens)}/${formatClock(row.closes)}`}>
                            {formatClock(row.opens)}–{formatClock(row.closes)}
                          </time>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {item.exceptions.length > 0 ? (
              <div className="mt-5 rounded-2xl bg-mist p-4 text-sm">
                <p className="font-semibold text-navy">Afwijkende dagen</p>
                <ul className="mt-2 grid gap-1 text-muted">
                  {item.exceptions.map((ex) => (
                    <li key={ex.id}>
                      {formatNlDate(ex.date)}: {ex.isClosed ? 'gesloten' : `${formatClock(ex.opens)}–${formatClock(ex.closes)}`}
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
