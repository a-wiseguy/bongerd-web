import { createFileRoute, Link } from '@tanstack/react-router'
import { CalendarClock, FileText, Megaphone, Newspaper } from 'lucide-react'
import { OpenBadge } from '@/components/PageHero'
import { formatNlDateTime, formatNlDay } from '@/lib/format'
import { pageHead } from '@/lib/seo'
import { getAdminDashboard } from '@/server/admin'

export const Route = createFileRoute('/beheer/')({
  loader: () => getAdminDashboard(),
  head: (ctx) => pageHead(ctx, { title: 'Overzicht · Beheer', description: 'Beheer van de website.', noindex: true }),
  component: Dashboard,
})

const actions = [
  { to: '/beheer/nieuws/$id', params: { id: 'nieuw' }, label: 'Nieuwsbericht schrijven', icon: Newspaper },
  { to: '/beheer/mededelingen', label: 'Mededeling plaatsen', icon: Megaphone },
  { to: '/beheer/openingstijden', hash: 'afwijkende-dagen', label: 'Afwijkende dag invoeren', icon: CalendarClock },
  { to: '/beheer/content', label: 'Teksten aanpassen', icon: FileText },
] as const

const panel = 'rounded-[1.5rem] border border-line bg-white p-5 sm:p-6'

function exceptionText(day: { isClosed: boolean; opens: string | null; closes: string | null; label: string }) {
  const hours = day.isClosed || !day.opens || !day.closes ? 'gesloten' : `${day.opens.slice(0, 5)}–${day.closes.slice(0, 5)}`
  return day.label ? `${day.label} · ${hours}` : hours
}

function Dashboard() {
  const data = Route.useLoaderData()

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-serif text-4xl text-navy">Overzicht</h1>
        <p className="mt-2 text-muted">Wijzigingen staan direct op de site.</p>
      </div>

      <section aria-labelledby="dash-messages" className={`${panel} ${data.openMessages ? 'border-warn' : ''}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="dash-messages" className="font-serif text-2xl text-navy">
            {data.openMessages === 0
              ? 'Geen open berichten'
              : data.openMessages === 1
                ? '1 open bericht'
                : `${data.openMessages} open berichten`}
          </h2>
          <Link to="/beheer/berichten" className="font-semibold text-navy underline-offset-4 hover:underline">
            Naar berichten
          </Link>
        </div>
        {data.latestMessages.length ? (
          <ul className="mt-3 divide-y divide-line">
            {data.latestMessages.map((message) => (
              <li key={message.id} className="flex flex-wrap justify-between gap-x-4 py-2.5">
                <span className="font-semibold text-ink">{message.subject}</span>
                <span className="text-sm text-muted">{formatNlDateTime(message.createdAt)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-muted">Alles is afgehandeld.</p>
        )}
      </section>

      <section aria-labelledby="dash-locations">
        <h2 id="dash-locations" className="sr-only">
          Vestigingen
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {data.locations.map((loc) => (
            <div key={loc.id} className={panel}>
              <p className="font-semibold text-navy">{loc.name}</p>
              <div className="mt-2">
                <OpenBadge open={loc.status.open} label={loc.status.label} />
              </div>
              <p className="mt-2 text-sm text-muted">{loc.status.detail}</p>
              {loc.exceptions.length ? (
                <ul className="mt-3 grid gap-1 border-t border-line pt-3 text-sm">
                  {loc.exceptions.map((day) => (
                    <li key={`${day.date}-${day.label}`}>
                      <span className="font-semibold text-ink">{formatNlDay(day.date)}</span>{' '}
                      <span className="text-muted">{exceptionText(day)}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="dash-actions">
        <h2 id="dash-actions" className="font-serif text-2xl text-navy">
          Snel naar
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map(({ icon: Icon, label, ...link }) => (
            <Link key={label} {...link} className={`card-link flex min-h-16 items-center gap-3 ${panel} py-4 sm:py-4`}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mist text-navy">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="font-semibold text-navy">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="dash-site" className={panel}>
        <h2 id="dash-site" className="font-serif text-2xl text-navy">
          Op de site
        </h2>
        <dl className="mt-3 grid gap-4 sm:grid-cols-3">
          <Stat to="/beheer/nieuws" label="Nieuwsberichten online" value={data.newsLive}>
            {data.newsScheduled ? `+ ${data.newsScheduled} gepland` : null}
          </Stat>
          <Stat to="/beheer/mededelingen" label="Actieve mededelingen" value={data.activeAnnouncements} />
          <Stat to="/beheer/diensten" label="Diensten online" value={data.liveServices} />
        </dl>
      </section>
    </div>
  )
}

function Stat({
  to,
  label,
  value,
  children,
}: {
  to: '/beheer/nieuws' | '/beheer/mededelingen' | '/beheer/diensten'
  label: string
  value: number
  children?: React.ReactNode
}) {
  return (
    <div>
      <dt className="text-sm font-semibold text-muted">
        <Link to={to} className="underline-offset-4 hover:underline">
          {label}
        </Link>
      </dt>
      <dd className="mt-1 flex items-baseline gap-2">
        <span className="text-4xl font-semibold tabular-nums tracking-tight text-navy">{value}</span>
        {children ? <span className="text-sm font-semibold text-warn">{children}</span> : null}
      </dd>
    </div>
  )
}
