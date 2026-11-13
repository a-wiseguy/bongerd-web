import { createFileRoute } from '@tanstack/react-router'
import { Mail, MapPinned, Phone } from 'lucide-react'
import { ContactForm } from '@/components/ContactForm'
import { OpenBadge, PageHero, Prose } from '@/components/PageHero'
import { blockMap, heading, mapsHref, text } from '@/lib/format'
import { blockImage, photos } from '@/lib/images'
import { pageHead } from '@/lib/seo'
import { getHoursBundle, getPageBlocks } from '@/server/public'

export const Route = createFileRoute('/contact')({
  loader: async () => ({
    blocks: await getPageBlocks({ data: 'contact' }),
    hours: await getHoursBundle(),
  }),
  head: (ctx) =>
    pageHead(ctx, {
      title: 'Contact',
      description:
        'Adres, telefoon, e-mail, route en contactformulier van Apotheek De Bongerd in Kesteren, Ochten en Rhenen.',
      path: '/contact',
    }),
  component: ContactPage,
})

function ContactPage() {
  const { blocks, hours } = Route.useLoaderData()
  const copy = blockMap(blocks)

  return (
    <div>
      <PageHero
        kicker="Bereikbaarheid"
        title={heading(copy, 'contact.intro', 'Contact')}
        lead={text(copy, 'contact.intro')}
        image={blockImage(copy['contact.intro'], photos.interior)}
      />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1fr] lg:items-start">
        <div className="grid gap-4">
          {hours.map((item) => (
            <article key={item.location.id} className="rounded-[1.8rem] border border-line bg-white p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-serif text-3xl text-navy">{item.location.name}</h2>
                <OpenBadge open={item.status.open} label={item.status.open ? 'Open' : 'Gesloten'} />
              </div>
              <p className="mt-1 text-sm font-semibold text-ink">{item.status.detail}</p>
              <address className="mt-3 not-italic text-muted">
                {item.location.address}
                <br />
                {item.location.postal} {item.location.city}
              </address>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-navy px-5 font-semibold text-white transition hover:bg-navy-deep"
                  href={`tel:${item.location.phoneTel}`}
                >
                  <Phone className="h-4 w-4" aria-hidden />
                  <span className="sr-only">Bel {item.location.name}: </span>
                  {item.location.phone}
                </a>
                <a
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border border-line px-5 font-semibold text-navy transition hover:border-navy"
                  href={mapsHref(item.location.mapsQuery)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPinned className="h-4 w-4" aria-hidden />
                  Route
                  <span className="sr-only"> naar {item.location.name} (opent Google Maps)</span>
                </a>
              </div>
              {item.location.email ? (
                <p className="mt-3">
                  <a
                    className="inline-flex min-h-11 items-center gap-2 break-all font-semibold text-navy underline-offset-4 hover:underline"
                    href={`mailto:${item.location.email}`}
                  >
                    <Mail className="h-4 w-4 shrink-0" aria-hidden />
                    {item.location.email}
                  </a>
                </p>
              ) : null}
            </article>
          ))}
        </div>
        <section
          aria-labelledby="contact-form-title"
          className="rounded-[1.8rem] border border-line bg-white p-6 shadow-card sm:p-8 lg:sticky lg:top-28"
        >
          <h2 id="contact-form-title" className="font-serif text-3xl text-navy">
            {heading(copy, 'contact.form', 'Bericht sturen')}
          </h2>
          <div className="mt-3 rounded-2xl bg-mint p-4 text-sm text-teal">
            <Prose html={text(copy, 'contact.form')} />
          </div>
          <div className="mt-6">
            <ContactForm />
          </div>
        </section>
      </div>
    </div>
  )
}
