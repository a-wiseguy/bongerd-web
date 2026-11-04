import { paragraphs } from '@/lib/format'
import { looksLikeHtml, sanitizeHtml, toSafeHtml } from '@/lib/sanitize'

export type OverOnsSectionKey = 'team' | 'kwaliteit' | 'inschrijven' | 'huisregels' | 'klachten'

export const overOnsSectionKeys: OverOnsSectionKey[] = [
  'team',
  'kwaliteit',
  'inschrijven',
  'huisregels',
  'klachten',
]

export function overOnsSectionId(key: OverOnsSectionKey) {
  return `over-ons-${key}`
}

export function listItemsFromHtml(value: string): string[] {
  const html = toSafeHtml(value)
  const matches = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
  return matches
    .map((m) =>
      m[1]
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter(Boolean)
}

function plainRuleSentences(body: string): { intro: string; rules: string[] } {
  const plain = body
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!plain) return { intro: '', rules: [] }

  const chunks = plain.split(/\.\s+/).filter(Boolean)
  if (chunks.length <= 1) return { intro: plain, rules: [] }

  const intro = `${chunks[0]}.`
  const rules = chunks.slice(1).map((part) => (part.endsWith('.') ? part : `${part}.`))
  return { intro, rules }
}

function introFromHtml(value: string) {
  const match = value.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
  if (!match) return ''
  return match[1]
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function houseRulesParts(body: string) {
  const rules = listItemsFromHtml(body)
  if (rules.length) {
    return { intro: introFromHtml(body), rules }
  }
  return plainRuleSentences(body)
}

export function complaintsHtml(body: string) {
  const chunk = body.trim()
  if (!chunk) return ''

  if (looksLikeHtml(chunk) && chunk.includes('<a ')) {
    return toSafeHtml(chunk)
  }

  const plain = looksLikeHtml(chunk)
    ? chunk
        .replace(/<\/p>\s*<p>/gi, '\n\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+\n/g, '\n')
        .trim()
    : chunk

  let html = plainToHtmlForComplaints(plain)
  return sanitizeHtml(html)
}

function plainToHtmlForComplaints(value: string) {
  return value
    .split(/\n{2,}/)
    .map((p) => `<p>${linkifyComplaintsFragment(p.trim())}</p>`)
    .join('')
}

function linkifyComplaintsFragment(text: string) {
  return escapeComplaintsText(text)
    .replace(/\n/g, '<br>')
    .replace(
      /06 2292 1649/g,
      '<a href="tel:+31622921649">06 2292 1649</a>',
    )
    .replace(
      /bemiddelingapotheken@kpnmail\.nl/g,
      '<a href="mailto:bemiddelingapotheken@kpnmail.nl">bemiddelingapotheken@kpnmail.nl</a>',
    )
    .replace(/088 022 9100/g, '<a href="tel:+31880229100">088 022 9100</a>')
    .replace(/info@skge\.nl/g, '<a href="mailto:info@skge.nl">info@skge.nl</a>')
    .replace(/\bskge\.nl\b/g, '<a href="https://www.skge.nl">skge.nl</a>')
}

function escapeComplaintsText(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function complaintSteps(body: string) {
  const chunks = paragraphs(body.replace(/\r/g, ''))
  if (chunks.length >= 2) return chunks

  const plain = body
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return paragraphs(plain)
}
