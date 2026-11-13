import { createFileRoute, Link, notFound, useNavigate, useRouter } from '@tanstack/react-router'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Field, PublishField, fieldClass } from '@/components/AdminShell'
import { AdminForm, DeleteButton, SaveButton } from '@/components/admin/AdminForm'
import { ImageField } from '@/components/admin/ImageField'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { StatusPill } from '@/components/admin/StatusPill'
import { limits } from '@/lib/limits'
import { pageHead } from '@/lib/seo'
import { deleteService, getAdminService, saveService } from '@/server/admin'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const Route = createFileRoute('/beheer/diensten/$id')({
  loader: async ({ params }) => {
    if (params.id === 'nieuw') return { service: null }
    if (!UUID.test(params.id)) throw notFound()
    const service = await getAdminService({ data: { id: params.id } })
    if (!service) throw notFound()
    return { service }
  },
  head: (ctx) =>
    pageHead(ctx, {
      title: `${ctx.loaderData?.service ? 'Dienst bewerken' : 'Nieuwe dienst'} · Beheer`,
      description: 'Dienst bewerken.',
      noindex: true,
    }),
  notFoundComponent: () => (
    <div className="max-w-xl">
      <h1 className="font-serif text-4xl text-navy">Dienst niet gevonden</h1>
      <p className="mt-2 text-muted">Misschien is deze al verwijderd.</p>
      <Link to="/beheer/diensten" className="mt-4 inline-flex min-h-12 items-center gap-2 font-semibold text-navy">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Terug naar diensten
      </Link>
    </div>
  ),
  component: ServiceEditor,
})

function ServiceEditor() {
  const { service } = Route.useLoaderData()
  const router = useRouter()
  const navigate = useNavigate()

  return (
    <div>
      <Link
        to="/beheer/diensten"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy underline-offset-4 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Alle diensten
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-4xl text-navy">{service ? service.title : 'Nieuwe dienst'}</h1>
        {service ? (
          <StatusPill tone={service.published ? 'online' : 'draft'}>{service.published ? 'Online' : 'Verborgen'}</StatusPill>
        ) : null}
      </div>

      <AdminForm
        className="mt-6"
        statusAtButton
        warnUnsaved
        success={service ? 'Opgeslagen.' : 'Dienst aangemaakt.'}
        onSave={async (data) => {
          const result = await saveService({
            data: {
              id: service?.id,
              title: String(data.get('title') ?? ''),
              summary: String(data.get('summary') ?? ''),
              body: String(data.get('body') ?? ''),
              imageUrl: String(data.get('imageUrl') ?? '') || null,
              imageAlt: String(data.get('imageAlt') ?? '') || null,
              href: String(data.get('href') || '') || null,
              published: data.get('published') === 'on',
            },
          })
          if (!service) {
            await navigate({ to: '/beheer/diensten/$id', params: { id: result.id }, replace: true })
            return
          }
          await router.invalidate()
        }}
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
          <div className="grid gap-4 rounded-[1.5rem] border border-line bg-white p-5 sm:p-6">
            <Field label="Titel">
              <input name="title" required defaultValue={service?.title} maxLength={limits.title} className={fieldClass} />
            </Field>
            <Field label="Samenvatting" hint={`Staat op de kaart op de homepage. Max. ${limits.serviceSummary} tekens.`}>
              <textarea
                name="summary"
                required
                rows={2}
                defaultValue={service?.summary}
                maxLength={limits.serviceSummary}
                className={fieldClass}
              />
            </Field>
            <div className="grid gap-1">
              <span className="text-sm font-semibold text-navy">Uitleg</span>
              <RichTextEditor name="body" label="Uitleg" defaultValue={service?.body} maxLength={limits.serviceBody} />
            </div>
            <ImageField defaultUrl={service?.imageUrl} defaultAlt={service?.imageAlt} label="Afbeelding" />
            <Field
              label="Knop-link (optioneel)"
              hint="Een https-link (bijv. MijnGezondheid.net) of een pad zoals /contact. Leeg = geen knop."
            >
              <input name="href" defaultValue={service?.href ?? ''} maxLength={512} className={fieldClass} />
            </Field>
          </div>

          <aside className="grid gap-4 rounded-[1.5rem] border border-line bg-white p-5 lg:sticky lg:top-6">
            <h2 className="font-serif text-2xl text-navy">Publicatie</h2>
            <PublishField defaultChecked={service?.published ?? true} hint="Volgorde wijzigt u in het overzicht." />
            <SaveButton className="min-h-12 w-full rounded-full bg-navy px-5 font-semibold text-white disabled:opacity-60">
              {service ? 'Opslaan' : 'Dienst aanmaken'}
            </SaveButton>
            {service?.published ? (
              <a
                href={`/diensten#${service.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-1.5 font-semibold text-navy underline-offset-4 hover:underline"
              >
                Bekijk op de site
                <ExternalLink className="h-4 w-4" aria-hidden />
                <span className="sr-only"> (nieuw tabblad)</span>
              </a>
            ) : null}
            {service ? (
              <div className="border-t border-line pt-4">
                <DeleteButton
                  confirmText={`“${service.title}” wordt definitief verwijderd.`}
                  onConfirm={async () => {
                    await deleteService({ data: { id: service.id } })
                    await navigate({ to: '/beheer/diensten' })
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
