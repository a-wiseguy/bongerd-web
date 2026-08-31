import { createFileRoute } from '@tanstack/react-router'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { uploadsRoot } from '@/lib/uploads'

const mimeByExt: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

export const Route = createFileRoute('/uploads/$filename')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const filename = params.filename
        if (!/^[a-z0-9-]+\.(jpg|jpeg|png|webp)$/i.test(filename)) {
          return new Response('Not found', { status: 404 })
        }
        const filePath = path.join(uploadsRoot(), path.basename(filename))
        try {
          const info = await stat(filePath)
          if (!info.isFile()) return new Response('Not found', { status: 404 })
          const buf = await readFile(filePath)
          const ext = path.extname(filename).toLowerCase()
          return new Response(buf, {
            headers: {
              'Content-Type': mimeByExt[ext] ?? 'application/octet-stream',
              'Cache-Control': 'public, max-age=31536000, immutable',
              'X-Content-Type-Options': 'nosniff',
            },
          })
        } catch {
          return new Response('Not found', { status: 404 })
        }
      },
    },
  },
})
