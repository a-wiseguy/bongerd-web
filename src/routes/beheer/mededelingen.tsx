import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { AdminIndexedPage } from '@/components/AdminPageIndex'
import { Field, PublishField, fieldClass } from '@/components/AdminShell'
import { AdminForm, DeleteButton, SaveButton } from '@/components/admin/AdminForm'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { limits } from '@/lib/limits'
import { deleteAnnouncement, getAdminAnnouncements, saveAnnouncement } from '@/server/admin'

export const Route = createFileRoute('/beheer/mededelingen')({
  loader: () => getAdminAnnouncements(),
  component: AnnouncementsAdmin,
})

function AnnouncementsAdmin() {
  const items = Route.useLoaderData()
  const router = useRouter()
  const [draftKey, setDraftKey] = useState(0)
  const indexItems = [
    { id: 'mededeling-nieuw', label: 'Nieuwe mededeling' },
    ...items.map((item) => ({
      id: `mededeling-${item.id}`,
      label: item.title || 'Mededeling',
    })),
  ]

  return (
    <AdminIndexedPage items={indexItems}>
      <h1 className="font-serif text-4xl text-navy">Mededelingen</h1>
      <p className="mt-2 text-muted">Deze teksten staan op de homepage.</p>
      <AdminForm
        id="mededeling-nieuw"
        className="mt-6 scroll-mt-6 rounded-[1.5rem] border border-line bg-white p-5"
        success="Mededeling toegevoegd."
        onSave={async (data, form) => {
          await saveAnnouncement({
            data: {
              title: String(data.get('title') ?? ''),
              body: String(data.get('body') ?? ''),
              published: data.get('published') === 'on',
            },
          })
          form.reset()
          setDraftKey((key) => key + 1)
          await router.invalidate()
        }}
      >
        <h2 className="font-serif text-2xl text-navy">Nieuwe mededeling</h2>
        <Field label="Titel">
          <input name="title" required maxLength={limits.title} className={fieldClass} />
        </Field>
        <div className="grid gap-1">
          <span className="text-sm font-semibold text-navy">Tekst</span>
          <RichTextEditor key={draftKey} name="body" maxLength={limits.announcementBody} compact />
        </div>
        <PublishField />
        <SaveButton>Toevoegen</SaveButton>
      </AdminForm>
      <ul className="mt-6 grid gap-4">
        {items.map((item) => (
          <li key={item.id} id={`mededeling-${item.id}`} className="scroll-mt-6">
            <AdminForm
              className="rounded-[1.5rem] border border-line bg-white p-5"
              onSave={async (data) => {
                await saveAnnouncement({
                  data: {
                    id: item.id,
                    title: String(data.get('title') ?? ''),
                    body: String(data.get('body') ?? ''),
                    published: data.get('published') === 'on',
                  },
                })
                await router.invalidate()
              }}
            >
              <Field label="Titel">
                <input name="title" defaultValue={item.title} maxLength={limits.title} className={fieldClass} />
              </Field>
              <div className="grid gap-1">
                <span className="text-sm font-semibold text-navy">Tekst</span>
                <RichTextEditor
                  name="body"
                  defaultValue={item.body}
                  maxLength={limits.announcementBody}
                  compact
                />
              </div>
              <PublishField defaultChecked={item.published} />
              <div className="flex flex-wrap items-center gap-2">
                <SaveButton>Opslaan</SaveButton>
                <DeleteButton
                  confirmText={`“${item.title}” verdwijnt van de homepage.`}
                  onConfirm={async () => {
                    await deleteAnnouncement({ data: { id: item.id } })
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
