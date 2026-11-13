import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { htmlLimits, limits } from '@/lib/limits'
import { spanProblem } from '@/lib/hours'
import { plainTextLength } from '@/lib/html'
import { isValidServiceHref } from '@/lib/serviceHref'

const titleSchema = z.string().trim().min(1).max(limits.title)
const imageUrlSchema = z
  .string()
  .trim()
  .max(512)
  .refine((v) => v === '' || v.startsWith('/uploads/') || v.startsWith('/images/'), 'Ongeldige afbeeldings-URL')
  .optional()
  .nullable()
const imageAltSchema = z.string().trim().max(limits.imageAlt).optional().nullable()

function richText(maxText: number, maxHtml: number) {
  return z
    .string()
    .trim()
    .min(1)
    .max(maxHtml)
    .refine((v) => plainTextLength(v) >= 1, 'Tekst is verplicht.')
    .refine((v) => plainTextLength(v) <= maxText, `Tekst mag max. ${maxText} tekens zijn.`)
}

export const getAdminDashboard = createServerFn({ method: 'GET' }).handler(async () => {
  const { getAdminDashboardImpl } = await import('./admin.server')
  return getAdminDashboardImpl()
})

export const getAdminContent = createServerFn({ method: 'GET' }).handler(async () => {
  const { getAdminContentImpl } = await import('./admin.server')
  return getAdminContentImpl()
})

export const saveContentBlock = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      id: z.uuid(),
      title: titleSchema,
      body: richText(limits.contentBody, htmlLimits.contentBody),
      imageUrl: imageUrlSchema,
      imageAlt: imageAltSchema,
    }),
  )
  .handler(async ({ data }) => {
    const { saveContentBlockImpl } = await import('./admin.server')
    return saveContentBlockImpl(data)
  })

export const getAdminHours = createServerFn({ method: 'GET' }).handler(async () => {
  const { getAdminHoursImpl } = await import('./admin.server')
  return getAdminHoursImpl()
})

const clock = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/, 'Gebruik een tijd als 08:00.')
  .nullable()

const timeSpan = {
  opens: clock,
  closes: clock,
  isClosed: z.boolean(),
}

function checkSpan(
  value: { opens: string | null; closes: string | null; isClosed: boolean },
  ctx: z.RefinementCtx,
  prefix: Array<string | number> = [],
) {
  const problem = spanProblem(value)
  if (problem) ctx.addIssue({ code: 'custom', path: [...prefix, problem.field], message: problem.message })
}

export const saveWeekHours = createServerFn({ method: 'POST' })
  .validator(
    z
      .object({
        locationId: z.uuid(),
        days: z.array(z.object({ id: z.uuid(), ...timeSpan })).min(1).max(7),
      })
      .superRefine((value, ctx) => value.days.forEach((day, index) => checkSpan(day, ctx, ['days', index]))),
  )
  .handler(async ({ data }) => {
    const { saveWeekHoursImpl } = await import('./admin.server')
    return saveWeekHoursImpl(data)
  })

export const saveException = createServerFn({ method: 'POST' })
  .validator(
    z
      .object({
        id: z.uuid().optional(),
        locationId: z.uuid().nullable(),
        date: z.iso.date('Kies een datum.'),
        ...timeSpan,
        label: z.string().trim().min(1, 'Vul een toelichting in.').max(255),
      })
      .superRefine((value, ctx) => checkSpan(value, ctx)),
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
      title: titleSchema,
      body: richText(limits.announcementBody, htmlLimits.announcementBody),
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
      title: titleSchema,
      excerpt: z.string().trim().min(1).max(limits.newsExcerpt),
      body: richText(limits.newsBody, htmlLimits.newsBody),
      imageUrl: imageUrlSchema,
      imageAlt: imageAltSchema,
      published: z.boolean(),
      slug: z.string().trim().max(191).optional(),
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
      title: titleSchema,
      summary: z.string().trim().min(1).max(limits.serviceSummary),
      body: richText(limits.serviceBody, htmlLimits.serviceBody),
      imageUrl: imageUrlSchema,
      imageAlt: imageAltSchema,
      href: z
        .string()
        .trim()
        .max(512)
        .refine(isValidServiceHref, 'Gebruik een intern pad (/…) of een https-link.')
        .optional()
        .nullable(),
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

export const uploadImage = createServerFn({ method: 'POST' })
  .validator((data) => {
    if (!(data instanceof FormData)) throw new Error('Expected FormData')
    const file = data.get('file')
    if (!(file instanceof File)) throw new Error('Geen bestand gekozen.')
    return { file }
  })
  .handler(async ({ data }) => {
    const { uploadImageImpl } = await import('./admin.server')
    return uploadImageImpl(data.file)
  })

export const deleteUploadedImage = createServerFn({ method: 'POST' })
  .validator(z.object({ url: z.string().trim().min(1).max(512) }))
  .handler(async ({ data }) => {
    const { deleteUploadedImageImpl } = await import('./admin.server')
    return deleteUploadedImageImpl(data.url)
  })
