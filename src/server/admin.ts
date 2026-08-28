import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

export const getAdminDashboard = createServerFn({ method: 'GET' }).handler(async () => {
  const { getAdminDashboardImpl } = await import('./admin.server')
  return getAdminDashboardImpl()
})

export const getAdminContent = createServerFn({ method: 'GET' }).handler(async () => {
  const { getAdminContentImpl } = await import('./admin.server')
  return getAdminContentImpl()
})

export const saveContentBlock = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.uuid(), title: z.string().min(1), body: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { saveContentBlockImpl } = await import('./admin.server')
    return saveContentBlockImpl(data)
  })

export const getAdminHours = createServerFn({ method: 'GET' }).handler(async () => {
  const { getAdminHoursImpl } = await import('./admin.server')
  return getAdminHoursImpl()
})

export const saveOpeningHour = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      id: z.uuid(),
      opens: z.string().nullable(),
      closes: z.string().nullable(),
      isClosed: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    const { saveOpeningHourImpl } = await import('./admin.server')
    return saveOpeningHourImpl(data)
  })

export const saveException = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      id: z.uuid().optional(),
      locationId: z.uuid().nullable(),
      date: z.string().min(8),
      opens: z.string().nullable(),
      closes: z.string().nullable(),
      isClosed: z.boolean(),
      label: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const { saveExceptionImpl } = await import('./admin.server')
    return saveExceptionImpl(data)
  })

export const deleteException = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ data }) => {
    const { deleteExceptionImpl } = await import('./admin.server')
    return deleteExceptionImpl(data.id)
  })

export const getAdminAnnouncements = createServerFn({ method: 'GET' }).handler(async () => {
  const { getAdminAnnouncementsImpl } = await import('./admin.server')
  return getAdminAnnouncementsImpl()
})

export const saveAnnouncement = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      id: z.uuid().optional(),
      title: z.string().min(1),
      body: z.string().min(1),
      published: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    const { saveAnnouncementImpl } = await import('./admin.server')
    return saveAnnouncementImpl(data)
  })

export const deleteAnnouncement = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ data }) => {
    const { deleteAnnouncementImpl } = await import('./admin.server')
    return deleteAnnouncementImpl(data.id)
  })

export const getAdminNews = createServerFn({ method: 'GET' }).handler(async () => {
  const { getAdminNewsImpl } = await import('./admin.server')
  return getAdminNewsImpl()
})

export const saveNews = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      id: z.uuid().optional(),
      title: z.string().min(1),
      excerpt: z.string().min(1),
      body: z.string().min(1),
      published: z.boolean(),
      slug: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { saveNewsImpl } = await import('./admin.server')
    return saveNewsImpl(data)
  })

export const deleteNews = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ data }) => {
    const { deleteNewsImpl } = await import('./admin.server')
    return deleteNewsImpl(data.id)
  })

export const getAdminServices = createServerFn({ method: 'GET' }).handler(async () => {
  const { getAdminServicesImpl } = await import('./admin.server')
  return getAdminServicesImpl()
})

export const saveService = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      id: z.uuid().optional(),
      title: z.string().min(1),
      summary: z.string().min(1),
      body: z.string().min(1),
      href: z.string().optional().nullable(),
      published: z.boolean(),
      sortOrder: z.number().int(),
    }),
  )
  .handler(async ({ data }) => {
    const { saveServiceImpl } = await import('./admin.server')
    return saveServiceImpl(data)
  })

export const deleteService = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ data }) => {
    const { deleteServiceImpl } = await import('./admin.server')
    return deleteServiceImpl(data.id)
  })

export const getAdminMessages = createServerFn({ method: 'GET' }).handler(async () => {
  const { getAdminMessagesImpl } = await import('./admin.server')
  return getAdminMessagesImpl()
})

export const setMessageHandled = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.uuid(), handled: z.boolean() }))
  .handler(async ({ data }) => {
    const { setMessageHandledImpl } = await import('./admin.server')
    return setMessageHandledImpl(data)
  })
