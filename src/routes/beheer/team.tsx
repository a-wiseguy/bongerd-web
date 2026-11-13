import { createFileRoute, useRouter } from '@tanstack/react-router'
import { KeyRound } from 'lucide-react'
import { useState } from 'react'
import { Field, fieldClass, ghostBtn } from '@/components/AdminShell'
import { AdminForm, DeleteButton, SaveButton } from '@/components/admin/AdminForm'
import { formatNlDate } from '@/lib/format'
import { staffErrorMessage } from '@/lib/formErrors'
import { pageHead } from '@/lib/seo'
import { addAdmin, getAdmins, removeAdmin, resetAdminPassword } from '@/server/auth'

export const Route = createFileRoute('/beheer/team')({
  loader: () => getAdmins(),
  head: (ctx) => pageHead(ctx, { title: 'Team · Beheer', description: 'Beheerders van de website.', noindex: true }),
  component: TeamPage,
})

type Credentials = { email: string; password: string }

function TeamPage() {
  const { me, users } = Route.useLoaderData()
  const router = useRouter()
  const [credentials, setCredentials] = useState<Credentials | null>(null)

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-4xl text-navy">Team</h1>
      <p className="mt-2 text-muted">Collega's die de website mogen beheren.</p>

      {credentials ? <CredentialsNotice credentials={credentials} onClose={() => setCredentials(null)} /> : null}

      <ul className="mt-6 grid gap-3">
        {users.map((user) => (
          <li key={user.id} className="rounded-[1.5rem] border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-all font-semibold text-navy">
                  {user.email}
                  {user.id === me ? <span className="ml-2 text-sm font-semibold text-teal">(u)</span> : null}
                </p>
                <p className="text-sm text-muted">Sinds {formatNlDate(user.createdAt)}</p>
              </div>
              {user.id !== me ? (
                <div className="flex flex-wrap items-start gap-2">
                  <ResetButton
                    onReset={async () => {
                      setCredentials(await resetAdminPassword({ data: { id: user.id } }))
                    }}
                  />
                  <DeleteButton
                    confirmText={`${user.email} kan dan niet meer inloggen.`}
                    onConfirm={async () => {
                      await removeAdmin({ data: { id: user.id } })
                      await router.invalidate()
                    }}
                  />
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <AdminForm
        className="mt-6 rounded-[1.5rem] border border-line bg-white p-5 sm:p-6"
        success="Collega toegevoegd."
        onSave={async (data, form) => {
          setCredentials(await addAdmin({ data: { email: String(data.get('email') ?? '').trim() } }))
          form.reset()
          await router.invalidate()
        }}
      >
        <h2 className="font-serif text-2xl text-navy">Collega toevoegen</h2>
        <Field label="E-mailadres" hint="U krijgt een tijdelijk wachtwoord te zien om door te geven.">
          <input name="email" type="email" required maxLength={255} autoComplete="off" className={fieldClass} />
        </Field>
        <div>
          <SaveButton>Toevoegen</SaveButton>
        </div>
      </AdminForm>
    </div>
  )
}

function ResetButton({ onReset }: { onReset: () => Promise<void> }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  return (
    <div className="grid gap-1">
      <button
        type="button"
        className={`${ghostBtn} inline-flex items-center gap-2`}
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          setError('')
          try {
            await onReset()
          } catch (err) {
            setError(staffErrorMessage(err, 'Herstellen mislukt. Probeer het opnieuw.'))
          } finally {
            setBusy(false)
          }
        }}
      >
        <KeyRound className="h-4 w-4" aria-hidden />
        {busy ? 'Bezig…' : 'Nieuw wachtwoord'}
      </button>
      {error ? (
        <p role="alert" className="text-sm font-semibold text-closed">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function CredentialsNotice({ credentials, onClose }: { credentials: Credentials; onClose: () => void }) {
  return (
    <div role="status" className="mt-6 rounded-[1.5rem] border border-teal/30 bg-mint p-5">
      <p className="font-semibold text-teal">Tijdelijk wachtwoord voor {credentials.email}</p>
      <p className="mt-2 select-all break-all rounded-xl bg-white px-4 py-3 font-mono text-lg tracking-wide text-ink">
        {credentials.password}
      </p>
      <p className="mt-2 text-sm text-ink">
        Geef dit persoonlijk of telefonisch door, niet per e-mail. Het wordt maar één keer getoond. Laat uw collega het
        na het inloggen direct wijzigen via Account.
      </p>
      <button type="button" className={`${ghostBtn} mt-3 bg-white`} onClick={onClose}>
        Ik heb het doorgegeven
      </button>
    </div>
  )
}
