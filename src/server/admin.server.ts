import { redirect } from '@tanstack/react-router'
import { and, asc, desc, eq, like, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  announcements,
  contactSubmissions,
  locations,
  newsPosts,
  openingExceptions,
  openingHours,
  services,
  siteContent,
} from '@/lib/schema'
import { nextFreeSlug, slugify } from '@/lib/format'
import { amsterdamNow, fromAmsterdamInput, publishWindow } from '@/lib/hours'
import { toSafeHtml } from '@/lib/sanitize.server'
import { deleteManagedUpload, isManagedUploadUrl, storeUpload } from '@/lib/uploads'
import { getAdminUserImpl } from './auth.server'
import { purgeExpiredMessages, retentionDays } from './contact.server'
import { notificationsEnabled } from '@/lib/mail.server'

async function requireAdmin() {
  const user = await getAdminUserImpl()
  if (!user) throw redirect({ to: '/beheer/login' })
  return user
}

function cleanImage(url?: string | null) {
  const value = url?.trim() || null
  if (!value) return null
  if (value.startsWith('/uploads/') || value.startsWith('/images/')) return value
  return null
}

function cleanAlt(alt?: string | null) {
  return alt?.trim() || null
}

async function uniqueSlug(table: typeof newsPosts | typeof services, base: string, ownId?: string) {
  const rows = await db
    .select({ id: table.id, slug: table.slug })
    .from(table)
    .where(like(table.slug, `${base}%`))
  return nextFreeSlug(base, rows.filter((row) => row.id !== ownId).map((row) => row.slug))
}

export async function getAdminDashboardImpl() {
  await requireAdmin()
  const [openMessages, news, serviceList, anns] = await Promise.all([
    db.select().from(contactSubmissions).where(eq(contactSubmissions.handled, false)),
    db.select().from(newsPosts),
    db.select().from(services),
    db.select().from(announcements),
  ])
  return {
    openMessages: openMessages.length,
    news: news.length,
    services: serviceList.length,
    announcements: anns.length,
  }
}

export async function getAdminContentImpl() {
  await requireAdmin()
  return db.select().from(siteContent).orderBy(asc(siteContent.page), asc(siteContent.sortOrder))
}

export async function saveContentBlockImpl(data: {
  id: string
  title: string
  body: string
  imageUrl?: string | null
  imageAlt?: string | null
}) {
  await requireAdmin()
  const [existing] = await db.select().from(siteContent).where(eq(siteContent.id, data.id)).limit(1)
  const nextUrl = cleanImage(data.imageUrl)
  if (existing && existing.imageUrl && existing.imageUrl !== nextUrl) {
    await deleteManagedUpload(existing.imageUrl)
  }
  await db
    .update(siteContent)
    .set({
      title: data.title,
      body: toSafeHtml(data.body),
      imageUrl: nextUrl,
      imageAlt: cleanAlt(data.imageAlt),
    })
    .where(eq(siteContent.id, data.id))
  return { ok: true }
}

export async function getAdminHoursImpl() {
  await requireAdmin()
  const locs = await db.select().from(locations).orderBy(asc(locations.sortOrder))
  const hours = await db.select().from(openingHours)
  const exceptions = await db.select().from(openingExceptions).orderBy(asc(openingExceptions.date))
  return { locations: locs, hours, exceptions, today: amsterdamNow().date }
}

export async function saveWeekHoursImpl(data: {
  locationId: string
  days: Array<{ id: string; opens: string | null; closes: string | null; isClosed: boolean }>
}) {
  await requireAdmin()
  await db.transaction(async (tx) => {
    for (const day of data.days) {
      await tx
        .update(openingHours)
        .set({
          opens: day.isClosed ? null : day.opens,
          closes: day.isClosed ? null : day.closes,
          isClosed: day.isClosed,
        })
        .where(and(eq(openingHours.id, day.id), eq(openingHours.locationId, data.locationId)))
    }
  })
  return { ok: true }
}

