import { Link } from '@tanstack/react-router'

const pages = [
  { to: '/', label: 'Home' },
  { to: '/over-ons', label: 'Over ons' },
  { to: '/openingstijden', label: 'Openingstijden' },
  { to: '/diensten', label: 'Diensten' },
  { to: '/nieuws', label: 'Nieuws' },
  { to: '/contact', label: 'Contact' },
] as const

const handy = [
  { to: '/diensten', hash: 'herhaalrecepten', label: 'Herhaalrecept' },
  { to: '/openingstijden', label: 'Nu open of gesloten?' },
  { to: '/openingstijden', hash: 'dienstapotheek', label: 'Spoed buiten openingstijden' },
  { to: '/contact', label: 'Route en adressen' },
  { to: '/privacy', label: 'Privacy' },
] as const

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative mt-16 overflow-hidden bg-navy-deep text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 8% 20%, rgb(213 220 237 / 0.18), transparent 42%), radial-gradient(ellipse at 92% 0%, rgb(31 95 90 / 0.28), transparent 38%)',
        }}
      />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.35fr_1fr_1fr]">
        <div>
          <p className="font-serif text-3xl leading-tight tracking-tight sm:text-4xl">Apotheek De Bongerd</p>
          <p className="mt-4 max-w-md text-base leading-relaxed text-sky">
            Zelfstandige apotheek met vaste teams in Kesteren, Ochten en Rhenen — dichtbij, met korte lijnen.
          </p>
          <p className="mt-5 text-sm font-semibold tracking-wide text-sky/90">Kesteren · Ochten · Rhenen</p>
          <a
            href="https://home.mijngezondheid.net"
            className="mt-6 inline-flex min-h-11 items-center rounded-full bg-white px-4 text-sm font-semibold text-navy transition hover:bg-mist"
            rel="noopener noreferrer"
            target="_blank"
          >
            MijnGezondheid.net
            <span className="sr-only"> (opent in nieuw tabblad)</span>
          </a>
        </div>

        <nav aria-labelledby="footer-paginas">
          <h2 id="footer-paginas" className="text-sm font-semibold uppercase tracking-[0.14em] text-sky">
            Pagina&apos;s
          </h2>
          <ul className="mt-4 grid gap-1">
            {pages.map((page) => (
              <li key={page.to}>
                <Link
                  to={page.to}
                  activeOptions={page.to === '/' ? { exact: true } : undefined}
                  className="inline-flex min-h-10 items-center text-[1.05rem] font-semibold text-white/95 underline-offset-4 hover:underline"
                >
                  {page.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-handig">
          <h2 id="footer-handig" className="text-sm font-semibold uppercase tracking-[0.14em] text-sky">
            Handig
          </h2>
          <ul className="mt-4 grid gap-1">
            {handy.map((item) => (
              <li key={`${item.to}-${item.hash ?? item.label}`}>
                <Link
                  to={item.to}
                  hash={'hash' in item ? item.hash : undefined}
                  className="inline-flex min-h-10 items-center text-[1.05rem] font-semibold text-white/95 underline-offset-4 hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="relative border-t border-white/12">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-sm text-sky sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {year} Apotheek De Bongerd</p>
          <p className="text-sky/80">Vragen? Bel uw vestiging of stuur een bericht via contact.</p>
        </div>
      </div>
    </footer>
  )
}
