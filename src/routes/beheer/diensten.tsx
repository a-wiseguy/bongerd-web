import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { AdminIndexedPage } from '@/components/AdminPageIndex'
import { Field, PublishField, fieldClass } from '@/components/AdminShell'
import { AdminForm, DeleteButton, SaveButton } from '@/components/admin/AdminForm'
import { ImageField } from '@/components/admin/ImageField'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { limits } from '@/lib/limits'
import { deleteService, getAdminServices, saveService } from '@/server/admin'

export const Route = createFileRoute('/beheer/diensten')({
  loader: () => getAdminServices(),
  component: ServicesAdmin,
})

function ServicesAdmin() {
  const items = Route.useLoaderData()
  const router = useRouter()
  const [draftKey, setDraftKey] = useState(0)
  const indexItems = [
    { id: 'dienst-nieuw', label: 'Nieuwe dienst' },
    ...items.map((item) => ({
      id: `dienst-${item.id}`,
      label: item.title || 'Dienst',
    })),
  ]

  return (
    <AdminIndexedPage items={indexItems}>
      <h1 className="font-serif text-4xl text-navy">Diensten</h1>
      <p className="mt-2 text-muted">
        Samenvatting blijft kort (max. {limits.serviceSummary} tekens) voor de kaarten op de site.
      </p>
      <AdminForm
        id="dienst-nieuw"
        className="mt-6 scroll-mt-6 rounded-[1.5rem] border border-line bg-white p-5"
        success="Dienst toegevoegd."
        onSave={async (data, form) => {
          await saveService({
            data: {
              title: String(data.get('title') ?? ''),
              summary: String(data.get('summary') ?? ''),
              body: String(data.get('body') ?? ''),
              imageUrl: String(data.get('imageUrl') ?? '') || null,
              imageAlt: String(data.get('imageAlt') ?? '') || null,
              href: String(data.get('href') || '') || null,
              published: data.get('published') === 'on',
              sortOrder: Number(data.get('sortOrder') || items.length + 1),
            },
          })
          form.reset()
          setDraftKey((key) => key + 1)
          await router.invalidate()
        }}
      >
        <h2 className="font-serif text-2xl text-navy">Nieuwe dienst</h2>
        <Field label="Titel">
          <input name="title" required maxLength={limits.title} className={fieldClass} />
        </Field>
        <Field label="Samenvatting (kort)">
          <textarea name="summary" required rows={2} maxLength={limits.serviceSummary} className={fieldClass} />
        </Field>
        <div className="grid gap-1">
          <span className="text-sm font-semibold text-navy">Tekst</span>
          <RichTextEditor key={draftKey} name="body" maxLength={limits.serviceBody} />
        </div>
        <ImageField key={draftKey} label="Afbeelding" />
        <Field label="Link (optioneel)" hint="Volledige URL of een pad zoals /contact. Leeg laten als er geen knop hoeft.">
          <input name="href" className={fieldClass} />
        </Field>
        <Field label="Volgorde" hint="Lager getal staat hoger op de pagina.">
          <input name="sortOrder" type="number" defaultValue={items.length + 1} className={fieldClass} />
        </Field>
        <PublishField />
        <SaveButton>Toevoegen</SaveButton>
      </AdminForm>
      <ul className="mt-6 grid gap-4">
        {items.map((item) => (
          <li key={item.id} id={`dienst-${item.id}`} className="scroll-mt-6">
            <AdminForm
              className="rounded-[1.5rem] border border-line bg-white p-5"
              onSave={async (data) => {
                await saveService({
                  data: {
                    id: item.id,
                    title: String(data.get('title') ?? ''),
                    summary: String(data.get('summary') ?? ''),
                    body: String(data.get('body') ?? ''),
                    imageUrl: String(data.get('imageUrl') ?? '') || null,
                    imageAlt: String(data.get('imageAlt') ?? '') || null,
                    href: String(data.get('href') || '') || null,
                    published: data.get('published') === 'on',
                    sortOrder: Number(data.get('sortOrder') || 0),
                  },
                })
                await router.invalidate()
              }}
            >
              <Field label="Titel">
                <input name="title" defaultValue={item.title} maxLength={limits.title} className={fieldClass} />
              </Field>
              <Field label="Samenvatting (kort)">
                <textarea
                  name="summary"
                  defaultValue={item.summary}
                  rows={2}
                  maxLength={limits.serviceSummary}
                  className={fieldClass}
                />
              </Field>
              <div className="grid gap-1">
                <span className="text-sm font-semibold text-navy">Tekst</span>
                <RichTextEditor name="body" defaultValue={item.body} maxLength={limits.serviceBody} />
              </div>
              <ImageField defaultUrl={item.imageUrl} defaultAlt={item.imageAlt} label="Afbeelding" />
              <Field label="Link (optioneel)" hint="Volledige URL of een pad zoals /contact. Leeg laten als er geen knop hoeft.">
                <input name="href" defaultValue={item.href ?? ''} className={fieldClass} />
              </Field>
              <Field label="Volgorde" hint="Lager getal staat hoger op de pagina.">
                <input name="sortOrder" type="number" defaultValue={item.sortOrder} className={fieldClass} />
              </Field>
              <PublishField defaultChecked={item.published} />
              <div className="flex flex-wrap items-center gap-2">
                <SaveButton>Opslaan</SaveButton>
                <DeleteButton
                  confirmText={`“${item.title}” verdwijnt van de site.`}
                  onConfirm={async () => {
                    await deleteService({ data: { id: item.id } })
                    await router.invalidate()
                  }}
                />
              </div>
            </AdminForm>
          </li>
        ))}
      </ul>
    </AdminIndexedPage>
  )
}
