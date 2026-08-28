import { useEffect, useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'

const links = [
  { to: '/', label: 'Home' },
  { to: '/over-ons', label: 'Over ons' },
  { to: '/openingstijden', label: 'Openingstijden' },
  { to: '/diensten', label: 'Diensten' },
  { to: '/nieuws', label: 'Nieuws' },
  { to: '/contact', label: 'Contact' },
] as const

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/92 backdrop-blur-md">
      <a className="skip-link" href="#inhoud">
        Naar inhoud
      </a>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex min-h-12 items-center" aria-label="Apotheek De Bongerd" onClick={() => setOpen(false)}>
          <img
            src="/brand/logo.png"
            alt=""
            width={300}
            height={121}
            className="h-11 w-auto sm:h-14"
          />
        </Link>
        <nav className="hidden lg:block" aria-label="Hoofdmenu">
          <ul className="flex items-center gap-1">
            {links.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  activeOptions={link.to === '/' ? { exact: true } : undefined}
                  activeProps={{ 'aria-current': 'page' }}
                  className="inline-flex min-h-11 items-center rounded-full px-3.5 py-2 text-[0.95rem] font-semibold tracking-wide text-navy hover:bg-mist aria-[current=page]:bg-navy aria-[current=page]:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button
          type="button"
          className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-full border border-line bg-white text-navy lg:hidden"
          aria-expanded={open}
          aria-controls="mobiel-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X aria-hidden /> : <Menu aria-hidden />}
          <span className="sr-only">{open ? 'Menu sluiten' : 'Menu openen'}</span>
        </button>
      </div>
      {open ? (
        <div id="mobiel-menu" className="border-t border-line bg-white px-4 py-4 lg:hidden">
          <nav aria-label="Mobiel menu">
            <ul className="grid gap-1">
              {links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    activeOptions={link.to === '/' ? { exact: true } : undefined}
                    activeProps={{ 'aria-current': 'page' }}
                    className="block rounded-2xl px-4 py-3 text-lg font-semibold text-navy hover:bg-mist aria-[current=page]:bg-mist"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
