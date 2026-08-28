import { createServerFn } from '@tanstack/react-start'

export const getLocations = createServerFn({ method: 'GET' }).handler(async () => {
  const { getLocationsImpl } = await import('./public.server')
  return getLocationsImpl()
})

export const getPageBlocks = createServerFn({ method: 'GET' })
  .validator((page: string) => page)
  .handler(async ({ data }) => {
    const { getPageBlocksImpl } = await import('./public.server')
    return getPageBlocksImpl(data)
  })

export const getPublishedServices = createServerFn({ method: 'GET' }).handler(async () => {
  const { getPublishedServicesImpl } = await import('./public.server')
  return getPublishedServicesImpl()
})

export const getPublishedNews = createServerFn({ method: 'GET' }).handler(async () => {
  const { getPublishedNewsImpl } = await import('./public.server')
  return getPublishedNewsImpl()
})

export const getNewsBySlug = createServerFn({ method: 'GET' })
  .validator((slug: string) => slug)
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
