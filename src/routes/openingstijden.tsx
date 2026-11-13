import { createFileRoute } from '@tanstack/react-router'
import { CalendarClock } from 'lucide-react'
import { Img } from '@/components/Img'
import { OpenBadge, PageHero, Prose } from '@/components/PageHero'
import { blockMap, formatNlDay, heading, text } from '@/lib/format'
import { formatClock, WEEKDAY_ORDER, weekdayName } from '@/lib/hours'
import { blockImage, photos } from '@/lib/images'
import { pageHead } from '@/lib/seo'
import { getHoursBundle, getPageBlocks } from '@/server/public'

export const Route = createFileRoute('/openingstijden')({
  loader: async () => ({
    blocks: await getPageBlocks({ data: 'openingstijden' }),
    hours: await getHoursBundle(),
  }),
  head: (ctx) =>
    pageHead(ctx, {
      title: 'Openingstijden',
      description:
        'Openingstijden van Apotheek De Bongerd in Kesteren, Ochten en Rhenen, plus dienstapotheek buiten openingstijden.',
      path: '/openingstijden',
    }),
  component: HoursPage,
})

function span(opens: string | null, closes: string | null) {
  return `${formatClock(opens)} – ${formatClock(closes)}`
}

function HoursPage() {
  const { blocks, hours } = Route.useLoaderData()
  const copy = blockMap(blocks)

  return (
    <div>
      <PageHero
        kicker="Wanneer kunt u terecht"
        title={heading(copy, 'openingstijden.intro', 'Openingstijden')}
        lead={text(copy, 'openingstijden.intro')}
        image={blockImage(copy['openingstijden.intro'], photos.storefront)}
      />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-3">
        {hours.map((item) => (
          <article key={item.location.id} className="flex flex-col rounded-[1.8rem] border border-line bg-white p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-serif text-3xl text-navy">{item.location.name}</h2>
                <p className="text-sm text-muted">{item.location.address}</p>
              </div>
              <OpenBadge open={item.status.open} label={item.status.open ? 'Open' : 'Gesloten'} />
            </div>
            <p className="mt-3 text-sm font-semibold text-ink">{item.status.detail}</p>
            <table className="mt-5 w-full text-[1.05rem] tabular-nums">
              <caption className="sr-only">Openingstijden {item.location.name} per weekdag</caption>
              <tbody>
                {WEEKDAY_ORDER.map((weekday) => {
                  const row = item.hours.find((h) => h.weekday === weekday)
                  const closed = !row || row.isClosed
                  const isToday = weekday === item.today
                  return (
                    <tr
                      key={weekday}
                      aria-current={isToday ? 'date' : undefined}
                      className={isToday ? 'bg-mint font-semibold' : 'border-b border-mist last:border-0'}
                    >
                      <th
                        scope="row"
                        className={`py-2.5 pl-3 text-left font-medium ${isToday ? 'rounded-l-xl text-navy' : 'text-ink'}`}
                      >
                        {weekdayName(weekday)}
                        {isToday ? <span className="ml-2 text-sm font-semibold text-teal">vandaag</span> : null}
                      </th>
                      <td
                        className={`py-2.5 pr-3 text-right ${isToday ? 'rounded-r-xl' : ''} ${closed ? 'text-muted' : 'font-semibold text-navy'}`}
                      >
                        {closed ? 'Gesloten' : span(row.opens, row.closes)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {item.exceptions.length > 0 ? (
              <div className="mt-5 rounded-2xl border border-warn/30 bg-warn/10 p-4 text-sm">
                <p className="flex items-center gap-2 font-semibold text-navy">
                  <CalendarClock className="h-4 w-4" aria-hidden />
                  Afwijkende openingstijden
                </p>
                <ul className="mt-2 grid gap-1.5 text-ink">
                  {item.exceptions.map((ex) => (
                    <li key={ex.id}>
                      <span className="flex flex-wrap justify-between gap-x-3">
                        <span className="first-letter:uppercase">{formatNlDay(ex.date)}</span>
                        <span className="font-semibold tabular-nums">
                          {ex.isClosed ? 'Gesloten' : span(ex.opens, ex.closes)}
                        </span>
                      </span>
                      {ex.label ? <span className="block text-muted">{ex.label}</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </article>
        ))}
      </div>
      <section id="dienstapotheek" className="mx-auto max-w-6xl scroll-mt-28 px-4 pb-12 sm:px-6">
        <div className="grid overflow-hidden rounded-[1.8rem] bg-navy text-white lg:grid-cols-2">
          <div className="p-6 sm:p-10">
            <h2 className="font-serif text-3xl">{heading(copy, 'openingstijden.dienst', 'Buiten openingstijden')}</h2>
            <Prose html={text(copy, 'openingstijden.dienst')} className="mt-4 max-w-3xl text-sky" />
          </div>
          <Img
            image={blockImage(copy['openingstijden.dienst'], photos.orchard)}
            className="h-52 w-full object-cover lg:h-full"
          />
        </div>
      </section>
    </div>
  )
}
