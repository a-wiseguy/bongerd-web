import { ArrowUpRight } from 'lucide-react'
import { enrichCmsHtml } from '@/lib/cmsRichText'

export function DienstenJumpNav({
  items,
}: {
  items: { id: string; label: string }[]
}) {
  return (
    <nav aria-label="Diensten op deze pagina" className="mb-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal">Snel naar</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="inline-flex min-h-10 items-center rounded-full border border-line bg-white px-4 text-sm font-semibold text-navy shadow-sm transition hover:border-navy/25 hover:bg-mist"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function ServiceBody({ body }: { body: string }) {
  return (
    <div
      className="prose-site service-prose text-muted [&_a]:font-semibold [&_strong]:text-ink"
      dangerouslySetInnerHTML={{ __html: enrichCmsHtml(body) }}
    />
  )
}

export function ServiceActionLink({
  href,
  external,
  label,
}: {
  href: string
  external?: boolean
  label: string
}) {
  return (
    <a
      href={href}
      className="mt-5 inline-flex min-h-12 items-center gap-2 font-semibold text-navy underline-offset-4 hover:underline"
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {label}
      <ArrowUpRight className="h-4 w-4" aria-hidden />
      {external ? <span className="sr-only">, opent in een nieuw tabblad</span> : null}
    </a>
  )
}
