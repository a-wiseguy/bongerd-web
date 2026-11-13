import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { Mail, Phone } from 'lucide-react'
import { useState } from 'react'
import { btnClass, ghostBtn } from '@/components/AdminShell'
import { DeleteButton } from '@/components/admin/AdminForm'
import { formatNlDate, formatNlDateTime } from '@/lib/format'
import { staffErrorMessage } from '@/lib/formErrors'
import type { ContactSubmission } from '@/lib/schema'
import { pageHead } from '@/lib/seo'
import { deleteMessage, getAdminMessages, setMessageHandled } from '@/server/admin'

type View = 'open' | 'afgehandeld'

export const Route = createFileRoute('/beheer/berichten')({
  validateSearch: (search: Record<string, unknown>): { toon?: View } =>
    search.toon === 'afgehandeld' ? { toon: 'afgehandeld' } : {},
  loader: () => getAdminMessages(),
  head: (ctx) => pageHead(ctx, { title: 'Berichten · Beheer', description: 'Contactformulier.', noindex: true }),
  component: MessagesAdmin,
})

function MessagesAdmin() {
  const { items, retentionDays, notifications } = Route.useLoaderData()
  const { toon = 'open' } = Route.useSearch()
  const open = items.filter((item) => !item.handled)
  const handled = items.filter((item) => item.handled)
  const shown = toon === 'open' ? open : handled

  const tabs: { view: View; label: string; count: number }[] = [
    { view: 'open', label: 'Open', count: open.length },
    { view: 'afgehandeld', label: 'Afgehandeld', count: handled.length },
  ]

  return (
    <div className="max-w-4xl">
      <h1 className="font-serif text-4xl text-navy">Berichten</h1>
      <p className="mt-2 text-muted">
        Binnengekomen via het contactformulier. Afgehandelde berichten worden na {retentionDays} dagen automatisch
        verwijderd.
      </p>
      {!notifications ? (
        <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm text-muted ring-1 ring-line">
          E-mailmeldingen voor nieuwe berichten staan uit. Kijk daarom regelmatig hier, of laat{' '}
          <code className="text-ink">SMTP_URL</code> en <code className="text-ink">NOTIFY_EMAIL</code> instellen.
        </p>
      ) : null}

      <nav aria-label="Filter berichten" className="mt-6">
        <ul className="flex gap-2">
          {tabs.map((tab) => (
            <li key={tab.view}>
              <Link
                to="/beheer/berichten"
                search={tab.view === 'open' ? {} : { toon: tab.view }}
                aria-current={toon === tab.view ? 'page' : undefined}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4 font-semibold text-navy aria-[current=page]:border-navy aria-[current=page]:bg-navy aria-[current=page]:text-white"
              >
                {tab.label}
                <span className="rounded-full bg-mist px-2 text-sm text-navy">{tab.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <ul className="mt-5 grid gap-4">
        {shown.length === 0 ? (
          <li className="rounded-[1.5rem] border border-dashed border-line bg-white px-6 py-10 text-center">
            <p className="font-serif text-2xl text-navy">
              {toon === 'open' ? 'Geen open berichten' : 'Geen afgehandelde berichten'}
            </p>
            <p className="mt-2 text-muted">
              {toon === 'open' ? 'Alles is beantwoord. Nieuwe berichten verschijnen hier.' : 'Afgehandelde berichten verschijnen hier.'}
            </p>
          </li>
        ) : null}
        {shown.map((item) => (
          <MessageCard key={item.id} item={item} retentionDays={retentionDays} />
        ))}
      </ul>
    </div>
  )
}

function MessageCard({ item, retentionDays }: { item: ContactSubmission; retentionDays: number }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const purgeOn = new Date(
    new Date(item.handledAt ?? item.createdAt).getTime() + retentionDays * 24 * 60 * 60 * 1000,
  )

  return (
    <li id={`bericht-${item.id}`} className="scroll-mt-6 rounded-[1.5rem] border border-line bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted">
            <time dateTime={new Date(item.createdAt).toISOString()}>{formatNlDateTime(item.createdAt)}</time>
          </p>
          <h2 className="mt-1 font-serif text-2xl text-navy">{item.subject}</h2>
          <p className="mt-1 font-semibold text-ink">{item.name}</p>
          <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            <a
              className="inline-flex min-h-11 items-center gap-1.5 break-all font-semibold text-navy underline-offset-4 hover:underline"
              href={`mailto:${item.email}?subject=${encodeURIComponent(`Re: ${item.subject}`)}`}
            >
              <Mail className="h-4 w-4 shrink-0" aria-hidden />
              {item.email}
            </a>
            {item.phone ? (
              <a
                className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-navy underline-offset-4 hover:underline"
                href={`tel:${item.phone.replace(/[^\d+]/g, '')}`}
              >
                <Phone className="h-4 w-4 shrink-0" aria-hidden />
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
            } finally {
              setBusy(false)
            }
          }}
        >
          {busy ? 'Bezig…' : item.handled ? 'Terug naar open' : 'Markeer als afgehandeld'}
        </button>
      </div>
      <p className="mt-4 whitespace-pre-wrap break-words rounded-2xl bg-paper px-4 py-3 text-ink">{item.message}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {item.handled ? `Wordt automatisch verwijderd op ${formatNlDate(purgeOn)}.` : 'Nog niet afgehandeld.'}
        </p>
        <DeleteButton
          confirmText="Het bericht wordt definitief verwijderd."
          onConfirm={async () => {
            await deleteMessage({ data: { id: item.id } })
            await router.invalidate()
          }}
        />
      </div>
      {error ? (
        <p role="alert" className="mt-3 text-sm font-semibold text-closed">
          {error}
        </p>
      ) : null}
    </li>
  )
}
