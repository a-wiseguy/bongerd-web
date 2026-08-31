import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Clock3, MapPinned, Phone, Repeat } from 'lucide-react'
import { OpenBadge, Photo, Prose } from '@/components/PageHero'
import { blockMap, heading, mapsHref, text } from '@/lib/format'
import { newsImage, photos, serviceImage } from '@/lib/images'
import { seo } from '@/lib/seo'
import { getHomeData } from '@/server/public'

export const Route = createFileRoute('/')({
  loader: () => getHomeData(),
  head: () => ({
    meta: seo({
      title: 'Home',
      description:
        'Apotheek De Bongerd in Kesteren, Ochten en Rhenen. Nu open of gesloten, herhaalrecepten, route en contact.',
      url: '/',
    }),
  }),
  component: HomePage,
})

function HomePage() {
  const { blocks, announcements, services, news, hours } = Route.useLoaderData()
  const copy = blockMap(blocks)
  const anyOpen = hours.some((item) => item.status.open)

  return (
    <div>
      <section className="orchard-wash">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold tracking-wide text-navy">
              Kesteren · Ochten · Rhenen
            </p>
            <h1 className="mt-3 font-serif text-5xl leading-[1.05] text-navy sm:text-6xl">
              {heading(copy, 'home.hero', 'Zorg om de hoek')}
            </h1>
            <div className="mt-5 max-w-xl text-xl text-muted">
              <Prose text={text(copy, 'home.hero')} />
            </div>
            <div className="mt-6">
              <OpenBadge
                open={anyOpen}
                label={anyOpen ? 'Nu open' : 'Nu gesloten'}
                detail={anyOpen ? 'minstens één vestiging' : 'zie openingstijden'}
              />
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Link
                to="/diensten"
                hash="herhaalrecepten"
                className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-navy px-4 font-semibold text-white"
              >
                <Repeat className="h-4 w-4" aria-hidden />
                Herhaalrecept
              </Link>
              <Link
                to="/contact"
                className="flex min-h-14 items-center justify-center gap-2 rounded-full border border-navy px-4 font-semibold text-navy"
              >
                <Phone className="h-4 w-4" aria-hidden />
                Contact
              </Link>
              <Link to="/contact" className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-mint px-4 font-semibold text-teal">
                <MapPinned className="h-4 w-4" aria-hidden />
                Route en adressen
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
                  <OpenBadge open={item.status.open} label={item.status.label} detail="" />
                </div>
                <p className="mt-3 text-sm text-muted">{item.status.detail}</p>
                <a
                  className="mt-4 inline-flex min-h-11 items-center font-semibold text-navy underline-offset-4 hover:underline"
                  href={`tel:${item.location.phoneTel}`}
                >
                  <span className="sr-only">Bel {item.location.name}: </span>
                  {item.location.phone}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-2 sm:px-6">
        <Photo
          src={photos.interior.src}
          alt={photos.interior.alt}
          imgClass="h-56 sm:h-80"
        />
      </section>

      {announcements.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h2 className="font-serif text-3xl text-navy">Actueel</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {announcements.map((item) => (
              <article key={item.id} className="rounded-3xl border border-line bg-white p-6">
                <p className="text-sm font-semibold tracking-wide text-teal">Mededeling</p>
                <h3 className="mt-2 font-serif text-2xl text-navy">{item.title}</h3>
                <div className="mt-2 text-muted">
                  <Prose text={item.body} />
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="grid overflow-hidden rounded-[2rem] bg-navy text-white lg:grid-cols-[1.1fr_0.9fr]">
          <div className="px-6 py-10 sm:px-10">
            <h2 className="font-serif text-3xl">{heading(copy, 'home.intro', 'Zelfstandig en dichtbij')}</h2>
            <div className="mt-4 max-w-3xl text-sky">
              <Prose text={text(copy, 'home.intro')} />
            </div>
            <Link to="/over-ons" className="mt-6 inline-flex min-h-12 items-center gap-2 font-semibold underline underline-offset-4">
              Meer over ons <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <img
            src={photos.consult.src}
            alt={photos.consult.alt}
            className="h-56 w-full object-cover lg:h-full"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-3xl text-navy">Diensten</h2>
          <Link to="/diensten" className="min-h-11 font-semibold text-navy underline-offset-4 hover:underline">
            Alle diensten
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const photo = serviceImage(service.slug, { src: service.imageUrl, alt: service.imageAlt })
            return (
            <a
              key={service.id}
              href={`/diensten#${service.slug}`}
              className="overflow-hidden rounded-3xl border border-line bg-white shadow-card"
            >
              <img src={photo.src} alt="" className="h-36 w-full object-cover" />
              <div className="p-6">
                <h3 className="font-serif text-2xl text-navy">{service.title}</h3>
                <p className="mt-2 text-muted">{service.summary}</p>
              </div>
            </a>
            )
          })}
        </div>
      </section>

      {news.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-3xl text-navy">Nieuws</h2>
            <Link to="/nieuws" className="min-h-11 font-semibold text-navy underline-offset-4 hover:underline">
              Al het nieuws
            </Link>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {news.map((post) => {
              const photo = newsImage(post, photos.orchard)
              return (
              <Link
                key={post.id}
                to="/nieuws/$slug"
                params={{ slug: post.slug }}
                className="overflow-hidden rounded-3xl border border-line bg-white"
              >
                <img src={photo.src} alt="" className="h-36 w-full object-cover" />
                <div className="p-6">
                  <h3 className="font-serif text-2xl text-navy">{post.title}</h3>
                  <p className="mt-2 text-muted">{post.excerpt}</p>
                </div>
              </Link>
              )
            })}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {hours.map((item) => (
            <a
              key={item.location.id}
              href={mapsHref(item.location.mapsQuery)}
              className="flex min-h-16 items-center justify-between rounded-3xl bg-mist px-5 font-semibold text-navy"
            >
              Route {item.location.name}
              <span className="sr-only">, opent Google Maps</span>
              <Clock3 className="h-4 w-4" aria-hidden />
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
