import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { AdminIndexedPage } from '@/components/AdminPageIndex'
import { btnClass, ghostBtn } from '@/components/AdminShell'
import { formatNlDate } from '@/lib/format'
import { staffErrorMessage } from '@/lib/formErrors'
import { getAdminMessages, setMessageHandled } from '@/server/admin'

export const Route = createFileRoute('/beheer/berichten')({
  loader: () => getAdminMessages(),
  component: MessagesAdmin,
})

function MessagesAdmin() {
  const items = Route.useLoaderData()
  const indexItems = items.map((item) => ({
    id: `bericht-${item.id}`,
    label: item.subject || item.name || 'Bericht',
  }))

  return (
    <AdminIndexedPage items={indexItems}>
      <h1 className="font-serif text-4xl text-navy">Berichten</h1>
      <p className="mt-2 text-muted">Binnengekomen via het contactformulier. Alleen zichtbaar voor ingelogde beheerders.</p>
      <ul className="mt-6 grid gap-4">
        {items.length === 0 ? (
          <li className="rounded-[1.5rem] border border-dashed border-line bg-white px-6 py-10 text-center">
            <p className="font-serif text-2xl text-navy">Geen berichten</p>
            <p className="mt-2 text-muted">Nieuwe formulieren van de site verschijnen hier.</p>
          </li>
        ) : null}
        {items.map((item) => (
          <MessageCard key={item.id} item={item} />
        ))}
      </ul>
    </AdminIndexedPage>
  )
}

function MessageCard({
  item,
}: {
  item: {
    id: string
    createdAt: string | Date
    subject: string
    name: string
    email: string
    phone: string | null
    message: string
    handled: boolean
  }
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  return (
    <li
      id={`bericht-${item.id}`}
      className={`scroll-mt-6 rounded-[1.5rem] border p-5 ${item.handled ? 'border-line bg-mist' : 'border-line bg-white'}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-muted">{formatNlDate(item.createdAt)}</p>
            {item.handled ? (
              <span className="inline-flex min-h-7 items-center rounded-full bg-mint px-3 text-sm font-semibold text-teal">
                Afgehandeld
              </span>
            ) : (
              <span className="inline-flex min-h-7 items-center rounded-full bg-white px-3 text-sm font-semibold text-warn ring-1 ring-warn/40">
                Open
              </span>
            )}
          </div>
          <h2 className="mt-1 font-serif text-2xl text-navy">{item.subject}</h2>
          <p className="mt-1 font-semibold text-navy">{item.name}</p>
          <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
            <a className="font-semibold text-navy underline-offset-4 hover:underline" href={`mailto:${item.email}`}>
              {item.email}
            </a>
            {item.phone ? (
              <a className="font-semibold text-navy underline-offset-4 hover:underline" href={`tel:${item.phone}`}>
                {item.phone}
              </a>
            ) : null}
          </p>
        </div>
        <button
          type="button"
          className={item.handled ? ghostBtn : btnClass}
          disabled={busy}
          onClick={async () => {
            setBusy(true)
            setError('')
            try {
              await setMessageHandled({ data: { id: item.id, handled: !item.handled } })
              await router.invalidate()
            } catch (err) {
              setError(staffErrorMessage(err, 'Status bijwerken mislukt. Probeer het opnieuw.'))
              setBusy(false)
            }
          }}
        >
          {busy ? 'Bezig…' : item.handled ? 'Terugzetten' : 'Afgehandeld'}
        </button>
      </div>
      <p className="mt-4 whitespace-pre-wrap rounded-2xl bg-paper px-4 py-3 text-muted">{item.message}</p>
      {error ? (
        <p role="alert" className="mt-3 text-sm font-semibold text-closed">
          {error}
        </p>
      ) : null}
    </li>
  )
}
