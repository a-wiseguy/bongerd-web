export function Photo({
  src,
  alt,
  caption,
  className = '',
  imgClass = 'h-52 sm:h-72',
}: {
  src: string
  alt: string
  caption?: string
  className?: string
  imgClass?: string
}) {
  return (
    <figure className={className}>
      <img src={src} alt={alt} className={`w-full rounded-[1.6rem] object-cover ${imgClass}`} />
      {caption ? <figcaption className="mt-2 text-sm text-muted">{caption}</figcaption> : null}
    </figure>
  )
}

export function OpenBadge({ open, label, detail }: { open: boolean; label: string; detail: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-sm font-semibold shadow-sm">
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
  image,
  imageAlt,
}: {
  kicker?: string
  title: string
  lead?: string
  image?: string
  imageAlt?: string
}) {
  return (
    <section className="orchard-wash border-b border-line">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        {kicker ? <p className="text-sm font-semibold tracking-wide text-navy">{kicker}</p> : null}
        <h1 className="mt-2 max-w-3xl font-serif text-4xl leading-tight text-navy sm:text-5xl">{title}</h1>
        {lead ? <p className="mt-4 max-w-2xl text-lg text-muted">{lead}</p> : null}
        {image ? (
          <img
            src={image}
            alt={imageAlt ?? ''}
            className="mt-8 h-52 w-full rounded-[1.8rem] object-cover shadow-card sm:h-80"
          />
        ) : null}
      </div>
    </section>
  )
}

export function Prose({ text }: { text: string }) {
  return (
    <div className="prose-site max-w-3xl">
      {text.split(/\n{2,}/).map((p) => (
        <p key={p.slice(0, 40)}>{p}</p>
      ))}
    </div>
  )
}
