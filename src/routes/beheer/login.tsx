import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { loginFn } from '@/server/auth'
import { btnClass, fieldClass } from '@/components/AdminShell'

export const Route = createFileRoute('/beheer/login')({
  component: LoginPage,
})

function LoginPage() {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  return (
    <div className="relative flex min-h-dvh items-center justify-center px-4">
      <img
        src="/images/orchard.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-navy/55" />
      <form
        className="relative z-10 w-full max-w-md rounded-[1.8rem] border border-line bg-white p-8"
        onSubmit={async (event) => {
          event.preventDefault()
          const data = new FormData(event.currentTarget)
          setBusy(true)
          setError('')
          const result = await loginFn({
            data: {
              email: String(data.get('email') ?? ''),
              password: String(data.get('password') ?? ''),
            },
          })
          if (result?.error) {
            setError(result.error)
            setBusy(false)
            return
          }
          window.location.assign('/beheer')
        }}
      >
        <img src="/brand/logo.png" alt="" className="h-12 w-auto" />
        <h1 className="mt-6 font-serif text-4xl text-navy">Beheer</h1>
        <p className="mt-2 text-muted">Alleen voor het apotheekteam.</p>
        <label className="mt-6 grid gap-1">
          <span className="text-sm font-semibold text-navy">E-mail</span>
          <input name="email" type="email" required autoComplete="username" className={fieldClass} />
        </label>
        <label className="mt-4 grid gap-1">
          <span className="text-sm font-semibold text-navy">Wachtwoord</span>
          <input name="password" type="password" required autoComplete="current-password" className={fieldClass} />
        </label>
        {error ? <p className="mt-3 text-closed">{error}</p> : null}
        <button type="submit" disabled={busy} className={`${btnClass} mt-6 w-full`}>
          {busy ? 'Inloggen…' : 'Inloggen'}
        </button>
      </form>
    </div>
  )
}
