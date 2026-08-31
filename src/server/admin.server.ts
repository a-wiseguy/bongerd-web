import { redirect } from '@tanstack/react-router'
import { asc, desc, eq } from 'drizzle-orm'
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
import { slugify } from '@/lib/format'
import { sanitizeForStorage } from '@/lib/sanitize'
import { deleteManagedUpload, isManagedUploadUrl, storeUpload } from '@/lib/uploads'
import { getAdminUserImpl } from './auth.server'

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
      body: sanitizeForStorage(data.body),
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
  return { locations: locs, hours, exceptions }
}

export async function saveOpeningHourImpl(data: {
  id: string
  opens: string | null
  closes: string | null
  isClosed: boolean
}) {
  await requireAdmin()
  await db
    .update(openingHours)
    .set({
      opens: data.isClosed ? null : data.opens,
      closes: data.isClosed ? null : data.closes,
      isClosed: data.isClosed,
    })
    .where(eq(openingHours.id, data.id))
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
}) {
  await requireAdmin()
  const body = sanitizeForStorage(data.body)
  if (data.id) {
    await db
      .update(announcements)
      .set({ title: data.title, body, published: data.published })
      .where(eq(announcements.id, data.id))
  } else {
    await db.insert(announcements).values({
      title: data.title,
      body,
      published: data.published,
    })
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
  return db.select().from(newsPosts).orderBy(desc(newsPosts.publishedAt))
}

export async function saveNewsImpl(data: {
  id?: string
  title: string
  excerpt: string
  body: string
  imageUrl?: string | null
  imageAlt?: string | null
  published: boolean
  slug?: string
}) {
  await requireAdmin()
  const slug = slugify(data.slug || data.title)
  const body = sanitizeForStorage(data.body)
  const nextUrl = cleanImage(data.imageUrl)
  if (data.id) {
    const [existing] = await db.select().from(newsPosts).where(eq(newsPosts.id, data.id)).limit(1)
    if (existing?.imageUrl && existing.imageUrl !== nextUrl) {
      await deleteManagedUpload(existing.imageUrl)
    }
    await db
      .update(newsPosts)
      .set({
        title: data.title,
        excerpt: data.excerpt,
        body,
        imageUrl: nextUrl,
        imageAlt: cleanAlt(data.imageAlt),
        published: data.published,
        slug,
      })
      .where(eq(newsPosts.id, data.id))
  } else {
    await db.insert(newsPosts).values({
      title: data.title,
      excerpt: data.excerpt,
      body,
      imageUrl: nextUrl,
      imageAlt: cleanAlt(data.imageAlt),
      published: data.published,
      slug,
    })
  }
  return { ok: true }
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
  return db.select().from(services).orderBy(asc(services.sortOrder))
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
  sortOrder: number
}) {
  await requireAdmin()
  const slug = slugify(data.title)
  const body = sanitizeForStorage(data.body)
  const nextUrl = cleanImage(data.imageUrl)
  if (data.id) {
    const [existing] = await db.select().from(services).where(eq(services.id, data.id)).limit(1)
    if (existing?.imageUrl && existing.imageUrl !== nextUrl) {
      await deleteManagedUpload(existing.imageUrl)
    }
    await db
      .update(services)
      .set({
        title: data.title,
        summary: data.summary,
        body,
        imageUrl: nextUrl,
        imageAlt: cleanAlt(data.imageAlt),
        href: data.href || null,
        published: data.published,
        sortOrder: data.sortOrder,
      })
      .where(eq(services.id, data.id))
  } else {
    await db.insert(services).values({
      title: data.title,
      summary: data.summary,
      body,
      imageUrl: nextUrl,
      imageAlt: cleanAlt(data.imageAlt),
      href: data.href || null,
      published: data.published,
      sortOrder: data.sortOrder,
      slug,
    })
  }
  return { ok: true }
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
  return db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt))
}

export async function setMessageHandledImpl(data: { id: string; handled: boolean }) {
  await requireAdmin()
  await db.update(contactSubmissions).set({ handled: data.handled }).where(eq(contactSubmissions.id, data.id))
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
