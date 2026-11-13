import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

export const getSiteShell = createServerFn({ method: 'GET' }).handler(async () => {
  const { getSiteShellImpl } = await import('./public.server')
  return getSiteShellImpl()
})

export const getLocations = createServerFn({ method: 'GET' }).handler(async () => {
  const { getLocationsImpl } = await import('./public.server')
  return getLocationsImpl()
})

export const getPageBlocks = createServerFn({ method: 'GET' })
  .validator(z.string().regex(/^[a-z-]{1,64}$/))
  .handler(async ({ data }) => {
    const { getPageBlocksImpl } = await import('./public.server')
    return getPageBlocksImpl(data)
  })

export const getPublishedServices = createServerFn({ method: 'GET' }).handler(async () => {
  const { getPublishedServicesImpl } = await import('./public.server')
  return getPublishedServicesImpl()
})

export const getPublishedNews = createServerFn({ method: 'GET' })
  .validator(z.object({ page: z.number().int().min(1).max(10_000) }))
  .handler(async ({ data }) => {
    const { getPublishedNewsImpl } = await import('./public.server')
    return getPublishedNewsImpl(data.page)
  })

export const getNewsBySlug = createServerFn({ method: 'GET' })
  .validator(z.string().max(191))
  .handler(async ({ data }) => {
    const { getNewsBySlugImpl } = await import('./public.server')
    return getNewsBySlugImpl(data)
  })

export const getHoursBundle = createServerFn({ method: 'GET' }).handler(async () => {
  const { loadHoursBundle } = await import('./public.server')
  return loadHoursBundle()
})

export const getHomeData = createServerFn({ method: 'GET' }).handler(async () => {
  const { getHomeDataImpl } = await import('./public.server')
  return getHomeDataImpl()
})
