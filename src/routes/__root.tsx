import type { ReactNode } from 'react'
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
import { getLocations } from '@/server/public'
import { pharmacyJsonLd, seo } from '@/lib/seo'
import appCss from '@/styles.css?url'

export const Route = createRootRoute({
  loader: () => getLocations(),
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      ...seo({
        title: 'Apotheek De Bongerd',
        description:
          'Zelfstandige apotheek in Kesteren, Ochten en Rhenen. Openingstijden, herhaalrecepten, bezorging en persoonlijk advies.',
      }),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&display=swap',
      },
      { rel: 'icon', href: '/favicon.png', type: 'image/png' },
      { rel: 'apple-touch-icon', href: '/favicon.png' },
    ],
  }),
  component: RootComponent,
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-20">
      <h1 className="font-serif text-4xl text-navy">Pagina niet gevonden</h1>
      <p className="mt-3 text-muted">Deze pagina bestaat niet. Ga terug naar home of gebruik het menu.</p>
      <a href="/" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-navy px-5 font-semibold text-white">
        Naar home
      </a>
    </div>
  ),
})

function RootComponent() {
  const locations = Route.useLoaderData()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isAdmin = pathname.startsWith('/beheer')

  return (
    <RootDocument jsonLd={pharmacyJsonLd(locations)}>
      {isAdmin ? (
        <Outlet />
      ) : (
        <div className="min-h-dvh">
          <SiteHeader />
          <main id="inhoud" tabIndex={-1}>
            <Outlet />
          </main>
          <SiteFooter locations={locations} />
          <MobileBar locations={locations} />
        </div>
      )}
    </RootDocument>
  )
}

function RootDocument({
  children,
  jsonLd,
}: {
  children: ReactNode
  jsonLd: unknown
}) {
  const jsonLdScript = JSON.stringify(jsonLd).replace(/[<>&]/g, (character) =>
    ({ '<': '\\u003c', '>': '\\u003e', '&': '\\u0026' })[character]!,
  )

  return (
    <html lang="nl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript }}
        />
        <Scripts />
      </body>
    </html>
  )
}
