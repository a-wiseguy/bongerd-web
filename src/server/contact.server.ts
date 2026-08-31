import { db } from '@/lib/db'
import { contactSubmissions } from '@/lib/schema'

const hits = new Map<string, { n: number; t: number }>()
const WINDOW = 15 * 60 * 1000
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
  return prev.n > 8
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
  if (limited(data.email.toLowerCase())) {
    return { error: 'Te veel berichten. Probeer het later opnieuw.' }
  }
  await db.insert(contactSubmissions).values({
    name: data.name,
    email: data.email,
    phone: data.phone ?? '',
    subject: data.subject,
    message: data.message,
  })
  return { ok: true as const }
}
