import { createFileRoute, Link } from '@tanstack/react-router'
import { getAdminDashboard } from '@/server/admin'

export const Route = createFileRoute('/beheer/')({
  loader: () => getAdminDashboard(),
  component: Dashboard,
})

function Dashboard() {
  const data = Route.useLoaderData()
  const cards = [
    { to: '/beheer/berichten', label: 'Open berichten', value: data.openMessages },
    { to: '/beheer/nieuws', label: 'Nieuwsberichten', value: data.news },
    { to: '/beheer/diensten', label: 'Diensten', value: data.services },
    { to: '/beheer/mededelingen', label: 'Mededelingen', value: data.announcements },
  ] as const

  return (
    <div>
      <h1 className="font-serif text-4xl text-navy">Overzicht</h1>
      <p className="mt-2 text-muted">Pas teksten, tijden en berichten aan. Wijzigingen staan meteen op de site.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((card) => {
          const attention = card.to === '/beheer/berichten' && card.value > 0
          return (
            <Link
              key={card.to}
              to={card.to}
              className={`card-link rounded-[1.6rem] border bg-white p-6 shadow-card ${attention ? 'border-warn' : 'border-line'}`}
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-muted">{card.label}</p>
              <p className="mt-2 font-sans text-5xl font-semibold tabular-nums tracking-tight text-navy">{card.value}</p>
              {attention ? <p className="mt-2 text-sm font-semibold text-warn">Nog te behandelen</p> : null}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
