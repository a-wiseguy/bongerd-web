import { createFileRoute, useRouter } from '@tanstack/react-router'
import { btnClass, fieldClass } from '@/components/AdminShell'
import { getAdminContent, saveContentBlock } from '@/server/admin'

export const Route = createFileRoute('/beheer/content')({
  loader: () => getAdminContent(),
  component: ContentAdmin,
})

function ContentAdmin() {
  const blocks = Route.useLoaderData()
  const router = useRouter()
  const pages = [...new Set(blocks.map((b) => b.page))]

  return (
    <div>
      <h1 className="font-serif text-4xl text-navy">Teksten</h1>
      <p className="mt-2 text-muted">Titel en tekst per blok. Lege regels scheiden alinea’s.</p>
      <div className="mt-8 grid gap-10">
        {pages.map((page) => (
          <section key={page}>
            <h2 className="font-serif text-3xl capitalize text-navy">{page.replace('-', ' ')}</h2>
            <div className="mt-4 grid gap-4">
              {blocks
                .filter((b) => b.page === page)
                .map((block) => (
                  <form
                    key={block.id}
                    className="rounded-[1.5rem] border border-line bg-white p-5"
                    onSubmit={async (event) => {
                      event.preventDefault()
                      const data = new FormData(event.currentTarget)
                      await saveContentBlock({
                        data: {
                          id: block.id,
                          title: String(data.get('title') ?? ''),
                          body: String(data.get('body') ?? ''),
                        },
                      })
                      await router.invalidate()
                    }}
                  >
                    <p className="text-sm font-semibold text-muted">{block.blockKey}</p>
                    <input name="title" defaultValue={block.title} className={`${fieldClass} mt-2`} />
                    <textarea name="body" defaultValue={block.body} rows={6} className={`${fieldClass} mt-3`} />
                    <button type="submit" className={`${btnClass} mt-3`}>
                      Opslaan
                    </button>
                  </form>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
