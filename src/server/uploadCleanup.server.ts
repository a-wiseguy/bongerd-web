import { readdir, stat, unlink } from 'node:fs/promises'
import path from 'node:path'
import { isNotNull, like } from 'drizzle-orm'
import { db } from '@/lib/db'
import { newsPosts, services, siteContent } from '@/lib/schema'
import { orphanedUploads, uploadsRoot } from '@/lib/uploads'

const EVERY_MS = 6 * 3_600_000
let lastRun = 0

async function referencedUploadUrls() {
  const tables = [siteContent, services, newsPosts] as const
  const rows = await Promise.all(
    tables.flatMap((table) => [
      db.select({ value: table.imageUrl }).from(table).where(isNotNull(table.imageUrl)),
      db.select({ value: table.body }).from(table).where(like(table.body, '%/uploads/%')),
    ]),
  )
  const urls = new Set<string>()
  for (const { value } of rows.flat()) {
    for (const match of String(value ?? '').matchAll(/\/uploads\/[a-z0-9.-]+/gi)) urls.add(match[0])
  }
  return urls
}

/** throttled per process; failures only log, never break the caller */
export async function purgeOrphanedUploads({ force = false } = {}) {
  if (!force && Date.now() - lastRun < EVERY_MS) return []
  lastRun = Date.now()
  try {
    const root = uploadsRoot()
    const names = await readdir(root).catch(() => [] as string[])
    const files = await Promise.all(
      names.map(async (name) => ({ name, mtimeMs: (await stat(path.join(root, name))).mtimeMs })),
    )
    const orphans = orphanedUploads(files, await referencedUploadUrls())
    await Promise.all(orphans.map((name) => unlink(path.join(root, name)).catch(() => {})))
    if (orphans.length) console.info(`[uploads] removed ${orphans.length} unused file(s)`)
    return orphans
  } catch (error) {
    console.error('[uploads] cleanup failed', error instanceof Error ? error.message : error)
    return []
  }
}
