import type { ReactNode } from 'react'
import { emergencyPharmacies, locationSeed } from '@/lib/practice'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useRouterState,
} from '@tanstack/react-router'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { MobileBar } from '@/components/MobileBar'
import { NotFound } from '@/components/NotFound'
import { getSiteShell } from '@/server/public'
import { pageHead } from '@/lib/seo'
import appCss from '@/styles.css?url'

export const Route = createRootRoute({
  loader: () => getSiteShell(),
  staleTime: 5 * 60 * 1000,
  head: (ctx) => {
    const { meta, links } = pageHead(ctx, {
      title: 'Apotheek De Bongerd',
      description:
        'Zelfstandige apotheek in Kesteren, Ochten en Rhenen. Openingstijden, herhaalrecepten, bezorging en persoonlijk advies.',
    })
    return {
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#001689' },
        ...meta,
      ],
      links: [
        { rel: 'stylesheet', href: appCss },
        { rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
        { rel: 'icon', href: '/icon-192.png', type: 'image/png', sizes: '192x192' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        ...links,
      ],
    }
  },
  component: RootComponent,
  errorComponent: RootError,
  notFoundComponent: () => <NotFound />,
})

function RootComponent() {
  const { locations, jsonLd } = Route.useLoaderData()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isAdmin = pathname.startsWith('/beheer')

  return (
    <RootDocument jsonLd={isAdmin ? undefined : jsonLd}>
      {isAdmin ? (
        <Outlet />
      ) : (
        <div className="flex min-h-dvh flex-col">
          <SiteHeader />
          <main id="inhoud" tabIndex={-1} className="flex-1 outline-none">
            <Outlet />
          </main>
          <SiteFooter />
          <MobileBar locations={locations} />
        </div>
      )}
    </RootDocument>
  )
}

function RootError({ reset }: { reset: () => void }) {
  return (
    <RootDocument>
      <main className="min-h-dvh bg-paper px-4">
        <div className="mx-auto w-full max-w-2xl py-16">
          <div className="inline-flex rounded-2xl bg-white px-4 py-3 shadow-card">
            <img src="/brand/logo.png" alt="Apotheek De Bongerd" className="h-12 w-auto" />
          </div>
          <h1 className="mt-6 font-serif text-4xl text-navy">De pagina kan nu niet geladen worden</h1>
          <p className="mt-3 text-muted">
            Er ging iets mis aan onze kant. Probeer het zo opnieuw. Heeft u een vraag, bel dan gerust uw vestiging.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              className="min-h-12 rounded-full bg-navy px-5 font-semibold text-white"
              onClick={() => reset()}
            >
              Opnieuw proberen
            </button>
            <a
              href="/"
              className="inline-flex min-h-12 items-center rounded-full border border-line bg-white px-5 font-semibold text-navy"
            >
              Naar home
            </a>
          </div>
          <section aria-labelledby="error-phones" className="mt-10 rounded-[1.5rem] border border-line bg-white p-5 sm:p-6">
            <h2 id="error-phones" className="font-serif text-2xl text-navy">
              Bel ons
            </h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-3">
              {locationSeed.map((loc) => (
                <li key={loc.slug}>
                  <p className="font-semibold text-ink">{loc.name}</p>
                  <a href={`tel:${loc.phoneTel}`} className="inline-flex min-h-11 items-center font-semibold text-navy underline underline-offset-4">
                    {loc.phone}
                  </a>
                </li>
              ))}
            </ul>
            <h3 className="mt-5 border-t border-line pt-4 font-semibold text-navy">Spoed buiten openingstijden</h3>
            <ul className="mt-2 grid gap-2 text-sm">
              {emergencyPharmacies.map((item) => (
                <li key={item.name}>
                  <span className="text-muted">Vanuit {item.area}:</span>{' '}
                  <span className="font-semibold text-ink">{item.name}</span>,{' '}
                  <a href={`tel:${item.phoneTel}`} className="font-semibold text-navy underline underline-offset-4">
                    {item.phone}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </RootDocument>
  )
}

function RootDocument({ children, jsonLd }: { children: ReactNode; jsonLd?: string }) {
  return (
    <html lang="nl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} /> : null}
        <Scripts />
      </body>
    </html>
  )
}
