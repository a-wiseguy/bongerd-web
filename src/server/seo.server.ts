import { and, desc, eq, lte } from 'drizzle-orm'
import { db } from '@/lib/db'
import { newsPosts } from '@/lib/schema'
import { siteUrl } from '@/server/public.server'

const STATIC_PATHS = ['/', '/openingstijden', '/diensten', '/nieuws', '/contact', '/over-ons', '/privacy']

function xmlEscape(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function robotsTxt() {
  return ['User-agent: *', 'Disallow: /beheer', '', `Sitemap: ${siteUrl()}/sitemap.xml`, ''].join('\n')
}

export async function sitemapXml() {
  const origin = siteUrl()
  const posts = await db
    .select({ slug: newsPosts.slug, updatedAt: newsPosts.updatedAt })
    .from(newsPosts)
    .where(and(eq(newsPosts.published, true), lte(newsPosts.publishedAt, new Date())))
    .orderBy(desc(newsPosts.publishedAt))

  const urls = [
    ...STATIC_PATHS.map((path) => ({ loc: `${origin}${path}` })),
    ...posts.map((post) => ({
      loc: `${origin}/nieuws/${post.slug}`,
      lastmod: new Date(post.updatedAt).toISOString().slice(0, 10),
    })),
  ]

  const body = urls
    .map(
      (url) =>
        `  <url><loc>${xmlEscape(url.loc)}</loc>${'lastmod' in url ? `<lastmod>${url.lastmod}</lastmod>` : ''}</url>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
}
