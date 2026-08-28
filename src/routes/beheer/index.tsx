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
        {cards.map((card) => (
          <Link key={card.to} to={card.to} className="rounded-[1.6rem] border border-line bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted">{card.label}</p>
            <p className="mt-2 font-serif text-5xl text-navy">{card.value}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
