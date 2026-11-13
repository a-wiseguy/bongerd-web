import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { AdminIndexedPage } from '@/components/AdminPageIndex'
import { Field, PublishField, fieldClass } from '@/components/AdminShell'
import { AdminForm, DeleteButton, SaveButton } from '@/components/admin/AdminForm'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { StatusPill } from '@/components/admin/StatusPill'
import { formatNlDay } from '@/lib/format'
import { amsterdamNow } from '@/lib/hours'
import { limits } from '@/lib/limits'
import { pageHead } from '@/lib/seo'
import { deleteAnnouncement, getAdminAnnouncements, saveAnnouncement } from '@/server/admin'

export const Route = createFileRoute('/beheer/mededelingen')({
  loader: () => getAdminAnnouncements(),
  head: (ctx) =>
    pageHead(ctx, { title: 'Mededelingen · Beheer', description: 'Mededelingen beheren.', noindex: true }),
  component: AnnouncementsAdmin,
})

type Announcement = Awaited<ReturnType<typeof getAdminAnnouncements>>[number]

function fieldsFrom(data: FormData) {
  return {
    title: String(data.get('title') ?? ''),
    body: String(data.get('body') ?? ''),
    published: data.get('published') === 'on',
    visibleUntil: String(data.get('visibleUntil') ?? '') || null,
  }
}

function announcementStatus(item: Announcement, today: string) {
  if (!item.published) return { tone: 'draft' as const, label: 'Verborgen' }
  if (item.visibleUntil && item.visibleUntil < today) return { tone: 'draft' as const, label: 'Verlopen' }
  return { tone: 'online' as const, label: 'Online' }
}

function AnnouncementFields({ item, draftKey }: { item?: Announcement; draftKey?: number }) {
  return (
    <>
      <Field label="Titel">
        <input name="title" required defaultValue={item?.title} maxLength={limits.title} className={fieldClass} />
      </Field>
      <div className="grid gap-1">
        <span className="text-sm font-semibold text-navy">Tekst</span>
        <RichTextEditor
          key={draftKey}
          name="body"
          defaultValue={item?.body}
          maxLength={limits.announcementBody}
          compact
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 sm:items-start">
        <Field label="Tonen tot en met (optioneel)" hint="Daarna verdwijnt de mededeling vanzelf van de homepage.">
          <input name="visibleUntil" type="date" defaultValue={item?.visibleUntil ?? ''} className={fieldClass} />
        </Field>
        <PublishField defaultChecked={item?.published ?? true} />
      </div>
    </>
  )
}

function AnnouncementsAdmin() {
  const items = Route.useLoaderData()
  const router = useRouter()
  const [draftKey, setDraftKey] = useState(0)
  const today = amsterdamNow().date
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
      <p className="mt-2 text-muted">
        Korte, tijdelijke berichten bovenaan de homepage, zoals een gewijzigde openingstijd of een storing.
      </p>
      <AdminForm
        id="mededeling-nieuw"
        className="mt-6 scroll-mt-6 rounded-[1.5rem] border border-line bg-white p-5"
        success="Mededeling toegevoegd."
        onSave={async (data, form) => {
          await saveAnnouncement({ data: fieldsFrom(data) })
          form.reset()
          setDraftKey((key) => key + 1)
          await router.invalidate()
        }}
      >
        <h2 className="font-serif text-2xl text-navy">Nieuwe mededeling</h2>
        <AnnouncementFields draftKey={draftKey} />
        <SaveButton>Toevoegen</SaveButton>
      </AdminForm>
      {items.length ? (
        <h2 className="mt-10 font-serif text-2xl text-navy">Bestaande mededelingen</h2>
      ) : null}
      <ul className="mt-4 grid gap-4">
        {items.map((item) => {
          const status = announcementStatus(item, today)
          return (
            <li key={item.id} id={`mededeling-${item.id}`} className="scroll-mt-6">
              <AdminForm
                className="rounded-[1.5rem] border border-line bg-white p-5"
                onSave={async (data) => {
                  await saveAnnouncement({ data: { id: item.id, ...fieldsFrom(data) } })
                  await router.invalidate()
                }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill tone={status.tone}>{status.label}</StatusPill>
                  {item.visibleUntil ? (
                    <span className="text-sm text-muted">
                      {status.label === 'Verlopen' ? 'Was zichtbaar' : 'Zichtbaar'} t/m {formatNlDay(item.visibleUntil, true)}
                    </span>
                  ) : null}
                </div>
                <AnnouncementFields item={item} />
                <div className="flex flex-wrap items-center gap-2">
                  <SaveButton>Opslaan</SaveButton>
                  <DeleteButton
                    confirmText={`“${item.title}” wordt definitief verwijderd.`}
                    onConfirm={async () => {
                      await deleteAnnouncement({ data: { id: item.id } })
                      await router.invalidate()
                    }}
                  />
                </div>
              </AdminForm>
            </li>
          )
        })}
      </ul>
    </AdminIndexedPage>
  )
}
