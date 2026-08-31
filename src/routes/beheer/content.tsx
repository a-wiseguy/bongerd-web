import { createFileRoute, useRouter } from '@tanstack/react-router'
import { AdminIndexedPage } from '@/components/AdminPageIndex'
import { btnClass, fieldClass } from '@/components/AdminShell'
import { ImageField } from '@/components/admin/ImageField'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { limits } from '@/lib/limits'
import { getAdminContent, saveContentBlock } from '@/server/admin'

export const Route = createFileRoute('/beheer/content')({
  loader: () => getAdminContent(),
  component: ContentAdmin,
})

function pageLabel(page: string) {
  return page.replace(/-/g, ' ')
}

function ContentAdmin() {
  const blocks = Route.useLoaderData()
  const router = useRouter()
  const pages = [...new Set(blocks.map((b) => b.page))]
  const indexItems = blocks.map((block) => ({
    id: `blok-${block.id}`,
    label: `${pageLabel(block.page)} · ${block.blockKey}`,
  }))

  return (
    <AdminIndexedPage items={indexItems}>
      <h1 className="font-serif text-4xl text-navy">Teksten</h1>
      <p className="mt-2 text-muted">
        Titel en opgemaakte tekst per blok. Bij intro-blokken kunt u ook de paginakop-afbeelding beheren.
      </p>
      <div className="mt-8 grid gap-10">
        {pages.map((page) => (
          <section key={page} className="scroll-mt-6">
            <h2 className="font-serif text-3xl capitalize text-navy">{pageLabel(page)}</h2>
            <div className="mt-4 grid gap-4">
              {blocks
                .filter((b) => b.page === page)
                .map((block) => (
                  <form
                    key={block.id}
                    id={`blok-${block.id}`}
                    className="scroll-mt-6 rounded-[1.5rem] border border-line bg-white p-5"
                    onSubmit={async (event) => {
                      event.preventDefault()
                      const data = new FormData(event.currentTarget)
                      await saveContentBlock({
                        data: {
                          id: block.id,
                          title: String(data.get('title') ?? ''),
                          body: String(data.get('body') ?? ''),
                          imageUrl: String(data.get('imageUrl') ?? '') || null,
                          imageAlt: String(data.get('imageAlt') ?? '') || null,
                        },
                      })
                      await router.invalidate()
                    }}
                  >
                    <p className="text-sm font-semibold text-muted">{block.blockKey}</p>
                    <label className="mt-2 grid gap-1">
                      <span className="text-sm font-semibold text-navy">Titel</span>
                      <input
                        name="title"
                        defaultValue={block.title}
                        maxLength={limits.title}
                        className={fieldClass}
                      />
                    </label>
                    <div className="mt-3 grid gap-1">
                      <span className="text-sm font-semibold text-navy">Tekst</span>
                      <RichTextEditor name="body" defaultValue={block.body} maxLength={limits.contentBody} />
                    </div>
                    {block.blockKey === 'intro' ? (
                      <div className="mt-3">
                        <ImageField
                          defaultUrl={block.imageUrl}
                          defaultAlt={block.imageAlt}
                          label="Paginakop-afbeelding"
                        />
                      </div>
                    ) : null}
                    <button type="submit" className={`${btnClass} mt-3`}>
                      Opslaan
                    </button>
                  </form>
                ))}
            </div>
          </section>
        ))}
      </div>
    </AdminIndexedPage>
  )
}
