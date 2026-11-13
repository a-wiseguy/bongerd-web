import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { contactSubjects } from '@/lib/contactSubjects'
import { fieldErrorsFromZod } from '@/lib/formErrors'

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Vul uw naam in.').max(120),
  email: z.email('Vul een geldig e-mailadres in.').transform((value) => value.trim().toLowerCase()),
  phone: z.string().trim().max(40).optional().default(''),
  subject: z.enum(contactSubjects, 'Kies een onderwerp.'),
  message: z.string().trim().min(10, 'Schrijf een kort bericht.').max(4000),
  website: z.string().optional(),
})

// raw form values; contactSchema does the real checking
export type ContactInput = Omit<z.input<typeof contactSchema>, 'subject'> & { subject: string }

export const submitContact = createServerFn({ method: 'POST' })
  .validator((data: ContactInput) => data)
  .handler(async ({ data }) => {
    const parsed = contactSchema.safeParse(data)
    if (!parsed.success) {
      return { fieldErrors: fieldErrorsFromZod(parsed.error) }
    }
    const { submitContactImpl } = await import('./contact.server')
    return submitContactImpl(parsed.data)
  })
