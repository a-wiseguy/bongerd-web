import type { ReactNode } from 'react'

export type AdminIndexItem = {
  id: string
  label: string
}

function jumpTo(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  history.replaceState(null, '', `#${id}`)
}

function IndexLinks({
  items,
  variant,
}: {
  items: AdminIndexItem[]
  variant: 'rail' | 'chips'
}) {
  if (variant === 'chips') {
    return (
      <ul className="flex gap-2 overflow-x-auto pb-1">
        {items.map((item) => (
          <li key={item.id} className="shrink-0">
            <a
              href={`#${item.id}`}
              className="inline-flex min-h-10 items-center rounded-full border border-line bg-white px-3.5 text-sm font-semibold text-navy hover:border-navy/30 hover:bg-mist"
              onClick={(event) => {
                event.preventDefault()
                jumpTo(item.id)
              }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul className="grid gap-0.5">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className="group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-semibold text-navy/85 transition hover:bg-mist hover:text-navy"
            onClick={(event) => {
              event.preventDefault()
              jumpTo(item.id)
            }}
          >
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-navy/25 transition group-hover:bg-navy"
              aria-hidden
            />
            <span className="min-w-0 truncate">{item.label}</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

export function AdminIndexedPage({
  items,
  children,
  title = 'Secties',
}: {
  items: AdminIndexItem[]
  children: ReactNode
  title?: string
}) {
  if (items.length < 2) {
    return <div>{children}</div>
  }

  return (
    <div className="lg:grid lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:items-start lg:gap-8">
      <aside className="sticky top-6 hidden lg:block" aria-label={title}>
        <nav className="rounded-2xl border border-line bg-white/90 p-3 shadow-[0_1px_0_rgb(0_22_137/0.04)]">
          <p className="px-2.5 pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted">
            {title}
          </p>
          <IndexLinks items={items} variant="rail" />
        </nav>
      </aside>

      <div className="min-w-0">
        <nav className="mb-5 lg:hidden" aria-label={title}>
          <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted">
            {title}
          </p>
          <IndexLinks items={items} variant="chips" />
        </nav>
        {children}
      </div>
    </div>
  )
}
