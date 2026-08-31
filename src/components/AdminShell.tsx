import type { ReactNode } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { logoutFn } from '@/server/auth'

const items = [
  { to: '/beheer', label: 'Overzicht', exact: true },
  { to: '/beheer/content', label: 'Teksten' },
  { to: '/beheer/openingstijden', label: 'Openingstijden' },
  { to: '/beheer/mededelingen', label: 'Mededelingen' },
  { to: '/beheer/nieuws', label: 'Nieuws' },
  { to: '/beheer/diensten', label: 'Diensten' },
  { to: '/beheer/berichten', label: 'Berichten' },
] as const

export function AdminShell({
  email,
  children,
}: {
  email: string
  children: ReactNode
}) {
  const router = useRouter()
  const pathname = router.state.location.pathname

  return (
    <div className="min-h-dvh bg-paper">
      <a className="skip-link" href="#beheer-inhoud">
        Naar inhoud
      </a>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <p className="font-serif text-2xl text-navy">Beheer</p>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted sm:inline">{email}</span>
            <button
              type="button"
              className="min-h-12 rounded-full border border-line px-4 font-semibold text-navy"
              onClick={async () => {
                await logoutFn()
                window.location.assign('/beheer/login')
              }}
            >
              Uitloggen
            </button>
          </div>
        </div>
        <nav className="mx-auto max-w-6xl overflow-x-auto px-4 pb-3 sm:px-6" aria-label="Beheer">
          <ul className="flex gap-1">
            {items.map((item) => {
              const active = 'exact' in item ? pathname === item.to : pathname.startsWith(item.to)
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    aria-current={active ? 'page' : undefined}
                    className={`inline-flex min-h-11 shrink-0 items-center rounded-full px-3 py-2 text-sm font-semibold ${
                      active ? 'bg-navy text-white' : 'text-navy hover:bg-mist'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </header>
      <main id="beheer-inhoud" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  )
}

export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-semibold text-navy">{label}</span>
      {children}
    </label>
  )
}

export const fieldClass =
  'min-h-12 w-full rounded-2xl border border-line bg-white px-4 py-3 text-base'
export const btnClass =
  'min-h-12 rounded-full bg-navy px-5 font-semibold text-white disabled:opacity-60'
export const ghostBtn =
  'min-h-12 rounded-full border border-line px-5 font-semibold text-navy'
