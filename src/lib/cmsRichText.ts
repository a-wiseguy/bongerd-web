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
    .replace(
      /Land(?:elijk Coördinatiecentrum Reizigersadvisering \(LCR\)|Coördinatiecentrum Reizigersadvisering \(LCR\))/gi,
      '<a href="https://www.lcr.nl/Landen">LCR</a>',
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

  if (looksLikeHtml(chunk)) {
    // structured html with links or lists: sanitize only
    if (chunk.includes('<a ') || /<ul\b/i.test(chunk)) {
      return toSafeHtml(chunk)
    }
    // bare <p> blocks from the editor — still enrich text
    const plain = htmlToPlain(chunk)
    return emphasizeKeyPhrases(sanitizeHtml(paragraphsToEnrichedHtml(plain)))
  }

  const structured = plainServiceBodyToHtml(chunk)
  if (looksLikeHtml(structured)) {
    return sanitizeHtml(structured)
  }

  return emphasizeKeyPhrases(sanitizeHtml(paragraphsToEnrichedHtml(structured)))
}

function plainServiceBodyToHtml(value: string) {
  const chunks = value.replace(/\r/g, '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  if (chunks.length >= 2) {
    const listItems = contactReasonsFromParagraph(chunks[1]!)
    if (listItems.length >= 2) {
      const intro = `<p>${linkifyCommonFragment(chunks[0]!)}</p>`
      const list = `<ul>${listItems.map((item) => `<li>${linkifyCommonFragment(item)}</li>`).join('')}</ul>`
      const tail = chunks.slice(2).map((p) => `<p>${linkifyCommonFragment(p)}</p>`).join('')
      return `${intro}${list}${tail}`
    }
  }
  return value
}

function contactReasonsFromParagraph(text: string) {
  if (!/^We nemen contact op als /i.test(text)) return []
  const rest = text.replace(/^We nemen contact op als /i, '')
  return rest
    .split(/,\s*(?:als|of als)\s+/i)
    .map((part) => part.replace(/\.\s*$/, '').trim())
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}.`)
}

export function emphasizeKeyPhrases(html: string) {
  return html
    .replace(/\b(gratis)\b/gi, '<strong>$1</strong>')
    .replace(/\b(24 uur per dag, 7 dagen per week)\b/gi, '<strong>$1</strong>')
    .replace(/\b(72 uur)\b/gi, '<strong>$1</strong>')
    .replace(/\bvóór 12\.00 uur\b/gi, '<strong>vóór 12.00 uur</strong>')
    .replace(/\bvolgende werkdag om 12\.00 uur\b/gi, '<strong>volgende werkdag om 12.00 uur</strong>')
}
