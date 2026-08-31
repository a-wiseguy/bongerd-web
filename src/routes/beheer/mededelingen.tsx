import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { AdminIndexedPage } from '@/components/AdminPageIndex'
import { btnClass, fieldClass, ghostBtn } from '@/components/AdminShell'
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
  const [formKey, setFormKey] = useState(0)
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
      <form
        key={formKey}
        id="mededeling-nieuw"
        className="mt-6 grid scroll-mt-6 gap-3 rounded-[1.5rem] border border-line bg-white p-5"
        onSubmit={async (event) => {
          event.preventDefault()
          const data = new FormData(event.currentTarget)
          await saveAnnouncement({
            data: {
              title: String(data.get('title') ?? ''),
              body: String(data.get('body') ?? ''),
              published: data.get('published') === 'on',
            },
          })
          setFormKey((k) => k + 1)
          await router.invalidate()
        }}
      >
        <h2 className="font-serif text-2xl text-navy">Nieuwe mededeling</h2>
        <input name="title" required maxLength={limits.title} placeholder="Titel" className={fieldClass} />
        <div className="grid gap-1">
          <span className="text-sm font-semibold text-navy">Tekst</span>
          <RichTextEditor name="body" maxLength={limits.announcementBody} compact />
        </div>
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
            id={`mededeling-${item.id}`}
            className="scroll-mt-6 rounded-[1.5rem] border border-line bg-white p-5"
          >
            <form
              className="grid gap-3"
              onSubmit={async (event) => {
                event.preventDefault()
                const data = new FormData(event.currentTarget)
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
              <input name="title" defaultValue={item.title} maxLength={limits.title} className={fieldClass} />
              <div className="grid gap-1">
                <span className="text-sm font-semibold text-navy">Tekst</span>
                <RichTextEditor
                  name="body"
                  defaultValue={item.body}
                  maxLength={limits.announcementBody}
                  compact
                />
              </div>
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
                    await deleteAnnouncement({ data: { id: item.id } })
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
