import sanitizeHtmlLib from 'sanitize-html'
import { plainToParagraphs } from './html'

const options: sanitizeHtmlLib.IOptions = {
  allowedTags: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'h2', 'h3'],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: {
    a: ['http', 'https', 'mailto', 'tel'],
  },
  allowProtocolRelative: false,
  transformTags: {
    a: (_tagName, attribs) => {
      const href = attribs.href ?? ''
      const external = /^https?:/i.test(href)
      return {
        tagName: 'a',
        attribs: {
          href,
          ...(external ? { rel: 'noopener noreferrer', target: '_blank' } : {}),
        },
      }
    },
  },
}

export function sanitizeHtml(dirty: string): string {
  return sanitizeHtmlLib(dirty, options).trim()
}

/** sanitize + normalize legacy plain text; used for storage and for rendering */
export function toSafeHtml(value: string): string {
  return sanitizeHtml(plainToParagraphs(value))
}
