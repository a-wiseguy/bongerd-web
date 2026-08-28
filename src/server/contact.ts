import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

export const submitContact = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      name: z.string().trim().min(2, 'Vul uw naam in.').max(120),
      email: z.email('Vul een geldig e-mailadres in.'),
      phone: z.string().trim().max(40).optional().default(''),
      subject: z.string().trim().min(2, 'Kies een onderwerp.').max(120),
      message: z.string().trim().min(10, 'Schrijf een kort bericht.').max(4000),
      website: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { submitContactImpl } = await import('./contact.server')
    return submitContactImpl(data)
  })
