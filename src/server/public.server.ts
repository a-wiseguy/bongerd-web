import { and, asc, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  announcements,
  locations,
  newsPosts,
  openingExceptions,
  openingHours,
  services,
  siteContent,
} from '@/lib/schema'
import { amsterdamNow, locationStatus, upcomingExceptions } from '@/lib/hours'
import { pharmacyJsonLd, serializeJsonLd } from '@/lib/seo'
import { toSafeHtml } from '@/lib/sanitize.server'

export function siteUrl() {
  return (process.env.SITE_URL || 'http://localhost:3000').replace(/\/+$/, '')
}

function withSafeBody<T extends { body: string }>(rows: T[]) {
  return rows.map((row) => ({ ...row, body: toSafeHtml(row.body) }))
}

export async function getLocationsImpl() {
  return db.select().from(locations).orderBy(asc(locations.sortOrder))
}

export async function getPageBlocksImpl(page: string) {
  const rows = await db
    .select()
    .from(siteContent)
    .where(eq(siteContent.page, page))
    .orderBy(asc(siteContent.sortOrder))
  return withSafeBody(rows)
}

export async function getPublishedServicesImpl() {
  const rows = await db
    .select()
    .from(services)
    .where(eq(services.published, true))
    .orderBy(asc(services.sortOrder))
  return withSafeBody(rows)
}

export async function getPublishedNewsImpl() {
  return db
    .select({
      id: newsPosts.id,
      slug: newsPosts.slug,
      title: newsPosts.title,
      excerpt: newsPosts.excerpt,
      imageUrl: newsPosts.imageUrl,
      imageAlt: newsPosts.imageAlt,
      publishedAt: newsPosts.publishedAt,
    })
    .from(newsPosts)
    .where(eq(newsPosts.published, true))
    .orderBy(desc(newsPosts.publishedAt))
}

export async function getNewsBySlugImpl(slug: string) {
  const [post] = await db
    .select()
    .from(newsPosts)
    .where(and(eq(newsPosts.slug, slug), eq(newsPosts.published, true)))
    .limit(1)
  return post ? { ...post, body: toSafeHtml(post.body) } : null
}

export async function loadHoursBundle() {
  const now = amsterdamNow()
  const [locs, hours, exceptions] = await Promise.all([
    db.select().from(locations).orderBy(asc(locations.sortOrder)),
    db.select().from(openingHours),
    db.select().from(openingExceptions),
  ])
  return locs.map((loc) => {
    const locHours = hours.filter((h) => h.locationId === loc.id)
    const locExceptions = upcomingExceptions(
      exceptions.filter((e) => e.locationId === loc.id || e.locationId == null),
      now.date,
    )
    return {
      location: loc,
      hours: locHours,
      exceptions: locExceptions,
      status: locationStatus(locHours, locExceptions, now),
      today: now.weekday,
    }
  })
}

export async function getSiteShellImpl() {
  const bundles = await loadHoursBundle()
  const origin = siteUrl()
  return {
    siteUrl: origin,
    locations: bundles.map((item) => item.location),
    jsonLd: serializeJsonLd(pharmacyJsonLd(origin, bundles)),
  }
}

export async function getHomeDataImpl() {
  const [blocks, anns, serviceList, news, hours] = await Promise.all([
    getPageBlocksImpl('home'),
    db
      .select()
      .from(announcements)
      .where(eq(announcements.published, true))
      .orderBy(asc(announcements.sortOrder), desc(announcements.createdAt)),
    db
      .select({
        id: services.id,
        slug: services.slug,
        title: services.title,
        summary: services.summary,
        imageUrl: services.imageUrl,
        imageAlt: services.imageAlt,
      })
      .from(services)
      .where(eq(services.published, true))
      .orderBy(asc(services.sortOrder))
      .limit(6),
    db
      .select({
        id: newsPosts.id,
        slug: newsPosts.slug,
        title: newsPosts.title,
        excerpt: newsPosts.excerpt,
        imageUrl: newsPosts.imageUrl,
        imageAlt: newsPosts.imageAlt,
        publishedAt: newsPosts.publishedAt,
      })
      .from(newsPosts)
      .where(eq(newsPosts.published, true))
      .orderBy(desc(newsPosts.publishedAt))
      .limit(3),
    loadHoursBundle(),
  ])
  return { blocks, announcements: withSafeBody(anns), services: serviceList, news, hours }
}
