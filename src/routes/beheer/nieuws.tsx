import { createFileRoute, useRouter } from '@tanstack/react-router'
import { btnClass, fieldClass, ghostBtn } from '@/components/AdminShell'
import { deleteNews, getAdminNews, saveNews } from '@/server/admin'

export const Route = createFileRoute('/beheer/nieuws')({
  loader: () => getAdminNews(),
  component: NewsAdmin,
})

function NewsAdmin() {
  const posts = Route.useLoaderData()
  const router = useRouter()

  return (
    <div>
      <h1 className="font-serif text-4xl text-navy">Nieuws</h1>
      <form
        className="mt-6 grid gap-3 rounded-[1.5rem] border border-line bg-white p-5"
        onSubmit={async (event) => {
          event.preventDefault()
          const data = new FormData(event.currentTarget)
          await saveNews({
            data: {
              title: String(data.get('title') ?? ''),
              excerpt: String(data.get('excerpt') ?? ''),
              body: String(data.get('body') ?? ''),
              published: data.get('published') === 'on',
            },
          })
          event.currentTarget.reset()
          await router.invalidate()
        }}
      >
        <h2 className="font-serif text-2xl text-navy">Nieuw bericht</h2>
        <label className="grid gap-1">
          <span className="text-sm font-semibold text-navy">Titel</span>
          <input name="title" required className={fieldClass} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm font-semibold text-navy">Korte samenvatting</span>
          <textarea name="excerpt" required rows={2} className={fieldClass} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm font-semibold text-navy">Bericht</span>
          <textarea name="body" required rows={6} className={fieldClass} />
        </label>
        <label className="flex items-center gap-2">
          <input name="published" type="checkbox" defaultChecked />
          Gepubliceerd
        </label>
        <button type="submit" className={btnClass}>
          Publiceren
        </button>
      </form>
      <ul className="mt-6 grid gap-4">
        {posts.map((post) => (
          <li key={post.id} className="rounded-[1.5rem] border border-line bg-white p-5">
            <form
              className="grid gap-3"
              onSubmit={async (event) => {
                event.preventDefault()
                const data = new FormData(event.currentTarget)
                await saveNews({
                  data: {
                    id: post.id,
                    slug: post.slug,
                    title: String(data.get('title') ?? ''),
                    excerpt: String(data.get('excerpt') ?? ''),
                    body: String(data.get('body') ?? ''),
                    published: data.get('published') === 'on',
                  },
                })
                await router.invalidate()
              }}
            >
              <input name="title" defaultValue={post.title} className={fieldClass} />
              <textarea name="excerpt" defaultValue={post.excerpt} rows={2} className={fieldClass} />
              <textarea name="body" defaultValue={post.body} rows={6} className={fieldClass} />
              <label className="flex items-center gap-2">
                <input name="published" type="checkbox" defaultChecked={post.published} />
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
                    await deleteNews({ data: { id: post.id } })
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
