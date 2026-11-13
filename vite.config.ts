import { createReadStream, statSync } from 'node:fs'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

// nitro dev treats *.webp/*.jpg as static assets and never reaches the /uploads route; prod is unaffected
function devUploads(): Plugin {
  return {
    name: 'bongerd-dev-uploads',
    apply: 'serve',
    configureServer(server) {
      const root = path.resolve(process.env.UPLOAD_DIR || 'data/uploads')
      server.middlewares.use('/uploads', (req, res, next) => {
        const name = path.basename((req.url ?? '').split('?')[0] ?? '')
        if (!/^[a-z0-9-]+\.(jpg|jpeg|png|webp)$/i.test(name)) return next()
        const candidates = [name, name.replace(/-800\.webp$/i, '.webp')].map((file) => path.join(root, file))
        const file = candidates.find((candidate) => statSync(candidate, { throwIfNoEntry: false })?.isFile())
        if (!file) return next()
        const ext = path.extname(file).slice(1).toLowerCase()
        res.setHeader('Content-Type', ext === 'jpg' ? 'image/jpeg' : `image/${ext}`)
        res.setHeader('X-Content-Type-Options', 'nosniff')
        createReadStream(file).pipe(res)
      })
    },
  }
}

export default defineConfig({
  server: {
    port: 3000,
    host: true,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    devUploads(),
    tailwindcss(),
    tanstackStart(),
    nitro(),
    viteReact(),
  ],
})
