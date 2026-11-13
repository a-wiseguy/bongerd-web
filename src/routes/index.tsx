import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Info, MapPinned, Phone, Repeat, Siren } from 'lucide-react'
import { Img } from '@/components/Img'
import { OpenBadge, Prose } from '@/components/PageHero'
import { blockMap, formatNlDate, heading, mapsHref, text } from '@/lib/format'
import { blockImage, newsImage, photos, serviceImage } from '@/lib/images'
import { pageHead } from '@/lib/seo'
import { getHomeData } from '@/server/public'

export const Route = createFileRoute('/')({
  loader: () => getHomeData(),
  head: (ctx) =>
    pageHead(ctx, {
      title: 'Apotheek De Bongerd · Kesteren, Ochten en Rhenen',
      description:
        'Apotheek De Bongerd in Kesteren, Ochten en Rhenen. Actuele openingstijden, herhaalrecepten, bezorging, route en contact.',
      path: '/',
    }),
  component: HomePage,
})

const newsColumns: Record<number, string> = { 1: 'md:grid-cols-1', 2: 'md:grid-cols-2' }

function statusSummary(openCount: number, total: number) {
  if (openCount === 0) return 'Alle vestigingen zijn nu gesloten'
  if (openCount === total) return 'Alle vestigingen zijn nu open'
  return `${openCount} van ${total} vestigingen nu open`
}

