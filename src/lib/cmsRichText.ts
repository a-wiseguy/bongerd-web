import { looksLikeHtml, sanitizeHtml, toSafeHtml } from '@/lib/sanitize'

export function escapeRichText(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function listItemsFromHtml(value: string): string[] {
  return listRichItemsFromHtml(value).map((item) =>
    item
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim(),
  )
}

export function listRichItemsFromHtml(value: string): string[] {
  const html = toSafeHtml(value)
  return [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((m) => sanitizeHtml((m[1] ?? '').trim()))
    .filter(Boolean)
}

export function introFromHtml(value: string) {
  const match = value.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
  if (!match) return ''
  return match[1]
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function htmlToPlain(value: string) {
  return value
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** shared link patterns for cms plain text */
export function linkifyCommonFragment(text: string) {
  return escapeRichText(text)
    .replace(/\n/g, '<br>')
    .replace(
      /info@apotheekdebongerd\.nl/gi,
      '<a href="mailto:info@apotheekdebongerd.nl">info@apotheekdebongerd.nl</a>',
    )
    .replace(
      /MijnGezondheid\.net/gi,
      '<a href="https://home.mijngezondheid.net">MijnGezondheid.net</a>',
    )
    .replace(
      /home\.mijngezondheid\.net/gi,
      '<a href="https://home.mijngezondheid.net">home.mijngezondheid.net</a>',
    )
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
    .replace(
      /www\.lcr\.nl\/Landen/gi,
      '<a href="https://www.lcr.nl/Landen">lcr.nl/Landen</a>',
    )
    .replace(
      /\bcontactformulier\b/gi,
      '<a href="/contact">contactformulier</a>',
    )
}

export function paragraphsToEnrichedHtml(value: string) {
  return value
    .split(/\n{2,}/)
    .map((p) => `<p>${linkifyCommonFragment(p.trim())}</p>`)
    .join('')
}

export function enrichCmsHtml(body: string) {
  const chunk = body.trim()
  if (!chunk) return ''

  if (looksLikeHtml(chunk) && chunk.includes('<a ')) {
    return emphasizeKeyPhrases(toSafeHtml(chunk))
  }

  const plain = looksLikeHtml(chunk) ? htmlToPlain(chunk) : chunk
  return emphasizeKeyPhrases(sanitizeHtml(paragraphsToEnrichedHtml(plain)))
}

export function emphasizeKeyPhrases(html: string) {
  return html
    .replace(/\b(gratis)\b/gi, '<strong>$1</strong>')
    .replace(/\b(24 uur per dag, 7 dagen per week)\b/gi, '<strong>$1</strong>')
    .replace(/\b(72 uur)\b/gi, '<strong>$1</strong>')
    .replace(/\bvóór 12\.00 uur\b/gi, '<strong>vóór 12.00 uur</strong>')
    .replace(/\bvolgende werkdag om 12\.00 uur\b/gi, '<strong>volgende werkdag om 12.00 uur</strong>')
}
