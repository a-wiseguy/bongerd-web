import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { AdminIndexedPage } from '@/components/AdminPageIndex'
import { Field, PublishField, fieldClass } from '@/components/AdminShell'
import { AdminForm, DeleteButton, SaveButton } from '@/components/admin/AdminForm'
import { ImageField } from '@/components/admin/ImageField'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { limits } from '@/lib/limits'
import { deleteNews, getAdminNews, saveNews } from '@/server/admin'

export const Route = createFileRoute('/beheer/nieuws')({
  loader: () => getAdminNews(),
  component: NewsAdmin,
})

function NewsAdmin() {
  const posts = Route.useLoaderData()
  const router = useRouter()
  const [draftKey, setDraftKey] = useState(0)
  const indexItems = [
    { id: 'nieuws-nieuw', label: 'Nieuw bericht' },
    ...posts.map((post) => ({
      id: `nieuws-${post.id}`,
      label: post.title || 'Bericht',
    })),
  ]

  return (
    <AdminIndexedPage items={indexItems}>
      <h1 className="font-serif text-4xl text-navy">Nieuws</h1>
      <p className="mt-2 text-muted">Gepubliceerde berichten verschijnen op de nieuwspagina.</p>
      <AdminForm
        id="nieuws-nieuw"
        className="mt-6 scroll-mt-6 rounded-[1.5rem] border border-line bg-white p-5"
        success="Bericht geplaatst."
        onSave={async (data, form) => {
          await saveNews({
            data: {
              title: String(data.get('title') ?? ''),
              excerpt: String(data.get('excerpt') ?? ''),
              body: String(data.get('body') ?? ''),
              imageUrl: String(data.get('imageUrl') ?? '') || null,
              imageAlt: String(data.get('imageAlt') ?? '') || null,
              published: data.get('published') === 'on',
            },
          })
          form.reset()
          setDraftKey((key) => key + 1)
          await router.invalidate()
        }}
      >
        <h2 className="font-serif text-2xl text-navy">Nieuw bericht</h2>
        <Field label="Titel">
          <input name="title" required maxLength={limits.title} className={fieldClass} />
        </Field>
        <Field label="Korte samenvatting">
          <textarea name="excerpt" required rows={2} maxLength={limits.newsExcerpt} className={fieldClass} />
        </Field>
        <div className="grid gap-1">
          <span className="text-sm font-semibold text-navy">Bericht</span>
          <RichTextEditor key={draftKey} name="body" maxLength={limits.newsBody} />
        </div>
        <ImageField key={draftKey} label="Afbeelding" />
        <PublishField />
        <SaveButton>Publiceren</SaveButton>
      </AdminForm>
      <ul className="mt-6 grid gap-4">
        {posts.map((post) => (
          <li key={post.id} id={`nieuws-${post.id}`} className="scroll-mt-6">
            <AdminForm
              className="rounded-[1.5rem] border border-line bg-white p-5"
              onSave={async (data) => {
                await saveNews({
                  data: {
                    id: post.id,
                    slug: post.slug,
                    title: String(data.get('title') ?? ''),
                    excerpt: String(data.get('excerpt') ?? ''),
                    body: String(data.get('body') ?? ''),
                    imageUrl: String(data.get('imageUrl') ?? '') || null,
                    imageAlt: String(data.get('imageAlt') ?? '') || null,
                    published: data.get('published') === 'on',
                  },
                })
                await router.invalidate()
              }}
            >
              <Field label="Titel">
                <input name="title" defaultValue={post.title} maxLength={limits.title} className={fieldClass} />
              </Field>
              <Field label="Korte samenvatting">
                <textarea
                  name="excerpt"
                  defaultValue={post.excerpt}
                  rows={2}
                  maxLength={limits.newsExcerpt}
                  className={fieldClass}
                />
              </Field>
              <div className="grid gap-1">
                <span className="text-sm font-semibold text-navy">Bericht</span>
                <RichTextEditor name="body" defaultValue={post.body} maxLength={limits.newsBody} />
              </div>
              <ImageField defaultUrl={post.imageUrl} defaultAlt={post.imageAlt} label="Afbeelding" />
              <PublishField defaultChecked={post.published} />
              <div className="flex flex-wrap items-center gap-2">
                <SaveButton>Opslaan</SaveButton>
                <DeleteButton
                  confirmText={`“${post.title}” verdwijnt van de site.`}
                  onConfirm={async () => {
                    await deleteNews({ data: { id: post.id } })
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
