import {
  createCsrfMiddleware,
  createMiddleware,
  createStart,
} from '@tanstack/react-start'

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
        "font-src 'self' https://fonts.gstatic.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "script-src 'self' 'unsafe-inline'",
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

export const startInstance = createStart(() => ({
  requestMiddleware: [
    createCsrfMiddleware({ filter: (ctx) => ctx.handlerType === 'serverFn' }),
    securityHeaders(),
  ],
}))