export async function saveExceptionImpl(data: {
  id?: string
  locationId: string | null
  date: string
  opens: string | null
  closes: string | null
  isClosed: boolean
  label: string
}) {
  await requireAdmin()
  const values = {
    locationId: data.locationId,
    date: data.date,
    opens: data.isClosed ? null : data.opens,
    closes: data.isClosed ? null : data.closes,
    isClosed: data.isClosed,
    label: data.label,
  }
  if (data.id) {
    await db.update(openingExceptions).set(values).where(eq(openingExceptions.id, data.id))
  } else {
    await db.insert(openingExceptions).values(values)
  }
  return { ok: true }
}

export async function deleteExceptionImpl(id: string) {
  await requireAdmin()
  await db.delete(openingExceptions).where(eq(openingExceptions.id, id))
  return { ok: true }
}

export async function getAdminAnnouncementsImpl() {
  await requireAdmin()
  return db.select().from(announcements).orderBy(asc(announcements.sortOrder), desc(announcements.createdAt))
}

export async function saveAnnouncementImpl(data: {
  id?: string
  title: string
  body: string
  published: boolean
  visibleUntil: string | null
}) {
  await requireAdmin()
  const fields = {
    title: data.title,
    body: toSafeHtml(data.body),
    published: data.published,
    visibleUntil: data.visibleUntil,
  }
  if (data.id) {
    await db.update(announcements).set(fields).where(eq(announcements.id, data.id))
  } else {
    await db.insert(announcements).values(fields)
  }
  return { ok: true }
}

export async function deleteAnnouncementImpl(id: string) {
  await requireAdmin()
  await db.delete(announcements).where(eq(announcements.id, id))
  return { ok: true }
}

export async function getAdminNewsImpl() {
  await requireAdmin()
  return db
    .select({
      id: newsPosts.id,
      slug: newsPosts.slug,
      title: newsPosts.title,
      imageUrl: newsPosts.imageUrl,
      published: newsPosts.published,
      publishedAt: newsPosts.publishedAt,
      updatedAt: newsPosts.updatedAt,
    })
    .from(newsPosts)
    .orderBy(desc(newsPosts.publishedAt))
}

export async function getAdminNewsPostImpl(id: string) {
  await requireAdmin()
  const [post] = await db.select().from(newsPosts).where(eq(newsPosts.id, id)).limit(1)
  return post ?? null
}

export async function saveNewsImpl(data: {
  id?: string
  title: string
  excerpt: string
  body: string
  imageUrl?: string | null
  imageAlt?: string | null
  published: boolean
  publishedAt?: string
}) {
  await requireAdmin()
  const body = toSafeHtml(data.body)
  const nextUrl = cleanImage(data.imageUrl)
  const publishedAt = data.publishedAt ? fromAmsterdamInput(data.publishedAt) : undefined
  if (publishedAt && !publishWindow().contains(publishedAt)) {
    throw new Error('Kies een publicatiedatum tussen 2000 en twee jaar vooruit.')
  }
  const fields = {
    title: data.title,
    excerpt: data.excerpt,
    body,
    imageUrl: nextUrl,
    imageAlt: cleanAlt(data.imageAlt),
    published: data.published,
    ...(publishedAt ? { publishedAt } : {}),
  }
  if (data.id) {
    const [existing] = await db.select().from(newsPosts).where(eq(newsPosts.id, data.id)).limit(1)
    if (!existing) throw new Error('Dit bericht bestaat niet meer.')
    if (existing.imageUrl && existing.imageUrl !== nextUrl) {
      await deleteManagedUpload(existing.imageUrl)
    }
    // slug stays put after creation so shared links keep working
    await db.update(newsPosts).set(fields).where(eq(newsPosts.id, data.id))
    return { ok: true as const, id: existing.id, slug: existing.slug }
  }
  const id = crypto.randomUUID()
  const slug = await uniqueSlug(newsPosts, slugify(data.title, 'bericht'))
  await db.insert(newsPosts).values({ id, slug, ...fields })
  return { ok: true as const, id, slug }
}

export async function deleteNewsImpl(id: string) {
  await requireAdmin()
  const [existing] = await db.select().from(newsPosts).where(eq(newsPosts.id, id)).limit(1)
  await deleteManagedUpload(existing?.imageUrl)
  await db.delete(newsPosts).where(eq(newsPosts.id, id))
  return { ok: true }
}

