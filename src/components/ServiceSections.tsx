import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  ArrowUpRight,
  Box,
  CheckCircle2,
  FileText,
  FlaskConical,
  HeartPulse,
  MessagesSquare,
  Pill,
  Plane,
  Repeat,
  Sparkles,
  Truck,
} from 'lucide-react'
import { serviceBodyHtml, serviceDisplayParts, serviceFragmentHtml } from '@/lib/serviceContent'

const serviceIcons: Record<string, LucideIcon> = {
  herhaalrecepten: Repeat,
  herhaalservice: Repeat,
  bezorgdienst: Truck,
  afhaalautomaat: Box,
  baxter: Pill,
  bereiding: FlaskConical,
  medicatiebegeleiding: HeartPulse,
  diabetes: Activity,
  huidverzorging: Sparkles,
  medicijnpaspoort: FileText,
  reisadvies: Plane,
  gesprek: MessagesSquare,
}

function iconForService(slug: string): LucideIcon {
  return serviceIcons[slug] ?? CheckCircle2
}

export function DienstenPageNav({
  items,
}: {
  items: { id: string; label: string }[]
}) {
  return (
    <nav
      aria-label="Diensten op deze pagina"
      className="rounded-[1.8rem] border border-line bg-white p-5 shadow-card lg:sticky lg:top-24"
    >
      <p className="text-sm font-semibold uppercase tracking-wide text-teal">Snel naar</p>
      <ul className="mt-4 grid max-h-[min(70vh,28rem)] gap-1 overflow-y-auto pr-1">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="flex min-h-10 items-center rounded-xl px-3 text-[0.92rem] font-semibold leading-snug text-navy transition hover:bg-mist focus-visible:bg-mist"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function ServiceBody({ slug, body }: { slug: string; body: string }) {
  const parts = serviceDisplayParts(body)
  const Icon = iconForService(slug)

  if (parts.listItems.length >= 2) {
    return (
      <div className="space-y-4 text-muted">
        {parts.introHtml ? (
          <div
            className="prose-site text-[1.02rem] leading-relaxed text-ink [&_a]:font-semibold"
            dangerouslySetInnerHTML={{ __html: serviceFragmentHtml(parts.introHtml) }}
          />
        ) : null}
        <ul className="grid gap-2.5">
          {parts.listItems.map((item) => (
            <li
              key={item}
              className="flex gap-3 rounded-2xl border border-line/70 bg-mist/60 px-3.5 py-3 text-[0.98rem] leading-snug text-ink"
            >
              <span
                className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-teal"
                aria-hidden
              >
                <Icon className="h-4 w-4" strokeWidth={1.85} />
              </span>
              <span
                className="[&_a]:font-semibold [&_a]:text-navy"
                dangerouslySetInnerHTML={{
                  __html: serviceFragmentHtml(
                    item.includes('<') ? item : `<p>${item}</p>`,
                  ),
                }}
              />
            </li>
          ))}
        </ul>
        {parts.tailHtml ? (
          <div
            className="prose-site [&_a]:font-semibold"
            dangerouslySetInnerHTML={{ __html: serviceFragmentHtml(parts.tailHtml) }}
          />
        ) : null}
      </div>
    )
  }

  return (
    <div
      className="prose-site text-muted [&_a]:font-semibold [&_strong]:text-ink"
      dangerouslySetInnerHTML={{ __html: serviceBodyHtml(body) }}
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
      className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-full bg-mist px-5 font-semibold text-navy transition hover:bg-sky/40"
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {label}
      <ArrowUpRight className="h-4 w-4" aria-hidden />
      {external ? <span className="sr-only">, opent in een nieuw tabblad</span> : null}
    </a>
  )
}