function HomePage() {
  const { blocks, announcements, services, news, hours } = Route.useLoaderData()
  const copy = blockMap(blocks)
  const openCount = hours.filter((item) => item.status.open).length

  return (
    <div>
      <section className="orchard-wash border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold tracking-wide text-teal">Kesteren · Ochten · Rhenen</p>
            <h1 className="mt-3 font-serif text-5xl leading-[1.05] text-navy sm:text-6xl">
              {heading(copy, 'home.hero', 'Zorg om de hoek')}
            </h1>
            <Prose html={text(copy, 'home.hero')} className="prose-lead mt-5 max-w-xl text-xl text-muted" />
            <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-base">
              <OpenBadge open={openCount > 0} label={statusSummary(openCount, hours.length)} />
              {openCount === 0 ? (
                <Link
                  to="/openingstijden"
                  hash="dienstapotheek"
                  className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-navy underline underline-offset-4"
                >
                  <Siren className="h-4 w-4" aria-hidden />
                  Spoed? Dienstapotheek
                </Link>
              ) : null}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                to="/diensten"
                hash="herhaalrecepten"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-navy px-6 font-semibold text-white transition hover:bg-navy-deep"
              >
                <Repeat className="h-5 w-5" aria-hidden />
                Herhaalrecept aanvragen
              </Link>
              <Link
                to="/contact"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-navy/25 bg-white px-6 font-semibold text-navy transition hover:border-navy"
              >
                <MapPinned className="h-5 w-5" aria-hidden />
                Contact en route
              </Link>
            </div>
          </div>
          <div className="grid gap-3">
            {hours.map((item) => (
              <article key={item.location.id} className="rounded-3xl border border-line bg-white p-5 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-2xl text-navy">{item.location.name}</h2>
                    <p className="text-sm text-muted">{item.location.address}</p>
                  </div>
                  <OpenBadge open={item.status.open} label={item.status.open ? 'Open' : 'Gesloten'} />
                </div>
                <p className="mt-2 text-sm font-semibold text-ink">{item.status.detail}</p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
                  <a
                    className="inline-flex min-h-11 items-center gap-2 font-semibold text-navy underline-offset-4 hover:underline"
                    href={`tel:${item.location.phoneTel}`}
                  >
                    <Phone className="h-4 w-4" aria-hidden />
                    <span className="sr-only">Bel {item.location.name}: </span>
                    {item.location.phone}
                  </a>
                  <a
                    className="inline-flex min-h-11 items-center gap-2 font-semibold text-navy underline-offset-4 hover:underline"
                    href={mapsHref(item.location.mapsQuery)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPinned className="h-4 w-4" aria-hidden />
                    Route
                    <span className="sr-only"> naar {item.location.name} (opent Google Maps)</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {announcements.length > 0 ? (
        <section aria-labelledby="actueel" className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
          <h2 id="actueel" className="sr-only">
            Mededelingen
          </h2>
          <div className="grid gap-3">
            {announcements.map((item) => (
              <article
                key={item.id}
                className="flex gap-4 rounded-3xl border border-teal/20 bg-mint px-5 py-5 sm:px-6"
              >
                <Info className="mt-1 h-6 w-6 shrink-0 text-teal" aria-hidden />
                <div className="min-w-0">
                  <h3 className="font-serif text-2xl text-navy">{item.title}</h3>
                  <Prose html={item.body} className="mt-1 max-w-3xl text-ink" />
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid overflow-hidden rounded-[2rem] bg-navy text-white lg:grid-cols-[1.1fr_0.9fr]">
          <div className="px-6 py-10 sm:px-10 sm:py-12">
            <h2 className="font-serif text-3xl sm:text-4xl">{heading(copy, 'home.intro', 'Zelfstandig en dichtbij')}</h2>
            <Prose html={text(copy, 'home.intro')} className="mt-4 max-w-3xl text-sky" />
            <Link
              to="/over-ons"
              className="mt-6 inline-flex min-h-12 items-center gap-2 font-semibold underline underline-offset-4"
            >
              Meer over ons <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <Img
            image={blockImage(copy['home.intro'], photos.john)}
            sizes="(min-width: 1024px) 460px, 100vw"
            className="h-60 w-full object-cover lg:h-full"
          />
        </div>
      </section>

      {services.length > 0 ? (
        <section aria-labelledby="home-diensten" className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <h2 id="home-diensten" className="font-serif text-3xl text-navy sm:text-4xl">
              Wat wij voor u doen
            </h2>
            <Link
              to="/diensten"
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 font-semibold text-navy underline-offset-4 hover:underline"
            >
              Alle diensten <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <li key={service.id}>
                <Link
                  to="/diensten"
                  hash={service.slug}
                  className="card-link group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-card"
                >
                  <Img
                    image={serviceImage(service.slug, { src: service.imageUrl, alt: service.imageAlt })}
                    decorative
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="h-40 w-full object-cover"
                  />
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-serif text-2xl text-navy group-hover:underline group-hover:underline-offset-4">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-muted">{service.summary}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {news.length > 0 ? (
        <section aria-labelledby="home-nieuws" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <h2 id="home-nieuws" className="font-serif text-3xl text-navy sm:text-4xl">
              Nieuws
            </h2>
            <Link
              to="/nieuws"
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 font-semibold text-navy underline-offset-4 hover:underline"
            >
              Al het nieuws <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <ul className={`mt-6 grid gap-4 ${newsColumns[news.length] ?? 'md:grid-cols-3'}`}>
            {news.map((post, index) => (
              <li key={post.id}>
                <Link
                  to="/nieuws/$slug"
                  params={{ slug: post.slug }}
                  className={`card-link group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-card ${news.length === 1 ? 'md:flex-row' : ''}`}
                >
                  <Img
                    image={newsImage(post, index)}
                    decorative
                    sizes={news.length === 1 ? '(min-width: 768px) 40vw, 100vw' : `(min-width: 768px) ${Math.round(100 / news.length)}vw, 100vw`}
                    className={`h-40 w-full object-cover ${news.length === 1 ? 'md:h-auto md:min-h-56 md:w-2/5' : news.length === 2 ? 'md:h-52' : ''}`}
                  />
                  <div className={`flex flex-1 flex-col p-6 ${news.length === 1 ? 'md:justify-center md:p-8' : ''}`}>
                    <p className="text-sm font-semibold text-teal">
                      <time dateTime={new Date(post.publishedAt).toISOString()}>{formatNlDate(post.publishedAt)}</time>
                    </p>
                    <h3 className="mt-1 font-serif text-2xl text-navy group-hover:underline group-hover:underline-offset-4">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-muted">{post.excerpt}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 pb-6 sm:px-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex gap-4">
            <Siren className="mt-1 h-6 w-6 shrink-0 text-closed" aria-hidden />
            <div>
              <h2 className="font-serif text-2xl text-navy">Medicijnen nodig buiten openingstijden?</h2>
              <p className="mt-1 text-muted">De dienstapotheek in de regio is 24 uur per dag bereikbaar.</p>
            </div>
          </div>
          <Link
            to="/openingstijden"
            hash="dienstapotheek"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-navy px-5 font-semibold text-white transition hover:bg-navy-deep"
          >
            Naar de dienstapotheek <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  )
}
