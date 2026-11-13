import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { logoutFn } from '@/server/auth'

const items = [
  { to: '/beheer', label: 'Overzicht', exact: true },
  { to: '/beheer/content', label: 'Teksten' },
  { to: '/beheer/openingstijden', label: 'Openingstijden' },
  { to: '/beheer/mededelingen', label: 'Mededelingen' },
  { to: '/beheer/nieuws', label: 'Nieuws' },
  { to: '/beheer/diensten', label: 'Diensten' },
  { to: '/beheer/berichten', label: 'Berichten' },
  { to: '/beheer/team', label: 'Team' },
  { to: '/beheer/account', label: 'Account' },
] as const

export function AdminShell({
  email,
  children,
}: {
  email: string
  children: ReactNode
}) {
  return (
    <div className="min-h-dvh bg-paper">
      <a className="skip-link" href="#beheer-inhoud">
        Naar inhoud
      </a>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <p className="font-serif text-2xl text-navy">Beheer</p>
          <div className="flex items-center gap-2 text-sm sm:gap-3">
            <Link
              to="/beheer/account"
              title="Account en wachtwoord"
              activeProps={{ 'aria-current': 'page' }}
              className="hidden min-h-12 max-w-56 items-center truncate rounded-full px-3 text-muted hover:bg-mist hover:text-navy aria-[current=page]:text-navy sm:inline-flex"
            >
              {email}
            </Link>
            <Link to="/" className="inline-flex min-h-12 items-center rounded-full px-3 font-semibold text-navy hover:bg-mist">
              Bekijk site
            </Link>
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
            {items.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeOptions={'exact' in item ? { exact: true } : undefined}
                  activeProps={{ 'aria-current': 'page' }}
                  className="inline-flex min-h-11 shrink-0 items-center rounded-full px-3 py-2 text-sm font-semibold text-navy hover:bg-mist aria-[current=page]:bg-navy aria-[current=page]:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
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
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-semibold text-navy">{label}</span>
      {children}
      {hint ? <span className="text-sm text-muted">{hint}</span> : null}
    </label>
  )
}

export function PublishField({ defaultChecked = true }: { defaultChecked?: boolean }) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-line bg-paper px-4 py-3">
      <input name="published" type="checkbox" defaultChecked={defaultChecked} className="mt-1 h-4 w-4 accent-navy" />
      <span>
        <span className="block text-sm font-semibold text-navy">Zichtbaar op de site</span>
        <span className="block text-sm text-muted">Uitvinken haalt het weg voor bezoekers.</span>
      </span>
    </label>
  )
}

export const fieldClass =
  'min-h-12 w-full rounded-2xl border border-line bg-white px-4 py-3 text-base'
export const btnClass =
  'min-h-12 rounded-full bg-navy px-5 font-semibold text-white disabled:opacity-60'
export const ghostBtn =
  'min-h-12 rounded-full border border-line px-5 font-semibold text-navy'
