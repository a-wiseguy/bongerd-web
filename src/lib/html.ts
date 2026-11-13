// client-safe helpers; real sanitizing lives in sanitize.server.ts

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

export function escapeText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** legacy plain cms text → paragraphs; html passes through unchanged */
export function plainToParagraphs(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (looksLikeHtml(trimmed)) return trimmed
  return trimmed
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeText(p.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('')
}

export function htmlToPlainText(value: string): string {
  return value
    .replace(/<\/(p|h2|h3|li)>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
}
