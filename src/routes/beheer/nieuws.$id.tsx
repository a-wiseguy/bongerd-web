import { createFileRoute, Link, notFound, useNavigate, useRouter } from '@tanstack/react-router'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Field, PublishField, fieldClass } from '@/components/AdminShell'
import { AdminForm, DeleteButton, SaveButton } from '@/components/admin/AdminForm'
import { ImageField } from '@/components/admin/ImageField'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { newsStatus, StatusPill } from '@/components/admin/StatusPill'
import { publishWindow, toAmsterdamInput } from '@/lib/hours'
import { limits } from '@/lib/limits'
import { pageHead } from '@/lib/seo'
import { deleteNews, getAdminNewsPost, saveNews } from '@/server/admin'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const Route = createFileRoute('/beheer/nieuws/$id')({
  loader: async ({ params }) => {
    if (params.id === 'nieuw') return { post: null }
    if (!UUID.test(params.id)) throw notFound()
    const post = await getAdminNewsPost({ data: { id: params.id } })
    if (!post) throw notFound()
    return { post }
  },
  head: (ctx) =>
    pageHead(ctx, {
      title: `${ctx.loaderData?.post ? 'Bericht bewerken' : 'Nieuw bericht'} · Beheer`,
      description: 'Nieuwsbericht bewerken.',
      noindex: true,
    }),
  notFoundComponent: () => (
    <div className="max-w-xl">
      <h1 className="font-serif text-4xl text-navy">Bericht niet gevonden</h1>
      <p className="mt-2 text-muted">Misschien is het al verwijderd.</p>
      <Link to="/beheer/nieuws" className="mt-4 inline-flex min-h-12 items-center gap-2 font-semibold text-navy">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Terug naar nieuws
      </Link>
    </div>
  ),
  component: NewsEditor,
})

function NewsEditor() {
  const { post } = Route.useLoaderData()
  const router = useRouter()
  const navigate = useNavigate()
  const status = post ? newsStatus(post) : null
  const range = publishWindow()

  return (
    <div>
      <Link
        to="/beheer/nieuws"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy underline-offset-4 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Alle berichten
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-4xl text-navy">{post ? post.title : 'Nieuw bericht'}</h1>
        {status ? <StatusPill tone={status.tone}>{status.label}</StatusPill> : null}
      </div>

      <AdminForm
        className="mt-6"
        statusAtButton
        success={post ? 'Opgeslagen.' : 'Bericht aangemaakt.'}
        onSave={async (data) => {
          const result = await saveNews({
            data: {
              id: post?.id,
              title: String(data.get('title') ?? ''),
              excerpt: String(data.get('excerpt') ?? ''),
              body: String(data.get('body') ?? ''),
              imageUrl: String(data.get('imageUrl') ?? '') || null,
              imageAlt: String(data.get('imageAlt') ?? '') || null,
              published: data.get('published') === 'on',
              publishedAt: String(data.get('publishedAt') ?? '') || undefined,
            },
          })
          if (!post) {
            await navigate({ to: '/beheer/nieuws/$id', params: { id: result.id }, replace: true })
            return
          }
          await router.invalidate()
        }}
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
          <div className="grid gap-4 rounded-[1.5rem] border border-line bg-white p-5 sm:p-6">
            <Field label="Titel">
              <input name="title" required defaultValue={post?.title} maxLength={limits.title} className={fieldClass} />
            </Field>
            <Field label="Korte samenvatting" hint="Staat op de nieuwskaart en in zoekmachines. Eén of twee zinnen.">
              <textarea
                name="excerpt"
                required
                rows={2}
                defaultValue={post?.excerpt}
                maxLength={limits.newsExcerpt}
                className={fieldClass}
              />
            </Field>
            <div className="grid gap-1">
              <span className="text-sm font-semibold text-navy">Bericht</span>
              <RichTextEditor name="body" label="Bericht" defaultValue={post?.body} maxLength={limits.newsBody} />
            </div>
            <ImageField defaultUrl={post?.imageUrl} defaultAlt={post?.imageAlt} label="Afbeelding" />
          </div>

          <aside className="grid gap-4 rounded-[1.5rem] border border-line bg-white p-5 lg:sticky lg:top-6">
            <h2 className="font-serif text-2xl text-navy">Publicatie</h2>
            <Field label="Publicatiedatum" hint="Een datum in de toekomst plant het bericht in.">
              <input
                name="publishedAt"
                type="datetime-local"
                required={Boolean(post)}
                min={range.minInput}
                max={range.maxInput}
                defaultValue={post ? toAmsterdamInput(post.publishedAt) : undefined}
                className={fieldClass}
              />
            </Field>
            <PublishField defaultChecked={post?.published ?? true} hint="Uitvinken verbergt het bericht zonder het te verwijderen." />
            <SaveButton className="min-h-12 w-full rounded-full bg-navy px-5 font-semibold text-white disabled:opacity-60">
              {post ? 'Opslaan' : 'Bericht aanmaken'}
            </SaveButton>
            {post && status?.live ? (
              <a
                href={`/nieuws/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-1.5 font-semibold text-navy underline-offset-4 hover:underline"
              >
                Bekijk op de site
                <ExternalLink className="h-4 w-4" aria-hidden />
                <span className="sr-only"> (nieuw tabblad)</span>
              </a>
            ) : null}
            {post ? (
              <div className="border-t border-line pt-4">
                <DeleteButton
                  confirmText={`“${post.title}” wordt definitief verwijderd.`}
                  onConfirm={async () => {
                    await deleteNews({ data: { id: post.id } })
                    await navigate({ to: '/beheer/nieuws' })
                  }}
                />
              </div>
            ) : null}
          </aside>
        </div>
      </AdminForm>
    </div>
  )
}
