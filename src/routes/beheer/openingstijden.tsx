import { createFileRoute, useRouter } from '@tanstack/react-router'
import { AdminIndexedPage } from '@/components/AdminPageIndex'
import { btnClass, fieldClass, ghostBtn } from '@/components/AdminShell'
import { weekdayName } from '@/lib/hours'
import { deleteException, getAdminHours, saveException, saveOpeningHour } from '@/server/admin'

export const Route = createFileRoute('/beheer/openingstijden')({
  loader: () => getAdminHours(),
  component: HoursAdmin,
})

function HoursAdmin() {
  const { locations, hours, exceptions } = Route.useLoaderData()
  const router = useRouter()
  const indexItems = [
    ...locations.map((loc) => ({
      id: `locatie-${loc.id}`,
      label: loc.name,
    })),
    { id: 'afwijkende-dagen', label: 'Afwijkende dagen' },
  ]

  return (
    <AdminIndexedPage items={indexItems}>
      <h1 className="font-serif text-4xl text-navy">Openingstijden</h1>
      <div className="mt-8 grid gap-8">
        {locations.map((loc) => (
          <section
            key={loc.id}
            id={`locatie-${loc.id}`}
            className="scroll-mt-6 rounded-[1.5rem] border border-line bg-white p-5"
          >
            <h2 className="font-serif text-3xl text-navy">{loc.name}</h2>
            <div className="mt-4 grid gap-3">
              {[1, 2, 3, 4, 5, 6, 0].map((weekday) => {
                const row = hours.find((h) => h.locationId === loc.id && h.weekday === weekday)
                if (!row) return null
                return (
                  <form
                    key={row.id}
                    className="grid gap-2 sm:grid-cols-[8rem_1fr_1fr_auto_auto] sm:items-end"
                    onSubmit={async (event) => {
                      event.preventDefault()
                      const data = new FormData(event.currentTarget)
                      await saveOpeningHour({
                        data: {
                          id: row.id,
                          opens: String(data.get('opens') || '') || null,
                          closes: String(data.get('closes') || '') || null,
                          isClosed: data.get('closed') === 'on',
                        },
                      })
                      await router.invalidate()
                    }}
                  >
                    <p className="font-semibold text-navy">{weekdayName(weekday)}</p>
                    <input name="opens" type="time" defaultValue={row.opens?.slice(0, 5) ?? ''} className={fieldClass} />
                    <input name="closes" type="time" defaultValue={row.closes?.slice(0, 5) ?? ''} className={fieldClass} />
                    <label className="flex min-h-12 items-center gap-2">
                      <input name="closed" type="checkbox" defaultChecked={row.isClosed} />
                      Gesloten
                    </label>
                    <button type="submit" className={btnClass}>
                      Opslaan
                    </button>
                  </form>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <section id="afwijkende-dagen" className="mt-10 scroll-mt-6">
        <h2 className="font-serif text-3xl text-navy">Afwijkende dagen</h2>
        <form
          className="mt-4 grid gap-3 rounded-[1.5rem] border border-line bg-white p-5 md:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault()
            const data = new FormData(event.currentTarget)
            await saveException({
              data: {
                locationId: String(data.get('locationId') || '') || null,
                date: String(data.get('date') ?? ''),
                opens: String(data.get('opens') || '') || null,
                closes: String(data.get('closes') || '') || null,
                isClosed: data.get('closed') === 'on',
                label: String(data.get('label') ?? ''),
              },
            })
            event.currentTarget.reset()
            await router.invalidate()
          }}
        >
          <select name="locationId" className={fieldClass} defaultValue="">
            <option value="">Alle vestigingen</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
          <input name="date" type="date" required className={fieldClass} />
          <input name="label" placeholder="Label" required className={fieldClass} />
          <div className="grid grid-cols-2 gap-3">
            <input name="opens" type="time" className={fieldClass} />
            <input name="closes" type="time" className={fieldClass} />
          </div>
          <label className="flex items-center gap-2">
            <input name="closed" type="checkbox" />
            Hele dag gesloten
          </label>
          <button type="submit" className={btnClass}>
            Toevoegen
          </button>
        </form>
        <ul className="mt-4 grid gap-2">
          {exceptions.map((ex) => (
            <li key={ex.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4">
              <span>
                {ex.date} · {locations.find((l) => l.id === ex.locationId)?.name ?? 'Alle'} · {ex.label}
              </span>
              <button
                type="button"
                className={ghostBtn}
                onClick={async () => {
                  await deleteException({ data: { id: ex.id } })
                  await router.invalidate()
                }}
              >
                Verwijder
              </button>
            </li>
          ))}
        </ul>
      </section>
    </AdminIndexedPage>
  )
}
