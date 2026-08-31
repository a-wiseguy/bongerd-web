import { useEffect, useState, type ReactNode } from 'react'

export type AdminIndexItem = {
  id: string
  label: string
}

function jumpTo(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  // keep hash for shareable deep links without fighting spa routing
  history.replaceState(null, '', `#${id}`)
}

function IndexLinks({
  items,
  onNavigate,
}: {
  items: AdminIndexItem[]
  onNavigate?: () => void
}) {
  return (
    <ul className="grid gap-0.5">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className="block rounded-xl px-2.5 py-1.5 text-sm font-semibold text-navy hover:bg-mist"
            onClick={(event) => {
              event.preventDefault()
              jumpTo(item.id)
              onNavigate?.()
            }}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  )
}

export function AdminPageIndex({ items }: { items: AdminIndexItem[] }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (items.length < 2) return null

  return (
    <>
      <aside
        className="pointer-events-none fixed bottom-4 right-4 z-30 hidden w-56 xl:pointer-events-auto xl:bottom-auto xl:top-28 xl:block"
        aria-label="Pagina-inhoud"
      >
        <nav className="pointer-events-auto max-h-[calc(100dvh-8rem)] overflow-y-auto rounded-[1.5rem] border border-line bg-white/95 p-3 shadow-[var(--shadow-card)] backdrop-blur-md">
          <p className="px-2.5 pb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Op deze pagina
          </p>
          <IndexLinks items={items} />
        </nav>
      </aside>

      <div className="fixed bottom-4 right-4 z-30 flex flex-col items-end xl:hidden">
        {open ? (
          <nav
            id="beheer-pagina-index"
            className="mb-2 max-h-[min(60dvh,24rem)] w-[min(18rem,calc(100vw-2rem))] overflow-y-auto rounded-[1.5rem] border border-line bg-white p-3 shadow-[var(--shadow-card)]"
            aria-label="Pagina-inhoud"
          >
            <p className="px-2.5 pb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Op deze pagina
            </p>
            <IndexLinks items={items} onNavigate={() => setOpen(false)} />
          </nav>
        ) : null}
        <button
          type="button"
          className="flex min-h-12 items-center rounded-full border border-line bg-white px-4 text-sm font-semibold text-navy shadow-[var(--shadow-card)]"
          aria-expanded={open}
          aria-controls="beheer-pagina-index"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Sluiten' : 'Inhoud'}
        </button>
      </div>
    </>
  )
}

export function AdminIndexedPage({
  items,
  children,
}: {
  items: AdminIndexItem[]
  children: ReactNode
}) {
  return (
    <div className="relative xl:pr-60">
      {children}
      <AdminPageIndex items={items} />
    </div>
  )
}
