import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { AdminIndexedPage } from '@/components/AdminPageIndex'
import { btnClass, fieldClass, ghostBtn } from '@/components/AdminShell'
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
  const [formKey, setFormKey] = useState(0)
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
      <form
        key={formKey}
        id="dienst-nieuw"
        className="mt-6 grid scroll-mt-6 gap-3 rounded-[1.5rem] border border-line bg-white p-5"
        onSubmit={async (event) => {
          event.preventDefault()
          const data = new FormData(event.currentTarget)
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
          setFormKey((k) => k + 1)
          await router.invalidate()
        }}
      >
        <h2 className="font-serif text-2xl text-navy">Nieuwe dienst</h2>
        <input name="title" required maxLength={limits.title} placeholder="Titel" className={fieldClass} />
        <label className="grid gap-1">
          <span className="text-sm font-semibold text-navy">Samenvatting (kort)</span>
          <textarea
            name="summary"
            required
            rows={2}
            maxLength={limits.serviceSummary}
            placeholder="Samenvatting"
            className={fieldClass}
          />
        </label>
        <div className="grid gap-1">
          <span className="text-sm font-semibold text-navy">Tekst</span>
          <RichTextEditor name="body" maxLength={limits.serviceBody} />
        </div>
        <ImageField label="Afbeelding" />
        <input name="href" placeholder="Link (optioneel)" className={fieldClass} />
        <input name="sortOrder" type="number" defaultValue={items.length + 1} className={fieldClass} />
        <label className="flex items-center gap-2">
          <input name="published" type="checkbox" defaultChecked />
          Gepubliceerd
        </label>
        <button type="submit" className={btnClass}>
          Toevoegen
        </button>
      </form>
      <ul className="mt-6 grid gap-4">
        {items.map((item) => (
          <li
            key={item.id}
            id={`dienst-${item.id}`}
            className="scroll-mt-6 rounded-[1.5rem] border border-line bg-white p-5"
          >
            <form
              className="grid gap-3"
              onSubmit={async (event) => {
                event.preventDefault()
                const data = new FormData(event.currentTarget)
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
              <input name="title" defaultValue={item.title} maxLength={limits.title} className={fieldClass} />
              <label className="grid gap-1">
                <span className="text-sm font-semibold text-navy">Samenvatting (kort)</span>
                <textarea
                  name="summary"
                  defaultValue={item.summary}
                  rows={2}
                  maxLength={limits.serviceSummary}
                  className={fieldClass}
                />
              </label>
              <div className="grid gap-1">
                <span className="text-sm font-semibold text-navy">Tekst</span>
                <RichTextEditor name="body" defaultValue={item.body} maxLength={limits.serviceBody} />
              </div>
              <ImageField defaultUrl={item.imageUrl} defaultAlt={item.imageAlt} label="Afbeelding" />
              <input name="href" defaultValue={item.href ?? ''} className={fieldClass} />
              <input name="sortOrder" type="number" defaultValue={item.sortOrder} className={fieldClass} />
              <label className="flex items-center gap-2">
                <input name="published" type="checkbox" defaultChecked={item.published} />
                Gepubliceerd
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="submit" className={btnClass}>
                  Opslaan
                </button>
                <button
                  type="button"
                  className={ghostBtn}
                  onClick={async () => {
                    await deleteService({ data: { id: item.id } })
                    await router.invalidate()
                  }}
                >
                  Verwijder
                </button>
              </div>
            </form>
          </li>
        ))}
      </ul>
    </AdminIndexedPage>
  )
}
