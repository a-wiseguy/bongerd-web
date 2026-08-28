import { createFileRoute, useRouter } from '@tanstack/react-router'
import { btnClass, ghostBtn } from '@/components/AdminShell'
import { formatNlDate } from '@/lib/format'
import { getAdminMessages, setMessageHandled } from '@/server/admin'

export const Route = createFileRoute('/beheer/berichten')({
  loader: () => getAdminMessages(),
  component: MessagesAdmin,
})

function MessagesAdmin() {
  const items = Route.useLoaderData()
  const router = useRouter()

  return (
    <div>
      <h1 className="font-serif text-4xl text-navy">Berichten</h1>
      <p className="mt-2 text-muted">Alleen zichtbaar voor ingelogde beheerders.</p>
      <ul className="mt-6 grid gap-4">
        {items.length === 0 ? <li className="text-muted">Nog geen berichten.</li> : null}
        {items.map((item) => (
          <li
            key={item.id}
            className={`rounded-[1.5rem] border p-5 ${item.handled ? 'border-line bg-mist' : 'border-line bg-white'}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted">{formatNlDate(item.createdAt)}</p>
                <h2 className="font-serif text-2xl text-navy">{item.subject}</h2>
                <p className="mt-1 font-semibold">
                  {item.name} · {item.email}
                  {item.phone ? ` · ${item.phone}` : ''}
                </p>
              </div>
              <button
                type="button"
                className={item.handled ? ghostBtn : btnClass}
                onClick={async () => {
                  await setMessageHandled({ data: { id: item.id, handled: !item.handled } })
                  await router.invalidate()
                }}
              >
                {item.handled ? 'Terugzetten' : 'Afgehandeld'}
              </button>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-muted">{item.message}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
