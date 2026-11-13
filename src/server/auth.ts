import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

// bcrypt ignores bytes past 72
const newPassword = z
  .string()
  .min(12, 'Gebruik minstens 12 tekens.')
  .max(72, 'Gebruik maximaal 72 tekens.')

export const getAdminUser = createServerFn({ method: 'GET' }).handler(async () => {
  const { getAdminUserImpl } = await import('./auth.server')
  return getAdminUserImpl()
})

export const loginFn = createServerFn({ method: 'POST' })
  .validator(z.object({ email: z.email().transform((value) => value.trim().toLowerCase()), password: z.string().min(1).max(256) }))
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

export const changePassword = createServerFn({ method: 'POST' })
  .validator(z.object({ current: z.string().min(1, 'Vul uw huidige wachtwoord in.').max(256), next: newPassword }))
  .handler(async ({ data }) => {
    const { changePasswordImpl } = await import('./auth.server')
    return changePasswordImpl(data)
  })

export const logoutEverywhere = createServerFn({ method: 'POST' }).handler(async () => {
  const { logoutEverywhereImpl } = await import('./auth.server')
  return logoutEverywhereImpl()
})

export const getAdmins = createServerFn({ method: 'GET' }).handler(async () => {
  const { listAdminsImpl } = await import('./auth.server')
  return listAdminsImpl()
})

export const addAdmin = createServerFn({ method: 'POST' })
  .validator(z.object({ email: z.email('Vul een geldig e-mailadres in.').max(255) }))
  .handler(async ({ data }) => {
    const { addAdminImpl } = await import('./auth.server')
    return addAdminImpl(data)
  })

export const resetAdminPassword = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ data }) => {
    const { resetAdminPasswordImpl } = await import('./auth.server')
    return resetAdminPasswordImpl(data)
  })

export const removeAdmin = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ data }) => {
    const { removeAdminImpl } = await import('./auth.server')
    return removeAdminImpl(data)
  })

export async function requireAdmin() {
  const user = await getAdminUser()
  if (!user) throw redirect({ to: '/beheer/login' })
  return user
}
