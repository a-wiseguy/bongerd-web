import { Link } from '@tanstack/react-router'
import type { Location } from '@/lib/schema'

export function SiteFooter({ locations }: { locations: Location[] }) {
  return (
    <footer className="mt-16 border-t border-line bg-navy text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        {locations.map((loc) => (
          <section key={loc.id} aria-labelledby={`footer-${loc.slug}`}>
            <h2 id={`footer-${loc.slug}`} className="font-serif text-2xl">
              {loc.name}
            </h2>
            <p className="mt-3 text-sky">
              {loc.address}
              <br />
              {loc.postal} {loc.city}
            </p>
            <p className="mt-3">
              <a className="font-semibold underline decoration-sky/60 underline-offset-4" href={`tel:${loc.phoneTel}`}>
                <span className="sr-only">Bel {loc.name}: </span>
                {loc.phone}
              </a>
            </p>
            <p className="mt-1">
              <a className="underline decoration-sky/60 underline-offset-4" href={`mailto:${loc.email}`}>
                {loc.email}
              </a>
            </p>
          </section>
        ))}
      </div>
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-sm text-sky sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Apotheek De Bongerd</p>
          <Link to="/privacy" className="font-semibold text-white underline underline-offset-4">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  )
}
