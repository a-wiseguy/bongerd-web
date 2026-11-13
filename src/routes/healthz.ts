import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/healthz')({
  server: {
    handlers: {
      GET: async () => {
        const { checkDatabase } = await import('@/server/public.server')
        const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
        try {
          await checkDatabase()
          return new Response(JSON.stringify({ status: 'ok' }), { headers })
        } catch {
          return new Response(JSON.stringify({ status: 'error', database: 'unreachable' }), { status: 503, headers })
        }
      },
    },
  },
})
