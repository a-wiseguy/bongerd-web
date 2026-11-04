import { createFileRoute, useRouter } from '@tanstack/react-router'
import { AdminIndexedPage } from '@/components/AdminPageIndex'
import { Field, fieldClass } from '@/components/AdminShell'
import { AdminForm, DeleteButton, SaveButton } from '@/components/admin/AdminForm'
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
      <p className="mt-2 text-muted">Elke dag slaat u apart op. De site toont daarna meteen de nieuwe tijd.</p>
      <div className="mt-8 grid gap-8">
        {locations.map((loc) => (
          <section
            key={loc.id}
            id={`locatie-${loc.id}`}
            className="scroll-mt-6 rounded-[1.5rem] border border-line bg-white p-5"
          >
            <h2 className="font-serif text-3xl text-navy">{loc.name}</h2>
            <div className="mt-4 hidden gap-2 px-0 text-sm font-semibold text-muted sm:grid sm:grid-cols-[8rem_1fr_1fr_auto_auto]">
              <span>Dag</span>
              <span>Opent</span>
              <span>Sluit</span>
              <span>Gesloten</span>
              <span className="sr-only">Actie</span>
            </div>
            <div className="mt-3 grid gap-3">
              {[1, 2, 3, 4, 5, 6, 0].map((weekday) => {
                const row = hours.find((h) => h.locationId === loc.id && h.weekday === weekday)
                if (!row) return null
                const day = weekdayName(weekday)
                return (
                  <AdminForm
                    key={row.id}
                    success={`${day} opgeslagen.`}
                    onSave={async (data) => {
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
                    <div className="grid gap-2 sm:grid-cols-[8rem_1fr_1fr_auto_auto] sm:items-end">
                      <p className="font-semibold text-navy">{day}</p>
                      <label className="grid gap-1">
                        <span className="text-sm font-semibold text-navy sm:sr-only">Opent</span>
                        <input
                          name="opens"
                          type="time"
                          aria-label={`${day} opent`}
                          defaultValue={row.opens?.slice(0, 5) ?? ''}
                          className={fieldClass}
                        />
                      </label>
                      <label className="grid gap-1">
                        <span className="text-sm font-semibold text-navy sm:sr-only">Sluit</span>
                        <input
                          name="closes"
                          type="time"
                          aria-label={`${day} sluit`}
                          defaultValue={row.closes?.slice(0, 5) ?? ''}
                          className={fieldClass}
                        />
                      </label>
                      <label className="flex min-h-12 items-center gap-2">
                        <input name="closed" type="checkbox" defaultChecked={row.isClosed} />
                        Gesloten
                      </label>
                      <SaveButton>Opslaan</SaveButton>
                    </div>
                  </AdminForm>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <section id="afwijkende-dagen" className="mt-10 scroll-mt-6">
        <h2 className="font-serif text-3xl text-navy">Afwijkende dagen</h2>
        <p className="mt-2 text-muted">Feestdagen of een andere sluitingstijd. Geldt voor één vestiging of voor alle drie.</p>
        <AdminForm
          className="mt-4 rounded-[1.5rem] border border-line bg-white p-5"
          success="Afwijkende dag toegevoegd."
          onSave={async (data, form) => {
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
            form.reset()
            await router.invalidate()
          }}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Vestiging">
              <select name="locationId" className={fieldClass} defaultValue="">
                <option value="">Alle vestigingen</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Datum">
              <input name="date" type="date" required className={fieldClass} />
            </Field>
            <Field label="Toelichting" hint="Bijvoorbeeld Kerst of studiedag. Deze tekst ziet de bezoeker.">
              <input name="label" required className={fieldClass} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Opent">
                <input name="opens" type="time" className={fieldClass} />
              </Field>
              <Field label="Sluit">
                <input name="closes" type="time" className={fieldClass} />
              </Field>
            </div>
            <label className="flex min-h-12 items-center gap-2">
              <input name="closed" type="checkbox" />
              Hele dag gesloten
            </label>
            <SaveButton>Toevoegen</SaveButton>
          </div>
        </AdminForm>
        <ul className="mt-4 grid gap-2">
          {exceptions.length === 0 ? (
            <li className="rounded-2xl border border-dashed border-line bg-white px-4 py-6 text-muted">
              Geen afwijkende dagen.
            </li>
          ) : null}
          {exceptions.map((ex) => (
            <li
              key={ex.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4"
            >
              <span>
                {ex.date} · {locations.find((l) => l.id === ex.locationId)?.name ?? 'Alle'} · {ex.label}
              </span>
              <DeleteButton
                confirmText="Deze afwijkende dag vervalt."
                onConfirm={async () => {
                  await deleteException({ data: { id: ex.id } })
                  await router.invalidate()
                }}
              />
            </li>
          ))}
        </ul>
      </section>
    </AdminIndexedPage>
  )
}
