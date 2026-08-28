import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

export const getAdminUser = createServerFn({ method: 'GET' }).handler(async () => {
  const { getAdminUserImpl } = await import('./auth.server')
  return getAdminUserImpl()
})

export const loginFn = createServerFn({ method: 'POST' })
  .validator(z.object({ email: z.email(), password: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { loginImpl } = await import('./auth.server')
    const result = await loginImpl(data)
    if ('ok' in result) return { ok: true as const }
    return result
  })

export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  const { logoutImpl } = await import('./auth.server')
  logoutImpl()
  return { ok: true as const }
})

export async function requireAdmin() {
  const user = await getAdminUser()
  if (!user) throw redirect({ to: '/beheer/login' })
  return user
}
