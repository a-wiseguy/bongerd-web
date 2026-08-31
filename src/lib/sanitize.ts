import sanitizeHtmlLib from 'sanitize-html'

const options: sanitizeHtmlLib.IOptions = {
  allowedTags: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'h2', 'h3'],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    a: ['http', 'https', 'mailto'],
  },
  allowProtocolRelative: false,
  transformTags: {
    a: (_tagName, attribs) => {
      const href = attribs.href ?? ''
      const external = /^https?:/i.test(href) || href.startsWith('mailto:')
      return {
        tagName: 'a',
        attribs: {
          href,
          ...(external
            ? { rel: 'noopener noreferrer', target: '_blank' }
            : {}),
        },
      }
    },
  },
}

export function sanitizeHtml(dirty: string): string {
  return sanitizeHtmlLib(dirty, options).trim()
}

export function plainTextLength(value: string): number {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim().length
}

export function looksLikeHtml(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value)
}

function escapeText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** plain cms text → safe html paragraphs for editor/public */
export function plainToHtml(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (looksLikeHtml(trimmed)) return sanitizeHtml(trimmed)
  return trimmed
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeText(p.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('')
}

/** sanitize + normalize legacy plain text for storage */
export function sanitizeForStorage(value: string): string {
  return sanitizeHtml(plainToHtml(value))
}

export function toSafeHtml(value: string): string {
  return sanitizeHtml(plainToHtml(value))
}
