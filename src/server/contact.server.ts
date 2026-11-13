import { and, eq, lt, sql } from 'drizzle-orm'
import { clientIp } from '@/lib/clientIp'
import { db } from '@/lib/db'
import { notifyNewMessage } from '@/lib/mail.server'
import { contactSubmissions } from '@/lib/schema'
import { siteUrl } from '@/server/public.server'

const hits = new Map<string, { n: number; t: number }>()
const WINDOW = 15 * 60 * 1000
const LIMIT = 8
const MAX_KEYS = 10_000

function limited(key: string) {
  const now = Date.now()
  const prev = hits.get(key)
  if (!prev || now - prev.t > WINDOW) {
    if (hits.size >= MAX_KEYS) {
      for (const [entryKey, entry] of hits) {
        if (now - entry.t > WINDOW) hits.delete(entryKey)
      }
      if (hits.size >= MAX_KEYS) return true
    }
    hits.set(key, { n: 1, t: now })
    return false
  }
  prev.n += 1
  return prev.n > LIMIT
}

export function retentionDays() {
  const days = Number(process.env.MESSAGE_RETENTION_DAYS ?? 90)
  return Number.isFinite(days) && days >= 1 ? Math.floor(days) : 90
}

// avg: handled messages are removed after the retention period; open ones stay until handled
export async function purgeExpiredMessages() {
  const cutoff = new Date(Date.now() - retentionDays() * 24 * 60 * 60 * 1000)
  await db
    .delete(contactSubmissions)
    .where(
      and(
        eq(contactSubmissions.handled, true),
        lt(sql`coalesce(${contactSubmissions.handledAt}, ${contactSubmissions.createdAt})`, cutoff),
      ),
    )
}

export async function submitContactImpl(data: {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  website?: string
}) {
  if (data.website) return { ok: true as const }
  const email = data.email.toLowerCase()
  const ip = clientIp()
  if (limited(`ip:${ip}`) || limited(`email:${email}`)) {
    return { error: 'Te veel berichten. Probeer het later opnieuw.' }
  }
  await db.insert(contactSubmissions).values({
    name: data.name,
    email: data.email,
    phone: data.phone ?? '',
    subject: data.subject,
    message: data.message,
  })
  void notifyNewMessage(data.subject, siteUrl())
  void purgeExpiredMessages().catch(() => {})
  return { ok: true as const }
}
