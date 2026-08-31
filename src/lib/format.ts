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

export function blockImage(
  map: Record<string, ContentBlock>,
  key: string,
  fallback: { src: string; alt: string },
) {
  const block = map[key]
  if (block?.imageUrl) {
    return { src: block.imageUrl, alt: block.imageAlt || fallback.alt }
  }
  return fallback
}

export function paragraphs(value: string) {
  return value
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
}

export function phoneHref(value: string) {
  return `tel:${value.replace(/[^\d+]/g, '')}`
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

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
