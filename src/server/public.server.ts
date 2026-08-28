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
import { locationStatus } from '@/lib/hours'

export async function getLocationsImpl() {
  return db.select().from(locations).orderBy(asc(locations.sortOrder))
}

export async function getPageBlocksImpl(page: string) {
  return db.select().from(siteContent).where(eq(siteContent.page, page)).orderBy(asc(siteContent.sortOrder))
}

export async function getPublishedServicesImpl() {
  return db.select().from(services).where(eq(services.published, true)).orderBy(asc(services.sortOrder))
}

export async function getPublishedNewsImpl() {
  return db.select().from(newsPosts).where(eq(newsPosts.published, true)).orderBy(desc(newsPosts.publishedAt))
}

export async function getNewsBySlugImpl(slug: string) {
  const [post] = await db
    .select()
    .from(newsPosts)
    .where(and(eq(newsPosts.slug, slug), eq(newsPosts.published, true)))
    .limit(1)
  return post ?? null
}

export async function loadHoursBundle() {
  const locs = await db.select().from(locations).orderBy(asc(locations.sortOrder))
  const hours = await db.select().from(openingHours)
  const exceptions = await db.select().from(openingExceptions)
  return locs.map((loc) => {
    const locHours = hours.filter((h) => h.locationId === loc.id)
    const locExceptions = exceptions.filter((e) => e.locationId === loc.id || e.locationId == null)
    return {
      location: loc,
      hours: locHours,
      exceptions: locExceptions,
      status: locationStatus(locHours, locExceptions),
    }
  })
}

export async function getHomeDataImpl() {
  const [blocks, anns, serviceList, news, hours] = await Promise.all([
    db.select().from(siteContent).where(eq(siteContent.page, 'home')).orderBy(asc(siteContent.sortOrder)),
    db
      .select()
      .from(announcements)
      .where(eq(announcements.published, true))
      .orderBy(asc(announcements.sortOrder), desc(announcements.createdAt)),
    db.select().from(services).where(eq(services.published, true)).orderBy(asc(services.sortOrder)),
    db
      .select()
      .from(newsPosts)
      .where(eq(newsPosts.published, true))
      .orderBy(desc(newsPosts.publishedAt))
      .limit(3),
    loadHoursBundle(),
  ])
  return { blocks, announcements: anns, services: serviceList.slice(0, 6), news, hours }
}
