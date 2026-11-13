import {
  createCsrfMiddleware,
  createMiddleware,
  createStart,
} from '@tanstack/react-start'
import { describeError, isExpectedError } from '@/lib/serverLog'

function securityHeaders() {
  const secureCookies = process.env.COOKIE_SECURE === 'true'
  const enableHsts = secureCookies || process.env.ENABLE_HSTS === 'true'

  return createMiddleware().server(async ({ next }) => {
    const result = await next()
    const headers = result.response.headers

    headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "object-src 'none'",
        "img-src 'self' data: blob:",
        "font-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "script-src 'self' 'unsafe-inline'",
        "connect-src 'self'",
        "manifest-src 'self'",
        'upgrade-insecure-requests',
      ]
        .filter((directive) => enableHsts || directive !== 'upgrade-insecure-requests')
        .join('; '),
    )
    headers.set('X-Frame-Options', 'DENY')
    headers.set('X-Content-Type-Options', 'nosniff')
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
    )
    if (enableHsts) {
      headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    }
    return result
  })
}

const logServerErrors = createMiddleware({ type: 'function' }).server(async ({ next, serverFnMeta }) => {
  try {
    return await next()
  } catch (error) {
    if (!isExpectedError(error)) {
      console.error(`[server] ${serverFnMeta?.name ?? 'serverFn'} failed: ${describeError(error)}`)
    }
    throw error
  }
})

export const startInstance = createStart(() => ({
  requestMiddleware: [
    createCsrfMiddleware({ filter: (ctx) => ctx.handlerType === 'serverFn' }),
    securityHeaders(),
  ],
  functionMiddleware: [logServerErrors],
}))
