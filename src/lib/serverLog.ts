import { isNotFound, isRedirect } from '@tanstack/react-router'

/** validation issues and router control flow are expected, not incidents */
export function isExpectedError(error: unknown) {
  if (isRedirect(error) || isNotFound(error)) return true
  return error instanceof Error && error.message.trimStart().startsWith('[')
}

/** drizzle puts query params (form data, emails) in the message; keep them out of logs */
export function describeError(error: unknown) {
  if (!(error instanceof Error)) return String(error)
  const message = error.message.split(/\nparams:/)[0]!.trim()
  const cause = error.cause as { code?: string; message?: string } | undefined
  const causeText = cause ? ` | cause: ${[cause.code, cause.message].filter(Boolean).join(' ')}` : ''
  const frames = (error.stack ?? '').split('\n').filter((line) => line.trimStart().startsWith('at ')).slice(0, 8)
  return [`${error.name}: ${message}${causeText}`, ...frames].join('\n')
}
