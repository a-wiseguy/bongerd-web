import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { MapPinned, Phone, Repeat } from 'lucide-react'
import type { Location } from '@/lib/schema'
import { mapsHref } from '@/lib/format'

export function MobileBar({ locations }: { locations: Location[] }) {
  const [sheet, setSheet] = useState<'call' | 'route' | null>(null)

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
            onClick={() => setSheet(sheet === 'call' ? null : 'call')}
          >
            <Phone className="h-5 w-5" aria-hidden />
            Bellen
          </button>
          <button
            type="button"
            className="flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl text-sm font-semibold text-navy"
            onClick={() => setSheet(sheet === 'route' ? null : 'route')}
          >
            <MapPinned className="h-5 w-5" aria-hidden />
            Route
          </button>
          <Link
            to="/diensten"
            hash="herhaalrecepten"
            className="flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl bg-navy text-sm font-semibold text-white"
          >
            <Repeat className="h-5 w-5" aria-hidden />
            Herhaal
          </Link>
        </div>
      </nav>
      {sheet ? (
        <div className="fixed inset-x-0 bottom-20 z-40 px-3 pb-[env(safe-area-inset-bottom)] lg:hidden">
          <div className="mx-auto max-w-lg rounded-3xl border border-line bg-white p-4 shadow-card">
            <p className="font-serif text-2xl text-navy">{sheet === 'call' ? 'Bellen' : 'Route'}</p>
            <ul className="mt-3 grid gap-2">
              {locations.map((loc) => (
                <li key={loc.id}>
                  <a
                    className="flex min-h-14 items-center justify-between rounded-2xl bg-mist px-4 py-3 font-semibold text-navy"
                    href={sheet === 'call' ? `tel:${loc.phoneTel}` : mapsHref(loc.mapsQuery)}
                  >
                    <span>{loc.name}</span>
                    <span className="text-sm font-medium text-muted">
                      {sheet === 'call' ? loc.phone : 'Kaart'}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-3 w-full min-h-12 rounded-2xl text-sm font-semibold text-muted"
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
