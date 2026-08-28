import { useId, useState } from 'react'
import { useRouter } from '@tanstack/react-router'
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

export function ContactForm() {
  const router = useRouter()
  const statusId = useId()
  const [status, setStatus] = useState<'idle' | 'busy' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')

  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault()
        const form = event.currentTarget
        const data = new FormData(form)
        setStatus('busy')
        const result = await submitContact({
          data: {
            name: String(data.get('name') ?? ''),
            email: String(data.get('email') ?? ''),
            phone: String(data.get('phone') ?? ''),
            subject: String(data.get('subject') ?? ''),
            message: String(data.get('message') ?? ''),
            website: String(data.get('website') ?? ''),
          },
        }).catch((err: unknown) => ({ error: err instanceof Error ? err.message : 'Verzenden mislukt.' }))
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
          required
          autoComplete="name"
          aria-required="true"
          aria-invalid={status === 'error' || undefined}
          aria-describedby={status !== 'idle' ? statusId : undefined}
          className="min-h-12 rounded-2xl border border-line bg-white px-4 text-base"
        />
      </label>
      <label className="grid gap-1">
        <span className="text-sm font-semibold text-navy">E-mail (verplicht)</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          aria-required="true"
          className="min-h-12 rounded-2xl border border-line bg-white px-4 text-base"
        />
      </label>
      <label className="grid gap-1">
        <span className="text-sm font-semibold text-navy">Telefoon (niet verplicht)</span>
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          className="min-h-12 rounded-2xl border border-line bg-white px-4 text-base"
        />
      </label>
      <label className="grid gap-1">
        <span className="text-sm font-semibold text-navy">Onderwerp (verplicht)</span>
        <select
          name="subject"
          required
          aria-required="true"
          className="min-h-12 rounded-2xl border border-line bg-white px-4 text-base"
        >
          {subjects.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-1">
        <span className="text-sm font-semibold text-navy">Bericht (verplicht)</span>
        <textarea
          name="message"
          required
          rows={5}
          aria-required="true"
          className="rounded-2xl border border-line bg-white px-4 py-3 text-base"
        />
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
