import { createFileRoute } from '@tanstack/react-router'
import { PageHero, Prose } from '@/components/PageHero'
import { blockMap, heading, text } from '@/lib/format'
import { photos } from '@/lib/images'
import { seo } from '@/lib/seo'
import { getPageBlocks } from '@/server/public'

export const Route = createFileRoute('/privacy')({
  loader: () => getPageBlocks({ data: 'privacy' }),
  head: () => ({
    meta: seo({
      title: 'Privacy',
      description: 'Privacybeleid van Apotheek De Bongerd.',
    }),
  }),
  component: PrivacyPage,
})

function PrivacyPage() {
  const blocks = Route.useLoaderData()
  const copy = blockMap(blocks)
  return (
    <div>
      <PageHero
        kicker="Gegevens"
        title={heading(copy, 'privacy.intro', 'Privacy')}
        image={photos.privacy.src}
        imageAlt={photos.privacy.alt}
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="overflow-hidden rounded-[1.8rem] border border-line bg-white">
          <img src={photos.consult.src} alt={photos.consult.alt} className="h-48 w-full object-cover" />
          <div className="p-6 sm:p-8 text-muted">
            <Prose text={text(copy, 'privacy.intro')} />
          </div>
        </div>
      </div>
    </div>
  )
}
