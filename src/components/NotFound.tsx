import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

const suggestions = [
  { to: '/openingstijden', label: 'Openingstijden', hint: 'Wanneer elke vestiging open is' },
  { to: '/diensten', label: 'Diensten', hint: 'Herhaalrecepten, bezorging en meer' },
  { to: '/nieuws', label: 'Nieuws', hint: 'Actuele berichten van de apotheek' },
  { to: '/contact', label: 'Contact en route', hint: 'Telefoon, adressen en formulier' },
] as const

export function NotFound({ title = 'Deze pagina bestaat niet (meer)' }: { title?: string }) {
  return (
    <section className="orchard-wash">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="text-sm font-semibold tracking-wide text-teal">Foutcode 404</p>
        <h1 className="mt-2 font-serif text-4xl leading-tight text-navy sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-xl text-lg text-muted">
          Misschien is de pagina verplaatst of is de link niet helemaal goed. Hier vindt u de meest gezochte
          informatie.
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {suggestions.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="card-link flex h-full items-center justify-between gap-3 rounded-2xl border border-line bg-white p-5"
              >
                <span>
                  <span className="block font-semibold text-navy">{item.label}</span>
                  <span className="block text-sm text-muted">{item.hint}</span>
                </span>
                <ArrowRight className="h-5 w-5 shrink-0 text-navy" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
        <Link
          to="/"
          className="mt-8 inline-flex min-h-12 items-center rounded-full bg-navy px-5 font-semibold text-white transition hover:bg-navy-deep"
        >
          Naar de homepage
        </Link>
      </div>
    </section>
  )
}
