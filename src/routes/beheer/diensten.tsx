import { createFileRoute, useRouter } from '@tanstack/react-router'
import { btnClass, fieldClass, ghostBtn } from '@/components/AdminShell'
import { deleteService, getAdminServices, saveService } from '@/server/admin'

export const Route = createFileRoute('/beheer/diensten')({
  loader: () => getAdminServices(),
  component: ServicesAdmin,
})

function ServicesAdmin() {
  const items = Route.useLoaderData()
  const router = useRouter()

  return (
    <div>
      <h1 className="font-serif text-4xl text-navy">Diensten</h1>
      <form
        className="mt-6 grid gap-3 rounded-[1.5rem] border border-line bg-white p-5"
        onSubmit={async (event) => {
          event.preventDefault()
          const data = new FormData(event.currentTarget)
          await saveService({
            data: {
              title: String(data.get('title') ?? ''),
              summary: String(data.get('summary') ?? ''),
              body: String(data.get('body') ?? ''),
              href: String(data.get('href') || '') || null,
              published: data.get('published') === 'on',
              sortOrder: Number(data.get('sortOrder') || items.length + 1),
            },
          })
          event.currentTarget.reset()
          await router.invalidate()
        }}
      >
        <h2 className="font-serif text-2xl text-navy">Nieuwe dienst</h2>
        <input name="title" required placeholder="Titel" className={fieldClass} />
        <textarea name="summary" required rows={2} placeholder="Samenvatting" className={fieldClass} />
        <textarea name="body" required rows={5} placeholder="Tekst" className={fieldClass} />
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
          <li key={item.id} className="rounded-[1.5rem] border border-line bg-white p-5">
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
                    href: String(data.get('href') || '') || null,
                    published: data.get('published') === 'on',
                    sortOrder: Number(data.get('sortOrder') || 0),
                  },
                })
                await router.invalidate()
              }}
            >
              <input name="title" defaultValue={item.title} className={fieldClass} />
              <textarea name="summary" defaultValue={item.summary} rows={2} className={fieldClass} />
              <textarea name="body" defaultValue={item.body} rows={5} className={fieldClass} />
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
    </div>
  )
}
