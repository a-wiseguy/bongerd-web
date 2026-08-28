import { createFileRoute } from '@tanstack/react-router'
import { ContactForm } from '@/components/ContactForm'
import { OpenBadge, PageHero, Prose } from '@/components/PageHero'
import { blockMap, heading, mapsHref, text } from '@/lib/format'
import { photos } from '@/lib/images'
import { seo } from '@/lib/seo'
import { getHoursBundle, getPageBlocks } from '@/server/public'

export const Route = createFileRoute('/contact')({
  loader: async () => ({
    blocks: await getPageBlocks({ data: 'contact' }),
    hours: await getHoursBundle(),
  }),
  head: () => ({
    meta: seo({
      title: 'Contact',
      description:
        'Adres, telefoon, e-mail, route en contactformulier van Apotheek De Bongerd in Kesteren, Ochten en Rhenen.',
    }),
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
        image={photos.storefront.src}
        imageAlt={photos.storefront.alt}
      />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4">
          {hours.map((item) => (
            <article key={item.location.id} className="rounded-[1.8rem] border border-line bg-white p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-serif text-3xl text-navy">{item.location.name}</h2>
                <OpenBadge open={item.status.open} label={item.status.label} detail="" />
              </div>
              <p className="mt-3 text-muted">
                {item.location.address}
                <br />
                {item.location.postal} {item.location.city}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  className="inline-flex min-h-12 items-center rounded-full bg-navy px-5 font-semibold text-white"
                  href={`tel:${item.location.phoneTel}`}
                >
                  {item.location.phone}
                </a>
                <a
                  className="inline-flex min-h-12 items-center rounded-full border border-line px-5 font-semibold text-navy"
                  href={mapsHref(item.location.mapsQuery)}
                >
                  Route
                </a>
              </div>
              <p className="mt-3">
                <a className="font-semibold text-navy" href={`mailto:${item.location.email}`}>
                  {item.location.email}
                </a>
              </p>
            </article>
          ))}
        </div>
        <div className="overflow-hidden rounded-[1.8rem] border border-line bg-white">
          <img src={photos.consult.src} alt={photos.consult.alt} className="h-44 w-full object-cover" />
          <div className="p-6 sm:p-8">
          <h2 className="font-serif text-3xl text-navy">{heading(copy, 'contact.form', 'Bericht sturen')}</h2>
          <div className="mt-3 rounded-2xl bg-mint p-4 text-sm text-teal">
            <Prose text={text(copy, 'contact.form')} />
          </div>
          <div className="mt-6">
            <ContactForm />
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
