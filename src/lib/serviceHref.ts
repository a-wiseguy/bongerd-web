/** empty, /path (not //…), or https://… */
export function isValidServiceHref(value: string) {
  if (value === '') return true
  if (/^https:\/\//i.test(value)) return true
  return value.startsWith('/') && !value.startsWith('//')
}

export function serviceHrefKind(href: string): 'external' | 'internal' | 'invalid' {
  if (/^https:\/\//i.test(href)) return 'external'
  if (href.startsWith('/') && !href.startsWith('//')) return 'internal'
  return 'invalid'
}
