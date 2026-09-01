import { getRequestIP } from '@tanstack/react-start/server'

/** direct peer ip; x-forwarded-for only when TRUST_PROXY=true */
export function clientIp() {
  return (
    getRequestIP({ xForwardedFor: process.env.TRUST_PROXY === 'true' }) ?? 'unknown'
  )
}
