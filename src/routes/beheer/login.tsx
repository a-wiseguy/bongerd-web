import { createFileRoute, useHydrated } from '@tanstack/react-router'
import { useState } from 'react'
import { loginFn } from '@/server/auth'
import { btnClass, fieldClass } from '@/components/AdminShell'
import { Img } from '@/components/Img'
import { photos } from '@/lib/images'
import { pageHead } from '@/lib/seo'

export const Route = createFileRoute('/beheer/login')({
  head: (ctx) => pageHead(ctx, { title: 'Inloggen · Beheer', description: 'Inloggen voor het apotheekteam.', noindex: true }),
  component: LoginPage,
})

function LoginPage() {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const hydrated = useHydrated()

  return (
    <main className="relative flex min-h-dvh items-center justify-center px-4">
      <Img image={photos.orchard} decorative priority sizes="100vw" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-navy/55" aria-hidden="true" />
      <form
        method="post"
        className="relative z-10 w-full max-w-md rounded-[1.8rem] border border-line bg-white p-8"
        aria-labelledby="login-title"
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
          }).catch(() => ({ error: 'Inloggen mislukt. Probeer het opnieuw.' as const }))
          if ('error' in result && result.error) {
            setError(result.error)
            setBusy(false)
            return
          }
          window.location.assign('/beheer')
        }}
      >
        <img src="/brand/logo.png" alt="Apotheek De Bongerd" className="h-12 w-auto" />
        <h1 id="login-title" className="mt-6 font-serif text-4xl text-navy">
          Beheer
        </h1>
        <p className="mt-2 text-muted">Alleen voor het apotheekteam.</p>
        <label className="mt-6 grid gap-1">
          <span className="text-sm font-semibold text-navy">E-mail</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'login-error' : undefined}
            className={fieldClass}
          />
        </label>
        <label className="mt-4 grid gap-1">
          <span className="text-sm font-semibold text-navy">Wachtwoord</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'login-error' : undefined}
            className={fieldClass}
          />
        </label>
        {error ? (
          <p id="login-error" className="mt-3 text-closed" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={busy || !hydrated} className={`${btnClass} mt-6 w-full`}>
          {busy ? 'Inloggen…' : 'Inloggen'}
        </button>
      </form>
    </main>
  )
}
