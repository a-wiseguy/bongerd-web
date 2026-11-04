import { useEffect, useId, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { MapPinned, Phone, Repeat } from 'lucide-react'
import type { Location } from '@/lib/schema'
import { mapsHref } from '@/lib/format'

export function MobileBar({ locations }: { locations: Location[] }) {
  const [sheet, setSheet] = useState<'call' | 'route' | null>(null)
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sheet) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSheet(null)
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [sheet])

  return (
    <>
      <div className="h-20 lg:hidden" />
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[max(0.4rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden"
        aria-label="Snelle acties"
      >
        <div className="mx-auto grid max-w-lg grid-cols-3 gap-1 px-2 pt-2">
          <button
            type="button"
            className="flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl text-sm font-semibold text-navy"
            aria-expanded={sheet === 'call'}
            aria-controls={sheet === 'call' ? 'snel-keuze' : undefined}
            onClick={() => setSheet(sheet === 'call' ? null : 'call')}
          >
            <Phone className="h-5 w-5" aria-hidden />
            Bellen
          </button>
          <button
            type="button"
            className="flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl text-sm font-semibold text-navy"
            aria-expanded={sheet === 'route'}
            aria-controls={sheet === 'route' ? 'snel-keuze' : undefined}
            onClick={() => setSheet(sheet === 'route' ? null : 'route')}
          >
            <MapPinned className="h-5 w-5" aria-hidden />
            Route
          </button>
          <Link
            to="/diensten"
            hash="herhaalrecepten"
            className="flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl bg-navy text-sm font-semibold text-white"
            aria-label="Herhaalrecept"
          >
            <Repeat className="h-5 w-5" aria-hidden />
            Herhaal
          </Link>
        </div>
      </nav>
      {sheet ? (
        <div className="fixed inset-x-0 bottom-20 z-50 px-3 pb-[env(safe-area-inset-bottom)] lg:hidden">
          <button
            type="button"
            className="fixed inset-0 z-40 bg-navy-deep/45 lg:hidden"
            aria-label="Sluiten"
            onClick={() => setSheet(null)}
          />
          <div
            ref={panelRef}
            id="snel-keuze"
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-50 mx-auto max-w-lg rounded-3xl border border-line bg-white p-4 shadow-card outline-none"
          >
            <p id={titleId} className="font-serif text-2xl text-navy">
              {sheet === 'call' ? 'Kies een vestiging om te bellen' : 'Kies een vestiging voor de route'}
            </p>
            <ul className="mt-3 grid gap-2">
              {locations.map((loc) => (
                <li key={loc.id}>
                  <a
                    className="flex min-h-14 items-center justify-between rounded-2xl bg-mist px-4 py-3 font-semibold text-navy"
                    href={sheet === 'call' ? `tel:${loc.phoneTel}` : mapsHref(loc.mapsQuery)}
                  >
                    <span>{loc.name}</span>
                    <span className="text-sm font-medium text-muted">
                      {sheet === 'call' ? loc.phone : 'Google Maps'}
                    </span>
                    {sheet === 'route' ? <span className="sr-only">, opent Google Maps</span> : null}
                  </a>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-3 w-full min-h-12 rounded-2xl font-semibold text-navy"
              onClick={() => setSheet(null)}
            >
              Sluiten
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
