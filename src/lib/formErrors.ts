import type { ZodError } from 'zod'

/** first message per field from a zod error */
export function fieldErrorsFromZod(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key === 'string' && !out[key]) out[key] = issue.message
  }
  return out
}

type IssueLike = { path?: Array<string | number | symbol>; message?: string }

const technical = /expected|invalid|too (small|big)|received|failed query|sql/i

/** dutch message for staff, never a zod dump or a query */
export function staffErrorMessage(error: unknown, fallback: string) {
  const fields = fieldErrorsFromThrown(error)
  if (fields) {
    const friendly = [...new Set(Object.values(fields))].filter((message) => !technical.test(message))
    if (friendly.length) return friendly.join(' ')
    return fallback
  }
  if (error instanceof Error) {
    const message = error.message.trim()
    if (message && !message.startsWith('[') && message.length < 180 && !technical.test(message)) {
      return message
    }
  }
  return fallback
}

/** parse tanstack start / zod json dumps thrown as Error.message */
export function fieldErrorsFromThrown(error: unknown): Record<string, string> | null {
  const raw = error instanceof Error ? error.message : typeof error === 'string' ? error : null
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed.startsWith('[')) return null
  try {
    const issues = JSON.parse(trimmed) as unknown
    if (!Array.isArray(issues)) return null
    const out: Record<string, string> = {}
    for (const issue of issues as IssueLike[]) {
      const key = issue.path?.[0]
      if (typeof key === 'string' && issue.message && !out[key]) out[key] = issue.message
    }
    return Object.keys(out).length ? out : null
  } catch {
    return null
  }
}
