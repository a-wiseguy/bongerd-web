import { paragraphs } from '@/lib/format'
import { linkifyCommonFragment, listItemsFromHtml } from '@/lib/cmsRichText'
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

export { listItemsFromHtml }

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
  if (!match?.[1]) return ''
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

  return sanitizeHtml(
    plain
      .split(/\n{2,}/)
      .map((p) => `<p>${linkifyCommonFragment(p.trim())}</p>`)
      .join(''),
  )
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
