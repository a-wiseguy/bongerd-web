/** soft/hard text limits for cms fields (plain-text char counts) */
export const limits = {
  title: 120,
  contentBody: 8000,
  announcementBody: 1000,
  newsExcerpt: 400,
  newsBody: 15000,
  serviceSummary: 280,
  serviceBody: 3000,
  imageAlt: 180,
} as const

/** html storage ceilings (tags inflate length) */
export const htmlLimits = {
  contentBody: 12000,
  announcementBody: 2000,
  newsBody: 25000,
  serviceBody: 5000,
} as const

export const uploadLimits = {
  maxBytes: 2 * 1024 * 1024,
  allowedMime: ['image/jpeg', 'image/png', 'image/webp'] as const,
}
