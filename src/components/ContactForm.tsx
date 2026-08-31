import { useId, useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { fieldErrorsFromThrown } from '@/lib/formErrors'
import { submitContact } from '@/server/contact'

const subjects = [
  'Algemene vraag',
  'Afspraak maken',
  'Herhaalrecept',
  'Inschrijven / wijziging',
  'Medicijnpaspoort',
  'Bezorging',
  'Anders',
]

type FieldKey = 'name' | 'email' | 'phone' | 'subject' | 'message'

const fieldClass = (invalid: boolean) =>
  `min-h-12 rounded-2xl border bg-white px-4 text-base ${invalid ? 'border-closed outline outline-1 outline-closed' : 'border-line'}`

export function ContactForm() {
  const router = useRouter()
  const statusId = useId()
  const [status, setStatus] = useState<'idle' | 'busy' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({})

  return (
    <form
      className="grid gap-4"
      noValidate
      onSubmit={async (event) => {
        event.preventDefault()
        const form = event.currentTarget
        const data = new FormData(form)
        setStatus('busy')
        setFieldErrors({})
        setMessage('')
        const result = await submitContact({
          data: {
            name: String(data.get('name') ?? ''),
            email: String(data.get('email') ?? ''),
            phone: String(data.get('phone') ?? ''),
            subject: String(data.get('subject') ?? ''),
            message: String(data.get('message') ?? ''),
            website: String(data.get('website') ?? ''),
          },
        }).catch((err: unknown) => {
          const fields = fieldErrorsFromThrown(err)
          if (fields) return { fieldErrors: fields }
          return { error: 'Verzenden mislukt.' }
        })
        if ('fieldErrors' in result && result.fieldErrors) {
          setFieldErrors(result.fieldErrors as Partial<Record<FieldKey, string>>)
          setStatus('error')
          setMessage('')
          return
        }
        if ('error' in result && result.error) {
          setStatus('error')
          setMessage(result.error)
          return
        }
        setStatus('ok')
        setMessage('Bedankt. We nemen zo snel mogelijk contact met u op.')
        form.reset()
        await router.invalidate()
      }}
    >
      <label className="grid gap-1">
        <span className="text-sm font-semibold text-navy">Naam (verplicht)</span>
        <input
          name="name"
          autoComplete="name"
          aria-required="true"
          aria-invalid={fieldErrors.name ? true : undefined}
          aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
          className={fieldClass(Boolean(fieldErrors.name))}
        />
        {fieldErrors.name ? (
          <span id="contact-name-error" className="text-sm text-closed" role="alert">
            {fieldErrors.name}
          </span>
        ) : null}
      </label>
      <label className="grid gap-1">
        <span className="text-sm font-semibold text-navy">E-mail (verplicht)</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          aria-required="true"
          aria-invalid={fieldErrors.email ? true : undefined}
          aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
          className={fieldClass(Boolean(fieldErrors.email))}
        />
        {fieldErrors.email ? (
          <span id="contact-email-error" className="text-sm text-closed" role="alert">
            {fieldErrors.email}
          </span>
        ) : null}
      </label>
      <label className="grid gap-1">
        <span className="text-sm font-semibold text-navy">Telefoon (niet verplicht)</span>
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          aria-invalid={fieldErrors.phone ? true : undefined}
          aria-describedby={fieldErrors.phone ? 'contact-phone-error' : undefined}
          className={fieldClass(Boolean(fieldErrors.phone))}
        />
        {fieldErrors.phone ? (
          <span id="contact-phone-error" className="text-sm text-closed" role="alert">
            {fieldErrors.phone}
          </span>
        ) : null}
      </label>
      <label className="grid gap-1">
        <span className="text-sm font-semibold text-navy">Onderwerp (verplicht)</span>
        <select
          name="subject"
          aria-required="true"
          aria-invalid={fieldErrors.subject ? true : undefined}
          aria-describedby={fieldErrors.subject ? 'contact-subject-error' : undefined}
          className={fieldClass(Boolean(fieldErrors.subject))}
        >
          {subjects.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        {fieldErrors.subject ? (
          <span id="contact-subject-error" className="text-sm text-closed" role="alert">
            {fieldErrors.subject}
          </span>
        ) : null}
      </label>
      <label className="grid gap-1">
        <span className="text-sm font-semibold text-navy">Bericht (verplicht)</span>
        <textarea
          name="message"
          rows={5}
          aria-required="true"
          aria-invalid={fieldErrors.message ? true : undefined}
          aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
          className={`rounded-2xl border bg-white px-4 py-3 text-base ${
            fieldErrors.message ? 'border-closed outline outline-1 outline-closed' : 'border-line'
          }`}
        />
        {fieldErrors.message ? (
          <span id="contact-message-error" className="text-sm text-closed" role="alert">
            {fieldErrors.message}
          </span>
        ) : null}
      </label>
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {status !== 'idle' && message ? (
        <p
          id={statusId}
          className={status === 'ok' ? 'text-open' : 'text-closed'}
          role={status === 'error' ? 'alert' : 'status'}
          aria-live={status === 'error' ? 'assertive' : 'polite'}
        >
          {message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === 'busy'}
        className="min-h-12 rounded-full bg-navy px-6 font-semibold text-white disabled:opacity-60"
      >
        {status === 'busy' ? 'Verzenden…' : 'Versturen'}
      </button>
    </form>
  )
}
