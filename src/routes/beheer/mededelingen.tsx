import { createFileRoute, useRouter } from '@tanstack/react-router'
import { btnClass, fieldClass, ghostBtn } from '@/components/AdminShell'
import { deleteAnnouncement, getAdminAnnouncements, saveAnnouncement } from '@/server/admin'

export const Route = createFileRoute('/beheer/mededelingen')({
  loader: () => getAdminAnnouncements(),
  component: AnnouncementsAdmin,
})

function AnnouncementsAdmin() {
  const items = Route.useLoaderData()
  const router = useRouter()

  return (
    <div>
      <h1 className="font-serif text-4xl text-navy">Mededelingen</h1>
      <p className="mt-2 text-muted">Deze teksten staan op de homepage.</p>
      <form
        className="mt-6 grid gap-3 rounded-[1.5rem] border border-line bg-white p-5"
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
          event.currentTarget.reset()
          await router.invalidate()
        }}
      >
        <h2 className="font-serif text-2xl text-navy">Nieuwe mededeling</h2>
        <input name="title" required placeholder="Titel" className={fieldClass} />
        <textarea name="body" required rows={4} placeholder="Tekst" className={fieldClass} />
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
          <li key={item.id} className="rounded-[1.5rem] border border-line bg-white p-5">
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
              <input name="title" defaultValue={item.title} className={fieldClass} />
              <textarea name="body" defaultValue={item.body} rows={4} className={fieldClass} />
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
    </div>
  )
}
