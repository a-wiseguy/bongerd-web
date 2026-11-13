import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { AdminIndexedPage } from '@/components/AdminPageIndex'
import { Field, fieldClass } from '@/components/AdminShell'
import { AdminForm, DeleteButton, SaveButton } from '@/components/admin/AdminForm'
import { formatNlDate } from '@/lib/format'
import { WEEKDAY_ORDER, formatClock, spanProblem, weekdayName } from '@/lib/hours'
import type { Location, OpeningHour } from '@/lib/schema'
import { deleteException, getAdminHours, saveException, saveWeekHours } from '@/server/admin'

export const Route = createFileRoute('/beheer/openingstijden')({
  loader: () => getAdminHours(),
  head: () => ({ meta: [{ title: 'Openingstijden · Beheer' }] }),
  component: HoursAdmin,
})


function HoursAdmin() {
  const { locations, hours, exceptions, today } = Route.useLoaderData()
  const router = useRouter()
  const upcoming = exceptions.filter((ex) => ex.date >= today)
  const past = exceptions.filter((ex) => ex.date < today).reverse()
  const locationName = (id: string | null) => locations.find((l) => l.id === id)?.name ?? 'Alle vestigingen'
  const indexItems = [
    ...locations.map((loc) => ({ id: `locatie-${loc.id}`, label: loc.name })),
    { id: 'afwijkende-dagen', label: 'Afwijkende dagen' },
  ]

  return (
    <AdminIndexedPage items={indexItems}>
      <h1 className="font-serif text-4xl text-navy">Openingstijden</h1>
      <p className="mt-2 text-muted">
        Vaste weektijden per vestiging. Feestdagen en uitzonderingen zet u onder{' '}
        <a href="#afwijkende-dagen" className="font-semibold text-navy underline underline-offset-4">
          afwijkende dagen
        </a>
        .
      </p>
      <div className="mt-8 grid gap-8">
        {locations.map((loc) => (
          <WeekForm
            key={loc.id}
            locationId={loc.id}
            name={loc.name}
            rows={hours.filter((h) => h.locationId === loc.id)}
          />
        ))}
      </div>

      <section id="afwijkende-dagen" className="mt-12 scroll-mt-6">
        <h2 className="font-serif text-3xl text-navy">Afwijkende dagen</h2>
        <p className="mt-2 text-muted">
          Feestdagen of een andere sluitingstijd. Bezoekers zien komende afwijkingen op de site; verlopen datums
          verdwijnen vanzelf.
        </p>
        <ExceptionForm locations={locations} />
        <h3 className="mt-8 font-serif text-2xl text-navy">Gepland</h3>
        <ul className="mt-3 grid gap-2">
          {upcoming.length === 0 ? (
            <li className="rounded-2xl border border-dashed border-line bg-white px-4 py-6 text-muted">
              Geen afwijkende dagen gepland.
            </li>
          ) : null}
          {upcoming.map((ex) => (
            <li
              key={ex.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4"
            >
              <span>
                <span className="block font-semibold text-navy">
                  {formatNlDate(ex.date)} · {ex.label}
                </span>
                <span className="block text-sm text-muted">
                  {locationName(ex.locationId)} ·{' '}
                  {ex.isClosed ? 'hele dag gesloten' : `${formatClock(ex.opens)}–${formatClock(ex.closes)}`}
                </span>
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
        {past.length > 0 ? (
          <details className="mt-6 rounded-2xl border border-line bg-white p-4">
            <summary className="cursor-pointer font-semibold text-navy">Verlopen ({past.length})</summary>
            <ul className="mt-3 grid gap-2">
              {past.map((ex) => (
                <li key={ex.id} className="flex flex-wrap items-center justify-between gap-3 text-muted">
                  <span>
                    {formatNlDate(ex.date)} · {locationName(ex.locationId)} · {ex.label}
                  </span>
                  <DeleteButton
                    confirmText="Verwijder deze verlopen dag."
                    onConfirm={async () => {
                      await deleteException({ data: { id: ex.id } })
                      await router.invalidate()
                    }}
                  />
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </section>
    </AdminIndexedPage>
  )
}

type DayState = { id: string; opens: string; closes: string; isClosed: boolean }

function WeekForm({ locationId, name, rows }: { locationId: string; name: string; rows: OpeningHour[] }) {
  const router = useRouter()
  const ordered = WEEKDAY_ORDER.map((weekday) => rows.find((row) => row.weekday === weekday)).filter(
    (row): row is OpeningHour => Boolean(row),
  )
  const [days, setDays] = useState<DayState[]>(() =>
    ordered.map((row) => ({
      id: row.id,
      opens: formatClock(row.opens),
      closes: formatClock(row.closes),
      isClosed: row.isClosed,
    })),
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const update = (id: string, patch: Partial<DayState>) => {
    setDays((current) => current.map((day) => (day.id === id ? { ...day, ...patch } : day)))
    setErrors((current) => {
      const { [id]: _removed, ...rest } = current
      return rest
    })
  }

  return (
    <AdminForm
      id={`locatie-${locationId}`}
      className="scroll-mt-6 rounded-[1.5rem] border border-line bg-white p-5"
      success={`Openingstijden ${name} opgeslagen.`}
      onSave={async () => {
        const found: Record<string, string> = {}
        for (const day of days) {
          const problem = spanProblem({ opens: day.opens || null, closes: day.closes || null, isClosed: day.isClosed })
          if (problem) found[day.id] = problem.message
        }
        setErrors(found)
        if (Object.keys(found).length) throw new Error('Controleer de gemarkeerde dagen.')
        await saveWeekHours({
          data: {
            locationId,
            days: days.map((day) => ({
              id: day.id,
              opens: day.isClosed ? null : day.opens || null,
              closes: day.isClosed ? null : day.closes || null,
              isClosed: day.isClosed,
            })),
          },
        })
        await router.invalidate()
      }}
    >
      <h2 className="font-serif text-3xl text-navy">{name}</h2>
      <div className="hidden gap-3 text-sm font-semibold text-muted sm:grid sm:grid-cols-[8rem_1fr_1fr_8rem]">
        <span>Dag</span>
        <span>Opent</span>
        <span>Sluit</span>
        <span>Gesloten</span>
      </div>
      <div className="grid gap-2">
        {days.map((day) => {
          const row = ordered.find((item) => item.id === day.id)!
          const label = weekdayName(row.weekday)
          const error = errors[day.id]
          return (
            <div key={day.id} className="grid gap-1">
              <div className="grid grid-cols-2 items-center gap-2 sm:grid-cols-[8rem_1fr_1fr_8rem] sm:gap-3">
                <p className="col-span-2 font-semibold text-navy sm:col-span-1">{label}</p>
                <input
                  type="time"
                  step={300}
                  aria-label={`${label} opent`}
                  value={day.opens}
                  disabled={day.isClosed}
                  aria-invalid={error ? true : undefined}
                  onChange={(event) => update(day.id, { opens: event.target.value })}
                  className={`${fieldClass} disabled:bg-mist disabled:text-muted ${error ? 'border-closed' : ''}`}
                />
                <input
                  type="time"
                  step={300}
                  aria-label={`${label} sluit`}
                  value={day.closes}
                  disabled={day.isClosed}
                  aria-invalid={error ? true : undefined}
                  onChange={(event) => update(day.id, { closes: event.target.value })}
                  className={`${fieldClass} disabled:bg-mist disabled:text-muted ${error ? 'border-closed' : ''}`}
                />
                <label className="col-span-2 flex min-h-12 items-center gap-2 sm:col-span-1">
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-navy"
                    checked={day.isClosed}
                    onChange={(event) => update(day.id, { isClosed: event.target.checked })}
                  />
                  Gesloten
                </label>
              </div>
              {error ? (
                <p className="text-sm font-semibold text-closed" role="alert">
                  {label}: {error}
                </p>
              ) : null}
            </div>
          )
        })}
      </div>
      <div>
        <SaveButton>Week opslaan</SaveButton>
      </div>
    </AdminForm>
  )
}

function ExceptionForm({ locations }: { locations: Location[] }) {
  const router = useRouter()
  const [closed, setClosed] = useState(false)
  return (
    <AdminForm
      className="mt-4 rounded-[1.5rem] border border-line bg-white p-5"
      success="Afwijkende dag toegevoegd."
      onSave={async (data, form) => {
        const value = {
          locationId: String(data.get('locationId') || '') || null,
          date: String(data.get('date') ?? ''),
          opens: String(data.get('opens') || '') || null,
          closes: String(data.get('closes') || '') || null,
          isClosed: data.get('closed') === 'on',
          label: String(data.get('label') ?? '').trim(),
        }
        if (!value.date) throw new Error('Kies een datum.')
        if (!value.label) throw new Error('Vul een toelichting in.')
        const problem = spanProblem(value)
        if (problem) throw new Error(problem.message)
        await saveException({ data: value })
        form.reset()
        setClosed(false)
        await router.invalidate()
      }}
    >
      <h3 className="font-serif text-2xl text-navy">Afwijkende dag toevoegen</h3>
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
        <Field label="Toelichting" hint="Bijvoorbeeld Tweede Kerstdag of studiedag. Deze tekst ziet de bezoeker.">
          <input name="label" required maxLength={255} className={fieldClass} />
        </Field>
        <div className="grid gap-3">
          <label className="flex min-h-12 items-center gap-2">
            <input
              name="closed"
              type="checkbox"
              className="h-5 w-5 accent-navy"
              checked={closed}
              onChange={(event) => setClosed(event.target.checked)}
            />
            Hele dag gesloten
          </label>
          {!closed ? (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Opent">
                <input name="opens" type="time" step={300} className={fieldClass} />
              </Field>
              <Field label="Sluit">
                <input name="closes" type="time" step={300} className={fieldClass} />
              </Field>
            </div>
          ) : null}
        </div>
      </div>
      <div>
        <SaveButton>Toevoegen</SaveButton>
      </div>
    </AdminForm>
  )
}
