import { createFileRoute } from '@tanstack/react-router'
import { PageHero } from '@/components/PageHero'
import {
  ComplaintsBody,
  HouseRulesBody,
  OverOnsPageNav,
} from '@/components/OverOnsSections'
import { blockImage, blockMap, heading, text } from '@/lib/format'
import { photos } from '@/lib/images'
import { overOnsSectionId, overOnsSectionKeys, type OverOnsSectionKey } from '@/lib/overOnsContent'
import { seo } from '@/lib/seo'
import { toSafeHtml } from '@/lib/sanitize'
import { getPageBlocks } from '@/server/public'

export const Route = createFileRoute('/over-ons')({
  loader: async () => ({
    blocks: await getPageBlocks({ data: 'over-ons' }),
  }),
  head: () => ({
    meta: seo({
      title: 'Over ons',
      description:
        'Zelfstandige HKZ-gecertificeerde apotheek met vestigingen in Kesteren, Ochten en Rhenen. Team, kwaliteit, inschrijven, huisregels en klachten.',
    }),
  }),
  component: OverOns,
})

function OverOns() {
  const { blocks } = Route.useLoaderData()
  const copy = blockMap(blocks)
  const hero = blockImage(copy, 'over-ons.intro', photos.orchard)
  const navItems = overOnsSectionKeys.map((key) => ({
    id: overOnsSectionId(key),
    label: heading(copy, `over-ons.${key}`),
  }))

  return (
    <div>
      <PageHero
        kicker="Onze apotheek"
        title={heading(copy, 'over-ons.intro', 'Over ons')}
        lead={text(copy, 'over-ons.intro')}
        image={hero.src}
        imageAlt={hero.alt}
      />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <OverOnsPageNav items={navItems} />
        <div className="grid gap-8">
          {overOnsSectionKeys.map((key) => (
            <Section key={key} sectionKey={key} copy={copy} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Section({
  sectionKey,
  copy,
}: {
  sectionKey: OverOnsSectionKey
  copy: ReturnType<typeof blockMap>
}) {
  const body = text(copy, `over-ons.${sectionKey}`)
  const title = heading(copy, `over-ons.${sectionKey}`)

  return (
    <section
      id={overOnsSectionId(sectionKey)}
      className="scroll-mt-28 rounded-[1.8rem] border border-line bg-white p-6 sm:p-8"
    >
      {sectionKey === 'team' ? (
        <img
          src={photos.john.src}
          alt={photos.john.alt}
          className="mb-6 h-56 w-full rounded-[1.4rem] object-cover sm:h-72"
        />
      ) : null}
      {sectionKey === 'kwaliteit' ? (
        <img
          src={photos.interior.src}
          alt={photos.interior.alt}
          className="mb-6 h-56 w-full rounded-[1.4rem] object-cover sm:h-72"
        />
      ) : null}
      <h2 className="font-serif text-2xl text-navy">{title}</h2>
      <div className="mt-4">
        {sectionKey === 'huisregels' ? <HouseRulesBody text={body} /> : null}
        {sectionKey === 'klachten' ? <ComplaintsBody text={body} /> : null}
        {sectionKey !== 'huisregels' && sectionKey !== 'klachten' ? (
          <div className="prose-site text-muted">
            <div dangerouslySetInnerHTML={{ __html: toSafeHtml(body) }} />
          </div>
        ) : null}
      </div>
    </section>
  )
}
