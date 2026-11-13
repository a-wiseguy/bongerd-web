import { createContext, useContext, useState, type FormEvent, type ReactNode } from 'react'
import { useHydrated } from '@tanstack/react-router'
import { btnClass, ghostBtn } from '@/components/AdminShell'
import { staffErrorMessage } from '@/lib/formErrors'

type FormState = { busy: boolean; status: 'idle' | 'busy' | 'ok' | 'error'; message: string; atButton: boolean }
const FormContext = createContext<FormState>({ busy: false, status: 'idle', message: '', atButton: false })

export function AdminForm({
  id,
  className,
  success = 'Opgeslagen.',
  failure = 'Opslaan mislukt. Controleer de velden en probeer het opnieuw.',
  statusClassName,
  statusAtButton = false,
  onSave,
  children,
}: {
  id?: string
  className?: string
  success?: string
  failure?: string
  statusClassName?: string
  /** long forms: show feedback under the save button, not at the bottom */
  statusAtButton?: boolean
  onSave: (data: FormData, form: HTMLFormElement) => Promise<void>
  children: ReactNode
}) {
  const [status, setStatus] = useState<'idle' | 'busy' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setStatus('busy')
    setMessage('')
    try {
      await onSave(new FormData(form), form)
      setStatus('ok')
      setMessage(success)
    } catch (error) {
      setStatus('error')
      setMessage(staffErrorMessage(error, failure))
    }
  }

  return (
    <form
      id={id}
      method="post"
      className={`grid gap-3 ${className ?? ''}`}
      aria-busy={status === 'busy' || undefined}
      onSubmit={onSubmit}
    >
      <FormContext.Provider value={{ busy: status === 'busy', status, message, atButton: statusAtButton }}>
        <div className={`grid gap-3 ${status === 'busy' ? 'opacity-70' : ''}`}>{children}</div>
        {statusAtButton ? null : <FormStatus status={status} message={message} className={statusClassName} />}
      </FormContext.Provider>
    </form>
  )
}

export function SaveButton({
  children,
  className = btnClass,
}: {
  children: ReactNode
  className?: string
}) {
  const { busy, status, message, atButton } = useContext(FormContext)
  const hydrated = useHydrated()
  const button = (
    <button type="submit" className={className} disabled={busy || !hydrated}>
      {busy ? 'Bezig…' : children}
    </button>
  )
  if (!atButton) return button
  return (
    <>
      {button}
      <FormStatus status={status} message={message} />
    </>
  )
}

export function FormStatus({
  status,
  message,
  className = '',
}: {
  status: 'idle' | 'busy' | 'ok' | 'error'
  message: string
  className?: string
}) {
  if ((status !== 'ok' && status !== 'error') || !message) return null
  const ok = status === 'ok'
  return (
    <p
      role={ok ? 'status' : 'alert'}
      className={`rounded-2xl px-4 py-3 text-sm font-semibold ${ok ? 'bg-mint text-teal' : 'bg-white text-closed ring-1 ring-closed/25'} ${className}`}
    >
      {message}
    </p>
  )
}

export function DeleteButton({
  onConfirm,
  confirmText = 'Dit haalt het item van de site.',
}: {
  onConfirm: () => Promise<void>
  confirmText?: string
}) {
  const formBusy = useContext(FormContext).busy
  const [armed, setArmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!armed) {
    return (
      <button type="button" className={ghostBtn} disabled={formBusy} onClick={() => setArmed(true)}>
        Verwijderen
      </button>
    )
  }

  return (
    <div className="grid gap-2 rounded-2xl bg-paper px-4 py-3">
      <p className="text-sm font-semibold text-closed">{confirmText}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={ghostBtn} disabled={busy} onClick={() => setArmed(false)}>
          Annuleren
        </button>
        <button
          type="button"
          className="min-h-12 rounded-full bg-closed px-5 font-semibold text-white disabled:opacity-60"
          disabled={busy}
          onClick={async () => {
            setBusy(true)
            setError('')
            try {
              await onConfirm()
            } catch (err) {
              setError(staffErrorMessage(err, 'Verwijderen mislukt. Probeer het opnieuw.'))
              setBusy(false)
            }
          }}
        >
          {busy ? 'Bezig…' : 'Definitief verwijderen'}
        </button>
      </div>
      {error ? (
        <p role="alert" className="text-sm font-semibold text-closed">
          {error}
        </p>
      ) : null}
    </div>
  )
}
