import { Img } from '@/components/Img'
import type { SiteImage } from '@/lib/images'

export function OpenBadge({ open, label, detail }: { open: boolean; label: string; detail?: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-sm font-semibold shadow-sm ring-1 ring-line/70">
      <span className={`h-2.5 w-2.5 rounded-full ${open ? 'bg-open' : 'bg-closed'}`} aria-hidden />
      <span className={open ? 'text-open' : 'text-closed'}>{label}</span>
      {detail ? <span className="font-medium text-muted">{detail}</span> : null}
    </span>
  )
}

export function PageHero({
  kicker,
  title,
  lead,
  leadText,
  image,
  children,
}: {
  kicker?: string
  title: string
  lead?: string
  leadText?: string
  image?: SiteImage
  children?: React.ReactNode
}) {
  return (
    <section className="orchard-wash border-b border-line">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        {kicker ? <p className="text-sm font-semibold tracking-wide text-teal">{kicker}</p> : null}
        <h1 className="mt-2 max-w-3xl font-serif text-4xl leading-tight text-navy sm:text-5xl">{title}</h1>
        {lead ? <Prose html={lead} className="prose-lead mt-4 max-w-2xl text-lg text-muted" /> : null}
        {leadText ? <p className="mt-4 max-w-2xl text-lg text-muted">{leadText}</p> : null}
        {children}
        {image ? (
          <Img
            image={image}
            priority
            sizes="(min-width: 1152px) 1104px, 100vw"
            className="mt-8 h-52 w-full rounded-[1.8rem] object-cover shadow-card sm:h-80"
          />
        ) : null}
      </div>
    </section>
  )
}

// html must be sanitized server-side (sanitize.server.ts)
export function Prose({ html, className = 'max-w-3xl' }: { html: string; className?: string }) {
  return <div className={`prose-site ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
}
