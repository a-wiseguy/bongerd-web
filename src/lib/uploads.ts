import { mkdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { uploadLimits } from './limits'

const mimeToExt = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const

type AllowedMime = keyof typeof mimeToExt

export function uploadsRoot() {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), 'data', 'uploads')
}

export function isManagedUploadUrl(url: string | null | undefined): url is string {
  return Boolean(url && /^\/uploads\/[a-z0-9-]+\.(jpg|png|webp)$/i.test(url))
}

export function uploadPathFromUrl(url: string) {
  const name = path.basename(url)
  if (!/^[a-z0-9-]+\.(jpg|png|webp)$/i.test(name)) {
    throw new Error('Ongeldige bestandsnaam')
  }
  return path.join(uploadsRoot(), name)
}

function sniffMime(buf: Buffer): AllowedMime | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return 'image/png'
  }
  if (
    buf.length >= 12 &&
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp'
  }
  return null
}

export async function ensureUploadsDir() {
  await mkdir(uploadsRoot(), { recursive: true })
}

export async function storeUpload(file: File) {
  if (file.size <= 0 || file.size > uploadLimits.maxBytes) {
    throw new Error('Bestand is te groot (max 2 MB).')
  }

  const claimed = file.type as AllowedMime
  if (!uploadLimits.allowedMime.includes(claimed)) {
    throw new Error('Alleen JPEG, PNG of WebP toegestaan.')
  }

  const buf = Buffer.from(await file.arrayBuffer())
  const sniffed = sniffMime(buf)
  if (!sniffed || sniffed !== claimed) {
    throw new Error('Bestandstype komt niet overeen met de inhoud.')
  }

  await ensureUploadsDir()
  const filename = `${crypto.randomUUID()}.${mimeToExt[sniffed]}`
  await writeFile(path.join(uploadsRoot(), filename), buf, { flag: 'wx' })
  return `/uploads/${filename}`
}

export async function deleteManagedUpload(url: string | null | undefined) {
  if (!isManagedUploadUrl(url)) return
  try {
    await unlink(uploadPathFromUrl(url))
  } catch {
    // missing file is fine
  }
}
