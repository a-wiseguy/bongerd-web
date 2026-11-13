import { useState } from 'react'
import { ghostBtn } from '@/components/AdminShell'
import { limits, uploadLimits } from '@/lib/limits'
import { staffErrorMessage } from '@/lib/formErrors'
import { uploadImage } from '@/server/admin'

type Props = {
  name?: string
  altName?: string
  defaultUrl?: string | null
  defaultAlt?: string | null
  label?: string
}

export function ImageField({
  name = 'imageUrl',
  altName = 'imageAlt',
  defaultUrl = '',
  defaultAlt = '',
  label = 'Afbeelding',
}: Props) {
  const [url, setUrl] = useState(defaultUrl ?? '')
  const [alt, setAlt] = useState(defaultAlt ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const onFile = async (file: File | null) => {
    if (!file) return
    setError('')
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const result = await uploadImage({ data: fd })
      setUrl(result.url)
    } catch (err) {
      setError(staffErrorMessage(err, 'Upload mislukt. Probeer het opnieuw.'))
    } finally {
      setBusy(false)
    }
  }

  const onDelete = () => {
    setUrl('')
    setError('')
  }

  return (
    <div className="grid gap-2 rounded-2xl border border-line bg-mist/40 p-4">
      <p className="text-sm font-semibold text-navy">{label}</p>
      {url ? (
        <img src={url} alt={alt || ''} className="h-40 w-full rounded-xl object-cover" />
      ) : (
        <p className="text-sm text-muted">Geen afbeelding — openbare fallback blijft actief.</p>
      )}
      <input type="hidden" name={name} value={url} />
      <label className="grid gap-1">
        <span className="text-sm font-semibold text-navy">Alt-tekst</span>
        <input
          name={altName}
          value={alt}
          maxLength={limits.imageAlt}
          onChange={(e) => setAlt(e.target.value)}
          className="min-h-12 w-full rounded-2xl border border-line bg-white px-4 py-3 text-base"
          placeholder="Korte beschrijving van de foto"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <label
          className={`${ghostBtn} inline-flex cursor-pointer items-center focus-within:outline-3 focus-within:outline-offset-3 focus-within:outline-navy ${busy ? 'opacity-60' : ''}`}
        >
          {busy ? 'Bezig…' : url ? 'Vervangen' : 'Uploaden'}
          <input
            type="file"
            accept={uploadLimits.allowedMime.join(',')}
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              void onFile(e.target.files?.[0] ?? null)
              e.target.value = ''
            }}
          />
        </label>
        {url ? (
          <button type="button" className={ghostBtn} disabled={busy} onClick={onDelete}>
            Foto weghalen
          </button>
        ) : null}
      </div>
      <p className="text-xs text-muted">
        JPEG, PNG of WebP · max {uploadLimits.maxLabel} · wordt automatisch verkleind, locatiegegevens worden verwijderd
      </p>
      {error ? (
        <p role="alert" className="text-sm font-semibold text-closed">
          {error}
        </p>
      ) : null}
    </div>
  )
}
