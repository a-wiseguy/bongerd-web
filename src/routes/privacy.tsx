import { createFileRoute } from '@tanstack/react-router'
import { PageHero, Prose } from '@/components/PageHero'
import { blockMap, heading, text } from '@/lib/format'
import { pageHead } from '@/lib/seo'
import { getPageBlocks } from '@/server/public'

export const Route = createFileRoute('/privacy')({
  loader: () => getPageBlocks({ data: 'privacy' }),
  head: (ctx) =>
    pageHead(ctx, {
      title: 'Privacy',
      description: 'Privacybeleid van Apotheek De Bongerd: welke gegevens wij verwerken, waarom en wat uw rechten zijn.',
      path: '/privacy',
    }),
  component: PrivacyPage,
})

function PrivacyPage() {
  const copy = blockMap(Route.useLoaderData())
  return (
    <div>
      <PageHero kicker="Uw gegevens" title={heading(copy, 'privacy.intro', 'Privacy')} />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <article className="rounded-[1.8rem] border border-line bg-white p-6 text-ink sm:p-10">
          <Prose html={text(copy, 'privacy.intro')} />
        </article>
      </div>
    </div>
  )
}
