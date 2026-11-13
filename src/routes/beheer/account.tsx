import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import { useState } from 'react'
import { Field, fieldClass, ghostBtn } from '@/components/AdminShell'
import { AdminForm, SaveButton } from '@/components/admin/AdminForm'
import { staffErrorMessage } from '@/lib/formErrors'
import { pageHead } from '@/lib/seo'
import { changePassword, logoutEverywhere } from '@/server/auth'

export const Route = createFileRoute('/beheer/account')({
  head: (ctx) => pageHead(ctx, { title: 'Account · Beheer', description: 'Uw beheeraccount.', noindex: true }),
  component: AccountPage,
})

const beheer = getRouteApi('/beheer')

function AccountPage() {
  const { user } = beheer.useLoaderData()
  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-4xl text-navy">Account</h1>
      <p className="mt-2 text-muted">
        Ingelogd als <strong className="text-ink">{user?.email}</strong>.
      </p>

      <AdminForm
        className="mt-6 rounded-[1.5rem] border border-line bg-white p-5 sm:p-6"
        success="Wachtwoord gewijzigd. Andere apparaten zijn uitgelogd."
        onSave={async (data, form) => {
          const next = String(data.get('next') ?? '')
          if (next !== String(data.get('repeat') ?? '')) throw new Error('De nieuwe wachtwoorden zijn niet gelijk.')
          await changePassword({ data: { current: String(data.get('current') ?? ''), next } })
          form.reset()
        }}
      >
        <h2 className="font-serif text-2xl text-navy">Wachtwoord wijzigen</h2>
        <input type="email" name="username" autoComplete="username" value={user?.email ?? ''} readOnly hidden />
        <Field label="Huidig wachtwoord">
          <input name="current" type="password" required autoComplete="current-password" className={fieldClass} />
        </Field>
        <Field label="Nieuw wachtwoord" hint="Minstens 12 tekens. Een zin van een paar woorden werkt goed.">
          <input
            name="next"
            type="password"
            required
            minLength={12}
            maxLength={72}
            autoComplete="new-password"
            className={fieldClass}
          />
        </Field>
        <Field label="Herhaal nieuw wachtwoord">
          <input
            name="repeat"
            type="password"
            required
            minLength={12}
            maxLength={72}
            autoComplete="new-password"
            className={fieldClass}
          />
        </Field>
        <div>
          <SaveButton>Wachtwoord opslaan</SaveButton>
        </div>
      </AdminForm>

      <LogoutEverywhere />
    </div>
  )
}

function LogoutEverywhere() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  return (
    <section className="mt-6 rounded-[1.5rem] border border-line bg-white p-5 sm:p-6">
      <h2 className="font-serif text-2xl text-navy">Overal uitloggen</h2>
      <p className="mt-1 text-muted">
        Ingelogd gebleven op een gedeelde computer of een telefoon kwijt? Dit beëindigt al uw sessies, ook deze.
      </p>
      <button
        type="button"
        className={`${ghostBtn} mt-4`}
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          setError('')
          try {
            await logoutEverywhere()
            window.location.assign('/beheer/login')
          } catch (err) {
            setError(staffErrorMessage(err, 'Uitloggen mislukt. Probeer het opnieuw.'))
            setBusy(false)
          }
        }}
      >
        {busy ? 'Bezig…' : 'Uitloggen op alle apparaten'}
      </button>
      {error ? (
        <p role="alert" className="mt-3 text-sm font-semibold text-closed">
          {error}
        </p>
      ) : null}
    </section>
  )
}
