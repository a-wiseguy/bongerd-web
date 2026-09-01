import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
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

const pageTitles: Record<string, string> = {
  home: 'Home',
  'over-ons': 'Over ons',
  openingstijden: 'Openingstijden',
  diensten: 'Diensten',
  nieuws: 'Nieuws',
  contact: 'Contact',
  privacy: 'Privacy',
}

const pageOrder = Object.keys(pageTitles)

function pageLabel(page: string) {
  return pageTitles[page] ?? page.replace(/-/g, ' ')
}

function ContentAdmin() {
  const blocks = Route.useLoaderData()
  const router = useRouter()
  const pages = useMemo(() => {
    const keys = [...new Set(blocks.map((b) => b.page))]
    return keys.sort((a, b) => {
      const ai = pageOrder.indexOf(a)
      const bi = pageOrder.indexOf(b)
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })
  }, [blocks])
  const [page, setPage] = useState(pages[0] ?? 'home')
  const pageBlocks = blocks.filter((b) => b.page === page)
  const indexItems = pageBlocks.map((block) => ({
    id: `blok-${block.id}`,
    label: block.blockKey,
  }))

  return (
    <div>
      <h1 className="font-serif text-4xl text-navy">Teksten</h1>
      <p className="mt-2 text-muted">
        Kies een pagina, bewerk de blokken. Bij intro-blokken kunt u ook de paginakop-afbeelding beheren.
      </p>

      <div
        className="mt-6 flex gap-1 overflow-x-auto pb-1"
        role="tablist"
        aria-label="Pagina kiezen"
      >
        {pages.map((key) => {
          const selected = key === page
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`inline-flex min-h-11 shrink-0 items-center rounded-full px-3.5 text-sm font-semibold transition ${
                selected
                  ? 'bg-navy text-white'
                  : 'border border-line bg-white text-navy hover:bg-mist'
              }`}
              onClick={() => setPage(key)}
            >
              {pageLabel(key)}
            </button>
          )
        })}
      </div>

      <div className="mt-8">
        <AdminIndexedPage items={indexItems} title="Blokken">
          <div className="grid gap-4">
            <h2 className="font-serif text-3xl text-navy">{pageLabel(page)}</h2>
            {pageBlocks.map((block) => (
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
        </AdminIndexedPage>
      </div>
    </div>
  )
}
