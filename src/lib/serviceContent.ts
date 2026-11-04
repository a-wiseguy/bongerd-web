import { paragraphs } from '@/lib/format'
import { looksLikeHtml, sanitizeHtml } from '@/lib/sanitize'
import {
  enrichCmsHtml,
  emphasizeKeyPhrases,
  listRichItemsFromHtml,
} from '@/lib/cmsRichText'

export type ServiceDisplayParts = {
  introHtml: string
  listItems: string[]
  tailHtml: string
}

function splitHtmlAroundList(body: string) {
  const html = enrichCmsHtml(body)
  const ulStart = html.search(/<ul\b/i)
  if (ulStart === -1) {
    return { intro: html, tail: '' }
  }
  const ulEnd = html.indexOf('</ul>', ulStart)
  if (ulEnd === -1) {
    return { intro: html, tail: '' }
  }
  return {
    intro: html.slice(0, ulStart).trim(),
    tail: html.slice(ulEnd + 5).trim(),
  }
}

function listFromPlainParagraph(text: string): string[] {
  const trimmed = text.trim()
  if (!trimmed) return []

  if (/^We nemen contact op als /i.test(trimmed)) {
    const rest = trimmed.replace(/^We nemen contact op als /i, '')
    return rest
      .split(/,\s*(?:als|of als)\s+/i)
      .map((part) => part.replace(/\.\s*$/, '').trim())
      .filter(Boolean)
      .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}.`)
  }

  return []
}

export function serviceDisplayParts(body: string): ServiceDisplayParts {
  const listItems = listRichItemsFromHtml(body)
  if (listItems.length >= 2) {
    const { intro, tail } = splitHtmlAroundList(body)
    return {
      introHtml: intro,
      listItems,
      tailHtml: tail,
    }
  }

  const chunks = paragraphs(body.replace(/\r/g, ''))
  if (chunks.length >= 2) {
    const introHtml = enrichCmsHtml(chunks[0]!)
    const listFromSecond = listFromPlainParagraph(chunks[1]!)
    if (listFromSecond.length >= 2) {
      return {
        introHtml,
        listItems: listFromSecond,
        tailHtml: chunks.slice(2).length ? enrichCmsHtml(chunks.slice(2).join('\n\n')) : '',
      }
    }
  }

  return { introHtml: '', listItems: [], tailHtml: '' }
}

export function serviceBodyHtml(body: string) {
  const parts = serviceDisplayParts(body)
  if (parts.listItems.length >= 2) {
    return ''
  }
  return emphasizeKeyPhrases(enrichCmsHtml(body))
}

export function serviceFragmentHtml(fragment: string) {
  if (!fragment.trim()) return ''
  if (looksLikeHtml(fragment)) {
    return emphasizeKeyPhrases(sanitizeHtml(fragment))
  }
  return emphasizeKeyPhrases(enrichCmsHtml(fragment))
}
