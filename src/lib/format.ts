export type ContentBlock = {
  page: string
  blockKey: string
  title: string
  body: string
  imageUrl?: string | null
  imageAlt?: string | null
}

export function blockMap(blocks: ContentBlock[]) {
  const map: Record<string, ContentBlock> = {}
  for (const block of blocks) {
    map[`${block.page}.${block.blockKey}`] = block
  }
  return map
}

export function text(map: Record<string, ContentBlock>, key: string, fallback = '') {
  return map[key]?.body || fallback
}

export function heading(map: Record<string, ContentBlock>, key: string, fallback = '') {
  return map[key]?.title || fallback
}

export function mapsHref(query: string) {
  return `https://maps.google.com/?q=${encodeURIComponent(query)}`
}

export function formatNlDate(value: Date | string) {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('nl-NL', {
    timeZone: 'Europe/Amsterdam',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatNlDateTime(value: Date | string) {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('nl-NL', {
    timeZone: 'Europe/Amsterdam',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/** yyyy-mm-dd calendar date → "donderdag 25 december" */
export function formatNlDay(value: string, withYear = false) {
  return new Intl.DateTimeFormat('nl-NL', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: withYear ? 'numeric' : undefined,
  }).format(new Date(`${value.slice(0, 10)}T00:00:00Z`))
}

export function slugify(value: string, fallback = 'item') {
  const slug = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)
    .replace(/-$/, '')
  return slug || fallback
}

/** base, base-2, base-3… skipping slugs already taken */
export function nextFreeSlug(base: string, taken: Iterable<string>) {
  const used = new Set(taken)
  if (!used.has(base)) return base
  for (let n = 2; ; n++) {
    const candidate = `${base}-${n}`
    if (!used.has(candidate)) return candidate
  }
}
