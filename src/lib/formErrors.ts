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