export async function getAdminServicesImpl() {
  await requireAdmin()
  return db
    .select({
      id: services.id,
      slug: services.slug,
      title: services.title,
      summary: services.summary,
      published: services.published,
      sortOrder: services.sortOrder,
    })
    .from(services)
    .orderBy(asc(services.sortOrder), asc(services.title))
}

export async function getAdminServiceImpl(id: string) {
  await requireAdmin()
  const [service] = await db.select().from(services).where(eq(services.id, id)).limit(1)
  return service ?? null
}

export async function moveServiceImpl(data: { id: string; direction: 'up' | 'down' }) {
  await requireAdmin()
  const list = await db
    .select({ id: services.id })
    .from(services)
    .orderBy(asc(services.sortOrder), asc(services.title))
  const index = list.findIndex((item) => item.id === data.id)
  const target = index + (data.direction === 'up' ? -1 : 1)
  if (index === -1 || target < 0 || target >= list.length) return { ok: true as const }
  const ordered = [...list]
  ;[ordered[index], ordered[target]] = [ordered[target]!, ordered[index]!]
  // renumber all so legacy duplicate sort values can't make a swap a no-op
  await db.transaction(async (tx) => {
    for (const [i, item] of ordered.entries()) {
      await tx.update(services).set({ sortOrder: i + 1 }).where(eq(services.id, item.id))
    }
  })
  return { ok: true as const }
}

export async function saveServiceImpl(data: {
  id?: string
  title: string
  summary: string
  body: string
  imageUrl?: string | null
  imageAlt?: string | null
  href?: string | null
  published: boolean
}) {
  await requireAdmin()
  const nextUrl = cleanImage(data.imageUrl)
  const fields = {
    title: data.title,
    summary: data.summary,
    body: toSafeHtml(data.body),
    imageUrl: nextUrl,
    imageAlt: cleanAlt(data.imageAlt),
    href: data.href || null,
    published: data.published,
  }
  if (data.id) {
    const [existing] = await db.select().from(services).where(eq(services.id, data.id)).limit(1)
    if (!existing) throw new Error('Deze dienst bestaat niet meer.')
    if (existing.imageUrl && existing.imageUrl !== nextUrl) {
      await deleteManagedUpload(existing.imageUrl)
    }
    await db.update(services).set(fields).where(eq(services.id, data.id))
    return { ok: true as const, id: existing.id, slug: existing.slug }
  }
  const [{ value: last } = { value: 0 }] = await db
    .select({ value: sql<number>`coalesce(max(${services.sortOrder}), 0)` })
    .from(services)
  const id = crypto.randomUUID()
  const slug = await uniqueSlug(services, slugify(data.title, 'dienst'))
  await db.insert(services).values({ id, slug, sortOrder: Number(last) + 1, ...fields })
  return { ok: true as const, id, slug }
}

export async function deleteServiceImpl(id: string) {
  await requireAdmin()
  const [existing] = await db.select().from(services).where(eq(services.id, id)).limit(1)
  await deleteManagedUpload(existing?.imageUrl)
  await db.delete(services).where(eq(services.id, id))
  return { ok: true }
}

export async function getAdminMessagesImpl() {
  await requireAdmin()
  await purgeExpiredMessages()
  const items = await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt))
  return { items, retentionDays: retentionDays(), notifications: notificationsEnabled() }
}

export async function setMessageHandledImpl(data: { id: string; handled: boolean }) {
  await requireAdmin()
  await db
    .update(contactSubmissions)
    .set({ handled: data.handled, handledAt: data.handled ? new Date() : null })
    .where(eq(contactSubmissions.id, data.id))
  return { ok: true }
}

export async function deleteMessageImpl(id: string) {
  await requireAdmin()
  await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id))
  return { ok: true }
}

export async function uploadImageImpl(file: File) {
  await requireAdmin()
  const url = await storeUpload(file)
  return { url }
}

export async function deleteUploadedImageImpl(url: string) {
  await requireAdmin()
  if (!isManagedUploadUrl(url)) {
    throw new Error('Alleen geüploade bestanden kunnen worden verwijderd.')
  }
  await deleteManagedUpload(url)
  return { ok: true }
}
